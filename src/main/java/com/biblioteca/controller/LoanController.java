package com.biblioteca.controller;

import com.biblioteca.dto.request.LoanRequest;
import com.biblioteca.dto.response.LoanResponse;
import com.biblioteca.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.biblioteca.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public Page<LoanResponse> findAll(@RequestParam(required = false) String status,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size) {
        return loanService.findAll(status, page, size);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<LoanResponse> create(@Valid @RequestBody LoanRequest req) {
        return ResponseEntity.status(201).body(loanService.create(req));
    }

    @PutMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public LoanResponse returnBook(@PathVariable Long id) {
        return loanService.returnBook(id);
    }

    @GetMapping("/my")
    public Page<LoanResponse> myLoans(@AuthenticationPrincipal UserDetails userDetails,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        return loanService.findByUser(userId, page, size);
    }
}
