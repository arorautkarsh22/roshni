package com.ssh.ecommerce.service.impl;

import com.ssh.ecommerce.dto.response.*;
import com.ssh.ecommerce.entity.*;
import com.ssh.ecommerce.entity.enums.OrderStatus;
import com.ssh.ecommerce.entity.enums.Role;
import com.ssh.ecommerce.repository.*;
import com.ssh.ecommerce.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        List<User> allUsers = userRepository.findAll();
        List<Product> allProducts = productRepository.findAll();
        List<Order> allOrders = orderRepository.findAll();

        long totalCustomers = allUsers.stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .count();
        long totalProducts = allProducts.size();
        long totalOrders = allOrders.size();

        double totalRevenue = allOrders.stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalAmount)
                .sum();

        long pendingOrders = allOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.PENDING)
                .count();
        long deliveredOrders = allOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED)
                .count();
        long cancelledOrders = allOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.CANCELLED)
                .count();

        long lowStockProducts = allProducts.stream()
                .filter(p -> p.getStock() > 0 && p.getStock() < 5)
                .count();
        long outOfStockProducts = allProducts.stream()
                .filter(p -> p.getStock() == 0)
                .count();

        double averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Sales by category
        List<DashboardStatsResponse.CategorySalesDTO> salesByCategory = new ArrayList<>();
        List<Category> categories = categoryRepository.findAll();
        for (Category category : categories) {
            long catOrderCount = 0;
            double catRevenue = 0;
            for (Order order : allOrders) {
                if (order.getOrderStatus() == OrderStatus.CANCELLED) continue;
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getProduct().getCategory().getId().equals(category.getId())) {
                        catOrderCount++;
                        catRevenue += item.getUnitPrice() * item.getQuantity();
                    }
                }
            }
            salesByCategory.add(DashboardStatsResponse.CategorySalesDTO.builder()
                    .categoryName(category.getName())
                    .orderCount(catOrderCount)
                    .revenue(catRevenue)
                    .build());
        }

        // Recent orders (last 10)
        List<DashboardStatsResponse.RecentOrderDTO> recentOrders = allOrders.stream()
                .sorted(Comparator.comparing(Order::getOrderDate).reversed())
                .limit(10)
                .map(o -> DashboardStatsResponse.RecentOrderDTO.builder()
                        .orderId(o.getOrderId())
                        .customerName(o.getUser().getName())
                        .totalAmount(o.getTotalAmount())
                        .status(o.getOrderStatus().name())
                        .orderDate(o.getOrderDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                        .build())
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .pendingOrders(pendingOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .lowStockProducts(lowStockProducts)
                .outOfStockProducts(outOfStockProducts)
                .averageOrderValue(Math.round(averageOrderValue * 100.0) / 100.0)
                .salesByCategory(salesByCategory)
                .recentOrders(recentOrders)
                .build();
    }

    @Override
    public InventoryResponse getInventory() {
        List<Product> allProducts = productRepository.findAll();

        long inStock = allProducts.stream().filter(p -> p.getStock() >= 5).count();
        long lowStock = allProducts.stream().filter(p -> p.getStock() > 0 && p.getStock() < 5).count();
        long outOfStock = allProducts.stream().filter(p -> p.getStock() == 0).count();

        double totalValue = allProducts.stream()
                .mapToDouble(p -> p.getPrice() * p.getStock())
                .sum();

        List<InventoryResponse.ProductStockDTO> products = allProducts.stream()
                .map(p -> {
                    String stockStatus;
                    if (p.getStock() == 0) stockStatus = "OUT_OF_STOCK";
                    else if (p.getStock() < 5) stockStatus = "LOW_STOCK";
                    else stockStatus = "IN_STOCK";

                    String image = p.getImages() != null && !p.getImages().isEmpty()
                            ? p.getImages().get(0).getImageUrl() : null;

                    return InventoryResponse.ProductStockDTO.builder()
                            .id(p.getId())
                            .productId(p.getProductId())
                            .name(p.getName())
                            .category(p.getCategory().getName())
                            .price(p.getPrice())
                            .stock(p.getStock())
                            .stockStatus(stockStatus)
                            .image(image)
                            .build();
                })
                .sorted(Comparator.comparingInt(InventoryResponse.ProductStockDTO::getStock))
                .collect(Collectors.toList());

        return InventoryResponse.builder()
                .totalProducts(allProducts.size())
                .inStockProducts(inStock)
                .lowStockProducts(lowStock)
                .outOfStockProducts(outOfStock)
                .totalInventoryValue(Math.round(totalValue * 100.0) / 100.0)
                .products(products)
                .build();
    }

    @Override
    public SalesAnalyticsResponse getSalesAnalytics() {
        List<Order> allOrders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.toList());

        double totalRevenue = allOrders.stream().mapToDouble(Order::getTotalAmount).sum();
        long totalOrders = allOrders.size();
        double avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Daily sales (last 30 days)
        Map<String, List<Order>> ordersByDate = allOrders.stream()
                .collect(Collectors.groupingBy(o ->
                        o.getOrderDate().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE)));

        List<SalesAnalyticsResponse.SalesDataDTO> dailySales = ordersByDate.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> SalesAnalyticsResponse.SalesDataDTO.builder()
                        .date(entry.getKey())
                        .orderCount(entry.getValue().size())
                        .revenue(entry.getValue().stream().mapToDouble(Order::getTotalAmount).sum())
                        .build())
                .collect(Collectors.toList());

        // Top selling products
        Map<Long, Integer> productQuantities = new HashMap<>();
        Map<Long, Double> productRevenues = new HashMap<>();
        for (Order order : allOrders) {
            for (OrderItem item : order.getOrderItems()) {
                Long pid = item.getProduct().getId();
                productQuantities.merge(pid, item.getQuantity(), Integer::sum);
                productRevenues.merge(pid, item.getUnitPrice() * item.getQuantity(), Double::sum);
            }
        }

        List<SalesAnalyticsResponse.TopProductDTO> topProducts = productQuantities.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Product p = productRepository.findById(entry.getKey()).orElse(null);
                    if (p == null) return null;
                    String image = p.getImages() != null && !p.getImages().isEmpty()
                            ? p.getImages().get(0).getImageUrl() : null;
                    return SalesAnalyticsResponse.TopProductDTO.builder()
                            .productId(p.getProductId())
                            .productName(p.getName())
                            .category(p.getCategory().getName())
                            .totalQuantitySold(entry.getValue())
                            .totalRevenue(productRevenues.getOrDefault(entry.getKey(), 0.0))
                            .image(image)
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Revenue by payment method
        Map<String, Double> revenueByPaymentMethod = allOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getPaymentMethod().name(),
                        Collectors.summingDouble(Order::getTotalAmount)
                ));

        return SalesAnalyticsResponse.builder()
                .totalRevenue(Math.round(totalRevenue * 100.0) / 100.0)
                .totalOrders(totalOrders)
                .averageOrderValue(Math.round(avgOrderValue * 100.0) / 100.0)
                .dailySales(dailySales)
                .topSellingProducts(topProducts)
                .revenueByPaymentMethod(revenueByPaymentMethod)
                .build();
    }

    @Override
    public CustomerAnalyticsResponse getCustomerAnalytics() {
        List<User> allCustomers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .collect(Collectors.toList());

        List<Order> allOrders = orderRepository.findAll();
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);

        long totalCustomers = allCustomers.size();

        long newCustomersThisMonth = allCustomers.stream()
                .filter(u -> u.getCreatedAt().isAfter(oneMonthAgo))
                .count();

        // Customers with >1 order
        Map<Long, List<Order>> ordersByUser = allOrders.stream()
                .collect(Collectors.groupingBy(o -> o.getUser().getId()));

        long returningCustomers = ordersByUser.entrySet().stream()
                .filter(e -> e.getValue().size() > 1)
                .count();

        double retentionRate = totalCustomers > 0
                ? (double) returningCustomers / totalCustomers * 100 : 0;

        // Average lifetime value
        double totalCustomerSpend = allOrders.stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalAmount)
                .sum();
        double avgLifetimeValue = totalCustomers > 0 ? totalCustomerSpend / totalCustomers : 0;

        // Customer details
        List<CustomerAnalyticsResponse.CustomerDetailDTO> customerDetails = allCustomers.stream()
                .map(customer -> {
                    List<Order> userOrders = ordersByUser.getOrDefault(customer.getId(), Collections.emptyList());
                    int totalOrders = userOrders.size();
                    double totalSpent = userOrders.stream()
                            .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                            .mapToDouble(Order::getTotalAmount)
                            .sum();

                    String lastOrderDate = userOrders.stream()
                            .max(Comparator.comparing(Order::getOrderDate))
                            .map(o -> o.getOrderDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                            .orElse("No orders");

                    // Status: NEW (joined this month), ACTIVE (ordered in last 30 days), CHURNED (no order in 60 days)
                    String status;
                    if (customer.getCreatedAt().isAfter(oneMonthAgo)) {
                        status = "NEW";
                    } else {
                        Optional<Order> latestOrder = userOrders.stream()
                                .max(Comparator.comparing(Order::getOrderDate));
                        if (latestOrder.isPresent() && latestOrder.get().getOrderDate().isAfter(LocalDateTime.now().minusDays(60))) {
                            status = "ACTIVE";
                        } else {
                            status = totalOrders == 0 ? "NEW" : "CHURNED";
                        }
                    }

                    return CustomerAnalyticsResponse.CustomerDetailDTO.builder()
                            .id(customer.getId())
                            .name(customer.getName())
                            .email(customer.getEmail())
                            .phone(customer.getPhone())
                            .totalOrders(totalOrders)
                            .totalSpent(Math.round(totalSpent * 100.0) / 100.0)
                            .lastOrderDate(lastOrderDate)
                            .joinDate(customer.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                            .status(status)
                            .build();
                })
                .sorted(Comparator.comparingDouble(CustomerAnalyticsResponse.CustomerDetailDTO::getTotalSpent).reversed())
                .collect(Collectors.toList());

        return CustomerAnalyticsResponse.builder()
                .totalCustomers(totalCustomers)
                .newCustomersThisMonth(newCustomersThisMonth)
                .returningCustomers(returningCustomers)
                .customerRetentionRate(Math.round(retentionRate * 100.0) / 100.0)
                .averageLifetimeValue(Math.round(avgLifetimeValue * 100.0) / 100.0)
                .customers(customerDetails)
                .build();
    }
}
