package com.ssh.ecommerce.service.impl;

import com.ssh.ecommerce.dto.request.ProductRequest;
import com.ssh.ecommerce.dto.response.PaginatedResponse;
import com.ssh.ecommerce.dto.response.ProductResponse;
import com.ssh.ecommerce.entity.Category;
import com.ssh.ecommerce.entity.Product;
import com.ssh.ecommerce.entity.ProductImage;
import com.ssh.ecommerce.exception.DuplicateResourceException;
import com.ssh.ecommerce.exception.ResourceNotFoundException;
import com.ssh.ecommerce.repository.CategoryRepository;
import com.ssh.ecommerce.repository.ProductRepository;
import com.ssh.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsByProductId(request.getProductId())) {
            throw new DuplicateResourceException("Product", "productId", request.getProductId());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Product product = Product.builder()
                .productId(request.getProductId())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .rating(request.getRating() != null ? request.getRating() : 0.0)
                .stock(request.getStock() != null ? request.getStock() : 0)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .category(category)
                .build();

        product = productRepository.save(product);

        // Save images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            Product finalProduct = product;
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage image = ProductImage.builder()
                        .imageUrl(request.getImageUrls().get(i))
                        .displayOrder(i)
                        .product(finalProduct)
                        .build();
                images.add(image);
            }
            product.setImages(images);
            product = productRepository.save(product);
        }

        return mapToResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<ProductResponse> getAllPaginated(int page, int size, String sortBy, String sortDir) {
        // Map friendly sort names to entity fields
        String sortField = switch (sortBy.toLowerCase()) {
            case "price" -> "price";
            case "rating" -> "rating";
            case "name" -> "name";
            case "newest", "created", "date" -> "createdAt";
            case "stock" -> "stock";
            default -> "createdAt";
        };

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortField).ascending()
                : Sort.by(sortField).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepository.findAll(pageable);

        List<ProductResponse> content = productPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<ProductResponse>builder()
                .content(content)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .isFirst(productPage.isFirst())
                .isLast(productPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getByProductId(String productId) {
        Product product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));
        return mapToResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getByCategory(Long categoryId) {
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getFeatured() {
        return productRepository.findByIsFeaturedTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> search(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponse update(String productId, ProductRequest request) {
        Product product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setRating(request.getRating() != null ? request.getRating() : product.getRating());
        product.setStock(request.getStock() != null ? request.getStock() : product.getStock());
        product.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : product.getIsFeatured());
        product.setCategory(category);

        // Update images
        if (request.getImageUrls() != null) {
            product.getImages().clear();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage image = ProductImage.builder()
                        .imageUrl(request.getImageUrls().get(i))
                        .displayOrder(i)
                        .product(product)
                        .build();
                product.getImages().add(image);
            }
        }

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public void delete(String productId) {
        Product product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));
        productRepository.delete(product);
    }

    private ProductResponse mapToResponse(Product product) {
        List<String> imageUrls = product.getImages() != null
                ? product.getImages().stream()
                    .map(ProductImage::getImageUrl)
                    .collect(Collectors.toList())
                : new ArrayList<>();

        return ProductResponse.builder()
                .id(product.getId())
                .productId(product.getProductId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .rating(product.getRating())
                .stock(product.getStock())
                .isFeatured(product.getIsFeatured())
                .categoryName(product.getCategory().getName())
                .categoryId(product.getCategory().getId())
                .images(imageUrls)
                .createdAt(product.getCreatedAt())
                .build();
    }
}
