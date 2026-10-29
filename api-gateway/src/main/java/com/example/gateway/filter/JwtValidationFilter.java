package com.example.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

/**
 * Runs on EVERY request that comes into the gateway.
 *
 *  - /api/auth/**  (register, login, logout) -> let it through, no token needed
 *  - anything else (e.g. /api/students/**)   -> ask auth-service "is this token OK?"
 *        200 from auth-service -> forward the request to the target service
 *        anything else         -> answer 401 right here, the target service is never called
 */
@Component
public class JwtValidationFilter implements GlobalFilter, Ordered {

    private final WebClient webClient;

    public JwtValidationFilter(WebClient.Builder loadBalancedBuilder) {
        this.webClient = loadBalancedBuilder.build();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // public endpoints and CORS preflight need no token
        if (path.startsWith("/api/auth/") || exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }

        // "auth-service" is looked up in Eureka. Any error (401, service down) counts as "not valid".
        return webClient.get()
                .uri("http://auth-service/api/auth/validate")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .retrieve()
                .toBodilessEntity()
                .map(response -> true)
                .onErrorReturn(false)
                .flatMap(valid -> valid ? chain.filter(exchange) : unauthorized(exchange));
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] body = "{\"message\":\"Unauthorized: please log in\"}".getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(body);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    // run early, before the request is routed
    @Override
    public int getOrder() {
        return -1;
    }
}
