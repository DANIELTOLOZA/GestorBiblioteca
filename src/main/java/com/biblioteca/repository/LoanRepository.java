package com.biblioteca.repository;

import com.biblioteca.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    Page<Loan> findByStatus(LoanStatus status, Pageable pageable);
    Page<Loan> findByUserId(Long userId, Pageable pageable);
    List<Loan> findByStatusAndDueDateBefore(LoanStatus status, LocalDate date);
    long countByStatus(LoanStatus status);
    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.book.id = :bookId AND l.status = 'ACTIVE'")
    List<Loan> findActiveByUserAndBook(@Param("userId") Long userId, @Param("bookId") Long bookId);
}
