package com.biblioteca.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReservationRequest {
    @NotNull
    private Long bookId;
}
