package com.biblioteca.dto.response;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FineResponse {
    private Long id;
    private LoanResponse loan;
    private UserResponse user;
    private BigDecimal amount;
    private String reason;
    private boolean paid;
    private LocalDateTime createdAt;
}
