package com.rootdocs.service;

import com.rootdocs.dto.PostRequest;
import com.rootdocs.dto.PostResponse;
import com.rootdocs.exception.ResourceNotFoundException;
import com.rootdocs.model.Post;
import com.rootdocs.model.User;
import com.rootdocs.repository.PostRepository;
import com.rootdocs.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<PostResponse> findAll() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PostResponse> findByCategory(String category) {
        return postRepository.findByCategoryOrderByCreatedAtDesc(category)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PostResponse findById(Long id) {
        return toResponse(findPostOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<PostResponse> search(String query) {
        return postRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(query, query)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PostResponse create(PostRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Post post = new Post(request.title(), request.category(), request.content(), author);
        return toResponse(postRepository.save(post));
    }

    @Transactional
    public PostResponse update(Long id, PostRequest request) {
        Post post = findPostOrThrow(id);
        post.setTitle(request.title());
        post.setCategory(request.category());
        post.setContent(request.content());
        return toResponse(postRepository.save(post));
    }

    @Transactional
    public void delete(Long id) {
        postRepository.delete(findPostOrThrow(id));
    }

    private Post findPostOrThrow(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
    }

    private PostResponse toResponse(Post post) {
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getCategory(),
                post.getContent(),
                post.getAuthor().getUsername(),
                post.getCreatedAt()
        );
    }
}