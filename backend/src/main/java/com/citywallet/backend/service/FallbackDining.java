package com.citywallet.backend.service;

import com.citywallet.backend.model.ContextEvent;
import java.util.List;

public final class FallbackDining {
    private FallbackDining() {
    }

    /** Named venues near Balanstraße / Obergiesing when Tavily dining search is unavailable. */
    public static final List<ContextEvent> PLACES = List.of(
        new ContextEvent(
            "Giesinger Bräu — Biergarten & Bräustüberl",
            "https://www.giesinger-braeu.de/",
            "Kellerbier und bayerische Küche; von der Balanstraße aus schnell mit Bus/Tram erreichbar.",
            null
        ),
        new ContextEvent(
            "Wirtshaus in der Au — bayerische Küche",
            "https://www.wirtshausinderau.de/",
            "Klassiker wie Leberkäs und Schweinshaxe; Au-Gegend.",
            null
        ),
        new ContextEvent(
            "Zum Wolf — Restaurant (Giesing)",
            "https://www.zumwolf.de/",
            "Regionale Küche und Tageskarte; fußläufig von der Balanstraße.",
            null
        ),
        new ContextEvent(
            "Brasserie Tresznjewski — Bistro & Bar",
            "https://www.brasserietresznjewski.de/",
            "Giesing: kompakte Karte, Wein und Abendessen; fußläufig von der Balanstraße.",
            null
        )
    );
}
