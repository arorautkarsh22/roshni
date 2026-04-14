package com.ssh.ecommerce.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String orderId;
    private Long userId;
    private String userName;
    private AddressResponse shippingAddress;
    private Double totalAmount;
    private String orderStatus;
    private String paymentMethod;
    private String paymentStatus;
    private String razorpayOrderId;  // For frontend payment tracking
    private List<OrderItemResponse> items;
    private LocalDateTime orderDate;
}
