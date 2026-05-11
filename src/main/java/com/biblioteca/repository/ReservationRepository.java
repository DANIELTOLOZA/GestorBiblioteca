package com.biblioteca.repository;

import com.biblioteca.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Page<Reservation> findByStatus(ReservationStatus status, Pageable pageable);
    Page<Reservation> findByUserId(Long userId, Pageable pageable);
    List<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status);
}
