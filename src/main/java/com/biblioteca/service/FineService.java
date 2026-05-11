package com.biblioteca.service;

import com.biblioteca.dto.response.FineResponse;
import com.biblioteca.entity.*;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.repository.FineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class FineService {

    private final FineRepository fineRepository;
    private final UserService userService;
    private static final BigDecimal DAILY_RATE = new BigDecimal("0.50");

    public Page<FineResponse> findAll(Boolean paid, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (paid != null) return fineRepository.findByPaid(paid, pageable).map(this::toResponse);
        return fineRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<FineResponse> findByUser(Long userId, int page, int size) {
        return fineRepository.findByUserId(userId, PageRequest.of(page, size)).map(this::toResponse);
    }

    @Transactional
    public void createFine(Loan loan, LocalDate returnDate) {
        if (fineRepository.findByLoanId(loan.getId()).isPresent()) return;
        long daysLate = ChronoUnit.DAYS.between(loan.getDueDate(), returnDate);
        BigDecimal amount = DAILY_RATE.multiply(BigDecimal.valueOf(daysLate));
        Fine fine = Fine.builder()
                .loan(loan)
                .user(loan.getUser())
                .amount(amount)
                .reason("Devolucion con " + daysLate + " dia(s) de retraso")
                .build();
        fineRepository.save(fine);
    }

    @Transactional
    public FineResponse markAsPaid(Long id) {
        Fine fine = fineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Multa no encontrada: " + id));
        fine.setPaid(true);
        return toResponse(fineRepository.save(fine));
    }

    public FineResponse toResponse(Fine f) {
        FineResponse r = new FineResponse();
        r.setId(f.getId());
        r.setAmount(f.getAmount());
        r.setReason(f.getReason());
        r.setPaid(f.isPaid());
        r.setCreatedAt(f.getCreatedAt());
        r.setUser(userService.toResponse(f.getUser()));
        return r;
    }
}
