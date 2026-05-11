package com.biblioteca.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fines")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Fine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    private String reason;
    @Column(nullable = false)
    @Builder.Default
    private boolean paid = false;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
