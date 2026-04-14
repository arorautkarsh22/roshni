package com.ssh.ecommerce.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StripeResponse {
    private String clientSecret;    // Needed by frontend to confirm payment
    private String publishableKey;  // Frontend may need this to initialize Stripe
    private Double amount;
    private String currency;
    private String orderId;
}
