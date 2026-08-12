package com.masoi.room.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.masoi.room.exception.InvalidRoomCodeException;
import org.junit.jupiter.api.Test;

class RoomCodeFormatTest {
    @Test
    void acceptsExactAlphabet() {
        assertThat(RoomCodeFormat.isValid("A7K9Q2")).isTrue();
        assertThat(RoomCodeFormat.isValid("ZZZZZZ")).isTrue();
        assertThat(RoomCodeFormat.isValid("234567")).isTrue();
        assertThat(RoomCodeFormat.isValid("B9CDEH")).isTrue();
    }

    @Test
    void rejectsLowercase() {
        assertThat(RoomCodeFormat.isValid("a7k9q2")).isFalse();
    }

    @Test
    void rejectsAmbiguousCharacters() {
        assertThat(RoomCodeFormat.isValid("A7K9Q0")).isFalse();
        assertThat(RoomCodeFormat.isValid("A7K9Q1")).isFalse();
        assertThat(RoomCodeFormat.isValid("A7K9QI")).isFalse();
        assertThat(RoomCodeFormat.isValid("A7K9QO")).isFalse();
    }

    @Test
    void rejectsNonCanonicalCharacters() {
        assertThat(RoomCodeFormat.isValid("A7K9Q!")).isFalse();
        assertThat(RoomCodeFormat.isValid("A7K9Q-")).isFalse();
        assertThat(RoomCodeFormat.isValid("A7K9Q ")).isFalse();
    }

    @Test
    void rejectsWrongLength() {
        assertThat(RoomCodeFormat.isValid("A7K9Q")).isFalse();
        assertThat(RoomCodeFormat.isValid("A7K9Q22")).isFalse();
        assertThat(RoomCodeFormat.isValid("")).isFalse();
        assertThat(RoomCodeFormat.isValid(null)).isFalse();
    }

    @Test
    void doesNotNormalizeAndThrowsOnInvalid() {
        assertThatThrownBy(() -> RoomCodeFormat.requireCanonical("a7k9q2")).isInstanceOf(InvalidRoomCodeException.class);
        assertThatThrownBy(() -> RoomCodeFormat.requireCanonical("A7K9Q")).isInstanceOf(InvalidRoomCodeException.class);
    }
}
