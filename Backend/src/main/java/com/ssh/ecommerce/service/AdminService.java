package com.ssh.ecommerce.service;

import com.ssh.ecommerce.dto.response.CustomerAnalyticsResponse;
import com.ssh.ecommerce.dto.response.DashboardStatsResponse;
import com.ssh.ecommerce.dto.response.InventoryResponse;
import com.ssh.ecommerce.dto.response.SalesAnalyticsResponse;

public interface AdminService {
    DashboardStatsResponse getDashboardStats();
    InventoryResponse getInventory();
    SalesAnalyticsResponse getSalesAnalytics();
    CustomerAnalyticsResponse getCustomerAnalytics();
}
