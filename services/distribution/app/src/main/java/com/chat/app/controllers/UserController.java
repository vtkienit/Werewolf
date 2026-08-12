package com.chat.app.controllers;

import com.chat.app.dtos.UserLoginRequest;
import com.chat.app.dtos.UserLoginResponse;
import com.chat.app.dtos.UserRegisterRequest;
import com.chat.app.dtos.UserResponse;
import com.chat.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/all")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping
    public Page<UserResponse> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return userService.getAllUsers(page, size);
    }

    @GetMapping("/exclude")
    public List<UserResponse> getAllUsers(Authentication authentication) {
        Long currentUserId = (Long) authentication.getPrincipal();

        return userService.getAllUsersExceptCurrentUser(currentUserId);
    }

    @GetMapping("/by-email")
    public UserResponse getUserByEmail(@RequestParam String email) {
        return userService.getUserByEmail(email);
    }
}