package com.ssh.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShipOrderRequest {

    @NotBlank(message = "Tracking number is required")
    private String trackingNumber;
}
