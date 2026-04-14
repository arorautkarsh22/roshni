package com.ssh.ecommerce.service;

import com.ssh.ecommerce.dto.request.AddressRequest;
import com.ssh.ecommerce.dto.response.AddressResponse;

import java.util.List;

public interface AddressService {
    AddressResponse create(Long userId, AddressRequest request);
    List<AddressResponse> getByUser(Long userId);
    AddressResponse update(Long id, AddressRequest request);
    void delete(Long id);
}
