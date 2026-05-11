package com.biblioteca.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoanRequest {
    @NotNull
    private Long userId;
    @NotNull
    private Long bookId;
    @NotNull
    private java.time.LocalDate dueDate;
}
