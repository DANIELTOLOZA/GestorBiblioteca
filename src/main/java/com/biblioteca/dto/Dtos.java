package com.biblioteca.dto;

import com.biblioteca.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// ── Auth DTOs ──────────────────────────────────────────────────────────────

@Data
class LoginRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
}

@Data
class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String name;
    private String email;
    private User.Role role;

    public AuthResponse(String token, Long id, String name, String email, User.Role role) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }
}

// ── Book DTOs ──────────────────────────────────────────────────────────────

@Data
class BookDto {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private Integer year;
    private String publisher;
    private int totalCopies;
    private int availableCopies;
    private Long categoryId;
    private String categoryName;
}

@Data
class BookRequest {
    @NotBlank private String title;
    @NotBlank private String author;
    private String isbn;
    private Integer year;
    private String publisher;
    private int totalCopies;
    private int availableCopies;
    private Long categoryId;
}

// ── User DTOs ──────────────────────────────────────────────────────────────

@Data
class UserDto {
    private Long id;
    private String name;
    private String email;
    private User.Role role;
    private boolean active;
    private String joinedDate;
}

@Data
class UserRequest {
    @NotBlank private String name;
    @NotBlank @Email private String email;
    @NotBlank private String password;
    private User.Role role = User.Role.READER;
}

// ── Loan DTOs ──────────────────────────────────────────────────────────────

@Data
class LoanDto {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private Long userId;
    private String userName;
    private String startDate;
    private String dueDate;
    private String returnDate;
    private String status;
}

@Data
class LoanRequest {
    private Long bookId;
    private Long userId;
    private String dueDate;
}
