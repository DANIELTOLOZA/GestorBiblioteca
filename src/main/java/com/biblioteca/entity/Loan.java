package com.biblioteca.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Loan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
    @Column(name = "loan_date", nullable = false)
    @Builder.Default
    private LocalDate loanDate = LocalDate.now();
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;
    @Column(name = "return_date")
    private LocalDate returnDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LoanStatus status = LoanStatus.ACTIVE;
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
