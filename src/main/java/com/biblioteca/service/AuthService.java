package com.biblioteca.service;

import com.biblioteca.dto.request.LoginRequest;
import com.biblioteca.dto.response.AuthResponse;
import com.biblioteca.entity.User;
import com.biblioteca.repository.UserRepository;
import com.biblioteca.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = tokenProvider.generateToken(auth);
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }
}
