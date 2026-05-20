package org.example.project.service;

import org.example.project.model.Category;

import java.util.List;

public interface CategoryService {
    List<Category> getAllCategory();
    void createCategory(Category category);
    String deleteCategory(Long categoryId);
    Category updateCategory(Category category, Long categoryId);
}
