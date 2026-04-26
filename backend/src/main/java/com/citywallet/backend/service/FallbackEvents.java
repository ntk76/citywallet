package com.citywallet.backend.service;

import com.citywallet.backend.model.ContextEvent;
import java.util.List;

public final class FallbackEvents {
    private FallbackEvents() {
    }

    /**
     * Named happenings (not calendar homepages) near Balanstraße / Obergiesing — used when Tavily is off or too few hits.
     * Links point to venue or ticket pages where users can confirm today’s slot.
     */
    public static final List<ContextEvent> EVENTS = List.of(
        new ContextEvent(
            "Open Mic & Special Guests — Import Export (Giesing)",
            "https://importexport.cc/",
            "Abendkasse ab ca. 19:30, Start gegen 20:15. Nur wenige Gehminuten von der Balanstraße.",
            null
        ),
        new ContextEvent(
            "Clubnacht: Drum & Bass / Breaks — Muffatwerk Halle",
            "https://www.muffatwerk.de/halle/",
            "Nachtprogramm mit mehreren DJs; Einlass und Vorverkauf auf der Club-Seite.",
            null
        ),
        new ContextEvent(
            "Live: Indie & Electronic — Feierwerk Hansa 39",
            "https://www.feierwerk.de/",
            "Konzertabend im Feierwerk-Areal; von Balanstraße mit Bus/S-Bahn in wenigen Minuten.",
            null
        ),
        new ContextEvent(
            "Jazz Late: Session mit Gästen — Jazzclub Unterfahrt",
            "https://www.unterfahrt.de/",
            "Session oft nach dem Hauptkonzert; U-Bahn von Giesing Richtung Innenstadt.",
            null
        ),
        new ContextEvent(
            "Kabarett / Kleinkunst — Lustspielhaus (Vorstellung)",
            "https://www.muenchenticket.de/",
            "Festes Programm mit Beginnzeit und Sitzplatzwahl — bitte Datum im Ticketshop prüfen.",
            null
        )
    );
}
