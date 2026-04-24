package com.ssh.ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DiscountCodeRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Discount percent is required")
    @Min(value = 1, message = "Discount must be at least 1%")
    @Max(value = 100, message = "Discount cannot exceed 100%")
    private Integer discountPercent;
}
