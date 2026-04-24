package com.ssh.ecommerce.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountValidateResponse {

    private boolean valid;
    private String code;
    private Integer discountPercent;
    private String message;
}
