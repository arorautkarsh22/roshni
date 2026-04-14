package com.ssh.ecommerce.security;

import com.ssh.ecommerce.entity.Cart;
import com.ssh.ecommerce.entity.User;
import com.ssh.ecommerce.entity.enums.Role;
import com.ssh.ecommerce.repository.CartRepository;
import com.ssh.ecommerce.repository.UserRepository;
import com.ssh.ecommerce.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                         Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        log.info("Google OAuth2 login successful for: {} ({})", name, email);

        // Find or create user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Creating new user from Google OAuth2: {}", email);

            User newUser = User.builder()
                    .name(name)
                    .email(email)
                    .password(UUID.randomUUID().toString()) // Random password for OAuth2 users
                    .phone("")
                    .role(Role.CUSTOMER)
                    .build();
            newUser = userRepository.save(newUser);

            // Create cart for new user
            Cart cart = Cart.builder()
                    .user(newUser)
                    .totalPrice(0.0)
                    .build();
            cartRepository.save(cart);

            // Send welcome email
            emailService.sendWelcomeEmail(newUser);

            return newUser;
        });

        // Generate JWT token
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        String accessToken = jwtService.generateToken(userDetails);

        // Redirect to frontend with JWT token
        String redirectUrl = frontendUrl + "/oauth2/callback"
                + "?token=" + accessToken
                + "&userId=" + user.getId()
                + "&name=" + java.net.URLEncoder.encode(user.getName(), "UTF-8")
                + "&email=" + java.net.URLEncoder.encode(user.getEmail(), "UTF-8")
                + "&role=" + user.getRole().name();

        log.info("Redirecting OAuth2 user to frontend: {}", user.getEmail());
        response.sendRedirect(redirectUrl);
    }
}
