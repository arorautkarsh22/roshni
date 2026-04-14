package com.ssh.ecommerce.service;

import com.ssh.ecommerce.dto.request.ProductRequest;
import com.ssh.ecommerce.dto.response.PaginatedResponse;
import com.ssh.ecommerce.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {
    ProductResponse create(ProductRequest request);
    List<ProductResponse> getAll();
    PaginatedResponse<ProductResponse> getAllPaginated(int page, int size, String sortBy, String sortDir);
    ProductResponse getByProductId(String productId);
    List<ProductResponse> getByCategory(Long categoryId);
    List<ProductResponse> getFeatured();
    List<ProductResponse> search(String keyword);
    ProductResponse update(String productId, ProductRequest request);
    void delete(String productId);
}
