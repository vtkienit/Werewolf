package com.chat.app.services;

import com.chat.app.dtos.UserLoginRequest;
import com.chat.app.dtos.UserLoginResponse;
import com.chat.app.dtos.UserRegisterRequest;
import com.chat.app.dtos.UserResponse;
import com.chat.app.entities.User;
import com.chat.app.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.chat.app.exceptions.BaseException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class UserService {

    private static final List<String> AVATAR_COLORS = List.of(
            "#80CBC4", "#4DB6AC", // teal
            "#81D4FA", "#4FC3F7", // blue
            "#64B5F6", "#5C6BC0", // blue-indigo
            "#9575CD", "#BA68C8", // purple
            "#F06292", "#EC407A", // pink
            "#FF8A65", "#FF7043", // orange
            "#FFB74D", "#FFA726", // amber
            "#AED581", "#9CCC65", // green
            "#4DD0E1", "#26C6DA", // cyan
            "#7986CB", "#7E57C2"  // indigo
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse createUser(UserRegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BaseException("Email already exists", HttpStatus.CONFLICT);
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setColor(randomAvatarColor());

        // hash password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    public UserLoginResponse login(UserLoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BaseException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BaseException(
                    "Invalid email or password",
                    HttpStatus.UNAUTHORIZED
            );
        }

        String token = jwtService.generateToken(user);

        UserResponse userResponse = toResponse(user);

        return new UserLoginResponse(token, userResponse);
    }

    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Page<UserResponse> getAllUsers(int page, int size) {
        if (page < 0) {
            throw new BaseException("Page must be greater than or equal to 0", HttpStatus.BAD_REQUEST);
        }

        if (size <= 0) {
            throw new BaseException("Size must be greater than 0", HttpStatus.BAD_REQUEST);
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("id").ascending()
        );

        return userRepository.findAll(pageable)
                .map(this::toResponse);
    }

    public List<UserResponse> getAllUsersExceptCurrentUser(Long currentUserId) {
        if (!userRepository.existsById(currentUserId))
            throw new BaseException("User not found", HttpStatus.NOT_FOUND);

        return userRepository.findByIdNot(currentUserId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserByEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException("User not found", HttpStatus.NOT_FOUND));

        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getColor(),
                user.getRole()
        );
    }

    private String randomAvatarColor() {
        int index = ThreadLocalRandom.current().nextInt(AVATAR_COLORS.size());
        return AVATAR_COLORS.get(index);
    }
}