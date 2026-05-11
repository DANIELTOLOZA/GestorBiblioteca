package com.biblioteca.service;

import com.biblioteca.dto.request.CategoryRequest;
import com.biblioteca.dto.response.CategoryResponse;
import com.biblioteca.entity.Category;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    public CategoryResponse findById(Long id) {
        return toResponse(findCategoryById(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        Category c = Category.builder().name(req.getName()).description(req.getDescription()).deweyCode(req.getDeweyCode()).build();
        return toResponse(categoryRepository.save(c));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category c = findCategoryById(id);
        c.setName(req.getName());
        c.setDescription(req.getDescription());
        c.setDeweyCode(req.getDeweyCode());
        return toResponse(categoryRepository.save(c));
    }

    @Transactional
    public void delete(Long id) {
        categoryRepository.delete(findCategoryById(id));
    }

    public Category findCategoryById(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada: " + id));
    }

    public CategoryResponse toResponse(Category c) {
        CategoryResponse r = new CategoryResponse();
        r.setId(c.getId()); r.setName(c.getName()); r.setDescription(c.getDescription()); r.setDeweyCode(c.getDeweyCode());
        return r;
    }
}
