package com.masoi.room.utils;

import java.util.UUID;

import org.springframework.stereotype.Component;

@Component
public class UuidPlayerIdGenerator implements PlayerIdGenerator {
    @Override
    public String generate() {
        return UUID.randomUUID().toString();
    }
}
