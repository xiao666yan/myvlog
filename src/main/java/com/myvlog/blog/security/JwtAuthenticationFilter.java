package com.myvlog.blog.security;

import com.myvlog.blog.utils.JwtUtils;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT 认证过滤器
 * 继承 OncePerRequestFilter 确保每个请求只被过滤一次
 * 用于从请求头中提取 Token，验证合法性，并将用户信息存入 Spring Security 上下文
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils; // JWT 工具类
    private final UserDetailsService userDetailsService; // 用于根据用户名加载用户信息

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();
        System.out.println("DEBUG: JwtFilter processing request: " + path);

        // 1. 获取请求头中的 Authorization 字段
        final String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String username = null;

        // 2. 如果请求头不包含 Bearer Token，则直接放行 (由后续拦截器决定是否报错)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 3. 截取 Token 字符串 (去掉 "Bearer " 前缀)
            jwt = authHeader.substring(7);
            // 4. 从 Token 中提取用户名
            username = jwtUtils.extractUsername(jwt);

            // 5. 如果用户名有效且当前上下文没有认证信息
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // 6. 从数据库/内存中加载用户信息
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // 7. 验证 Token 是否合法且属于该用户
                if (jwtUtils.isTokenValid(jwt, userDetails)) {
                    // 8. 创建认证对象并存入 SecurityContext 上下文
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // 密码设为空，因为 Token 已经通过验证
                            userDetails.getAuthorities() // 用户的角色/权限列表
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (ExpiredJwtException e) {
            log.warn("JWT token has expired: {}", e.getMessage());
            // Token 过期：在响应头中标记，方便前端处理跳转
            response.setHeader("X-JWT-Expired", "true");
        } catch (JwtException e) {
            log.error("JWT authentication failed: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during JWT authentication", e);
        }
        
        // 继续执行后续过滤器链
        filterChain.doFilter(request, response);
    }
}
