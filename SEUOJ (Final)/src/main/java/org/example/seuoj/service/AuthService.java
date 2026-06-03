package org.example.seuoj.service;

import org.example.seuoj.Auth.JwtResponse;
import org.example.seuoj.Auth.LoginRequest;
import org.example.seuoj.Auth.RegisterRequest;
import org.example.seuoj.payload.User.UserDTO;

public interface AuthService {
    UserDTO registerUser(RegisterRequest request);
    JwtResponse loginUser(LoginRequest request);
}
