package org.example.seuoj.service;

import org.example.seuoj.exceptions.APIException;
import org.example.seuoj.model.AppRole;
import org.example.seuoj.model.Role;
import org.example.seuoj.model.User;
import org.example.seuoj.Auth.JwtResponse;
import org.example.seuoj.Auth.LoginRequest;
import org.example.seuoj.Auth.RegisterRequest;
import org.example.seuoj.payload.User.UserDTO;
import org.example.seuoj.repositories.RoleRepository;
import org.example.seuoj.repositories.UserRepository;
import org.example.seuoj.security.jwt.JwtUtils;
import org.example.seuoj.security.service.UserDetailsImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public UserDTO registerUser(RegisterRequest request) {
        if (userRepository.existsByUserName(request.getUsername())) {
            throw new APIException("Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new APIException("Email is already registered!");
        }

        User user = new User(request.getUsername(), request.getEmail(),
                passwordEncoder.encode(request.getPassword()));

        // Resolve default user role
        Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                .orElseThrow(() -> new APIException("Default user role not found in database."));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);
        user.setJoinedDate(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDTO.class);
    }

    @Override
    public JwtResponse loginUser(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUserName(request.getUsername())
                .orElseThrow(() -> new APIException("Invalid username or password."));

        if (user.getIsBanned() != null && user.getIsBanned()) {
            if (user.getBanUntil() != null && LocalDateTime.now().isAfter(user.getBanUntil())) {
                // Temporary ban has expired, auto-unban the user!
                user.setIsBanned(false);
                user.setBanReason(null);
                user.setBanUntil(null);
                userRepository.save(user);
            } else {
                String message = "This account has been banned. Reason: " + user.getBanReason();
                if (user.getBanUntil() != null) {
                    message += " (until " + user.getBanUntil() + ")";
                }
                throw new APIException(message);
            }
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        String jwtToken = jwtUtils.generateTokenFromUsername(userPrincipal.getUsername());

        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new JwtResponse(jwtToken, userPrincipal.getId(), userPrincipal.getUsername(), userPrincipal.getEmail(), roles);
    }
}
