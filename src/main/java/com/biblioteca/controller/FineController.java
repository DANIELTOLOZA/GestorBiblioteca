package com.biblioteca.controller;

import com.biblioteca.dto.response.FineResponse;
import com.biblioteca.service.FineService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import com.biblioteca.repository.UserRepository;

@RestController
@RequestMapping("/api/fines")
@RequiredArgsConstructor
public class FineController {

    private final FineService fineService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public Page<FineResponse> findAll(@RequestParam(required = false) Boolean paid,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size) {
        return fineService.findAll(paid, page, size);
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public FineResponse markAsPaid(@PathVariable Long id) {
        return fineService.markAsPaid(id);
    }

    @GetMapping("/my")
    public Page<FineResponse> myFines(@AuthenticationPrincipal UserDetails userDetails,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        return fineService.findByUser(userId, page, size);
    }
}
