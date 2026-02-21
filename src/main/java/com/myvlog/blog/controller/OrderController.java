package com.myvlog.blog.controller;

import com.myvlog.blog.entity.Order;
import com.myvlog.blog.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(@RequestParam Long productId) {
        return ResponseEntity.ok(orderService.createOrder(productId));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<String> payOrder(@PathVariable Long id) {
        orderService.payOrder(id);
        return ResponseEntity.ok("Payment successful. VIP granted if applicable.");
    }
}
