package com.biblioteca.repository;

import com.biblioteca.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByActiveTrue();
}

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByCategoryId(Long categoryId);
    List<Book> findByAvailableCopiesGreaterThan(int copies);

    @Query("SELECT b FROM Book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Book> searchBooks(String q);
}

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String name);
}

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUserId(Long userId);
    List<Loan> findByBookId(Long bookId);
    List<Loan> findByStatus(Loan.LoanStatus status);
    List<Loan> findByReturnDateIsNull();

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = 'ACTIVE'")
    long countActiveLoans();
}
