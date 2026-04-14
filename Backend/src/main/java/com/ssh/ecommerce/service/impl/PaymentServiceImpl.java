package com.ssh.ecommerce.service.impl;

import com.ssh.ecommerce.dto.response.PaymentResponse;
import com.ssh.ecommerce.dto.response.StripeResponse;
import com.ssh.ecommerce.entity.Payment;
import com.ssh.ecommerce.entity.User;
import com.ssh.ecommerce.entity.enums.OrderStatus;
import com.ssh.ecommerce.entity.enums.PaymentStatus;
import com.ssh.ecommerce.exception.ResourceNotFoundException;
import com.ssh.ecommerce.repository.OrderRepository;
import com.ssh.ecommerce.repository.PaymentRepository;
import com.ssh.ecommerce.service.EmailService;
import com.ssh.ecommerce.service.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;

    @Value("${stripe.publishable.key}")
    private String stripePublishableKey;

    @Override
    public StripeResponse createStripePaymentIntent(String orderId) {
        com.ssh.ecommerce.entity.Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));

        // Check if payment already exists for this order
        if (paymentRepository.findByOrderId(order.getId()).isPresent()) {
            Payment existingPayment = paymentRepository.findByOrderId(order.getId()).get();
            if (existingPayment.getStatus() == PaymentStatus.COMPLETED) {
                throw new IllegalArgumentException("Payment already completed for this order");
            }
            // If pending/failed, allow re-creation — delete old record
            paymentRepository.delete(existingPayment);
        }

        try {
            // Stripe expects amount in cents (INR × 100)
            long amountInCents = (long) (order.getTotalAmount() * 100);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("inr")
                    .putMetadata("order_id", orderId)
                    .putMetadata("user_id", order.getUser().getId().toString())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            String stripePaymentIntentId = intent.getId();
            String stripeClientSecret = intent.getClientSecret();

            log.info("Stripe PaymentIntent created: {} for order: {}", stripePaymentIntentId, orderId);

            // Save payment record
            Payment payment = Payment.builder()
                    .stripePaymentIntentId(stripePaymentIntentId)
                    .stripeClientSecret(stripeClientSecret)
                    .order(order)
                    .user(order.getUser())
                    .amount(order.getTotalAmount())
                    .currency("INR")
                    .status(PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment);

            return StripeResponse.builder()
                    .clientSecret(stripeClientSecret)
                    .publishableKey(stripePublishableKey)
                    .amount(order.getTotalAmount())
                    .currency("INR")
                    .orderId(orderId)
                    .build();

        } catch (StripeException e) {
            log.error("Failed to create Stripe PaymentIntent: {}", e.getMessage());
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }

    @Override
    public PaymentResponse confirmPayment(String stripePaymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "stripePaymentIntentId", stripePaymentIntentId));

        try {
            // Retrieve PaymentIntent from Stripe to verify status
            PaymentIntent intent = PaymentIntent.retrieve(stripePaymentIntentId);

            if ("succeeded".equals(intent.getStatus())) {
                // Payment verified — update payment and order
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setPaidAt(LocalDateTime.now());
                payment.setMethod(intent.getPaymentMethod());

                // Update order status
                com.ssh.ecommerce.entity.Order order = payment.getOrder();
                order.setPaymentStatus(PaymentStatus.COMPLETED);
                order.setOrderStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);

                payment = paymentRepository.save(payment);
                log.info("Payment confirmed successfully: {}", stripePaymentIntentId);

                // Send order confirmation email now that payment is confirmed
                emailService.sendOrderConfirmation(order.getId());

                return mapToResponse(payment);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Stripe payment status: " + intent.getStatus());
                paymentRepository.save(payment);

                log.warn("Payment confirmation failed for intent: {} with status: {}", stripePaymentIntentId, intent.getStatus());
                throw new IllegalArgumentException("Payment confirmation failed: " + intent.getStatus());
            }

        } catch (StripeException e) {
            log.error("Stripe API error during confirmation: {}", e.getMessage());
            throw new RuntimeException("Stripe confirmation failed: " + e.getMessage());
        }
    }

    @Override
    public PaymentResponse handlePaymentFailure(String stripePaymentIntentId, String reason) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "stripePaymentIntentId", stripePaymentIntentId));

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason);
        payment = paymentRepository.save(payment);

        // Update order payment status
        com.ssh.ecommerce.entity.Order order = payment.getOrder();
        order.setPaymentStatus(PaymentStatus.FAILED);
        orderRepository.save(order);

        log.warn("Payment failed for intent {}: {}", stripePaymentIntentId, reason);
        return mapToResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getByOrderId(String orderId) {
        com.ssh.ecommerce.entity.Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));
        return mapToResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getByUser(Long userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getByStripeClientSecret(String clientSecret) {
        Payment payment = paymentRepository.findByStripeClientSecret(clientSecret)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "clientSecret", clientSecret));
        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .stripePaymentIntentId(payment.getStripePaymentIntentId())
                .stripeClientSecret(payment.getStripeClientSecret())
                .orderId(payment.getOrder().getOrderId())
                .userId(payment.getUser().getId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus().name())
                .method(payment.getMethod())
                .failureReason(payment.getFailureReason())
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
