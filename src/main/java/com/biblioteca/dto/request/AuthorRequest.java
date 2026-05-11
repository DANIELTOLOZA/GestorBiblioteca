package com.biblioteca.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AuthorRequest {
    @NotBlank
    private String name;
    private String bio;
}
