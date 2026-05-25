package org.example.project.service;

import org.example.project.payload.CartDTO;

import java.util.List;

public interface CartService {

    CartDTO addProductToCart(Long productId, Integer quantity);
    List<CartDTO> gteAllCarts();
    CartDTO getCart (String emailId, Long cartId);
}
