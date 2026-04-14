package com.ssh.ecommerce.repository;

import com.ssh.ecommerce.entity.Category;
import com.ssh.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByProductId(String productId);
    List<Product> findByCategory(Category category);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByIsFeaturedTrue();
    List<Product> findByNameContainingIgnoreCase(String keyword);
    boolean existsByProductId(String productId);
}
