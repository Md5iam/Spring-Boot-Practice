package org.example.firstspring;

import org.springframework.web.bind.annotation.*;

@RestController
public class HelloController {

    @GetMapping("/hello/{id}")
    public HelloResponse helloParam(@PathVariable String id){
        return new HelloResponse("The id is " + id );
    }

    @GetMapping("/hello")
    public HelloResponse hello(){
        return new HelloResponse("Hello World!");
    }

    @PostMapping("/post")
    public HelloResponse helloPost(@RequestBody String name){
        return new HelloResponse("My name is " + name);
    }
}
