package com.ssh.ecommerce.controller;

import com.ssh.ecommerce.dto.ApiResponse;
import com.ssh.ecommerce.dto.response.DiscountValidateResponse;
import com.ssh.ecommerce.service.DiscountCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/discount-codes")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountCodeService discountCodeService;

    /**
     * Validate a discount code — publicly accessible so frontend can call it at checkout
     */
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<DiscountValidateResponse>> validate(@RequestParam String code) {
        DiscountValidateResponse response = discountCodeService.validate(code);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Mark a discount code as used — called after order is successfully placed
     */
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<Void>> apply(@RequestParam String code) {
        discountCodeService.markUsed(code);
        return ResponseEntity.ok(ApiResponse.success("Discount code applied successfully.", null));
    }
}
