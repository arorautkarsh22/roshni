package com.ssh.ecommerce.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productUuid;
    private String productName;
    private String productImage;
    private Double unitPrice;
    private Integer quantity;
    private Double subtotal;
}
