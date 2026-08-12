package com.masoi.room;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;

class ArchitectureTest {

    private static final Path MAIN_JAVA = Path.of("src/main/java");
    private static final Path ROOM_PACKAGE = MAIN_JAVA.resolve("com/masoi/room");
    private static final Set<String> ALLOWED_ROOT_PACKAGES = Set.of(
            "controller", "service", "repository", "model", "dto", "exception", "config", "utils");

    @Test
    void productionSourcesUseOnlyClassicLayeredPackages() throws IOException {
        try (Stream<Path> files = Files.walk(ROOM_PACKAGE)) {
            List<String> violations = files
                    .filter(path -> path.toString().endsWith(".java"))
                    .map(ROOM_PACKAGE::relativize)
                    .filter(path -> path.getNameCount() > 1)
                    .filter(path -> !ALLOWED_ROOT_PACKAGES.contains(path.getName(0).toString()))
                    .map(Path::toString)
                    .toList();

            assertThat(violations).isEmpty();
        }
    }

    @Test
    void dtoContainsOnlyRequestAndResponsePackages() throws IOException {
        Path dto = ROOM_PACKAGE.resolve("dto");
        if (!Files.exists(dto)) {
            return;
        }
        try (Stream<Path> files = Files.walk(dto)) {
            assertThat(files.filter(path -> path.toString().endsWith(".java"))
                    .map(dto::relativize)
                    .filter(path -> path.getNameCount() < 2
                            || !(path.getName(0).toString().equals("request")
                            || path.getName(0).toString().equals("response")))
                    .toList()).isEmpty();
        }
    }

    @Test
    void layersDoNotContainForbiddenFrameworkDependencies() throws IOException {
        assertSourcesDoNotContain("controller", "StringRedisTemplate", "RedisTemplate");
        assertSourcesDoNotContain("repository", "@RequestMapping", "@PostMapping", "@PatchMapping");
        assertSourcesDoNotContain("service", "ResponseEntity", "@RequestMapping", "@PostMapping", "@PatchMapping");
        assertSourcesDoNotContain("model", "@RequestMapping", "@PostMapping", "@PatchMapping");
        assertSourcesDoNotContain("dto", "StringRedisTemplate", "RedisTemplate", "JpaRepository", "CrudRepository");
    }

    @Test
    void forbiddenPersistenceAndLegacyTypesAreAbsent() throws IOException {
        assertSourcesDoNotContain("", "package com.chat.app", "jakarta.persistence", "javax.persistence",
                "JpaRepository", "CrudRepository", "@RedisHash");
    }

    @Test
    void exactlyOneRestControllerAdviceExists() throws IOException {
        assertThat(countOccurrences("@RestControllerAdvice")).isEqualTo(1);
    }

    @Test
    void wildcardCorsIsAbsent() throws IOException {
        assertSourcesDoNotContain("", "allowedOrigins(\"*\")", "allowedOriginPatterns(\"*\")");
    }

    private void assertSourcesDoNotContain(String layer, String... forbidden) throws IOException {
        Path root = layer.isEmpty() ? MAIN_JAVA : ROOM_PACKAGE.resolve(layer);
        if (!Files.exists(root)) {
            return;
        }
        try (Stream<Path> files = Files.walk(root)) {
            List<String> sources = files.filter(path -> path.toString().endsWith(".java"))
                    .map(this::read)
                    .toList();
            for (String token : forbidden) {
                assertThat(sources).noneMatch(source -> source.contains(token));
            }
        }
    }

    private long countOccurrences(String token) throws IOException {
        try (Stream<Path> files = Files.walk(MAIN_JAVA)) {
            return files.filter(path -> path.toString().endsWith(".java"))
                    .map(this::read)
                    .filter(source -> source.contains(token))
                    .count();
        }
    }

    private String read(Path path) {
        try {
            return Files.readString(path);
        } catch (IOException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
