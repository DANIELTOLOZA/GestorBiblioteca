-- Categorias
INSERT INTO categories (name, description, dewey_code) VALUES
  ('Literatura', 'Novelas, cuentos y poesia', '800'),
  ('Ciencias', 'Matematicas, fisica, quimica', '500'),
  ('Historia', 'Historia universal y local', '900'),
  ('Tecnologia', 'Informatica y sistemas', '600'),
  ('Arte', 'Pintura, musica y cine', '700')
ON CONFLICT DO NOTHING;

-- Autores
INSERT INTO authors (name, bio) VALUES
  ('Gabriel Garcia Marquez', 'Escritor colombiano, Premio Nobel 1982'),
  ('Jorge Luis Borges', 'Escritor argentino, maestro del fantastico'),
  ('Robert C. Martin', 'Ingeniero de software, autor de Clean Code'),
  ('Donald Knuth', 'Cientifico computacional, autor de TAOCP'),
  ('Isabel Allende', 'Escritora chilena, autora de La Casa de los Espiritus')
ON CONFLICT DO NOTHING;

-- Usuarios (password: password) - BCrypt hash de "password"
INSERT INTO users (name, email, password, role, active) VALUES
  ('Administrador', 'admin@biblioteca.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', true),
  ('Bibliotecario', 'librarian@biblioteca.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LIBRARIAN', true),
  ('Juan Lector', 'reader@biblioteca.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'READER', true)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- Libros
INSERT INTO books (title, isbn, description, total_copies, available_copies, published_year, category_id) VALUES
  ('Cien anos de soledad', '978-0-06-088328-7', 'La obra cumbre del realismo magico', 5, 5, 1967, 1),
  ('Ficciones', '978-0-8021-3030-0', 'Coleccion de cuentos fantasticos', 3, 3, 1944, 1),
  ('Clean Code', '978-0-13-235088-4', 'Guia para escribir codigo limpio', 4, 4, 2008, 4),
  ('The Art of Computer Programming Vol.1', '978-0-201-89683-1', 'Fundamentos de algoritmos', 2, 2, 1968, 2),
  ('La Casa de los Espiritus', '978-0-553-38368-5', 'Saga familiar de la escritora chilena', 3, 3, 1982, 1),
  ('Breve Historia del Tiempo', '978-0-553-38016-5', 'Stephen Hawking explica el universo', 4, 4, 1988, 2),
  ('Don Quijote de la Mancha', '978-84-376-0494-7', 'La novela mas importante en espanol', 6, 6, 1605, 1),
  ('El arte de la guerra', '978-0-521-60148-1', 'Sun Tzu estrategia milenaria', 5, 5, 500, 3),
  ('Design Patterns', '978-0-201-63361-0', 'Patrones de diseno orientado a objetos', 3, 3, 1994, 4),
  ('Sapiens', '978-0-06-231609-7', 'Breve historia de la humanidad', 4, 4, 2011, 3)
ON CONFLICT DO NOTHING;

-- Relacion libro-autor
INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a
WHERE (b.title = 'Cien anos de soledad' AND a.name = 'Gabriel Garcia Marquez')
   OR (b.title = 'Ficciones' AND a.name = 'Jorge Luis Borges')
   OR (b.title = 'Clean Code' AND a.name = 'Robert C. Martin')
   OR (b.title = 'The Art of Computer Programming Vol.1' AND a.name = 'Donald Knuth')
   OR (b.title = 'La Casa de los Espiritus' AND a.name = 'Isabel Allende')
ON CONFLICT DO NOTHING;
