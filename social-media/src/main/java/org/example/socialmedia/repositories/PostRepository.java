package org.example.socialmedia.repositories;

import org.example.socialmedia.models.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}
