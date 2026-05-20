package org.example.project.service;
import org.example.project.model.Category;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryServiceImpl implements CategoryService{
    List<Category> categories = new ArrayList<>();
    Long userId = 1L;

    @Override
    public List<Category> getAllCategory() {
        return categories;
    }

    @Override
    public void createCategory(Category category) {
        category.setCategoryId(userId++);
        categories.add(category);
    }

    @Override
    public String deleteCategory(Long categoryId) {
        Category category = categories.stream().filter(c -> c.getCategoryId()
                .equals(categoryId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found")) ;

        categories.remove(category);
        return "Category is deleted successfully";
    }

    @Override
    public Category updateCategory(Category category, Long categoryId) {
        Optional<Category> optionalCategory = categories.stream().filter(c -> c.getCategoryId().equals(categoryId)).findFirst();
        if( optionalCategory.isPresent()){
            Category existingCategory = optionalCategory.get();
            existingCategory.setCategoryName(category.getCategoryName());
            return existingCategory;
        }
        else{
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
        }
    }
}
