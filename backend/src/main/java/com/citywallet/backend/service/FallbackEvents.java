package com.citywallet.backend.service;

import com.citywallet.backend.model.ContextEvent;
import java.util.List;

public final class FallbackEvents {
    private FallbackEvents() {
    }

    /** Curated Munich sources; many events sit near Obergiesing / Ostbahnhof and Balanstraße. */
    public static final List<ContextEvent> EVENTS = List.of(
        new ContextEvent(
            "muenchen.de — Veranstaltungskalender",
            "https://www.muenchen.de/rubriken/08-veranstaltungen/kalender.html",
            "Offizieller Kalender der Landeshauptstadt: Konzerte, Märkte, Feste und Kultur in ganz München.",
            null
        ),
        new ContextEvent(
            "München Ticket — Events & Vorstellungen",
            "https://www.muenchenticket.de/",
            "Tickets und Termine für Theater, Konzerte und Hallen — gut filterbar nach Stadtteil und Datum.",
            null
        ),
        new ContextEvent(
            "Muffatwerk — Konzerte & Club am Isarufer",
            "https://www.muffatwerk.de/",
            "Kultur am Isarhang: nur wenige Minuten von Balanstraße und Obergiesing, viele Abend-Highlights.",
            null
        ),
        new ContextEvent(
            "Gasteig — Kulturprogramm München",
            "https://www.gasteig.de/",
            "Philharmonie, Kurse und Veranstaltungen; mit U-Bahn schnell von der Balanstraße aus erreichbar.",
            null
        ),
        new ContextEvent(
            "Deutsches Museum — Ausstellungen & Events",
            "https://www.deutsches-museum.de/",
            "Dauerausstellungen und Sonderveranstaltungen; von der Balanstraße per ÖPNV Richtung Innenstadt.",
            null
        )
    );
}
