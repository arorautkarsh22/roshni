package com.ssh.ecommerce.service;

import com.ssh.ecommerce.dto.request.LoginRequest;
import com.ssh.ecommerce.dto.request.RegisterRequest;
import com.ssh.ecommerce.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse registerAdmin(RegisterRequest request);
}
