# CSS-Struktur Dokumentation

## Version 13.1.0 - Modulare CSS-Architektur mit Template-System & Drag-Support

Die CSS-Styles wurden thematisch in mehrere Dateien aufgeteilt für bessere Wartbarkeit und Organisation.
Neu in v13.1: Drag & Drop für Marker, vereinfachte Scene Controls.

## 📁 Dateistruktur

```
e9l-scene-marker/
├── module.json                    # Modul-Manifest (v13.0.0)
├── scripts/                       # JavaScript-Module
│   ├── main.js                   # Hauptmodul mit Versionsverwaltung
│   ├── marker-manager.js         # CRUD-Operationen
│   ├── marker-ui.js              # UI-Rendering mit Templates & Drag
│   ├── marker-actions.js         # Aktionslogik
│   ├── marker-events.js          # Event-Handler
│   └── template-loader.js        # Template-System
├── templates/                     # HTML-Templates
│   ├── marker-menu.html          # Kontextmenü-Template
│   ├── script-dialog.html        # Skript-Dialog-Template
│   ├── darkness-config.html      # Dunkelheits-Konfig-Template
│   └── image-config.html         # Bild-Konfig-Template
├── styles/                        # CSS-Module
│   ├── base.css                  # Variablen & Grundlagen
│   ├── animations.css            # Animationen & Effekte
│   ├── markers.css               # Marker-Styles
│   ├── menus.css                 # Kontextmenü-Styles
│   ├── dialogs.css               # Dialog & Button-Styles
│   └── chat.css                  # Chat-Nachrichten-Styles
└── lang/
    └── de.json
```

## 🚀 Was ist neu in Version 13.1?

### ✅ Drag & Drop für Marker
- **Marker verschieben** mit gedrückter linker Maustaste
- **Automatisches Speichern** der neuen Position
- **Visuelles Feedback** während des Verschiebens
- **Nur für GMs** verfügbar

### ✅ Ein-Klick-Bedienung (NEU!)
- **Kein Untermenü mehr** - der Zauberstab-Button funktioniert direkt
- **Ein Klick** aktiviert den Marker-Modus sofort
- **Direkt in Token-Controls** integriert für schnellen Zugriff
- Toggle-Funktion: Klick = an, nochmal klicken = aus

### ✅ Template-System (v13.0)
- Alle UI-Komponenten nutzen HTML-Templates
- Template-Caching für bessere Performance
- Einfache Wartbarkeit durch Trennung von HTML und JS

## 🎮 Bedienung

### Marker erstellen
1. Klicke auf den **Zauberstab-Button** in den Token-Controls
2. Der Cursor wird zum Fadenkreuz
3. **Linksklick** auf die Szene platziert einen Marker
4. **Rechtsklick** beendet den Platzierungsmodus

### Marker verschieben (NEU!)
1. **Linke Maustaste** auf einen Marker drücken und halten
2. Marker an neue Position ziehen
3. Maustaste loslassen zum Speichern

### Marker konfigurieren
1. **Rechtsklick** auf einen Marker öffnet das Kontextmenü
2. Name direkt im Menü ändern
3. Verschiedene Aktionen und Konfigurationen verfügbar

## 📋 CSS-Module im Detail

### 1. **base.css** - Grundlagen (Lädt zuerst)
- CSS-Variablen für konsistentes Theming
- Farben, Schatten, Abstände, Übergänge
- Globale Container-Styles
- Scene Control Button-Styles
- Cursor-Styles

### 2. **animations.css** - Animationen
- Keyframe-Animationen (fadeIn, pulse, glow, etc.)
- Wiederverwendbare Animation-Klassen
- Transition-Helper-Klassen
- Loading-States

### 3. **markers.css** - Marker-Elemente
- `.e9l-scene-marker-dom` - Marker-Container
- `.marker-box` - Marker-Box-Styles
- `.marker-label` - Hover-Labels
- Hover- und Active-States

### 4. **menus.css** - Kontextmenüs
- `.e9l-marker-menu` - Menü-Container
- `.marker-name-input` - Name-Eingabefeld
- `.context-items` - Menü-Items
- Status-Icons und Divider

### 5. **dialogs.css** - Dialoge (⭐ NEUE BUTTON-ANORDNUNG)
- `.e9l-script-dialog` - Script-Dialog-Styles
- **Horizontale Button-Anordnung** (Prüfen, Testen, Speichern, Abbrechen)
- Konfigurations-Dialog-Styles
- Form-Element-Styles

### 6. **chat.css** - Chat-Integration
- `.e9l-check-request` - Talentproben-Nachrichten
- `.e9l-group-check-request` - Sammelproben-Nachrichten
- `.e9l-marker-image` - Bild-Anzeige im Chat
- Atmosphärische Nachrichten

## 🎨 CSS-Variablen (in base.css)

```css
:root {
    /* Farben */
    --e9l-bg-primary: linear-gradient(135deg, #1a1a1d 0%, #0d0d0f 100%);
    --e9l-bg-secondary: linear-gradient(135deg, #202024 0%, #101012 100%);
    --e9l-border-color: rgba(255, 255, 255, 0.1);
    --e9l-text-primary: rgba(255, 255, 255, 0.9);
    
    /* Button-Farben */
    --e9l-btn-validate: /* Blau */
    --e9l-btn-execute: /* Grün */
    --e9l-btn-save: /* Gold */
    --e9l-btn-cancel: /* Rot */
    
    /* Abstände */
    --e9l-spacing-xs: 4px;
    --e9l-spacing-sm: 8px;
    --e9l-spacing-md: 12px;
    --e9l-spacing-lg: 16px;
}
```

## 🔧 Vorteile der modularen Struktur

1. **Bessere Wartbarkeit**: Jede CSS-Datei und jedes Template hat einen klaren Fokus
2. **Einfacheres Debugging**: Styles und Templates sind logisch gruppiert
3. **Performance**: Nur benötigte Ressourcen laden, Template-Caching
4. **Team-Arbeit**: Mehrere Entwickler können parallel arbeiten
5. **Wiederverwendbarkeit**: Module können in anderen Projekten genutzt werden

## 📝 Anpassungen vornehmen

| Änderung | Datei |
|----------|-------|
| Marker-Farben ändern | `markers.css` |
| Neue Animation hinzufügen | `animations.css` |
| Dialog-Layout anpassen | `dialogs.css` + `templates/*.html` |
| Menü-Items ändern | `menus.css` + `templates/marker-menu.html` |
| Chat-Nachrichten formatieren | `chat.css` |
| Globale Variablen | `base.css` |

## 🚀 Installation

1. Alle Dateien in den entsprechenden Ordner kopieren
2. `module.json` mit Version 13.0.0 verwenden
3. Foundry VTT neu laden

## 📌 Wichtige Änderungen in v13.0

- ✅ **Template-System für alle UI-Komponenten**
- ✅ **Vereinheitlichte Versionsnummer (13.0.0)**
- ✅ **Getrennte Skript-Aktionen** (Ausführen vs. Konfigurieren)
- ✅ **Script-Dialog Buttons sind HORIZONTAL angeordnet**
- ✅ Farbcodierte Buttons für bessere UX
- ✅ CSS-Variablen für einfache Theme-Anpassungen
- ✅ Optimierte Hover-Effekte
- ✅ Verbesserte Dark-Theme-Integration

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
```

## 📜 Lizenz

MIT License - Frei verwendbar und anpassbar