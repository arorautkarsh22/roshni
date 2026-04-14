package com.ssh.ecommerce.service;

import com.ssh.ecommerce.dto.request.ReviewRequest;
import com.ssh.ecommerce.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse create(ReviewRequest request);
    List<ReviewResponse> getByProduct(Long productId);
    List<ReviewResponse> getByUser(Long userId);
    void delete(Long id);
}
