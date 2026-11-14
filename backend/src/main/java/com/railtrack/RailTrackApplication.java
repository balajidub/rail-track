package com.railtrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RailTrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(RailTrackApplication.class, args);
    }
}
