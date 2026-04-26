package com.citywallet.backend;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Loads {@code backend/.env} into {@link System#setProperty} before Spring starts, so
 * {@code @Value("${TAVILY_API_KEY}")} works the same way as with real OS environment variables.
 * Does not override keys already present in the process environment.
 */
public final class LocalDotenvLoader {

    private LocalDotenvLoader() {
    }

    public static void load() {
        Path[] candidates = { Path.of(".env"), Path.of("backend", ".env") };
        for (Path p : candidates) {
            if (Files.isRegularFile(p)) {
                applyFile(p);
                return;
            }
        }
    }

    private static void applyFile(Path file) {
        try {
            for (String line : Files.readAllLines(file, StandardCharsets.UTF_8)) {
                String t = line.trim();
                if (t.isEmpty() || t.startsWith("#")) {
                    continue;
                }
                int eq = t.indexOf('=');
                if (eq <= 0) {
                    continue;
                }
                String key = t.substring(0, eq).trim();
                if (key.isEmpty()) {
                    continue;
                }
                String val = t.substring(eq + 1).trim();
                if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.substring(1, val.length() - 1);
                }
                if (isPlaceholder(key, val)) {
                    continue;
                }
                if (System.getenv(key) != null && !System.getenv(key).isBlank()) {
                    continue;
                }
                if (System.getProperty(key) != null) {
                    continue;
                }
                System.setProperty(key, val);
            }
        } catch (IOException ignored) {
            // missing or unreadable .env — rely on OS env / IDE only
        }
    }

    private static boolean isPlaceholder(String key, String val) {
        if (val.isBlank()) {
            return true;
        }
        String v = val.toLowerCase();
        if (!"TAVILY_API_KEY".equalsIgnoreCase(key)) {
            return false;
        }
        return v.contains("your-tavily")
            || v.contains("paste")
            || v.equals("changeme")
            || v.equals("xxx");
    }
}
