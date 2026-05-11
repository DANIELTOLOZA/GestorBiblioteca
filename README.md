# 📚 BibliotecaMS — Sistema de Gestión de Biblioteca

Stack: **React 18** (Frontend) + **Spring Boot 3.3** (Backend) + **MySQL 8**

---

## 🏗️ Arquitectura

```
biblioteca-ms/
├── frontend/          ← React + Recharts + Lucide React
└── biblioteca-backend/ ← Spring Boot 3 + Spring Security + JWT + JPA
```

---

## ⚙️ Configuración del Backend

### 1. Requisitos
- Java 17+
- Maven 3.9+
- MySQL 8.0+

### 2. Crear la base de datos
```sql
CREATE DATABASE biblioteca_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'biblioteca'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON biblioteca_db.* TO 'biblioteca'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configurar `application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/biblioteca_db?...
spring.datasource.username=biblioteca
spring.datasource.password=tu_password
app.jwt.secret=TU_SECRETO_JWT_LARGO_Y_SEGURO_MINIMO_256_BITS
```

### 4. Compilar y ejecutar
```bash
cd biblioteca-backend
mvn clean install
mvn spring-boot:run
```
El backend correrá en `http://localhost:8080`

---

## 🌐 API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login → retorna JWT |
| POST | `/api/auth/register` | Registrar usuario (solo ADMIN) |

### Libros
| Método | Ruta | Rol mínimo |
|--------|------|-----------|
| GET | `/api/books` | READER |
| GET | `/api/books?q=titulo` | READER |
| GET | `/api/books/{id}` | READER |
| POST | `/api/books` | LIBRARIAN |
| PUT | `/api/books/{id}` | LIBRARIAN |
| DELETE | `/api/books/{id}` | ADMIN |

### Categorías
| Método | Ruta | Rol mínimo |
|--------|------|-----------|
| GET | `/api/categories` | READER |
| POST/PUT/DELETE | `/api/categories` | ADMIN |

### Préstamos
| Método | Ruta | Rol mínimo |
|--------|------|-----------|
| GET | `/api/loans` | LIBRARIAN |
| GET | `/api/loans?status=active` | LIBRARIAN |
| POST | `/api/loans` | LIBRARIAN |
| PUT | `/api/loans/{id}/return` | LIBRARIAN |

### Usuarios
| Método | Ruta | Rol mínimo |
|--------|------|-----------|
| GET/PUT/DELETE | `/api/users/**` | ADMIN |

---

## 🔐 Roles del sistema

| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Acceso completo: usuarios, libros, categorías, préstamos |
| `LIBRARIAN` | Gestiona libros, categorías y préstamos |
| `READER` | Consulta el catálogo de libros |

---

## 🖥️ Configurar el Frontend React

### 1. Instalar dependencias
```bash
cd frontend
npm install recharts lucide-react
```

### 2. Conectar con el backend
En el archivo React, reemplaza las funciones mock con llamadas reales:
```javascript
// Ejemplo de login real
const login = async (email, password) => {
  const res = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data;
};

// Ejemplo de fetch autenticado
const apiFetch = (url, opts = {}) =>
  fetch(`http://localhost:8080${url}`, {
    ...opts,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json', ...opts.headers }
  });
```

### 3. Ejecutar el frontend
```bash
npm run dev  # Vite
# o
npm start    # CRA
```

---

## 📦 Dependencias principales del Backend

```xml
spring-boot-starter-web
spring-boot-starter-security
spring-boot-starter-data-jpa
spring-boot-starter-validation
mysql-connector-j
jjwt-api / jjwt-impl / jjwt-jackson (v0.12.3)
lombok
```

---

## 🚀 Despliegue (Producción)

```bash
# Generar JAR
mvn clean package -DskipTests
# Ejecutar
java -jar target/biblioteca-ms-1.0.0.jar --spring.profiles.active=prod
```

Para producción, configura un `application-prod.properties` con tus credenciales de producción y usa variables de entorno para los secretos.

---

## 📋 Modelo de datos

```
User (id, name, email, password, role, active, joinedDate)
  └── Loan (N)

Category (id, name, description, icon, color)
  └── Book (N)

Book (id, title, author, isbn, year, publisher, totalCopies, availableCopies, category)
  └── Loan (N)

Loan (id, book, user, startDate, dueDate, returnDate, status)
```
