package com.ssh.ecommerce.controller;

import com.ssh.ecommerce.dto.ApiResponse;
import com.ssh.ecommerce.dto.request.ProductRequest;
import com.ssh.ecommerce.dto.response.PaginatedResponse;
import com.ssh.ecommerce.dto.response.ProductResponse;
import com.ssh.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAll() {
        List<ProductResponse> response = productService.getAll();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Paginated + sorted product listing.
     * Examples:
     *   /api/products/page?page=0&size=6&sortBy=price&sortDir=asc
     *   /api/products/page?sortBy=rating&sortDir=desc
     *   /api/products/page?sortBy=newest
     */
    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PaginatedResponse<ProductResponse>>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PaginatedResponse<ProductResponse> response = productService.getAllPaginated(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> getByProductId(@PathVariable String productId) {
        ProductResponse response = productService.getByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getByCategory(@PathVariable Long categoryId) {
        List<ProductResponse> response = productService.getByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeatured() {
        List<ProductResponse> response = productService.getFeatured();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> search(@RequestParam String keyword) {
        List<ProductResponse> response = productService.search(keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable String productId,
                                                                @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.update(productId, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String productId) {
        productService.delete(productId);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
}
