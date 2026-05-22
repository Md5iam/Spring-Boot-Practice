package org.example.socialmedia;

import org.example.socialmedia.models.Post;
import org.example.socialmedia.models.SocialGroup;
import org.example.socialmedia.models.SocialProfile;
import org.example.socialmedia.models.SocialUser;
import org.example.socialmedia.repositories.PostRepository;
import org.example.socialmedia.repositories.SocialGroupRepository;
import org.example.socialmedia.repositories.SocialProfileRepository;
import org.example.socialmedia.repositories.SocialUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    private final SocialUserRepository userRepository;
    private final SocialGroupRepository groupRepository;
    private final SocialProfileRepository profileRepository;
    private final PostRepository postRepository;

    public DataInitializer(SocialUserRepository userRepository, SocialGroupRepository groupRepository, SocialProfileRepository profileRepository, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.profileRepository = profileRepository;
        this.postRepository = postRepository;
    }

    @Bean
    public CommandLineRunner initializeData(){
        return args -> {
            // create some users
            SocialUser user1 = new SocialUser();
            SocialUser user2 = new SocialUser();
            SocialUser user3 = new SocialUser();

            // save users to the database
            userRepository.save(user1);
            userRepository.save(user2);
            userRepository.save(user3);

            // create some group
            SocialGroup group1 = new SocialGroup();
            SocialGroup group2 = new SocialGroup();

            // add user to the group
            group1.getSocialUsers().add(user1);
            group1.getSocialUsers().add(user2);

            group2.getSocialUsers().add(user2);
            group2.getSocialUsers().add(user3);

            //save groups to the database
            groupRepository.save(group1);
            groupRepository.save(group2);

            // assign user to group
            user1.getGroups().add(group1);
            user2.getGroups().add(group1);
            user2.getGroups().add(group2);
            user3.getGroups().add(group2);

            // save user back to database to update
            userRepository.save(user1);
            userRepository.save(user2);
            userRepository.save(user3);

            // create some post
            Post post1 = new Post();
            Post post2 = new Post();
            Post post3 = new Post();

            // assign post with user
            post1.setSocialUser(user1);
            post2.setSocialUser(user2);
            post3.setSocialUser(user3);

            // save post to database
            postRepository.save(post1);
            postRepository.save(post2);
            postRepository.save(post3);

            // create some social profile
            SocialProfile profile1 = new SocialProfile();
            SocialProfile profile2 = new SocialProfile();
            SocialProfile profile3 = new SocialProfile();

            // Associate profiles with users
            profile1.setSocialUser(user1);
            profile2.setSocialUser(user2);
            profile3.setSocialUser(user3);

            // save proifile to database
            profileRepository.save(profile1);
            profileRepository.save(profile2);
            profileRepository.save(profile3);

            // FETCH TYPES
            System.out.println("Fetching user !!");
            userRepository.findById(1L);
        };
    }
}
