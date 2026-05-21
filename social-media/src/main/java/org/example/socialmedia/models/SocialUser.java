package org.example.socialmedia.models;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class SocialUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "social_profile_id") // jpoincol will get the control
    private SocialProfile socialProfile;

    @OneToMany(mappedBy = "socialUser")
    private List<Post> posts = new ArrayList<>();
}
