package org.example.seuoj;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SeuojApplication {

    public static void main(String[] args) {
        SpringApplication.run(SeuojApplication.class, args);
    }

}
