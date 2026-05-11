package com.biblioteca.controller;

import com.biblioteca.dto.response.DashboardStatsResponse;
import com.biblioteca.entity.*;
import com.biblioteca.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
public class DashboardController {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final ReservationRepository reservationRepository;
    private final FineRepository fineRepository;

    @GetMapping("/stats")
    public DashboardStatsResponse getStats() {
        return new DashboardStatsResponse(
            bookRepository.count(),
            bookRepository.countByAvailableCopiesGreaterThan(0),
            userRepository.count(),
            loanRepository.countByStatus(LoanStatus.ACTIVE),
            loanRepository.countByStatus(LoanStatus.OVERDUE),
            reservationRepository.findByStatus(ReservationStatus.PENDING, org.springframework.data.domain.Pageable.unpaged()).getTotalElements(),
            fineRepository.sumUnpaidAmount()
        );
    }
}
