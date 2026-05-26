package org.example.project.service;

import jakarta.transaction.Transactional;
import org.example.project.payload.OrderDTO;

public interface OrderService {
    @Transactional
    OrderDTO placeOrder(String emailId, Long addressId, String paymentMethod, String pgName, String pgPaymentId, String pgStatus, String pgResponseMessage);
}
