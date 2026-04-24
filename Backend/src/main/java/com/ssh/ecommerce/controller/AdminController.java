package com.ssh.ecommerce.controller;

import com.ssh.ecommerce.dto.ApiResponse;
import com.ssh.ecommerce.dto.request.DiscountCodeRequest;
import com.ssh.ecommerce.dto.request.StockUpdateRequest;
import com.ssh.ecommerce.dto.response.CustomerAnalyticsResponse;
import com.ssh.ecommerce.dto.response.DashboardStatsResponse;
import com.ssh.ecommerce.dto.response.InventoryResponse;
import com.ssh.ecommerce.dto.response.SalesAnalyticsResponse;
import com.ssh.ecommerce.service.AdminService;
import com.ssh.ecommerce.service.DiscountCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final DiscountCodeService discountCodeService;

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
     * Update stock for a product — adds additionalStock on top of current stock.
     */
    @PatchMapping("/products/{productId}/stock")
    public ResponseEntity<ApiResponse<Void>> updateStock(
            @PathVariable String productId,
            @Valid @RequestBody StockUpdateRequest request) {
        adminService.updateProductStock(productId, request.getAdditionalStock());
        return ResponseEntity.ok(ApiResponse.success(
                "Stock updated: +" + request.getAdditionalStock() + " units added.", null));
    }

    /**
     * Generate and email a discount code for a premium customer.
     */
    @PostMapping("/discount-codes")
    public ResponseEntity<ApiResponse<String>> generateDiscountCode(
            @Valid @RequestBody DiscountCodeRequest request) {
        String code = discountCodeService.generateAndSend(request);
        return ResponseEntity.ok(ApiResponse.success("Discount code sent to customer.", code));
    }
}
