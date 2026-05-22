package org.example.project.service;

import org.example.project.model.Product;
import org.example.project.payload.ProductDTO;
import org.example.project.payload.ProductResponse;

public interface ProductService {
    ProductDTO addProduct(Long categoryId, Product product);

    ProductResponse getAllProduct();

    ProductResponse searchByCategory(Long categoryId);

    ProductResponse searchProductByKeyword(String keyword);

    ProductDTO updateProduct(Product product, Long productId);

    ProductDTO deleteProduct(Long productId);
}
