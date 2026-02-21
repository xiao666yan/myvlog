package com.myvlog.blog.annotation;

import java.lang.annotation.*;
import java.util.concurrent.TimeUnit;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimit {
    int limit() default 10;
    int timeout() default 1;
    TimeUnit unit() default TimeUnit.MINUTES;
}
