# CSS-Struktur Dokumentation

## Version 13.3.4 - Modulare CSS-Architektur mit dynamischen Popups

Die CSS-Styles wurden thematisch in mehrere Dateien aufgeteilt für bessere Wartbarkeit und Organisation.
Neu in v13.3.4: Dynamische Popup-Größe, vereinfachte Konfiguration, einheitliche Buttons.

## 📁 Dateistruktur

```
e9l-scene-marker/
├── module.json                    # Modul-Manifest (v13.3.4)
├── scripts/                       # JavaScript-Module
│   ├── main.js                   # Hauptmodul mit Versionsverwaltung
│   ├── marker-manager.js         # CRUD-Operationen
│   ├── marker-ui.js              # UI-Rendering mit Templates & Drag
│   ├── marker-actions.js         # Aktionslogik mit dynamischen Popups ✨
│   ├── marker-events.js          # Event-Handler
│   └── template-loader.js        # Template-System
├── templates/                     # HTML-Templates
│   ├── marker-menu.html          # Kontextmenü-Template
│   ├── script-dialog.html        # Skript-Dialog-Template
│   ├── darkness-config.html      # Dunkelheits-Konfig-Template
│   └── image-config.html         # Bild-Konfig-Template (vereinfacht) ✨
├── styles/                        # CSS-Module
│   ├── base.css                  # Variablen & Grundlagen
│   ├── animations.css            # Animationen & Effekte
│   ├── markers.css               # Marker-Styles
│   ├── menus.css                 # Kontextmenü-Styles
│   ├── dialogs.css               # Dialog & Button-Styles (vereinheitlicht) ✨
│   └── chat.css                  # Chat-Nachrichten-Styles
└── lang/
    └── de.json
```

## 🚀 Was ist neu in Version 13.3.4?

### ✅ Dynamische Popup-Größe
- **30% der Bildschirmhöhe** als Basis für Popups
- **Automatische Anpassung** an Bildformat
- **Responsive Skalierung** für verschiedene Auflösungen
- **Optimale Darstellung** ohne Scrollbalken

### ✅ Vereinfachte Konfiguration
- **Entfernte Größenoptionen** für Chat (perfekte Standardgröße)
- **Keine Video-Optionen mehr** (Defaults: autoplay, loop, muted)
- **Aufgeräumtes Interface** ohne redundante Felder
- **Feste Vorschaugröße** für konsistente Darstellung

### ✅ Einheitliches Button-Design
- **Alle Buttons im Foundry-Style**
- **Konsistente Hover-Effekte**
- **Gleiche Größe und Abstände**
- **Professionelles Erscheinungsbild**

## 🎮 Bedienung

### Marker erstellen
1. Klicke auf den **Scroll-Button** in den Token-Controls
2. Der Cursor wird zum Fadenkreuz
3. **Linksklick** auf die Szene platziert einen Marker
4. **Rechtsklick** beendet den Platzierungsmodus

### Marker verschieben
1. **Linke Maustaste** auf einen Marker drücken und halten
2. Marker an neue Position ziehen (Petrol Glow erscheint)
3. Maustaste loslassen zum Speichern
4. Notification bestätigt die Verschiebung

### Bild/Video konfigurieren
1. **Rechtsklick** auf einen Marker
2. **"Bild/Video konfigurieren"** wählen
3. **"Datei wählen"** Button klicken (Tooltip zeigt Formate)
4. **Dropdown** wählen: "Im Chat anzeigen" oder "Als Popup öffnen"
5. **Vorschau** zeigt das Medium in fester Größe
6. Speichern und mit **"Bild/Video zeigen"** aktivieren

### Medien-Anzeige
- **Im Chat**: Optimale Größe, volle Breite
- **Als Popup**: 30% der Bildschirmhöhe, dynamisch angepasst
- **Videos**: Immer mit autoplay, loop und muted

## 📋 CSS-Module im Detail

### 1. **base.css** - Grundlagen (v13.2.1)
- CSS-Variablen für konsistentes Theming
- Native Foundry Theme Integration
- Globale Container-Styles
- Cursor-Styles

### 2. **animations.css** - Animationen
- Keyframe-Animationen (fadeIn, pulse, glow, etc.)
- Wiederverwendbare Animation-Klassen
- Transition-Helper-Klassen
- Loading-States

### 3. **markers.css** - Marker-Elemente (v13.3.1)
- `.e9l-scene-marker-dom` - Marker-Container
- `.marker-box` - Marker-Box-Styles
- `.marker-label` - Hover-Labels mit Petrol Border
- Dragging-States mit verstärktem Glow
- Spawn-Animation beim Erstellen

### 4. **menus.css** - Kontextmenüs (v13.3.1)
- `.e9l-marker-menu` - Menü-Container
- `.marker-name-input` - Name-Eingabefeld
- `.context-items` - Menü-Items
- Petrol Icons für konsistentes Design

### 5. **dialogs.css** - Dialoge (v13.3.4)
- `.e9l-script-dialog` - Script-Dialog-Styles
- `.e9l-image-config-form` - **NEU: Vereinfachte Bild-Konfiguration**
- **Einheitliche Button-Styles** im Foundry-Design
- **Feste Vorschaugröße** (250px Höhe)
- **Dark Tooltips** für Dateiauswahl

### 6. **chat.css** - Chat-Integration
- `.e9l-marker-media` - Optimierte Mediendarstellung
- Volle Breite für beste Sichtbarkeit
- Automatische Größenanpassung
- Keine überflüssigen Titel

## 🎨 CSS-Variablen (in base.css)

```css
:root {
    /* Farben */
    --e9l-bg-primary: linear-gradient(135deg, #1a1a1d 0%, #0d0d0f 100%);
    --e9l-bg-secondary: linear-gradient(135deg, #202024 0%, #101012 100%);
    
    /* Petrol Theme für Marker */
    --e9l-marker-petrol: #17a2b8;
    --e9l-marker-turquoise: #20c997;
    
    /* Abstände */
    --e9l-spacing-xs: 4px;
    --e9l-spacing-sm: 8px;
    --e9l-spacing-md: 12px;
    --e9l-spacing-lg: 16px;
}
```

## 🔧 Vorteile der neuen Version

1. **Bessere Performance**: Weniger Options = schnellere Dialoge
2. **Klarere UX**: Keine verwirrenden Einstellungen
3. **Konsistentes Design**: Einheitliche Buttons überall
4. **Dynamische Anpassung**: Popups passen sich an Bildschirm an
5. **Optimale Defaults**: Video-Settings immer perfekt

## 📝 Anpassungen vornehmen

| Änderung | Datei |
|----------|-------|
| Popup-Größe ändern (% der Höhe) | `marker-actions.js` Zeile ~500 |
| Vorschau-Höhe anpassen | `dialogs.css` → `.media-preview-container` |
| Button-Styles ändern | `dialogs.css` → `.dialog-button` |
| Video-Defaults ändern | `marker-actions.js` → `showImage()` |
| Tooltip-Design anpassen | `dialogs.css` → `.dialog-button[title]:hover` |

## 🚀 Installation

1. Alle Dateien in den entsprechenden Ordner kopieren
2. `module.json` mit Version 13.3.4 verwenden
3. Foundry VTT neu laden

## 📌 Wichtige Änderungen in v13.3.4

- ✅ **Dynamische Popup-Größe** (30% der Bildschirmhöhe)
- ✅ **Entfernte Größenoptionen** für Chat
- ✅ **Entfernte Video-Optionen** (fixe Defaults)
- ✅ **Einheitliche Buttons** im Foundry-Style
- ✅ **Feste Vorschaugröße** (250px)
- ✅ **Aufgeräumtes Interface** ohne Textfeld
- ✅ **Optimierte Chat-Darstellung** (volle Breite)
- ✅ **Bessere Dateipfad-Anzeige**

## 🐛 Fehlerbehebung

Falls Styles nicht korrekt laden:
1. Browser-Cache leeren (F5 oder Strg+F5)
2. Prüfen ob alle CSS-Dateien im `styles/` Ordner sind
3. Prüfen ob alle Templates im `templates/` Ordner sind
4. `module.json` auf korrekte Pfade prüfen
5. Browser-Konsole auf Fehler checken

## 🔍 Debug-Funktionen

Im GM-Modus stehen folgende Debug-Befehle zur Verfügung:
```javascript
// Marker-Informationen ausgeben
game.e9lSceneMarker.debugMarkers()

// Aktuelle Version prüfen
game.e9lSceneMarker.getVersion()

// Popup-Größe testen
// 1. Bild/Video konfigurieren
// 2. "Als Popup öffnen" wählen
// 3. Popup sollte 30% der Bildschirmhöhe haben
```

## 📜 Lizenz

MIT License - Frei verwendbar und anpassbar

## 🎯 Changelog v13.3.4

- **Added**: Dynamische Popup-Größe basierend auf Bildschirm
- **Added**: Einheitliche Button-Styles
- **Removed**: Größenoptionen für Chat-Anzeige
- **Removed**: Video-Optionen (nutzt Defaults)
- **Removed**: Überflüssiges Textfeld vor Dateiauswahl
- **Changed**: Feste Vorschaugröße für Konsistenz
- **Changed**: Dateipfad-Anzeige optimiert
- **Improved**: Aufgeräumtes, klareres Interface
- **Improved**: Performance durch weniger Optionen
- **Fixed**: Popup-Darstellung ohne Scrollbalken