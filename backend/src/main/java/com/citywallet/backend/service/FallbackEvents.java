package com.citywallet.backend.service;

import com.citywallet.backend.model.ContextEvent;
import java.util.List;

public final class FallbackEvents {
    private FallbackEvents() {
    }

    public static final List<ContextEvent> EVENTS = List.of(
        new ContextEvent(
            "Staatsgalerie Stuttgart - Aktuelle Ausstellungen",
            "https://www.staatsgalerie.de/",
            "Kunst-Highlights mit wechselnden Ausstellungen im Zentrum von Stuttgart."
        ),
        new ContextEvent(
            "Stuttgart-Marketing - Events und Veranstaltungen heute",
            "https://www.stuttgart-tourist.de/",
            "Offizielle Uebersicht zu Veranstaltungen, Touren und Stadt-Highlights."
        ),
        new ContextEvent(
            "Markthalle Stuttgart - Kulinarische Entdeckungen",
            "https://www.stuttgart.de/markthalle",
            "Beliebter Spot in Mitte fuer Food, regionale Produkte und kurze Besuche."
        ),
        new ContextEvent(
            "Wilhelma Stuttgart - Zoo und Botanischer Garten",
            "https://www.wilhelma.de/",
            "Ausflugstipp mit wechselnden Programmpunkten und Indoor/Outdoor-Bereichen."
        ),
        new ContextEvent(
            "Liederhalle Stuttgart - Konzerte und Kultur",
            "https://www.liederhalle-stuttgart.de/",
            "Abendprogramm mit Musik, Kultur und Buehnenveranstaltungen in der Innenstadt."
        )
    );
}
