package com.biblioteca.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "books")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Book {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    @Column(unique = true)
    private String isbn;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "total_copies", nullable = false)
    @Builder.Default
    private int totalCopies = 1;
    @Column(name = "available_copies", nullable = false)
    @Builder.Default
    private int availableCopies = 1;
    @Column(name = "published_year")
    private Integer publishedYear;
    @Column(name = "cover_url")
    private String coverUrl;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    @ManyToMany
    @JoinTable(
        name = "book_authors",
        joinColumns = @JoinColumn(name = "book_id"),
        inverseJoinColumns = @JoinColumn(name = "author_id")
    )
    @Builder.Default
    private Set<Author> authors = new HashSet<>();
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
