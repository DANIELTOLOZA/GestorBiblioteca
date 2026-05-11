package com.biblioteca.service;

import com.biblioteca.dto.request.BookRequest;
import com.biblioteca.dto.response.*;
import com.biblioteca.entity.*;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryService categoryService;
    private final AuthorService authorService;

    public Page<BookResponse> findAll(String search, Long categoryId, int page, int size) {
        return bookRepository.findByFilters(search, categoryId, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(this::toResponse);
    }

    public BookResponse findById(Long id) {
        return toResponse(findBookById(id));
    }

    @Transactional
    public BookResponse create(BookRequest req) {
        Book book = buildBook(new Book(), req);
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public BookResponse update(Long id, BookRequest req) {
        Book book = findBookById(id);
        int diff = req.getTotalCopies() - book.getTotalCopies();
        buildBook(book, req);
        book.setAvailableCopies(Math.max(0, book.getAvailableCopies() + diff));
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public void delete(Long id) {
        bookRepository.delete(findBookById(id));
    }

    private Book buildBook(Book book, BookRequest req) {
        book.setTitle(req.getTitle());
        book.setIsbn(req.getIsbn());
        book.setDescription(req.getDescription());
        book.setTotalCopies(req.getTotalCopies());
        book.setPublishedYear(req.getPublishedYear());
        book.setCoverUrl(req.getCoverUrl());
        if (req.getCategoryId() != null)
            book.setCategory(categoryService.findCategoryById(req.getCategoryId()));
        if (req.getAuthorIds() != null) {
            Set<Author> authors = req.getAuthorIds().stream()
                    .map(authorService::findAuthorById)
                    .collect(Collectors.toSet());
            book.setAuthors(authors);
        }
        if (book.getId() == null) book.setAvailableCopies(req.getTotalCopies());
        return book;
    }

    public Book findBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Libro no encontrado: " + id));
    }

    public BookResponse toResponse(Book b) {
        BookResponse r = new BookResponse();
        r.setId(b.getId());
        r.setTitle(b.getTitle());
        r.setIsbn(b.getIsbn());
        r.setDescription(b.getDescription());
        r.setTotalCopies(b.getTotalCopies());
        r.setAvailableCopies(b.getAvailableCopies());
        r.setPublishedYear(b.getPublishedYear());
        r.setCoverUrl(b.getCoverUrl());
        r.setCreatedAt(b.getCreatedAt());
        if (b.getCategory() != null) r.setCategory(categoryService.toResponse(b.getCategory()));
        if (b.getAuthors() != null)
            r.setAuthors(b.getAuthors().stream().map(authorService::toResponse).toList());
        return r;
    }
}
