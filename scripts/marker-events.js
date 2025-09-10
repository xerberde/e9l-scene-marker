/**
 * e9l DSA5/TDE5 Scene Marker Module for Foundry VTT v12
 * Version: 13.2.2
 * Date: 2024
 * Description: Marker Events - Event-Handler mit Button-Fix
 */

export class MarkerEvents {
    constructor(parent) {
        this.parent = parent;
        this.version = parent.version || '13.2.2';
        
        // Bind event handlers
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.handleRightClick = this.handleRightClick.bind(this);
    }

    activateMarkerMode() {
        // Nur GMs können den Marker-Modus aktivieren
        if (!game.user.isGM) {
            console.warn(`[V${this.version}] Nur GMs können den Marker-Modus aktivieren`);
            return;
        }
        
        document.body.style.cursor = 'crosshair';
        canvas.stage.on('pointerdown', this.handleCanvasClick);
        canvas.stage.on('rightdown', this.handleRightClick);
        ui.notifications.info("Marker-Modus aktiviert. Linksklick zum Platzieren, Rechtsklick zum Beenden.");
    }

    deactivateMarkerMode() {
        // Nur GMs können den Marker-Modus deaktivieren
        if (!game.user.isGM) return;
        
        // Cursor zurücksetzen
        document.body.style.cursor = 'default';
        
        // Event-Listener entfernen
        canvas.stage.off('pointerdown', this.handleCanvasClick);
        canvas.stage.off('rightdown', this.handleRightClick);
        
        // WICHTIG: Button-State über parent zurücksetzen
        this.parent.resetButtonState();
        
        // Flag zurücksetzen
        this.parent.isPlacing = false;
        
        // Notification
        ui.notifications.info("Marker-Modus deaktiviert.");
        
        console.log(`[V${this.version}] Marker-Modus deaktiviert, Button-State zurückgesetzt`);
    }

    handleCanvasClick(event) {
        // Zusätzlicher GM-Check für Sicherheit
        if (!game.user.isGM) return;
        if (!this.parent.isPlacing) return;
        if (event.data.button === 2) return;  // Rechtsklick ignorieren
        
        event.stopPropagation();
        const position = event.data.getLocalPosition(canvas.stage);
        
        // Marker nur erstellen wenn Position valide ist
        if (position && position.x !== undefined && position.y !== undefined) {
            this.parent.manager.createMarker(position.x, position.y);
        } else {
            console.warn(`[V${this.version}] Ungültige Position für Marker`);
        }
    }

    handleRightClick(event) {
        // Nur GMs können mit Rechtsklick den Modus beenden
        if (!game.user.isGM) return;
        
        if (this.parent.isPlacing) {
            event.stopPropagation();
            event.preventDefault();
            
            console.log(`[V${this.version}] Rechtsklick erkannt - deaktiviere Marker-Modus`);
            
            // Deaktiviere Marker-Modus (ruft resetButtonState auf)
            this.deactivateMarkerMode();
        }
    }
}