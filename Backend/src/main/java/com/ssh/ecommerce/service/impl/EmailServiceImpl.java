package com.ssh.ecommerce.service.impl;

import com.ssh.ecommerce.entity.EmailNotification;
import com.ssh.ecommerce.entity.Order;
import com.ssh.ecommerce.entity.OrderItem;
import com.ssh.ecommerce.entity.User;
import com.ssh.ecommerce.repository.EmailNotificationRepository;
import com.ssh.ecommerce.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import com.ssh.ecommerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final EmailNotificationRepository emailNotificationRepository;
    private final JavaMailSender mailSender;
    private final OrderRepository orderRepository;

    private static final String FROM_EMAIL = "roshnidcreations@gmail.com";
    private static final String FROM_NAME = "Roshni Creations";

    @Override
    @Async
    @Transactional(readOnly = true)
    public void sendOrderConfirmation(Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return;
        
        String subject = "Order Confirmed! #" + order.getOrderId() + " — Roshni Creations";

        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(order.getUser().getName()).append(",\n\n");
        body.append("Thank you for your order! 🎉\n\n");
        body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        body.append("ORDER DETAILS\n");
        body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        body.append("Order ID: ").append(order.getOrderId()).append("\n");
        body.append("Date: ").append(order.getOrderDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))).append("\n\n");

        body.append("Items:\n");
        for (OrderItem item : order.getOrderItems()) {
            body.append("  • ").append(item.getProduct().getName())
                    .append(" × ").append(item.getQuantity())
                    .append("  ₹").append(String.format("%.2f", item.getUnitPrice() * item.getQuantity()))
                    .append("\n");
        }

        body.append("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        body.append("TOTAL: ₹").append(String.format("%.2f", order.getTotalAmount())).append("\n");
        body.append("Payment: ").append(order.getPaymentMethod().name()).append("\n");
        body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");

        body.append("Shipping To:\n");
        body.append(order.getShippingAddress().getFullName()).append("\n");
        body.append(order.getShippingAddress().getAddressLine1()).append("\n");
        if (order.getShippingAddress().getAddressLine2() != null) {
            body.append(order.getShippingAddress().getAddressLine2()).append("\n");
        }
        body.append(order.getShippingAddress().getCity()).append(", ")
                .append(order.getShippingAddress().getState()).append(" - ")
                .append(order.getShippingAddress().getPincode()).append("\n\n");

        body.append("We'll notify you when your order ships.\n\n");
        body.append("With love,\nRoshni Creations ✨");

        saveAndSendEmail(order.getUser().getEmail(), subject, body.toString(),
                "ORDER_CONFIRMATION", order.getOrderId());
    }

    @Override
    @Async
    @Transactional(readOnly = true)
    public void sendOrderStatusUpdate(Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return;

        String statusText;
        switch (order.getOrderStatus()) {
            case SHIPPED -> statusText = "Your order has been shipped! 📦";
            case DELIVERED -> statusText = "Your order has been delivered! 🎉";
            case CANCELLED -> statusText = "Your order has been cancelled.";
            case CONFIRMED -> statusText = "Your order has been confirmed! ✅";
            default -> statusText = "Your order status has been updated.";
        }

        String subject = order.getOrderId() + " — " + statusText;

        String body = "Dear " + order.getUser().getName() + ",\n\n" +
                statusText + "\n\n" +
                "Order ID: " + order.getOrderId() + "\n" +
                "Status: " + order.getOrderStatus().name() + "\n" +
                "Total: ₹" + String.format("%.2f", order.getTotalAmount()) + "\n\n" +
                "Track your order anytime on our website.\n\n" +
                "With love,\nRoshni Creations ✨";

        saveAndSendEmail(order.getUser().getEmail(), subject, body,
                "ORDER_" + order.getOrderStatus().name(), order.getOrderId());
    }

    @Override
    @Async
    public void sendWelcomeEmail(User user) {
        String subject = "Welcome to Roshni Creations! ✨";

        String body = "Dear " + user.getName() + ",\n\n" +
                "Welcome to Roshni Creations! 🎊\n\n" +
                "We're thrilled to have you join our family of jewellery lovers.\n\n" +
                "Explore our handcrafted collection of chokers, necklaces, mangalsutras, " +
                "and watches — all designed for timeless beauty and modern grace.\n\n" +
                "Happy Shopping! 🛍️\n\n" +
                "With love,\nRoshni Creations ✨";

        saveAndSendEmail(user.getEmail(), subject, body, "WELCOME", user.getId().toString());
    }

    @Override
    @Async
    @Transactional(readOnly = true)
    public void sendShippingNotification(Long id, String trackingNumber) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return;

        String trackNo = trackingNumber != null ? trackingNumber : (order.getTrackingNumber() != null ? order.getTrackingNumber() : "N/A");
        String subject = "Your order is on its way! 🚚 #" + order.getOrderId();

        String body = "Dear " + order.getUser().getName() + ",\n\n" +
                "Great news! Your order has been shipped! 📦\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "SHIPPING DETAILS\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "Order ID: " + order.getOrderId() + "\n" +
                "Tracking Number: " + trackNo + "\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "Use your tracking number to track your parcel with the courier service.\n\n" +
                "With love,\nRoshni Creations ✨";

        saveAndSendEmail(order.getUser().getEmail(), subject, body,
                "ORDER_SHIPPED", order.getOrderId());
    }

    @Override
    @Async
    @Transactional(readOnly = true)
    public void sendDeliveryNotification(Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return;

        String subject = "Your order has been delivered! 🎁 #" + order.getOrderId();

        String body = "Dear " + order.getUser().getName() + ",\n\n" +
                "Your order has been successfully delivered! 🎊\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "ORDER DETAILS\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "Order ID: " + order.getOrderId() + "\n" +
                "Total Amount: ₹" + String.format("%.2f", order.getTotalAmount()) + "\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "We hope you love your new jewellery from Roshni Creations! ✨\n\n" +
                "If you have a moment, we'd love to hear your feedback on our website.\n\n" +
                "Happy Shopping! 🛍️\n\n" +
                "With love,\nRoshni Creations ✨";

        saveAndSendEmail(order.getUser().getEmail(), subject, body,
                "ORDER_DELIVERED", order.getOrderId());
    }

    @Override
    @Async
    public void sendDiscountCode(String toEmail, String customerName, String code,
                                  int discountPercent, String expiresAt) {
        String subject = "🎁 You've earned a special discount! — Roshni Creations";

        String body = "Dear " + customerName + ",\n\n" +
                "Thank you for being one of our most valued customers! 🌟\n\n" +
                "As a token of our appreciation, we're sending you an exclusive discount:\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "   YOUR DISCOUNT CODE: " + code + "\n" +
                "   DISCOUNT: " + discountPercent + "% OFF your entire order\n" +
                "   VALID UNTIL: " + expiresAt + "\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "Simply enter this code at checkout to redeem your discount.\n" +
                "This code is valid for one-time use only.\n\n" +
                "Happy Shopping! 🛍️\n\n" +
                "With love,\nRoshni Creations ✨";

        saveAndSendEmail(toEmail, subject, body, "DISCOUNT_CODE", code);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllNotifications() {
        return emailNotificationRepository.findAllByOrderBySentAtDesc().stream()
                .map(this::mapToMap)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNotificationsByUser(String email) {
        return emailNotificationRepository.findByToEmailOrderBySentAtDesc(email).stream()
                .map(this::mapToMap)
                .collect(Collectors.toList());
    }

    /**
     * Save notification to DB and send actual email via SMTP
     */
    private void saveAndSendEmail(String toEmail, String subject, String body, String type, String referenceId) {
        String status = "SENT";

        // Try sending real email via SMTP
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_EMAIL, FROM_NAME);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, false); // plain text
            mailSender.send(message);
            log.info("📧 Email SENT to {} — Subject: {}", toEmail, subject);
        } catch (MessagingException e) {
            log.error("❌ Failed to send email to {} — {}", toEmail, e.getMessage());
            status = "FAILED";
        } catch (Exception e) {
            log.error("❌ Email error for {} — {}", toEmail, e.getMessage());
            status = "FAILED";
        }

        // Always save notification record to DB
        EmailNotification notification = EmailNotification.builder()
                .toEmail(toEmail)
                .subject(subject)
                .body(body)
                .type(type)
                .referenceId(referenceId)
                .status(status)
                .build();

        emailNotificationRepository.save(notification);
    }

    private Map<String, Object> mapToMap(EmailNotification n) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", n.getId());
        map.put("toEmail", n.getToEmail());
        map.put("subject", n.getSubject());
        map.put("body", n.getBody());
        map.put("type", n.getType());
        map.put("referenceId", n.getReferenceId());
        map.put("status", n.getStatus());
        map.put("sentAt", n.getSentAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        return map;
    }
}
