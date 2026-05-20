package org.example.project.controller;

import org.example.project.model.Category;
import org.example.project.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@RestController
//@RequestMapping("/api") this annotation means all endpoint start with "/api" so no need to write multiple time
public class CategoryController {

    CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/api/public/categories")
//    @RequestMapping(value= "/api/public/categories", method = RequestMethod.GET) another way to implemnt endpoint
    ResponseEntity<List<Category>>getAllCategories(){
        return new ResponseEntity<>(categoryService.getAllCategory(), HttpStatus.OK) ;
    }

    @PostMapping("/api/public/categories")
    public ResponseEntity<String> createCategory(@RequestBody Category category){
        categoryService.createCategory(category);
        return new ResponseEntity<>("Category added successfully", HttpStatus.CREATED);
    }

    @DeleteMapping("/api/public/categories/{categoryId}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long categoryId){
        try{
            String status = categoryService.deleteCategory(categoryId);
            return new ResponseEntity<>(status, HttpStatus.OK);
        }catch (ResponseStatusException e ) {
            return new ResponseEntity<>(e.getReason(),e.getStatusCode());
        }
    }

    @PutMapping("/api/public/categories/{categoryId}")
    public ResponseEntity<String> updateCategory(@RequestBody Category category, @PathVariable Long categoryId){
        try{
            Category saveCategory = categoryService.updateCategory(category, categoryId);
            return new ResponseEntity<>("Category Updated Successfully", HttpStatus.OK);
        }catch (ResponseStatusException e ){
            return new ResponseEntity<>(e.getReason(), e.getStatusCode());
        }
    }


}
