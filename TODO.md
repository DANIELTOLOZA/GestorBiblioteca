# TODO - BibliotecaMS (React + Spring Boot)

## Backend (Spring Boot)
- [ ] Verificar endpoints existentes y roles (ADMIN/LIBRARIAN/READER) contra la UI requerida.
- [ ] Ajustar CORS en `application.properties` si el origen del frontend difiere.

## Frontend (React)
- [ ] Crear proyecto React en `frontend/` usando Vite + React Router.
- [ ] Implementar auth JWT:
  - [ ] Login (POST `/api/auth/login`)
  - [ ] Guardar token y datos de sesión (localStorage)
  - [ ] Protected routes por rol
- [ ] Implementar páginas:
  - [ ] `AdminDashboard` (resumen + tabla usuarios)
  - [ ] `BooksManager` (listado + CRUD)
  - [ ] `CategoriesManager` (CRUD)
  - [ ] `LoansManager` (listar + devolver)
- [ ] Implementar capa de API client:
  - [ ] `Authorization: Bearer <token>`
  - [ ] Manejo de errores y loading states

## Integración y pruebas
- [ ] Levantar backend y frontend en local.
- [ ] Probar flujos de login por rol.
- [ ] Probar CRUD y préstamos según permisos.

