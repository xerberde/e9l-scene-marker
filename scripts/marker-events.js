/**
 * e9l DSA5/TDE5 Scene Marker Module for Foundry VTT v12
 * Version: 10.0
 * Date: 2024
 * Description: Marker Events - Event-Handler für Marker-Interaktionen
 * Changes: GM-Only Event-Handling
 */

export class MarkerEvents {
    constructor(parent) {
        this.parent = parent;
        
        // Bind event handlers
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.handleRightClick = this.handleRightClick.bind(this);
    }

    activateMarkerMode() {
        // Nur GMs können den Marker-Modus aktivieren
        if (!game.user.isGM) {
            console.warn('[V8.0] Nur GMs können den Marker-Modus aktivieren');
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
        
        document.body.style.cursor = 'default';
        canvas.stage.off('pointerdown', this.handleCanvasClick);
        canvas.stage.off('rightdown', this.handleRightClick);
        
        const control = ui.controls.controls.find(c => c.name === "e9l-markers");
        if (control) {
            const tool = control.tools.find(t => t.name === "place-marker");
            if (tool) tool.active = false;
            ui.controls.render();
        }
        
        this.parent.isPlacing = false;
        ui.notifications.info("Marker-Modus deaktiviert.");
    }

    handleCanvasClick(event) {
        // Zusätzlicher GM-Check für Sicherheit
        if (!game.user.isGM) return;
        if (!this.parent.isPlacing) return;
        if (event.data.button === 2) return;
        
        event.stopPropagation();
        const position = event.data.getLocalPosition(canvas.stage);
        
        // Marker nur erstellen wenn Position valide ist
        if (position && position.x !== undefined && position.y !== undefined) {
            this.parent.manager.createMarker(position.x, position.y);
        } else {
            console.warn('[V11.0] Ungültige Position für Marker');
        }
    }

    handleRightClick(event) {
        // Nur GMs können mit Rechtsklick den Modus beenden
        if (!game.user.isGM) return;
        
        if (this.parent.isPlacing) {
            event.stopPropagation();
            this.deactivateMarkerMode();
        }
    }
}