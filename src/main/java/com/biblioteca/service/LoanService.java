package com.biblioteca.service;

import com.biblioteca.dto.request.LoanRequest;
import com.biblioteca.dto.response.LoanResponse;
import com.biblioteca.entity.*;
import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BookService bookService;
    private final UserService userService;
    private final FineService fineService;

    public Page<LoanResponse> findAll(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null) {
            LoanStatus loanStatus = LoanStatus.valueOf(status.toUpperCase());
            return loanRepository.findByStatus(loanStatus, pageable).map(this::toResponse);
        }
        return loanRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<LoanResponse> findByUser(Long userId, int page, int size) {
        return loanRepository.findByUserId(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(this::toResponse);
    }

    @Transactional
    public LoanResponse create(LoanRequest req) {
        Book book = bookRepository.findById(req.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Libro no encontrado"));
        if (book.getAvailableCopies() < 1)
            throw new BusinessException("No hay copias disponibles del libro");
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        if (!loanRepository.findActiveByUserAndBook(user.getId(), book.getId()).isEmpty())
            throw new BusinessException("El usuario ya tiene este libro en prestamo");

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Loan loan = Loan.builder()
                .user(user)
                .book(book)
                .dueDate(req.getDueDate())
                .build();
        return toResponse(loanRepository.save(loan));
    }

    @Transactional
    public LoanResponse returnBook(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Prestamo no encontrado"));
        if (loan.getStatus() == LoanStatus.RETURNED)
            throw new BusinessException("El libro ya fue devuelto");

        LocalDate returnDate = LocalDate.now();
        loan.setReturnDate(returnDate);
        loan.setStatus(LoanStatus.RETURNED);

        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        if (returnDate.isAfter(loan.getDueDate())) {
            fineService.createFine(loan, returnDate);
        }

        return toResponse(loanRepository.save(loan));
    }

    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void markOverdueLoans() {
        List<Loan> overdueLoans = loanRepository.findByStatusAndDueDateBefore(LoanStatus.ACTIVE, LocalDate.now());
        overdueLoans.forEach(loan -> {
            loan.setStatus(LoanStatus.OVERDUE);
            loanRepository.save(loan);
        });
    }

    public LoanResponse toResponse(Loan l) {
        LoanResponse r = new LoanResponse();
        r.setId(l.getId());
        r.setUser(userService.toResponse(l.getUser()));
        r.setBook(bookService.toResponse(l.getBook()));
        r.setLoanDate(l.getLoanDate());
        r.setDueDate(l.getDueDate());
        r.setReturnDate(l.getReturnDate());
        r.setStatus(l.getStatus().name());
        r.setCreatedAt(l.getCreatedAt());
        return r;
    }
}
