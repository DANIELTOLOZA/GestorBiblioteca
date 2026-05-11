package com.biblioteca.controller;

import com.biblioteca.model.*;
import com.biblioteca.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// ── AuthController ────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> req) {
        Map<String, Object> res = authService.login(req.get("email"), req.get("password"));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> register(@RequestBody Map<String, String> req) {
        User.Role role = User.Role.valueOf(req.getOrDefault("role", "READER"));
        User user = authService.register(req.get("name"), req.get("email"), req.get("password"), role);
        return ResponseEntity.ok(Map.of("message", "Usuario creado", "id", user.getId()));
    }
}

// ── BookController ────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin
class BookController {
    private final BookService bookService;

    @GetMapping
    public ResponseEntity<List<Book>> getAll(@RequestParam(required = false) String q,
                                              @RequestParam(required = false) Long categoryId) {
        if (q != null && !q.isBlank()) return ResponseEntity.ok(bookService.search(q));
        if (categoryId != null) return ResponseEntity.ok(bookService.findByCategory(categoryId));
        return ResponseEntity.ok(bookService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getById(@PathVariable Long id) {
        return bookService.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<Book> create(@RequestBody Map<String, Object> req) {
        Book book = bookService.save(
                (String) req.get("title"), (String) req.get("author"),
                (String) req.get("isbn"), (Integer) req.get("year"),
                (String) req.get("publisher"),
                ((Number) req.get("totalCopies")).intValue(),
                ((Number) req.get("availableCopies")).intValue(),
                ((Number) req.get("categoryId")).longValue());
        return ResponseEntity.ok(book);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<Book> update(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        Book book = bookService.update(id,
                (String) req.get("title"), (String) req.get("author"),
                (String) req.get("isbn"), (Integer) req.get("year"),
                (String) req.get("publisher"),
                ((Number) req.get("totalCopies")).intValue(),
                ((Number) req.get("availableCopies")).intValue(),
                ((Number) req.get("categoryId")).longValue());
        return ResponseEntity.ok(book);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        bookService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Libro eliminado"));
    }
}

// ── CategoryController ────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoryService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> create(@RequestBody Map<String, String> req) {
        Category cat = categoryService.save(req.get("name"), req.get("description"),
                req.get("icon"), req.get("color"));
        return ResponseEntity.ok(cat);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> update(@PathVariable Long id, @RequestBody Map<String, String> req) {
        Category cat = categoryService.update(id, req.get("name"), req.get("description"),
                req.get("icon"), req.get("color"));
        return ResponseEntity.ok(cat);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Categoría eliminada"));
    }
}

// ── LoanController ────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
class LoanController {
    private final LoanService loanService;

    @GetMapping
    public ResponseEntity<List<Loan>> getAll(@RequestParam(required = false) String status) {
        if ("active".equalsIgnoreCase(status)) return ResponseEntity.ok(loanService.findActive());
        return ResponseEntity.ok(loanService.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Loan>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(loanService.findByUser(userId));
    }

    @PostMapping
    public ResponseEntity<Loan> create(@RequestBody Map<String, Object> req) {
        Loan loan = loanService.createLoan(
                ((Number) req.get("bookId")).longValue(),
                ((Number) req.get("userId")).longValue(),
                LocalDate.parse((String) req.get("dueDate")));
        return ResponseEntity.ok(loan);
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<Loan> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.returnLoan(id));
    }
}

// ── UserController ────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return userService.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        User.Role role = User.Role.valueOf((String) req.get("role"));
        boolean active = Boolean.parseBoolean(req.getOrDefault("active", true).toString());
        User user = userService.update(id, (String) req.get("name"), (String) req.get("email"), role, active);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Usuario eliminado"));
    }
}
