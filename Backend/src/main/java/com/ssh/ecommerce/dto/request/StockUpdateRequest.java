package com.ssh.ecommerce.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockUpdateRequest {

    @NotNull(message = "Additional stock quantity is required")
    @Min(value = 1, message = "Stock quantity must be at least 1")
    private Integer additionalStock;
}
