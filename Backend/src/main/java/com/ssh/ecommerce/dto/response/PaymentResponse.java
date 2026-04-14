package com.ssh.ecommerce.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private String stripePaymentIntentId;
    private String stripeClientSecret;
    private String orderId;        // Our internal order ID (e.g. ORD-XXXXXXXX)
    private Long userId;
    private Double amount;
    private String currency;
    private String status;
    private String method;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
