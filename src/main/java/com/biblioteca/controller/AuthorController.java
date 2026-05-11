package com.biblioteca.controller;

import com.biblioteca.dto.request.AuthorRequest;
import com.biblioteca.dto.response.AuthorResponse;
import com.biblioteca.service.AuthorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;

    @GetMapping
    public List<AuthorResponse> findAll() { return authorService.findAll(); }

    @GetMapping("/{id}")
    public AuthorResponse findById(@PathVariable Long id) { return authorService.findById(id); }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<AuthorResponse> create(@Valid @RequestBody AuthorRequest req) {
        return ResponseEntity.status(201).body(authorService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public AuthorResponse update(@PathVariable Long id, @Valid @RequestBody AuthorRequest req) {
        return authorService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        authorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
