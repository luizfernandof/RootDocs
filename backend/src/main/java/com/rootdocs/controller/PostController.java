package com.rootdocs.controller;

import com.rootdocs.dto.PostRequest;
import com.rootdocs.dto.PostResponse;
import com.rootdocs.service.PostService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> listAll() {
        return ResponseEntity.ok(postService.findAll());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<PostResponse>> listByCategory(@PathVariable String category) {
        return ResponseEntity.ok(postService.findByCategory(category));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PostResponse>> search(@RequestParam String q) {
        return ResponseEntity.ok(postService.search(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PostResponse> create(
            @Valid @RequestBody PostRequest request,
            @AuthenticationPrincipal String username
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(request, username));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> update(@PathVariable Long id, @Valid @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }
}