package com.ssh.ecommerce.controller;

import com.ssh.ecommerce.dto.ApiResponse;
import com.ssh.ecommerce.dto.request.CartItemRequest;
import com.ssh.ecommerce.dto.response.CartResponse;
import com.ssh.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@PathVariable Long userId) {
        CartResponse response = cartService.getCartByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(@PathVariable Long userId,
                                                                @Valid @RequestBody CartItemRequest request) {
        CartResponse response = cartService.addToCart(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", response));
    }

    @PutMapping("/{userId}/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(@PathVariable Long userId,
                                                                     @PathVariable Long itemId,
                                                                     @RequestParam Integer quantity) {
        CartResponse response = cartService.updateCartItemQuantity(userId, itemId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart item updated", response));
    }

    @DeleteMapping("/{userId}/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(@PathVariable Long userId,
                                                                 @PathVariable Long itemId) {
        CartResponse response = cartService.removeCartItem(userId, itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", response));
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
