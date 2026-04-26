package com.citywallet.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CityWalletBackendApplication {

    public static void main(String[] args) {
        LocalDotenvLoader.load();
        SpringApplication.run(CityWalletBackendApplication.class, args);
    }
}
