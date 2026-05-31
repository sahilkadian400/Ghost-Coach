package com.playmotech.ghostcoach.config;

import com.playmotech.ghostcoach.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtil.validateToken(jwt)) {
                String username = jwtUtil.getUsernameFromToken(jwt);

                var userOpt = userRepository.findByUsername(username);
                com.playmotech.ghostcoach.model.User user;
                if (userOpt.isPresent()) {
                    user = userOpt.get();
                } else {
                    user = com.playmotech.ghostcoach.model.User.builder()
                            .username(username)
                            .password(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("auto_provisioned_dummy"))
                            .fullName(capitalizeUsername(username))
                            .sport("Cricket")
                            .position("General Player")
                            .experience("Intermediate")
                            .build();
                    user = userRepository.save(user);
                }

                UserDetails userDetails = org.springframework.security.core.userdetails.User
                        .withUsername(user.getUsername())
                        .password(user.getPassword())
                        .authorities(Collections.emptyList())
                        .build();

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Could not assert secure athlete authentication context", e);
        }

        filterChain.doFilter(request, response);
    }

    private String capitalizeUsername(String str) {
        if (str == null || str.isEmpty()) return "User";
        String clean = str.replaceAll("[_-]", " ");
        char[] chars = clean.toCharArray();
        boolean fun = true;
        for (int i = 0; i < chars.length; i++) {
            if (fun && Character.isLetter(chars[i])) {
                chars[i] = Character.toUpperCase(chars[i]);
                fun = false;
            } else if (Character.isWhitespace(chars[i])) {
                fun = true;
            }
        }
        return new String(chars);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
