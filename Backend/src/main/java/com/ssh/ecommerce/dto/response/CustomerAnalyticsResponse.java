package com.ssh.ecommerce.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerAnalyticsResponse {
    private long totalCustomers;
    private long newCustomersThisMonth;
    private long returningCustomers;       // customers with > 1 order
    private double customerRetentionRate;   // (returning / total) * 100
    private double averageLifetimeValue;    // avg total spend per customer
    private List<CustomerDetailDTO> customers;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CustomerDetailDTO {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private int totalOrders;
        private double totalSpent;
        private String lastOrderDate;
        private String joinDate;
        private String status; // ACTIVE, NEW, CHURNED
    }
}
