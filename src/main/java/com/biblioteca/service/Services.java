package com.biblioteca.service;

import com.biblioteca.model.*;
import com.biblioteca.repository.*;
import com.biblioteca.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

// ── UserDetailsService ──────────────────────────────────────────────────────

@Service
@RequiredArgsConstructor
class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .accountLocked(!user.isActive())
                .build();
    }
}

// ── AuthService ─────────────────────────────────────────────────────────────

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Map<String, Object> login(String email, String password) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));
        String token = tokenProvider.generateToken(auth);
        User user = userRepository.findByEmail(email).orElseThrow();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("token", token);
        res.put("type", "Bearer");
        res.put("id", user.getId());
        res.put("name", user.getName());
        res.put("email", user.getEmail());
        res.put("role", user.getRole());
        return res;
    }

    public User register(String name, String email, String password, User.Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("El correo ya está registrado");
        }
        User user = User.builder()
                .name(name).email(email)
                .password(passwordEncoder.encode(password))
                .role(role).active(true).build();
        return userRepository.save(user);
    }
}

// ── BookService ──────────────────────────────────────────────────────────────

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    public List<Book> findAll() { return bookRepository.findAll(); }
    public List<Book> search(String q) { return bookRepository.searchBooks(q); }
    public List<Book> findByCategory(Long catId) { return bookRepository.findByCategoryId(catId); }
    public Optional<Book> findById(Long id) { return bookRepository.findById(id); }

    @Transactional
    public Book save(String title, String author, String isbn, Integer year, String publisher,
                     int totalCopies, int available, Long categoryId) {
        Category cat = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        Book book = Book.builder().title(title).author(author).isbn(isbn).year(year)
                .publisher(publisher).totalCopies(totalCopies).availableCopies(available)
                .category(cat).build();
        return bookRepository.save(book);
    }

    @Transactional
    public Book update(Long id, String title, String author, String isbn, Integer year,
                       String publisher, int totalCopies, int available, Long categoryId) {
        Book book = bookRepository.findById(id).orElseThrow(() -> new RuntimeException("Libro no encontrado"));
        Category cat = categoryRepository.findById(categoryId).orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        book.setTitle(title); book.setAuthor(author); book.setIsbn(isbn); book.setYear(year);
        book.setPublisher(publisher); book.setTotalCopies(totalCopies); book.setAvailableCopies(available);
        book.setCategory(cat);
        return bookRepository.save(book);
    }

    public void delete(Long id) { bookRepository.deleteById(id); }
}

// ── CategoryService ──────────────────────────────────────────────────────────

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<Category> findAll() { return categoryRepository.findAll(); }
    public Optional<Category> findById(Long id) { return categoryRepository.findById(id); }

    public Category save(String name, String description, String icon, String color) {
        if (categoryRepository.existsByName(name)) throw new RuntimeException("La categoría ya existe");
        return categoryRepository.save(Category.builder().name(name).description(description).icon(icon).color(color).build());
    }

    public Category update(Long id, String name, String description, String icon, String color) {
        Category c = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        c.setName(name); c.setDescription(description); c.setIcon(icon); c.setColor(color);
        return categoryRepository.save(c);
    }

    public void delete(Long id) { categoryRepository.deleteById(id); }
}

// ── LoanService ──────────────────────────────────────────────────────────────

@Service
@RequiredArgsConstructor
public class LoanService {
    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public List<Loan> findAll() { return loanRepository.findAll(); }
    public List<Loan> findActive() { return loanRepository.findByStatus(Loan.LoanStatus.ACTIVE); }
    public List<Loan> findByUser(Long userId) { return loanRepository.findByUserId(userId); }

    @Transactional
    public Loan createLoan(Long bookId, Long userId, LocalDate dueDate) {
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Libro no encontrado"));
        if (book.getAvailableCopies() <= 0) throw new RuntimeException("No hay copias disponibles");
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);
        Loan loan = Loan.builder().book(book).user(user)
                .startDate(LocalDate.now()).dueDate(dueDate)
                .status(Loan.LoanStatus.ACTIVE).build();
        return loanRepository.save(loan);
    }

    @Transactional
    public Loan returnLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
        if (loan.getStatus() == Loan.LoanStatus.RETURNED) throw new RuntimeException("Ya fue devuelto");
        loan.setReturnDate(LocalDate.now());
        loan.setStatus(Loan.LoanStatus.RETURNED);
        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);
        return loanRepository.save(loan);
    }
}

// ── UserService ──────────────────────────────────────────────────────────────

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> findAll() { return userRepository.findAll(); }
    public Optional<User> findById(Long id) { return userRepository.findById(id); }

    @Transactional
    public User update(Long id, String name, String email, User.Role role, boolean active) {
        User u = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        u.setName(name); u.setEmail(email); u.setRole(role); u.setActive(active);
        return userRepository.save(u);
    }

    public void delete(Long id) { userRepository.deleteById(id); }
}
