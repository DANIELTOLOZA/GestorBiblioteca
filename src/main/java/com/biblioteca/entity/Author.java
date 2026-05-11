package com.biblioteca.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "authors")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Author {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    private String bio;
}
