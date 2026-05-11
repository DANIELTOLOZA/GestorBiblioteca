package com.biblioteca.repository;

import com.biblioteca.entity.Fine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.Optional;

public interface FineRepository extends JpaRepository<Fine, Long> {
    Page<Fine> findByPaid(boolean paid, Pageable pageable);
    Page<Fine> findByUserId(Long userId, Pageable pageable);
    Optional<Fine> findByLoanId(Long loanId);
    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM Fine f WHERE f.paid = false")
    BigDecimal sumUnpaidAmount();
}
