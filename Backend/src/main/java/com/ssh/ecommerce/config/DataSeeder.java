package com.ssh.ecommerce.config;

import com.ssh.ecommerce.entity.*;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🛠️ Cleaning up legacy database columns...");
        try {
            // Drop columns if they exist. Using multiple tries for safety.
            try { jdbcTemplate.execute("ALTER TABLE payments DROP COLUMN razorpay_order_id"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("ALTER TABLE payments DROP COLUMN razorpay_payment_id"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("ALTER TABLE payments DROP COLUMN razorpay_signature"); } catch (Exception ignored) {}
            log.info("✅ Database cleanup successful!");
        } catch (Exception e) {
            log.warn("⚠️ Database cleanup warning: {}", e.getMessage());
        }

        // Seed admin user if not exists
        if (!userRepository.existsByEmail("admin@roshnicreations.com")) {
            User admin = User.builder()
                    .name("Admin")
                    .email("admin@roshnicreations.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("9999999999")
                    .role(Role.ADMIN)
                    .build();
            admin = userRepository.save(admin);

            Cart adminCart = Cart.builder().user(admin).totalPrice(0.0).build();
            cartRepository.save(adminCart);

            log.info("Admin user created — email: admin@roshnicreations.com, password: admin123");
        }

        if (productRepository.count() > 0) {
            log.info("Products already seeded. Skipping...");
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
    }

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
