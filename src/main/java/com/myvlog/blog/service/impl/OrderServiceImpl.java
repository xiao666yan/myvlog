package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.entity.Order;
import com.myvlog.blog.entity.Product;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.mapper.OrderMapper;
import com.myvlog.blog.mapper.ProductMapper;
import com.myvlog.blog.mapper.UserMapper;
import com.myvlog.blog.service.OrderService;
import com.myvlog.blog.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

    private final ProductMapper productMapper;
    private final UserMapper userMapper;
    private final UserService userService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            return userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        }
        throw new RuntimeException("User not found");
    }

    @Override
    @Transactional
    public Order createOrder(Long productId) {
        User user = getCurrentUser();
        Product product = productMapper.selectById(productId);
        if (product == null || !product.getIsActive()) {
            throw new RuntimeException("Product not available");
        }

        Order order = new Order();
        order.setOrderNo(UUID.randomUUID().toString().replace("-", ""));
        order.setUserId(user.getId());
        order.setProductId(productId);
        order.setAmount(product.getPrice());
        order.setStatus("pending");
        
        save(order);
        return order;
    }

    @Override
    @Transactional
    public void payOrder(Long orderId) {
        Order order = getById(orderId);
        if (order == null) throw new RuntimeException("Order not found");
        
        if (!"pending".equals(order.getStatus())) {
            throw new RuntimeException("Order status is not pending");
        }
        
        // Simulate payment success
        order.setStatus("paid");
        order.setPaidAt(LocalDateTime.now());
        order.setPaymentMethod("simulation");
        order.setTransactionId("SIM_" + System.currentTimeMillis());
        updateById(order);
        
        // Handle product delivery (Grant VIP)
        Product product = productMapper.selectById(order.getProductId());
        if (product != null) {
            if ("vip_monthly".equals(product.getType())) {
                userService.grantVip(order.getUserId(), 30);
            } else if ("vip_yearly".equals(product.getType())) {
                userService.grantVip(order.getUserId(), 365);
            }
        }
    }
}
