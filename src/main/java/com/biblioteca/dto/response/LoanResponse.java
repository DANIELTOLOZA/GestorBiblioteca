package com.biblioteca.dto.response;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LoanResponse {
    private Long id;
    private UserResponse user;
    private BookResponse book;
    private LocalDate loanDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private String status;
    private LocalDateTime createdAt;
}
