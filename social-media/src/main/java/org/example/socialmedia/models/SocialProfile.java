package org.example.socialmedia.models;

import jakarta.persistence.*;

@Entity
public class SocialProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(mappedBy = "socialProfile") // mapped by will not get the control
    private SocialUser socialUser;
}
