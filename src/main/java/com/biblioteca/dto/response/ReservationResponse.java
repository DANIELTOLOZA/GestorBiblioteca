package com.biblioteca.dto.response;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ReservationResponse {
    private Long id;
    private UserResponse user;
    private BookResponse book;
    private LocalDate reservationDate;
    private LocalDate expiryDate;
    private String status;
    private LocalDateTime createdAt;
}
