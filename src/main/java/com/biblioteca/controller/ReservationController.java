package com.biblioteca.controller;

import com.biblioteca.dto.request.ReservationRequest;
import com.biblioteca.dto.response.ReservationResponse;
import com.biblioteca.repository.UserRepository;
import com.biblioteca.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public Page<ReservationResponse> findAll(@RequestParam(required = false) String status,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return reservationService.findAll(status, page, size);
    }

    @PostMapping
    public ResponseEntity<ReservationResponse> create(@AuthenticationPrincipal UserDetails userDetails,
                                                       @Valid @RequestBody ReservationRequest req) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        return ResponseEntity.status(201).body(reservationService.create(userId, req));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ReservationResponse confirm(@PathVariable Long id) {
        return reservationService.confirm(id);
    }

    @PutMapping("/{id}/cancel")
    public ReservationResponse cancel(@PathVariable Long id) {
        return reservationService.cancel(id);
    }

    @GetMapping("/my")
    public Page<ReservationResponse> myReservations(@AuthenticationPrincipal UserDetails userDetails,
                                                      @RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "10") int size) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        return reservationService.findByUser(userId, page, size);
    }
}
