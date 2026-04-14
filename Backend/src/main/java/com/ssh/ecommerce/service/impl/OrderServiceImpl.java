package com.ssh.ecommerce.service.impl;

import com.ssh.ecommerce.dto.request.OrderRequest;
import com.ssh.ecommerce.dto.response.AddressResponse;
import com.ssh.ecommerce.dto.response.OrderItemResponse;
import com.ssh.ecommerce.dto.response.OrderResponse;
import com.ssh.ecommerce.entity.*;
import com.ssh.ecommerce.entity.enums.OrderStatus;
import com.ssh.ecommerce.entity.enums.PaymentMethod;
import com.ssh.ecommerce.exception.InsufficientStockException;
import com.ssh.ecommerce.exception.ResourceNotFoundException;
import com.ssh.ecommerce.repository.*;
import com.ssh.ecommerce.service.EmailService;
import com.ssh.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    @Override
    public OrderResponse placeOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot place order with an empty cart");
        }

        Address address = addressRepository.findById(request.getShippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", request.getShippingAddressId()));

        log.info("📦 Fetched order dependencies — User: {}, Cart items: {}, Address: {}", 
                user.getEmail(), cart.getCartItems().size(), address.getCity());

        // Generate unique order ID
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Create order
        Order order = Order.builder()
                .orderId(orderId)
                .user(user)
                .shippingAddress(address)
                .paymentMethod(request.getPaymentMethod())
                .totalAmount(cart.getTotalPrice())
                .build();

        // Convert cart items to order items and decrement stock
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();

            // Validate stock
            if (product.getStock() < cartItem.getQuantity()) {
                throw new InsufficientStockException(product.getName(), cartItem.getQuantity(), product.getStock());
            }

            // Decrement stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .build();
            orderItems.add(orderItem);
        }

        order.setOrderItems(orderItems);
        order = orderRepository.save(order);
        log.info("✅ Order saved successfully with ID: {}", order.getOrderId());

        // Clear the cart
        cart.getCartItems().clear();
        cart.setTotalPrice(0.0);
        cartRepository.save(cart);

        // Send order confirmation email only for COD
        if (order.getPaymentMethod() == PaymentMethod.COD) {
            emailService.sendOrderConfirmation(order.getId());
        }

        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getByOrderId(String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getByUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse updateStatus(String orderId, OrderStatus status) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));

        order.setOrderStatus(status);
        order = orderRepository.save(order);

        // Send status update email
        emailService.sendOrderStatusUpdate(order.getId());

        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAll() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse mapToResponse(Order order) {
        Address addr = order.getShippingAddress();
        AddressResponse addressResponse = AddressResponse.builder()
                .id(addr.getId())
                .fullName(addr.getFullName())
                .phone(addr.getPhone())
                .addressLine1(addr.getAddressLine1())
                .addressLine2(addr.getAddressLine2())
                .city(addr.getCity())
                .state(addr.getState())
                .pincode(addr.getPincode())
                .isDefault(addr.getIsDefault())
                .build();

        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderId(order.getOrderId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .shippingAddress(addressResponse)
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus().name())
                .paymentMethod(order.getPaymentMethod().name())
                .paymentStatus(order.getPaymentStatus().name())
                .items(items)
                .orderDate(order.getOrderDate())
                .build();
    }

    private OrderItemResponse mapItemToResponse(OrderItem item) {
        String firstImage = item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()
                ? item.getProduct().getImages().get(0).getImageUrl()
                : null;

        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImage(firstImage)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getUnitPrice() * item.getQuantity())
                .build();
    }
}
