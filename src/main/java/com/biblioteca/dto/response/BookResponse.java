package com.biblioteca.dto.response;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BookResponse {
    private Long id;
    private String title;
    private String isbn;
    private String description;
    private int totalCopies;
    private int availableCopies;
    private Integer publishedYear;
    private String coverUrl;
    private CategoryResponse category;
    private List<AuthorResponse> authors;
    private LocalDateTime createdAt;
}
