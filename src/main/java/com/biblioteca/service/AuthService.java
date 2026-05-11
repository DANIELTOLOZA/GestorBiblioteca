package com.biblioteca.service;

import com.biblioteca.dto.request.LoginRequest;
import com.biblioteca.dto.request.RegisterRequest;
import com.biblioteca.dto.response.AuthResponse;
import com.biblioteca.entity.Role;
import com.biblioteca.entity.User;
import com.biblioteca.exception.BusinessException;
import com.biblioteca.repository.UserRepository;
import com.biblioteca.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = tokenProvider.generateToken(auth);
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        return new AuthResponse(user.getId(), token, user.getEmail(), user.getName(), user.getRole().name());
    }

    @Transactional
    public AuthResponse registerPublic(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent())
            throw new BusinessException("El email ya esta registrado");
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.READER)
                .active(true)
                .build();
        userRepository.save(user);
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = tokenProvider.generateToken(auth);
        return new AuthResponse(user.getId(), token, user.getEmail(), user.getName(), user.getRole().name());
    }
}
