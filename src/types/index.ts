export type Role = 'ADMIN' | 'LIBRARIAN' | 'READER';
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  deweyCode?: string;
}

export interface Author {
  id: number;
  name: string;
  bio?: string;
}

export interface Book {
  id: number;
  title: string;
  isbn?: string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  publishedYear?: number;
  coverUrl?: string;
  category?: Category;
  authors?: Author[];
  createdAt: string;
}

export interface Loan {
  id: number;
  user: User;
  book: Book;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
  createdAt: string;
}

export interface Reservation {
  id: number;
  user: User;
  book: Book;
  reservationDate: string;
  expiryDate?: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface Fine {
  id: number;
  loan: Loan;
  user: User;
  amount: number;
  reason?: string;
  paid: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  totalUsers: number;
  activeLoans: number;
  overdueLoans: number;
  pendingReservations: number;
  totalUnpaidFines: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuthData {
  id: number;
  token: string;
  email: string;
  name: string;
  role: Role;
}
