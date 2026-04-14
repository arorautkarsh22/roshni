package com.ssh.ecommerce.service;

import com.ssh.ecommerce.dto.response.WishlistItemResponse;

import java.util.List;

public interface WishlistService {
    WishlistItemResponse addToWishlist(Long userId, Long productId);
    void removeFromWishlist(Long userId, Long productId);
    List<WishlistItemResponse> getByUser(Long userId);
}
