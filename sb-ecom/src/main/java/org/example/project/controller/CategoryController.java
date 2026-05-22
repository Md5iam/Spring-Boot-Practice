package org.example.project.controller;

import jakarta.validation.Valid;
import org.example.project.Configuration.AppConstants;
import org.example.project.exceptions.APIException;
import org.example.project.model.Category;
import org.example.project.payload.CategoryDTO;
import org.example.project.payload.CategoryResponse;
import org.example.project.repositories.CategoryRepository;
import org.example.project.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@RestController
//@RequestMapping("/api") this annotation means all endpoint start with "/api" so no need to write multiple time
public class CategoryController {

     // this class in only handeling api route , request and response
    //  the others task handel in diffrent package like service exception

    CategoryService categoryService;
    CategoryRepository categoryRepository;

    @Autowired
    public CategoryController(CategoryService categoryService, CategoryRepository categoryRepository) {
        this.categoryService = categoryService;
        this.categoryRepository = categoryRepository;
    }

//    @GetMapping("/api/echo")
//    public ResponseEntity<String> echoMessage(@RequestParam(name = "message" , defaultValue = "hello siam") String message){
//        return new ResponseEntity<>("Echo message " + message , HttpStatus.OK);
//    }

    @GetMapping("/api/public/categories")
//    @RequestMapping(value= "/api/public/categories", method = RequestMethod.GET) another way to implemnt endpoint
    ResponseEntity<CategoryResponse>getAllCategories(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER , required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_CATEGORIES_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder
    ){
        CategoryResponse categories = categoryService.getAllCategory(pageNumber , pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @PostMapping("/api/public/categories")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO){
        CategoryDTO savedCategoryDTO = categoryService.createCategory(categoryDTO);
        return new ResponseEntity<>(savedCategoryDTO, HttpStatus.CREATED);
    }

    @DeleteMapping("/api/public/categories/{categoryId}")
    public ResponseEntity<CategoryDTO> deleteCategory(@PathVariable Long categoryId){
        CategoryDTO categoryDTO = categoryService.deleteCategory(categoryId);
        return new ResponseEntity<>(categoryDTO, HttpStatus.OK);
    }

    @PutMapping("/api/public/categories/{categoryId}")
    public ResponseEntity<CategoryDTO> updateCategory(@RequestBody CategoryDTO categoryDTO, @PathVariable Long categoryId){
        CategoryDTO saveCategoryDTO = categoryService.updateCategory(categoryDTO, categoryId);
        return new ResponseEntity<>(saveCategoryDTO, HttpStatus.OK);
    }


}
