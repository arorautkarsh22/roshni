package com.ssh.ecommerce.service.impl;

import com.ssh.ecommerce.dto.request.DiscountCodeRequest;
import com.ssh.ecommerce.dto.response.DiscountValidateResponse;
import com.ssh.ecommerce.entity.DiscountCode;
import com.ssh.ecommerce.entity.User;
import com.ssh.ecommerce.exception.ResourceNotFoundException;
import com.ssh.ecommerce.repository.DiscountCodeRepository;
import com.ssh.ecommerce.repository.UserRepository;
import com.ssh.ecommerce.service.DiscountCodeService;
import com.ssh.ecommerce.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DiscountCodeServiceImpl implements DiscountCodeService {

    private final DiscountCodeRepository discountCodeRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    public String generateAndSend(DiscountCodeRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        // Generate a unique human-readable code like RC-A3F7B2
        String code;
        do {
            code = "RC-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (discountCodeRepository.existsByCode(code));

        LocalDateTime expiresAt = LocalDateTime.now().plusDays(30);

        DiscountCode discountCode = DiscountCode.builder()
                .code(code)
                .discountPercent(request.getDiscountPercent())
                .user(user)
                .isUsed(false)
                .expiresAt(expiresAt)
                .build();

        discountCodeRepository.save(discountCode);
        log.info("🎁 Discount code {} generated for user {}", code, user.getEmail());

        String expiresAtFormatted = expiresAt.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        emailService.sendDiscountCode(user.getEmail(), user.getName(), code,
                request.getDiscountPercent(), expiresAtFormatted);

        return code;
    }

    @Override
    @Transactional(readOnly = true)
    public DiscountValidateResponse validate(String code) {
        DiscountCode discountCode = discountCodeRepository.findByCode(code).orElse(null);

        if (discountCode == null) {
            return DiscountValidateResponse.builder()
                    .valid(false)
                    .message("Invalid discount code.")
                    .build();
        }
        if (discountCode.getIsUsed()) {
            return DiscountValidateResponse.builder()
                    .valid(false)
                    .code(code)
                    .message("This discount code has already been used.")
                    .build();
        }
        if (discountCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            return DiscountValidateResponse.builder()
                    .valid(false)
                    .code(code)
                    .message("This discount code has expired.")
                    .build();
        }

        return DiscountValidateResponse.builder()
                .valid(true)
                .code(code)
                .discountPercent(discountCode.getDiscountPercent())
                .message(discountCode.getDiscountPercent() + "% discount applied!")
                .build();
    }

    @Override
    public void markUsed(String code) {
        DiscountCode discountCode = discountCodeRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("DiscountCode", "code", code));
        discountCode.setIsUsed(true);
        discountCodeRepository.save(discountCode);
        log.info("✅ Discount code {} marked as used", code);
    }
}
