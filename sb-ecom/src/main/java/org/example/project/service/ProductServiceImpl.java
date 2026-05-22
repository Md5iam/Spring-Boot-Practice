package org.example.project.service;

import org.example.project.exceptions.ResourceNotFoundException;
import org.example.project.model.Category;
import org.example.project.model.Product;
import org.example.project.payload.ProductDTO;
import org.example.project.payload.ProductResponse;
import org.example.project.repositories.CategoryRepository;
import org.example.project.repositories.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService{

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    ModelMapper modelMapper;

    @Override
    public ProductDTO addProduct(Long categoryId, Product product) {
        Category category= categoryRepository.findById(categoryId)
                .orElseThrow(
                        ()->new ResourceNotFoundException("Category" , "categoryId", categoryId));
        product.setCategory(category);
        product.setImage("default.png");
        double sprecialPrice = product.getPrice() - ((product.getDiscount()* 0.01 ) * product.getPrice());
        product.setSpecialPrice(sprecialPrice);
        Product savedProduct = productRepository.save(product);
        return modelMapper.map(savedProduct , ProductDTO.class);
    }

    @Override
    public ProductResponse getAllProduct() {
        List<Product> products = productRepository.findAll();
        List<ProductDTO> productDTOS = products.stream()
                .map(product -> modelMapper.map(product, ProductDTO.class))
                .collect(Collectors.toList());
        ProductResponse productResponse = new ProductResponse();
        productResponse.setContent(productDTOS);
        return  productResponse;
    }

    @Override
    public ProductResponse searchByCategory(Long categoryId) {
        Category category= categoryRepository.findById(categoryId)
                .orElseThrow(
                        ()->new ResourceNotFoundException("Category" , "categoryId", categoryId));
        List<Product> products = productRepository.findByCategoryOrderByPriceAsc(category);
        List<ProductDTO> productDTOS = products.stream()
                .map(product -> modelMapper.map(product, ProductDTO.class))
                .collect(Collectors.toList());
        ProductResponse productResponse = new ProductResponse();
        productResponse.setContent(productDTOS);
        return  productResponse;
    }

    @Override
    public ProductResponse searchProductByKeyword(String keyword) {
        List<Product> products = productRepository.findByProductNameLikeIgnoreCase('%'+keyword+'%');
        List<ProductDTO> productDTOS = products.stream()
                .map(product -> modelMapper.map(product, ProductDTO.class))
                .collect(Collectors.toList());
        ProductResponse productResponse = new ProductResponse();
        productResponse.setContent(productDTOS);
        return  productResponse;
    }

    @Override
    public ProductDTO updateProduct(Product product, Long productId) {
        Product productFromDB = productRepository.findById(productId)
                .orElseThrow(()-> new ResourceNotFoundException("Product" , "productId", productId));
        productFromDB.setProductName(product.getProductName());
        productFromDB.setDescription(product.getDescription());
        productFromDB.setQuantity(product.getQuantity());
        productFromDB.setDiscount(product.getDiscount());
        productFromDB.setPrice(product.getPrice());
        productFromDB.setSpecialPrice(product.getSpecialPrice());

        Product savedProduce = productRepository.save(productFromDB);
        return modelMapper.map(savedProduce, ProductDTO.class);
    }

    @Override
    public ProductDTO deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(()-> new ResourceNotFoundException("Product" , "productId", productId));
        productRepository.delete(product);
        return modelMapper.map(product, ProductDTO.class);
    }
}
