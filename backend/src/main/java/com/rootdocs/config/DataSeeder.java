package com.rootdocs.config;

import com.rootdocs.model.Role;
import com.rootdocs.model.User;
import com.rootdocs.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Value("${seed.admin-password}")
    private String adminPassword;

    @Value("${seed.leitor-password}")
    private String leitorPassword;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUser("admin", adminPassword, Role.ROLE_EDITOR);
        seedUser("leitor", leitorPassword, Role.ROLE_LEITOR);
    }

    private void seedUser(String username, String rawPassword, Role role) {
        if (userRepository.existsByUsername(username)) {
            return;
        }
        User user = new User(username, passwordEncoder.encode(rawPassword), role);
        userRepository.save(user);
        log.info("Seeded user: {} ({})", username, role.name());
    }
}