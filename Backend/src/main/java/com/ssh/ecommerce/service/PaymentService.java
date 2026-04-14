package com.ssh.ecommerce.service;

import com.ssh.ecommerce.dto.request.PaymentVerificationRequest;
import com.ssh.ecommerce.dto.response.PaymentResponse;
import com.ssh.ecommerce.dto.response.StripeResponse;

import java.util.List;

public interface PaymentService {

    /**
     * Create a Stripe PaymentIntent for a placed order.
     * Returns Stripe details needed by frontend to initiate checkout.
     */
    StripeResponse createStripePaymentIntent(String orderId);

    /**
     * Confirm payment after Stripe checkout completes.
     * Updates payment & order status.
     */
    PaymentResponse confirmPayment(String stripePaymentIntentId);

    /**
     * Handle payment failure.
     */
    PaymentResponse handlePaymentFailure(String stripePaymentIntentId, String reason);

    /**
     * Get payment details by our internal order ID.
     */
    PaymentResponse getByOrderId(String orderId);

    /**
     * Get all payments for a user.
     */
    List<PaymentResponse> getByUser(Long userId);

    /**
     * Get payment by Stripe client secret.
     */
    PaymentResponse getByStripeClientSecret(String clientSecret);
}
