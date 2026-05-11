package com.biblioteca.service;

import com.biblioteca.dto.request.UserRequest;
import com.biblioteca.dto.response.UserResponse;
import com.biblioteca.entity.User;
import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<UserResponse> findAll(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(this::toResponse);
    }

    public UserResponse findById(Long id) {
        return toResponse(findUserById(id));
    }

    @Transactional
    public UserResponse create(UserRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new BusinessException("Email ya registrado: " + req.getEmail());
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .build();
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserRequest req) {
        User user = findUserById(id);
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        if (req.getPassword() != null && !req.getPassword().isBlank())
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(req.getRole());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void toggleActive(Long id) {
        User user = findUserById(id);
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    @Transactional
    public void delete(Long id) {
        userRepository.delete(findUserById(id));
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
    }

    public UserResponse toResponse(User user) {
        UserResponse r = new UserResponse();
        r.setId(user.getId());
        r.setName(user.getName());
        r.setEmail(user.getEmail());
        r.setRole(user.getRole().name());
        r.setActive(user.isActive());
        r.setCreatedAt(user.getCreatedAt());
        return r;
    }
}
