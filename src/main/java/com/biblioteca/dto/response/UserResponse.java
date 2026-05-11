package com.biblioteca.dto.response;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean active;
    private LocalDateTime createdAt;
}
