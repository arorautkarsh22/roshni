package com.ssh.ecommerce.controller;

import com.ssh.ecommerce.dto.ApiResponse;
import com.ssh.ecommerce.dto.request.OrderRequest;
import com.ssh.ecommerce.dto.request.ShipOrderRequest;
import com.ssh.ecommerce.dto.response.OrderResponse;
import com.ssh.ecommerce.entity.enums.OrderStatus;
import com.ssh.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/{userId}")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(@PathVariable Long userId,
                                                                   @Valid @RequestBody OrderRequest request) {
        log.info("🛒 Received placeOrder request for userId: {} — Payload: addressId={}, paymentMethod={}", 
                userId, request.getShippingAddressId(), request.getPaymentMethod());
        OrderResponse response = orderService.placeOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", response));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getByOrderId(@PathVariable String orderId) {
        OrderResponse response = orderService.getByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getByUser(@PathVariable Long userId) {
        List<OrderResponse> response = orderService.getByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(@PathVariable String orderId,
                                                                     @RequestParam OrderStatus status) {
        OrderResponse response = orderService.updateStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", response));
    }

    @PatchMapping("/{orderId}/ship")
    public ResponseEntity<ApiResponse<OrderResponse>> shipOrder(@PathVariable String orderId,
                                                                 @Valid @RequestBody ShipOrderRequest request) {
        OrderResponse response = orderService.shipOrder(orderId, request.getTrackingNumber());
        return ResponseEntity.ok(ApiResponse.success("Order shipped. Tracking email sent to customer.", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAll() {
        List<OrderResponse> response = orderService.getAll();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
