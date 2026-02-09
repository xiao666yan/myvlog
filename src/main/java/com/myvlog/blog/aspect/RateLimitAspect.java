package com.myvlog.blog.aspect;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.util.concurrent.RateLimiter;
import com.myvlog.blog.annotation.RateLimit;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

@Aspect
@Component
@Slf4j
public class RateLimitAspect {

    // Cache to store RateLimiter for each IP + Method
    // Key: ip + methodSignature
    private final Cache<String, RateLimiter> limiters = CacheBuilder.newBuilder()
            .expireAfterAccess(1, TimeUnit.HOURS)
            .build();

    @Around("@annotation(com.myvlog.blog.annotation.RateLimit)")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        RateLimit rateLimit = method.getAnnotation(RateLimit.class);

        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        if (request == null) {
            return point.proceed();
        }

        String ip = getIpAddress(request);
        String key = ip + "-" + method.getName();

        RateLimiter rateLimiter = limiters.get(key, () -> RateLimiter.create(calculatePermitsPerSecond(rateLimit)));

        if (!rateLimiter.tryAcquire()) {
            throw new RuntimeException("Too many requests, please try again later.");
        }

        return point.proceed();
    }

    private double calculatePermitsPerSecond(RateLimit rateLimit) {
        // Convert limit/timeout(unit) to permits per second
        long timeoutInSeconds = rateLimit.unit().toSeconds(rateLimit.timeout());
        if (timeoutInSeconds == 0) timeoutInSeconds = 1;
        return (double) rateLimit.limit() / timeoutInSeconds;
    }

    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
