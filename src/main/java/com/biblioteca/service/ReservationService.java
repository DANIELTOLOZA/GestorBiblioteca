package com.biblioteca.service;

import com.biblioteca.dto.request.ReservationRequest;
import com.biblioteca.dto.response.ReservationResponse;
import com.biblioteca.entity.*;
import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BookService bookService;
    private final UserService userService;

    public Page<ReservationResponse> findAll(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null) {
            ReservationStatus rs = ReservationStatus.valueOf(status.toUpperCase());
            return reservationRepository.findByStatus(rs, pageable).map(this::toResponse);
        }
        return reservationRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<ReservationResponse> findByUser(Long userId, int page, int size) {
        return reservationRepository.findByUserId(userId, PageRequest.of(page, size)).map(this::toResponse);
    }

    @Transactional
    public ReservationResponse create(Long userId, ReservationRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Book book = bookRepository.findById(req.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Libro no encontrado"));
        boolean hasActive = !reservationRepository.findByUserIdAndStatus(userId, ReservationStatus.PENDING).isEmpty();
        if (hasActive) throw new BusinessException("Ya tienes una reserva pendiente para este libro");

        Reservation reservation = Reservation.builder()
                .user(user)
                .book(book)
                .expiryDate(LocalDate.now().plusDays(3))
                .build();
        return toResponse(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationResponse confirm(Long id) {
        Reservation r = findReservationById(id);
        r.setStatus(ReservationStatus.CONFIRMED);
        return toResponse(reservationRepository.save(r));
    }

    @Transactional
    public ReservationResponse cancel(Long id) {
        Reservation r = findReservationById(id);
        r.setStatus(ReservationStatus.CANCELLED);
        return toResponse(reservationRepository.save(r));
    }

    private Reservation findReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada: " + id));
    }

    public ReservationResponse toResponse(Reservation r) {
        ReservationResponse res = new ReservationResponse();
        res.setId(r.getId());
        res.setUser(userService.toResponse(r.getUser()));
        res.setBook(bookService.toResponse(r.getBook()));
        res.setReservationDate(r.getReservationDate());
        res.setExpiryDate(r.getExpiryDate());
        res.setStatus(r.getStatus().name());
        res.setCreatedAt(r.getCreatedAt());
        return res;
    }
}
