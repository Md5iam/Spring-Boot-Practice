package org.example.seuoj.security.service;

import org.example.seuoj.exceptions.APIException;
import org.example.seuoj.model.User;
import org.example.seuoj.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        // Enforce Ban checks
        if (user.getIsBanned() != null && user.getIsBanned()) {
            if (user.getBanUntil() == null || user.getBanUntil().isAfter(LocalDateTime.now())) {
                String duration = user.getBanUntil() == null ? "permanently" : "until " + user.getBanUntil();
                throw new APIException("Your account has been suspended " + duration + ". Reason: " + user.getBanReason());
            }
        }

        return UserDetailsImpl.build(user);
    }
}
