package com.biblioteca.dto.response;
import lombok.Data;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String deweyCode;
}
