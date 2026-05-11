package com.biblioteca.service;

import com.biblioteca.dto.request.AuthorRequest;
import com.biblioteca.dto.response.AuthorResponse;
import com.biblioteca.entity.Author;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthorService {

    private final AuthorRepository authorRepository;

    public List<AuthorResponse> findAll() {
        return authorRepository.findAll().stream().map(this::toResponse).toList();
    }

    public AuthorResponse findById(Long id) {
        return toResponse(findAuthorById(id));
    }

    @Transactional
    public AuthorResponse create(AuthorRequest req) {
        Author a = Author.builder().name(req.getName()).bio(req.getBio()).build();
        return toResponse(authorRepository.save(a));
    }

    @Transactional
    public AuthorResponse update(Long id, AuthorRequest req) {
        Author a = findAuthorById(id);
        a.setName(req.getName()); a.setBio(req.getBio());
        return toResponse(authorRepository.save(a));
    }

    @Transactional
    public void delete(Long id) {
        authorRepository.delete(findAuthorById(id));
    }

    public Author findAuthorById(Long id) {
        return authorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Autor no encontrado: " + id));
    }

    public AuthorResponse toResponse(Author a) {
        AuthorResponse r = new AuthorResponse();
        r.setId(a.getId()); r.setName(a.getName()); r.setBio(a.getBio());
        return r;
    }
}
