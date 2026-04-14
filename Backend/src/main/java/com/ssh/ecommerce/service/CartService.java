package com.ssh.ecommerce.service;

import com.ssh.ecommerce.dto.request.CartItemRequest;
import com.ssh.ecommerce.dto.response.CartResponse;

public interface CartService {
    CartResponse getCartByUser(Long userId);
    CartResponse addToCart(Long userId, CartItemRequest request);
    CartResponse updateCartItemQuantity(Long userId, Long itemId, Integer quantity);
    CartResponse removeCartItem(Long userId, Long itemId);
    void clearCart(Long userId);
}
