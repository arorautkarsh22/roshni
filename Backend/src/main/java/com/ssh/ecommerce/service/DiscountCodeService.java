package com.ssh.ecommerce.service;

import com.ssh.ecommerce.dto.request.DiscountCodeRequest;
import com.ssh.ecommerce.dto.response.DiscountValidateResponse;

public interface DiscountCodeService {
    String generateAndSend(DiscountCodeRequest request);
    DiscountValidateResponse validate(String code);
    void markUsed(String code);
}
