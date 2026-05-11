package com.biblioteca.dto.response;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data @AllArgsConstructor
public class DashboardStatsResponse {
    private long totalBooks;
    private long availableBooks;
    private long totalUsers;
    private long activeLoans;
    private long overdueLoans;
    private long pendingReservations;
    private BigDecimal totalUnpaidFines;
}
