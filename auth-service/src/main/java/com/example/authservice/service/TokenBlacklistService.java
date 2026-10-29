package com.example.authservice.service;

import com.example.authservice.model.BlacklistedToken;
import com.example.authservice.repository.BlacklistedTokenRepository;
import org.springframework.stereotype.Service;

/** The token denylist used for logout. */
@Service
public class TokenBlacklistService {

    private final BlacklistedTokenRepository repository;

    public TokenBlacklistService(BlacklistedTokenRepository repository) {
        this.repository = repository;
    }

    public void blacklist(String token) {
        if (!repository.existsByToken(token)) {
            repository.save(new BlacklistedToken(token));
        }
    }

    public boolean isBlacklisted(String token) {
        return repository.existsByToken(token);
    }
}
