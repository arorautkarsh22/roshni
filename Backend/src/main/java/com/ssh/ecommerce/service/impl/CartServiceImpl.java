package com.ssh.ecommerce.service.impl;

import com.ssh.ecommerce.dto.request.CartItemRequest;
import com.ssh.ecommerce.dto.response.CartItemResponse;
import com.ssh.ecommerce.dto.response.CartResponse;
import com.ssh.ecommerce.entity.Cart;
import com.ssh.ecommerce.entity.CartItem;
import com.ssh.ecommerce.entity.Product;
import com.ssh.ecommerce.entity.User;
import com.ssh.ecommerce.exception.InsufficientStockException;
import com.ssh.ecommerce.exception.ResourceNotFoundException;
import com.ssh.ecommerce.repository.CartItemRepository;
import com.ssh.ecommerce.repository.CartRepository;
import com.ssh.ecommerce.repository.ProductRepository;
import com.ssh.ecommerce.repository.UserRepository;
import com.ssh.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CartResponse getCartByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().user(user).totalPrice(0.0).build();
                    return cartRepository.save(newCart);
                });
        return mapToResponse(cart);
    }

    @Override
    public CartResponse addToCart(Long userId, CartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Auto-create cart if not exists (handles Google OAuth users)
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().user(user).totalPrice(0.0).build();
                    return cartRepository.save(newCart);
                });

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        // Check stock
        if (product.getStock() < request.getQuantity()) {
            throw new InsufficientStockException(product.getName(), request.getQuantity(), product.getStock());
        }

        // Check if product already in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (product.getStock() < newQuantity) {
                throw new InsufficientStockException(product.getName(), newQuantity, product.getStock());
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();
            cart.getCartItems().add(newItem);
        }

        updateCartTotal(cart);
        cart = cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Override
    public CartResponse updateCartItemQuantity(Long userId, Long itemId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("CartItem", "id", itemId);
        }

        if (quantity <= 0) {
            cart.getCartItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            if (item.getProduct().getStock() < quantity) {
                throw new InsufficientStockException(item.getProduct().getName(), quantity, item.getProduct().getStock());
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        updateCartTotal(cart);
        cart = cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Override
    public CartResponse removeCartItem(Long userId, Long itemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("CartItem", "id", itemId);
        }

        cart.getCartItems().remove(item);
        cartItemRepository.delete(item);

        updateCartTotal(cart);
        cart = cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));

        cart.getCartItems().clear();
        cart.setTotalPrice(0.0);
        cartRepository.save(cart);
    }

    private void updateCartTotal(Cart cart) {
        double total = cart.getCartItems().stream()
                .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
                .sum();
        cart.setTotalPrice(total);
    }

    private CartResponse mapToResponse(Cart cart) {
        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .totalPrice(cart.getTotalPrice())
                .items(cart.getCartItems().stream()
                        .map(this::mapItemToResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private CartItemResponse mapItemToResponse(CartItem item) {
        String firstImage = item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()
                ? item.getProduct().getImages().get(0).getImageUrl()
                : null;

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productUuid(item.getProduct().getProductId())
                .productName(item.getProduct().getName())
                .productImage(firstImage)
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getUnitPrice() * item.getQuantity())
                .build();
    }
}
