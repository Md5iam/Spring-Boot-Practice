package org.example.socialmedia.services;

import org.example.socialmedia.models.SocialGroup;
import org.example.socialmedia.models.SocialUser;
import org.example.socialmedia.repositories.SocialUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SocialServices {

    @Autowired
    SocialUserRepository socialUserRepository;

    public List<SocialUser> getAllUsers() {
        return socialUserRepository.findAll();
    }

    public SocialUser saveUser(SocialUser socialUser) {
        return socialUserRepository.save(socialUser);
    }

    public SocialUser deleteUser(Long userId) {
        SocialUser socialUser = socialUserRepository.findById(userId)
                .orElseThrow( ()-> new RuntimeException("User not found"));
        socialUserRepository.delete(socialUser);
        return socialUser;
    }
}
