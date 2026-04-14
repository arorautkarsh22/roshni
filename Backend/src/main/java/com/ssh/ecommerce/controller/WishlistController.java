package com.ssh.ecommerce.controller;

import com.ssh.ecommerce.dto.ApiResponse;
import com.ssh.ecommerce.dto.response.WishlistItemResponse;
import com.ssh.ecommerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{userId}/{productId}")
    public ResponseEntity<ApiResponse<WishlistItemResponse>> addToWishlist(@PathVariable Long userId,
                                                                            @PathVariable Long productId) {
        WishlistItemResponse response = wishlistService.addToWishlist(userId, productId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Added to wishlist", response));
    }

    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(@PathVariable Long userId,
                                                                  @PathVariable Long productId) {
        wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<WishlistItemResponse>>> getByUser(@PathVariable Long userId) {
        List<WishlistItemResponse> response = wishlistService.getByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
