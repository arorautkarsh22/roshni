package com.ssh.ecommerce.controller;

import com.ssh.ecommerce.dto.ApiResponse;
import com.ssh.ecommerce.dto.request.PaymentVerificationRequest;
import com.ssh.ecommerce.dto.response.PaymentResponse;
import com.ssh.ecommerce.dto.response.StripeResponse;
import com.ssh.ecommerce.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Step 1: Create Stripe PaymentIntent for a placed order.
     * Frontend uses the client_secret to confirm payment.
     */
    @PostMapping("/create/{orderId}")
    public ResponseEntity<ApiResponse<StripeResponse>> createPaymentIntent(@PathVariable String orderId) {
        StripeResponse response = paymentService.createStripePaymentIntent(orderId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stripe PaymentIntent created successfully", response));
    }

    /**
     * Step 2: Confirm payment after Stripe checkout completes.
     */
    @PostMapping("/confirm/{intentId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(@PathVariable String intentId) {
        PaymentResponse response = paymentService.confirmPayment(intentId);
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed successfully", response));
    }

    /**
     * Handle payment failure from frontend.
     */
    @PostMapping("/failure")
    public ResponseEntity<ApiResponse<PaymentResponse>> handleFailure(
            @RequestParam String intentId,
            @RequestParam(required = false, defaultValue = "Payment failed") String reason) {
        PaymentResponse response = paymentService.handlePaymentFailure(intentId, reason);
        return ResponseEntity.ok(ApiResponse.success("Payment failure recorded", response));
    }

    /**
     * Get payment details by our internal order ID.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getByOrderId(@PathVariable String orderId) {
        PaymentResponse response = paymentService.getByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get all payments for a user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getByUser(@PathVariable Long userId) {
        List<PaymentResponse> response = paymentService.getByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get payment by Stripe client secret.
     */
    @GetMapping("/stripe/{clientSecret}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getByStripeClientSecret(
            @PathVariable String clientSecret) {
        PaymentResponse response = paymentService.getByStripeClientSecret(clientSecret);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
