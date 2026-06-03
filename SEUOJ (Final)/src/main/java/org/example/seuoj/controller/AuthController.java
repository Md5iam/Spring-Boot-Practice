package org.example.seuoj.controller;

import jakarta.validation.Valid;
import org.example.seuoj.exceptions.APIException;
import org.example.seuoj.model.User;
import org.example.seuoj.repositories.UserRepository;
import org.example.seuoj.payload.APIResponse;
import org.example.seuoj.Auth.JwtResponse;
import org.example.seuoj.Auth.LoginRequest;
import org.example.seuoj.Auth.RegisterRequest;
import org.example.seuoj.payload.User.UserDTO;
import org.example.seuoj.security.jwt.JwtUtils;
import org.example.seuoj.security.service.UserDetailsImpl;
import org.example.seuoj.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import java.time.LocalDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@Valid @RequestBody RegisterRequest request) {
        UserDTO userDTO = authService.registerUser(request);
        return new ResponseEntity<>(userDTO, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> loginUser(@Valid @RequestBody LoginRequest request) {
        // Enforce Ban checks BEFORE authenticating to return a clear suspension message to the user!
        User user = userRepository.findByUserName(request.getUsername()).orElse(null);
        if (user != null && user.getIsBanned() != null && user.getIsBanned()) {
            if (user.getBanUntil() != null && LocalDateTime.now().isAfter(user.getBanUntil())) {
                // Temporary ban has expired, auto-unban the user!
                user.setIsBanned(false);
                user.setBanReason(null);
                user.setBanUntil(null);
                userRepository.save(user);
            } else {
                String duration = user.getBanUntil() == null ? "permanently" : "until " + user.getBanUntil();
                throw new APIException("Your account has been suspended " + duration + ". Reason: " + user.getBanReason());
            }
        }

        // Authenticate credentials
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        // Generate response JWT token & Cookie
        String jwtToken = jwtUtils.generateTokenFromUsername(userPrincipal.getUsername());
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userPrincipal);

        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        JwtResponse jwtResponse = new JwtResponse(jwtToken, userPrincipal.getId(), userPrincipal.getUsername(), userPrincipal.getEmail(), roles);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(jwtResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<APIResponse> logoutUser() {
        ResponseCookie cleanCookie = jwtUtils.generateCleanJwtCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                .body(new APIResponse("Logged out successfully!", true));
    }
}
