package com.rootdocs.service;

import com.rootdocs.dto.LoginResponse;
import com.rootdocs.dto.RefreshResponse;
import com.rootdocs.model.RefreshToken;
import com.rootdocs.model.User;
import com.rootdocs.repository.RefreshTokenRepository;
import com.rootdocs.repository.UserRepository;
import com.rootdocs.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final long REFRESH_TOKEN_DURATION_DAYS = 7;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public LoginResponse authenticate(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        UserDetails userDetails = loadUserByUsername(username);
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = createRefreshToken(user);

        return new LoginResponse(accessToken, refreshToken, user.getUsername(), user.getRole().name());
    }

    @Transactional
    public RefreshResponse refresh(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .filter(rt -> rt.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired refresh token"));

        User user = refreshToken.getUser();
        UserDetails userDetails = loadUserByUsername(user.getUsername());

        // Rotate: delete old, create new
        refreshTokenRepository.delete(refreshToken);
        String newRefreshToken = createRefreshToken(user);
        String newAccessToken = jwtService.generateAccessToken(userDetails);

        return new RefreshResponse(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        refreshTokenRepository.findByToken(refreshTokenStr)
                .ifPresent(refreshTokenRepository::delete);
    }

    private String createRefreshToken(User user) {
        // Delete any existing refresh tokens for this user (single session)
        refreshTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        RefreshToken refreshToken = new RefreshToken(
                token,
                user,
                Instant.now().plusSeconds(REFRESH_TOKEN_DURATION_DAYS * 86400)
        );
        refreshTokenRepository.save(refreshToken);
        return token;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRole().name())
                .build();
    }
}