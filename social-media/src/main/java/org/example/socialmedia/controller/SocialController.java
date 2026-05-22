package org.example.socialmedia.controller;

import org.example.socialmedia.models.SocialUser;
import org.example.socialmedia.services.SocialServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SocialController {

    @Autowired
    private SocialServices socialServices;

    @GetMapping("/social/users")
    public ResponseEntity<List<SocialUser>> getUser(){
        return new ResponseEntity<>(socialServices.getAllUsers(), HttpStatus.OK);
    }

    @PostMapping("/social/user")
    public ResponseEntity<SocialUser> saveUser(@RequestBody SocialUser socialUser){
        return new ResponseEntity<>(socialServices.saveUser(socialUser), HttpStatus.CREATED);
    }

    @DeleteMapping("/social/user/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId ){
        socialServices.deleteUser(userId);
        return new ResponseEntity<>("Deleted Succesfully", HttpStatus.OK);
    }

}
