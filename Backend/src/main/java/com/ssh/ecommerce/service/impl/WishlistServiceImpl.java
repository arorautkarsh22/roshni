package com.ssh.ecommerce.service.impl;

import com.ssh.ecommerce.dto.response.WishlistItemResponse;
import com.ssh.ecommerce.entity.Product;
import com.ssh.ecommerce.entity.User;
import com.ssh.ecommerce.entity.WishlistItem;
import com.ssh.ecommerce.exception.DuplicateResourceException;
import com.ssh.ecommerce.exception.ResourceNotFoundException;
import com.ssh.ecommerce.repository.ProductRepository;
import com.ssh.ecommerce.repository.UserRepository;
import com.ssh.ecommerce.repository.WishlistItemRepository;
import com.ssh.ecommerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public WishlistItemResponse addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (wishlistItemRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new DuplicateResourceException("Product is already in your wishlist");
        }

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();

        item = wishlistItemRepository.save(item);
        return mapToResponse(item);
    }

    @Override
    public void removeFromWishlist(Long userId, Long productId) {
        WishlistItem item = wishlistItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("WishlistItem", "userId+productId", userId + "+" + productId));
        wishlistItemRepository.delete(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getByUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return wishlistItemRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private WishlistItemResponse mapToResponse(WishlistItem item) {
        String firstImage = item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()
                ? item.getProduct().getImages().get(0).getImageUrl()
                : null;

        return WishlistItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImage(firstImage)
                .productPrice(item.getProduct().getPrice())
                .addedAt(item.getAddedAt())
                .build();
    }
}
