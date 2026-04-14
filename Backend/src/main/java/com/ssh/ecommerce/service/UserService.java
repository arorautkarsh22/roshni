package com.ssh.ecommerce.service;

import com.ssh.ecommerce.dto.request.UserRequest;
import com.ssh.ecommerce.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse register(UserRequest request);
    UserResponse getById(Long id);
    UserResponse getByEmail(String email);
    List<UserResponse> getAll();
    UserResponse update(Long id, UserRequest request);
    void delete(Long id);
}
