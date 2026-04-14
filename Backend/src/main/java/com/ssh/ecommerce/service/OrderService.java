package com.ssh.ecommerce.service;

import com.ssh.ecommerce.dto.request.OrderRequest;
import com.ssh.ecommerce.dto.response.OrderResponse;
import com.ssh.ecommerce.entity.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    OrderResponse placeOrder(Long userId, OrderRequest request);
    OrderResponse getByOrderId(String orderId);
    List<OrderResponse> getByUser(Long userId);
    OrderResponse updateStatus(String orderId, OrderStatus status);
    List<OrderResponse> getAll();
}
