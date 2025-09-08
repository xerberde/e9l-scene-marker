# CSS-Struktur Dokumentation

## Version 12.0 - Modulare CSS-Architektur

Die CSS-Styles wurden thematisch in mehrere Dateien aufgeteilt für bessere Wartbarkeit und Organisation.

## 📁 Dateistruktur

```
e9l-scene-marker/
├── module.json                    # Modul-Manifest (v12.0)
├── scripts/                       # JavaScript-Module
│   ├── main.js
│   ├── marker-manager.js
│   ├── marker-ui.js
│   ├── marker-actions.js
│   └── marker-events.js
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

1. **Bessere Wartbarkeit**: Jede CSS-Datei hat einen klaren Fokus
2. **Einfacheres Debugging**: Styles sind logisch gruppiert
3. **Performance**: Nur benötigte Styles laden
4. **Team-Arbeit**: Mehrere Entwickler können parallel arbeiten
5. **Wiederverwendbarkeit**: CSS-Module können in anderen Projekten genutzt werden

## 📝 Anpassungen vornehmen

| Änderung | Datei |
|----------|-------|
| Marker-Farben ändern | `markers.css` |
| Neue Animation hinzufügen | `animations.css` |
| Dialog-Layout anpassen | `dialogs.css` |
| Menü-Items stylen | `menus.css` |
| Chat-Nachrichten formatieren | `chat.css` |
| Globale Variablen | `base.css` |

## 🚀 Installation

1. Alle CSS-Dateien in den `styles/` Ordner kopieren
2. `module.json` mit Version 12.0 verwenden
3. Foundry VTT neu laden

## 📌 Wichtige Änderungen in v12.0

- ✅ **Script-Dialog Buttons sind jetzt HORIZONTAL angeordnet**
- ✅ Farbcodierte Buttons für bessere UX
- ✅ CSS-Variablen für einfache Theme-Anpassungen
- ✅ Optimierte Hover-Effekte
- ✅ Verbesserte Dark-Theme-Integration

## 🐛 Fehlerbehebung

Falls Styles nicht korrekt laden:
1. Browser-Cache leeren (F5 oder Strg+F5)
2. Prüfen ob alle CSS-Dateien im `styles/` Ordner sind
3. `module.json` auf korrekte Pfade prüfen
4. Browser-Konsole auf Fehler checken

## 📜 Lizenz

MIT License - Frei verwendbar und anpassbar