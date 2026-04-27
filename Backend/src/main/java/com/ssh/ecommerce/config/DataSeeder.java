package com.ssh.ecommerce.config;

import com.ssh.ecommerce.entity.*;
import com.ssh.ecommerce.entity.enums.OrderStatus;
import com.ssh.ecommerce.entity.enums.PaymentMethod;
import com.ssh.ecommerce.entity.enums.PaymentStatus;
import com.ssh.ecommerce.entity.enums.Role;
import com.ssh.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🛠️ Cleaning up legacy database columns...");
        try {
            // PostgreSQL-safe: only drop columns if table and column exist
            jdbcTemplate.execute(
                "DO $$ BEGIN " +
                "IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='razorpay_order_id') THEN " +
                "ALTER TABLE payments DROP COLUMN razorpay_order_id; END IF; " +
                "IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='razorpay_payment_id') THEN " +
                "ALTER TABLE payments DROP COLUMN razorpay_payment_id; END IF; " +
                "IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='razorpay_signature') THEN " +
                "ALTER TABLE payments DROP COLUMN razorpay_signature; END IF; " +
                "END $$;"
            );
            log.info("✅ Database cleanup successful!");
        } catch (Exception e) {
            log.warn("⚠️ Database cleanup warning: {}", e.getMessage());
        }

        // Ensure admin user exists and has ADMIN role
        User admin = userRepository.findByEmail("admin@gmail.com").orElse(null);
        if (admin == null) {
            admin = User.builder()
                    .name("Admin")
                    .email("admin@gmail.com")
                    .phone("9999999999")
                    .build();
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setRole(Role.ADMIN);
            admin = userRepository.save(admin);

            Cart adminCart = Cart.builder().user(admin).totalPrice(0.0).build();
            cartRepository.save(adminCart);

            log.info("Admin user created — email: admin@gmail.com, password: 123456");
        } else {
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.info("Admin user updated with ADMIN role and new password.");
        }

        if (productRepository.count() > 0) {
            log.info("Products already seeded. Skipping product seed...");
            // Still seed customers & orders if they don't exist yet
            seedCustomersAndOrders();
            return;
        }

        log.info("Seeding database with categories and products...");

        // Create categories
        Category choker = createCategory("Choker", "Elegant choker jewellery collection",
                "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/01/product-001-1.webp");
        Category necklace = createCategory("Necklace", "Premium necklace collection",
                "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/02/product-002-1.webp");
        Category mangalsutra = createCategory("Mangalsutra", "Traditional mangalsutra collection",
                "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/04/product-004-1.webp");
        Category watch = createCategory("Watch", "Stylish watch collection",
                "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/05/product-005-1.webp");

        Map<String, Category> categoryMap = Map.of(
                "choker", choker,
                "necklace", necklace,
                "mangalsutra", mangalsutra,
                "watch", watch
        );

        // Seed all 12 products
        seedProduct("prod_001", "Premium Kundan Choker", 1800.0, "choker", categoryMap,
                "Elegant handcrafted jewellery designed for timeless beauty and modern grace.",
                4.5, 12, true, LocalDate.of(2026, 4, 10),
                List.of(
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/01/product-001-1.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/01/product-001-2.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/01/product-001-3.webp"
                ));

        seedProduct("prod_002", "Premium Pink Beads Necklace", 450.0, "necklace", categoryMap,
                "Elegant handcrafted jewellery designed for timeless beauty and modern grace.",
                4.6, 10, false, LocalDate.of(2026, 4, 10),
                List.of(
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/02/product-002-1.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/02/product-002-2.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/02/product-002-3.webp"
                ));

        seedProduct("prod_003", "Premium Green Beads Necklace", 350.0, "necklace", categoryMap,
                "Elegant handcrafted jewellery designed for timeless beauty and modern grace.",
                4.2, 7, false, LocalDate.of(2026, 4, 10),
                List.of(
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/03/product-003-1.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/03/product-003-2.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/03/product-003-3.webp"
                ));

        seedProduct("prod_004", "Premium Moon Mangalsutra", 450.0, "mangalsutra", categoryMap,
                "Elegant handcrafted jewellery designed for timeless beauty and modern grace.",
                4.8, 9, true, LocalDate.of(2026, 4, 10),
                List.of(
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/04/product-004-1.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/04/product-004-2.webp"
                ));

        seedProduct("prod_005", "Premium Bridal Watch", 1070.0, "watch", categoryMap,
                "Elegant handcrafted jewellery designed for timeless beauty and modern grace.",
                4.4, 15, false, LocalDate.of(2026, 4, 10),
                List.of(
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/05/product-005-1.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/05/product-005-2.webp"
                ));

        seedProduct("prod_006", "Premium Black Bead Necklace", 970.0, "necklace", categoryMap,
                "Elegant handcrafted jewellery designed for timeless beauty and modern grace.",
                4.9, 4, true, LocalDate.of(2026, 4, 10),
                List.of(
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/06/product-006-1.webp"
                ));

        seedProduct("prod_007", "Premium Kundan Mangalsutra", 890.0, "mangalsutra", categoryMap,
                "Elegant handcrafted jewellery designed for timeless beauty and modern grace.",
                4.8, 6, false, LocalDate.of(2026, 4, 10),
                List.of(
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/07/product-007-1.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/07/product-007-2.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/07/product-007-3.webp"
                ));

        seedProduct("prod_008", "Premium Kundan Mangalsutra – Royal Edition", 990.0, "mangalsutra", categoryMap,
                "Elegant handcrafted jewellery designed for timeless beauty and modern grace.",
                4.7, 8, true, LocalDate.of(2026, 4, 10),
                List.of(
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/08/product-008-1.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/08/product-008-2.webp"
                ));

        seedProduct("prod_009", "Brass Beaded Necklace", 1080.0, "necklace", categoryMap,
                "Elegant handcrafted jewellery designed for timeless beauty and modern grace.",
                4.9, 16, false, LocalDate.of(2026, 4, 10),
                List.of(
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/09/product-009-1.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/09/product-009-2.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/09/product-009-3.webp"
                ));

        seedProduct("prod_010", "Grace Premium Necklace", 1080.0, "necklace", categoryMap,
                "Elegant handcrafted jewellery designed for timeless beauty and modern grace.",
                4.7, 13, false, LocalDate.of(2026, 4, 10),
                List.of(
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/10/product-010-1.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/10/product-010-2.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/10/product-010-3.webp"
                ));

        seedProduct("prod_011", "Grace Premium Watch", 1099.0, "watch", categoryMap,
                "Elegant handcrafted jewellery designed for timeless beauty and modern grace.",
                4.8, 19, true, LocalDate.of(2026, 4, 10),
                List.of(
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/11/product-011-1.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/11/product-011-2.webp"
                ));

        seedProduct("prod_012", "Rainbow Beads Premium Watch", 1099.0, "watch", categoryMap,
                "Elegant handcrafted jewellery designed for timeless beauty and modern grace.",
                4.7, 20, false, LocalDate.of(2026, 4, 10),
                List.of(
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/12/product-012-1.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/12/product-012-2.webp",
                        "https://raw.githubusercontent.com/SatyawanPanchal/roshni_creations_assets_ssh01/main/assets/12/product-012-3.webp"
                ));

        log.info("Database seeded successfully with 4 categories and 12 products!");

        // Seed customers and orders
        seedCustomersAndOrders();
    }

    // ────────────────────────────────────────────────────
    //  Seed dummy customers, addresses, and orders
    // ────────────────────────────────────────────────────

    private void seedCustomersAndOrders() {
        // Only seed if our dummy data hasn't been seeded yet
        boolean alreadySeeded = userRepository.findByEmail("priya.sharma@gmail.com").isPresent();
        if (alreadySeeded) {
            log.info("Dummy customers already seeded. Skipping customer/order seed.");
            return;
        }

        log.info("🧑‍🤝‍🧑 Seeding dummy customers, addresses, and orders...");

        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            log.warn("No products found — skipping order seeding.");
            return;
        }

        // ── Create 8 dummy customers ──
        String[][] customerData = {
                {"Priya Sharma",    "priya.sharma@gmail.com",    "9876543210"},
                {"Rahul Verma",     "rahul.verma@gmail.com",     "9876543211"},
                {"Anita Desai",     "anita.desai@gmail.com",     "9876543212"},
                {"Vikram Singh",    "vikram.singh@gmail.com",    "9876543213"},
                {"Meera Patel",     "meera.patel@gmail.com",     "9876543214"},
                {"Arjun Reddy",     "arjun.reddy@gmail.com",     "9876543215"},
                {"Sneha Gupta",     "sneha.gupta@gmail.com",     "9876543216"},
                {"Rohan Joshi",     "rohan.joshi@gmail.com",     "9876543217"},
        };

        List<User> customers = new ArrayList<>();
        for (String[] cd : customerData) {
            User customer = User.builder()
                    .name(cd[0])
                    .email(cd[1])
                    .phone(cd[2])
                    .role(Role.CUSTOMER)
                    .build();
            customer.setPassword(passwordEncoder.encode("password123"));
            // Vary join dates to make analytics look realistic
            customer.setCreatedAt(LocalDateTime.now().minusDays((long) (Math.random() * 45) + 1));
            customer = userRepository.save(customer);

            // Create cart for each customer
            Cart cart = Cart.builder().user(customer).totalPrice(0.0).build();
            cartRepository.save(cart);

            customers.add(customer);
        }
        log.info("✅ Created {} dummy customers.", customers.size());

        // ── Create addresses for each customer ──
        String[][] addressData = {
                {"12, MG Road",      "Sector 21",     "Mumbai",     "Maharashtra",  "400001"},
                {"45, Park Street",  "Block B",       "Delhi",      "Delhi",        "110001"},
                {"78, Lake View",    "Near Temple",   "Jaipur",     "Rajasthan",    "302001"},
                {"33, Ring Road",    "Flat 4B",       "Bangalore",  "Karnataka",    "560001"},
                {"91, Civil Lines",  "",              "Ahmedabad",  "Gujarat",      "380001"},
                {"22, Station Road", "Opp. Mall",     "Hyderabad",  "Telangana",    "500001"},
                {"56, Nehru Nagar",  "Lane 3",        "Pune",       "Maharashtra",  "411001"},
                {"8, Gandhi Chowk",  "Near Market",   "Lucknow",    "Uttar Pradesh","226001"},
        };

        List<Address> addresses = new ArrayList<>();
        for (int i = 0; i < customers.size(); i++) {
            String[] ad = addressData[i];
            Address address = Address.builder()
                    .user(customers.get(i))
                    .fullName(customers.get(i).getName())
                    .phone(customers.get(i).getPhone())
                    .addressLine1(ad[0])
                    .addressLine2(ad[1])
                    .city(ad[2])
                    .state(ad[3])
                    .pincode(ad[4])
                    .isDefault(true)
                    .build();
            addresses.add(addressRepository.save(address));
        }
        log.info("✅ Created {} addresses.", addresses.size());

        // ── Create dummy orders ──
        // Each customer will get 1-3 orders with varying statuses/dates
        OrderStatus[] statuses = {OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED, OrderStatus.PENDING, OrderStatus.DELIVERED};
        PaymentMethod[] methods = {PaymentMethod.UPI, PaymentMethod.CARD, PaymentMethod.COD, PaymentMethod.ONLINE, PaymentMethod.NET_BANKING};
        PaymentStatus[] payStatuses = {PaymentStatus.COMPLETED, PaymentStatus.COMPLETED, PaymentStatus.COMPLETED, PaymentStatus.PENDING, PaymentStatus.COMPLETED};

        int orderSeq = 1;
        for (int ci = 0; ci < customers.size(); ci++) {
            User customer = customers.get(ci);
            Address address = addresses.get(ci);

            // each customer gets 2-3 orders
            int numOrders = 2 + (ci % 2);  // alternating 2 or 3
            for (int oi = 0; oi < numOrders; oi++) {
                int statusIdx = (ci + oi) % statuses.length;
                String orderId = String.format("ORD-%04d", orderSeq++);

                // Pick 1-3 random products for this order
                int numItems = 1 + (oi % 3);
                List<OrderItem> orderItems = new ArrayList<>();
                double total = 0;

                Order order = Order.builder()
                        .orderId(orderId)
                        .user(customer)
                        .shippingAddress(address)
                        .totalAmount(0.0) // will update after items
                        .orderStatus(statuses[statusIdx])
                        .paymentMethod(methods[statusIdx])
                        .paymentStatus(payStatuses[statusIdx])
                        .orderDate(LocalDateTime.now().minusDays((long) (Math.random() * 30) + 1))
                        .build();
                order = orderRepository.save(order);

                for (int pi = 0; pi < numItems; pi++) {
                    Product product = products.get((ci * 3 + oi + pi) % products.size());
                    int qty = 1 + (pi % 2);  // 1 or 2
                    double unitPrice = product.getPrice();

                    OrderItem item = OrderItem.builder()
                            .order(order)
                            .product(product)
                            .quantity(qty)
                            .unitPrice(unitPrice)
                            .build();
                    orderItems.add(item);
                    total += unitPrice * qty;
                }

                order.setOrderItems(orderItems);
                order.setTotalAmount(total);
                orderRepository.save(order);
            }
        }

        long totalOrders = orderRepository.count();
        log.info("✅ Seeded {} dummy orders across {} customers!", totalOrders, customers.size());
        log.info("🎉 Full dummy data seeding complete — dashboard should now show real stats.");
    }

    // ────────────────────────────────────────────────────
    //  Product / Category helpers (unchanged)
    // ────────────────────────────────────────────────────

    private Category createCategory(String name, String description, String imageUrl) {
        Category category = Category.builder()
                .name(name)
                .description(description)
                .imageUrl(imageUrl)
                .build();
        return categoryRepository.save(category);
    }

    private void seedProduct(String productId, String name, Double price, String categoryKey,
                              Map<String, Category> categoryMap, String description,
                              Double rating, Integer stock, Boolean isFeatured, LocalDate createdAt,
                              List<String> imageUrls) {
        Category category = categoryMap.get(categoryKey);

        Product product = Product.builder()
                .productId(productId)
                .name(name)
                .price(price)
                .category(category)
                .description(description)
                .rating(rating)
                .stock(stock)
                .isFeatured(isFeatured)
                .createdAt(createdAt)
                .build();

        product = productRepository.save(product);

        List<ProductImage> images = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            ProductImage image = ProductImage.builder()
                    .imageUrl(imageUrls.get(i))
                    .displayOrder(i)
                    .product(product)
                    .build();
            images.add(image);
        }
        product.setImages(images);
        productRepository.save(product);
    }
}
