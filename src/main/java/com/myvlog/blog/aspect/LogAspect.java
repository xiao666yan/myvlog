package com.myvlog.blog.aspect;

import com.myvlog.blog.annotation.Log;
import com.myvlog.blog.entity.OperationLog;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.mapper.OperationLogMapper;
import com.myvlog.blog.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.Arrays;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LogAspect {

    private final OperationLogMapper operationLogMapper;
    private final UserService userService;

    @Pointcut("@annotation(com.myvlog.blog.annotation.Log)")
    public void logPointcut() {
    }

    @Around("logPointcut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        long beginTime = System.currentTimeMillis();
        
        // Execute method
        Object result = point.proceed();
        
        long time = System.currentTimeMillis() - beginTime;
        
        saveLog(point, time);
        
        return result;
    }

    private void saveLog(ProceedingJoinPoint point, long time) {
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();

        OperationLog operationLog = new OperationLog();
        Log logAnnotation = method.getAnnotation(Log.class);
        
        if (logAnnotation != null) {
            operationLog.setModule(logAnnotation.module());
            operationLog.setAction(logAnnotation.action());
            operationLog.setDescription(logAnnotation.description());
        }

        String className = point.getTarget().getClass().getName();
        String methodName = signature.getName();
        operationLog.setMethod(className + "." + methodName + "()");

        // Request Args
        Object[] args = point.getArgs();
        try {
            // Simplify params for log
            String params = Arrays.toString(args);
            if (params.length() > 500) {
                params = params.substring(0, 500) + "...";
            }
            operationLog.setParams(params);
        } catch (Exception e) {
            // Ignore param serialization errors
        }

        // HTTP Context
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        if (request != null) {
            operationLog.setIpAddress(getIpAddress(request));
            operationLog.setUserAgent(request.getHeader("User-Agent"));
        }

        // User Info
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            operationLog.setUsername(username);
            
            // Fetch User ID (Optimizable: Cache or put in UserDetails)
            User user = userService.getByUsername(username);
            if (user != null) {
                operationLog.setUserId(user.getId());
            }
        }

        operationLog.setExecutionTime(time);
        
        // Save Async? For now sync
        operationLogMapper.insert(operationLog);
    }
    
    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
