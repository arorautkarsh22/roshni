package com.ssh.ecommerce.repository;

import com.ssh.ecommerce.entity.EmailNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailNotificationRepository extends JpaRepository<EmailNotification, Long> {
    List<EmailNotification> findByToEmailOrderBySentAtDesc(String toEmail);
    List<EmailNotification> findByReferenceId(String referenceId);
    List<EmailNotification> findByTypeOrderBySentAtDesc(String type);
    List<EmailNotification> findAllByOrderBySentAtDesc();
}
