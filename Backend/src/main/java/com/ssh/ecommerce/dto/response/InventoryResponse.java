package com.ssh.ecommerce.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {
    private long totalProducts;
    private long inStockProducts;
    private long lowStockProducts;
    private long outOfStockProducts;
    private double totalInventoryValue;
    private List<ProductStockDTO> products;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProductStockDTO {
        private Long id;
        private String productId;
        private String name;
        private String category;
        private double price;
        private int stock;
        private String stockStatus; // IN_STOCK, LOW_STOCK, OUT_OF_STOCK
        private String image;
    }
}
