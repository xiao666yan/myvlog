package com.myvlog.blog.service;

import com.myvlog.blog.entity.Order;

public interface OrderService {
    Order createOrder(Long productId);
    void payOrder(Long orderId); // Simulate payment callback
}
