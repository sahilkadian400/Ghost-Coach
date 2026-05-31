package com.playmotech.ghostcoach.controller;

import com.playmotech.ghostcoach.config.JwtUtil;
import com.playmotech.ghostcoach.dto.JwtResponse;
import com.playmotech.ghostcoach.model.User;
import com.playmotech.ghostcoach.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Username is already assigned in secure ledger."));
        }

        // Encode raw password key
        signUpRequest.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        User savedUser = userRepository.save(signUpRequest);

        String token = jwtUtil.generateToken(savedUser.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToJwtResponse(token, savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        var userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid secure athlete key or username reference."));
        }

        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getUsername());

        return ResponseEntity.ok(mapToJwtResponse(token, user));
    }

    private JwtResponse mapToJwtResponse(String token, User user) {
        return JwtResponse.builder()
                .token(token)
                .user(JwtResponse.UserDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .fullName(user.getFullName())
                        .sport(user.getSport())
                        .position(user.getPosition())
                        .experience(user.getExperience())
                        .build())
                .build();
    }
}
