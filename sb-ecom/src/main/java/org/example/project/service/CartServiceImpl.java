package org.example.project.service;

import org.example.project.exceptions.APIException;
import org.example.project.exceptions.ResourceNotFoundException;
import org.example.project.model.Cart;
import org.example.project.model.CartItem;
import org.example.project.model.Product;
import org.example.project.payload.CartDTO;
import org.example.project.payload.CartItemDTO;
import org.example.project.payload.ProductDTO;
import org.example.project.repositories.CartItemRepository;
import org.example.project.repositories.CartRepository;
import org.example.project.repositories.ProductRepository;
import org.example.project.util.AuthUtil;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class CartServiceImpl implements CartService{

    @Autowired
    CartRepository cartRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    CartItemRepository cartItemRepository;

    @Autowired
    AuthUtil authUtil;

    @Autowired
    ModelMapper modelMapper;

    @Override
    public CartDTO addProductToCart(Long productId, Integer quantity) {
        // Find existing cart or create one
        Cart cart = createCart();
        // Retrive Product Details
        Product product = productRepository.findById(productId)
                .orElseThrow(()-> new ResourceNotFoundException("Product" , "productId" , productId));
        // Perform validation
        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(
                cart.getCartId(), productId
        );
        if ( cartItem != null){
            throw new APIException("Prouct " + product.getProductName() + " is already exist in cartItem");
        }
        if ( product.getQuantity() == 0 ){
            throw new APIException("Prouct " + product.getProductName() + " is not available");
        }
        if ( product.getQuantity() < quantity ){
            throw new APIException("Please make an order of the "+ product.getProductName()
                    + "less then or equal to the quantity " + product.getQuantity());
        }
        // Create cart item
        CartItem newCartItem = new CartItem();
        newCartItem.setProduct(product);
        newCartItem.setCart(cart);
        newCartItem.setQuantity(quantity);
        newCartItem.setDiscount(product.getSpecialPrice());
        newCartItem.setProductPrice(product.getPrice());
        cartItemRepository.save(newCartItem);
        // save Cart item
        product.setQuantity(product.getQuantity());
        cart.setTotalPrice(cart.getTotalPrice() + (product.getSpecialPrice() * quantity));
        cartRepository.save(cart);
        // Return updated cart
        CartDTO cartDTO = modelMapper.map(cart , CartDTO.class);
        List<CartItem> cartItems = cart.getCartItems();

        Stream<ProductDTO> productStream = cartItems.stream().map(item ->{
            ProductDTO map = modelMapper.map(item.getProduct(), ProductDTO.class);
            map .setQuantity(item.getQuantity());
            return map;
        });

        cartDTO.setProducts(productStream.toList());
        return cartDTO;
    }


    private Cart createCart(){
        Cart userCart = cartRepository.findCartByEmail(authUtil.loggedInEmail());
        if ( userCart != null ){
            return userCart ;
        }
        Cart cart = new Cart();
        cart.setTotalPrice(0.0);
        cart.setUser(authUtil.loggedInUser());
        Cart newCart = cartRepository.save(cart);
        return newCart;
    }

    @Override
    public List<CartDTO> gteAllCarts() {
        List<Cart> carts = cartRepository.findAll();
        if ( carts.size() == 0){
            throw new APIException("no Cart exists ");
        }
        List<CartDTO> cartDTOS = carts.stream()
                .map(cart->{
                   CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);
                   List<ProductDTO> products = cart.getCartItems().stream()
                           .map(p-> modelMapper.map(p.getProduct(), ProductDTO.class))
                           .collect(Collectors.toList());
                   cartDTO.setProducts(products);
                   return cartDTO;
                }).collect(Collectors.toList());
        return cartDTOS;
    }

    @Override
    public CartDTO getCart(String emailId, Long cartId) {
        Cart cart = cartRepository.findCartByEmailAndCartId(emailId, cartId);
        if ( cart == null ){
            throw new ResourceNotFoundException("Cart" , "cartId" , cartId);
        }
        CartDTO cartDTO = modelMapper.map(cart , CartDTO.class);
        List<ProductDTO> products = cart.getCartItems().stream()
                .map(p-> modelMapper.map(p.getProduct(), ProductDTO.class))
                .toList();
        cartDTO.setProducts(products);
        return cartDTO;
    }
}
