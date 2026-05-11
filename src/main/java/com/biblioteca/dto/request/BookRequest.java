package com.biblioteca.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Set;

@Data
public class BookRequest {
    @NotBlank
    private String title;
    private String isbn;
    private String description;
    @Min(1)
    private int totalCopies = 1;
    private Integer publishedYear;
    private String coverUrl;
    private Long categoryId;
    private Set<Long> authorIds;
}
