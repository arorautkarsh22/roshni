package com.ssh.ecommerce.controller;

import com.ssh.ecommerce.dto.ApiResponse;
import com.ssh.ecommerce.dto.response.CustomerAnalyticsResponse;
import com.ssh.ecommerce.dto.response.DashboardStatsResponse;
import com.ssh.ecommerce.dto.response.InventoryResponse;
import com.ssh.ecommerce.dto.response.SalesAnalyticsResponse;
import com.ssh.ecommerce.service.AdminService;
import com.ssh.ecommerce.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final EmailService emailService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
        DashboardStatsResponse response = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<InventoryResponse>> getInventory() {
        InventoryResponse response = adminService.getInventory();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<SalesAnalyticsResponse>> getSales() {
        SalesAnalyticsResponse response = adminService.getSalesAnalytics();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<CustomerAnalyticsResponse>> getCustomerAnalytics() {
        CustomerAnalyticsResponse response = adminService.getCustomerAnalytics();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * View all email notifications sent by the system.
     */
    @GetMapping("/emails")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllEmails() {
        List<Map<String, Object>> response = emailService.getAllNotifications();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * View email notifications for a specific user email.
     */
    @GetMapping("/emails/{email}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEmailsByUser(@PathVariable String email) {
        List<Map<String, Object>> response = emailService.getNotificationsByUser(email);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
