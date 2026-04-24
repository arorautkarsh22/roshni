package com.ssh.ecommerce.service;

import com.ssh.ecommerce.entity.Order;
import com.ssh.ecommerce.entity.User;

import java.util.List;
import java.util.Map;

public interface EmailService {
    void sendOrderConfirmation(Long orderId);
    void sendOrderStatusUpdate(Long orderId);
    void sendShippingNotification(Long orderId, String trackingNumber);
    void sendDeliveryNotification(Long orderId);
    void sendWelcomeEmail(User user);
    void sendDiscountCode(String toEmail, String customerName, String code, int discountPercent, String expiresAt);
    List<Map<String, Object>> getAllNotifications();
    List<Map<String, Object>> getNotificationsByUser(String email);
}
