package com.ssh.ecommerce.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesAnalyticsResponse {
    private double totalRevenue;
    private long totalOrders;
    private double averageOrderValue;
    private List<SalesDataDTO> dailySales;
    private List<TopProductDTO> topSellingProducts;
    private Map<String, Double> revenueByPaymentMethod;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SalesDataDTO {
        private String date;
        private long orderCount;
        private double revenue;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TopProductDTO {
        private String productId;
        private String productName;
        private String category;
        private int totalQuantitySold;
        private double totalRevenue;
        private String image;
    }
}
