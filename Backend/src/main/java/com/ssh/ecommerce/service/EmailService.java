package com.ssh.ecommerce.service;

import com.ssh.ecommerce.entity.Order;
import com.ssh.ecommerce.entity.User;

import java.util.List;
import java.util.Map;

public interface EmailService {
    void sendOrderConfirmation(Long orderId);
    void sendOrderStatusUpdate(Long orderId);
    void sendWelcomeEmail(User user);
    List<Map<String, Object>> getAllNotifications();
    List<Map<String, Object>> getNotificationsByUser(String email);
}
