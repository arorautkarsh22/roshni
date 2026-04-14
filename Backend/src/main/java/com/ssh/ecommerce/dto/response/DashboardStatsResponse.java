package com.ssh.ecommerce.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private long totalCustomers;
    private long totalProducts;
    private long totalOrders;
    private double totalRevenue;
    private long pendingOrders;
    private long deliveredOrders;
    private long cancelledOrders;
    private long lowStockProducts;     // stock < 5
    private long outOfStockProducts;   // stock = 0
    private double averageOrderValue;
    private List<CategorySalesDTO> salesByCategory;
    private List<RecentOrderDTO> recentOrders;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CategorySalesDTO {
        private String categoryName;
        private long orderCount;
        private double revenue;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RecentOrderDTO {
        private String orderId;
        private String customerName;
        private double totalAmount;
        private String status;
        private String orderDate;
    }
}
