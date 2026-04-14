package com.ssh.ecommerce.repository;

import com.ssh.ecommerce.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
    Optional<Payment> findByStripeClientSecret(String stripeClientSecret);
    Optional<Payment> findByOrderId(Long orderId);
    List<Payment> findByUserId(Long userId);
}
