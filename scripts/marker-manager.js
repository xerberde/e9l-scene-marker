/**
 * e9l DSA5/TDE5 Scene Marker Module for Foundry VTT v12
 * Version: 10.0
 * Date: 2024
 * Description: Marker Manager - CRUD-Operationen für Marker
 * Changes: Unterstützung für customName, customScript und darknessConfig
 */

export class MarkerManager {
    constructor(parent) {
        this.parent = parent;
    }

    async createMarker(x, y) {
        // Nur GMs können Marker erstellen
        if (!game.user.isGM) {
            console.warn('[V8.0] Nur GMs können Marker erstellen');
            return;
        }
        
        const markerId = foundry.utils.randomID();
        const markerData = {
            id: markerId,
            x: x,
            y: y,
            label: `Marker ${this.parent.markers.size + 1}`,
            visible: true,
            icon: 'fas fa-wand-magic-sparkles'
        };

        // NUR speichern - KEIN direktes Rendering!
        // Der updateScene Hook wird loadMarkers() aufrufen, was das Rendering übernimmt
        await this.saveMarkerToScene(markerData);
        
        console.log(`[V8.0] Marker erstellt an Position ${Math.round(x)}, ${Math.round(y)}`);
    }

    async saveMarkerToScene(markerData) {
        // Nur GMs können speichern
        if (!game.user.isGM) return;
        
        const scene = canvas.scene;
        if (!scene) return;

        const currentMarkers = scene.getFlag('e9l-scene-marker', 'markers') || {};
        currentMarkers[markerData.id] = markerData;

        await scene.setFlag('e9l-scene-marker', 'markers', currentMarkers);
    }

    loadMarkers() {
        // Nur GMs sehen Marker
        if (!game.user.isGM) {
            console.log('[V8.0] Spieler - Marker werden nicht geladen');
            return;
        }
        
        // Verhindere Reload während Löschvorgang
        if (this.parent.isDeleting) {
            console.log('[V8.0] Überspringe loadMarkers während Löschvorgang');
            return;
        }
        
        const scene = canvas.scene;
        if (!scene) return;

        const savedMarkers = scene.getFlag('e9l-scene-marker', 'markers') || {};
        
        console.log(`[V8.0] GM lädt ${Object.keys(savedMarkers).length} gespeicherte Marker`);
        
        // Intelligentes Update: Nur neue Marker hinzufügen, bestehende behalten
        const existingMarkerIds = new Set(this.parent.markers.keys());
        const savedMarkerIds = new Set(Object.keys(savedMarkers));
        
        // Entferne gelöschte Marker aus DOM
        for (const markerId of existingMarkerIds) {
            if (!savedMarkerIds.has(markerId)) {
                const marker = this.parent.markers.get(markerId);
                if (marker?.element) {
                    marker.element.remove();
                }
                this.parent.markers.delete(markerId);
                console.log(`[V8.0] Marker ${markerId} entfernt`);
            }
        }
        
        // Stelle sicher dass Overlay existiert
        if (!this.parent.markerOverlay) {
            this.parent.ui.createMarkerOverlay();
        }

        // Füge nur neue Marker hinzu
        let newMarkersCount = 0;
        Object.values(savedMarkers).forEach(markerData => {
            // Stelle sicher dass Icon korrekt ist
            if (markerData.icon !== 'fas fa-wand-magic-sparkles') {
                markerData.icon = 'fas fa-wand-magic-sparkles';
            }
            
            // NUR rendern wenn Marker noch nicht existiert
            if (!this.parent.markers.has(markerData.id)) {
                this.parent.ui.renderMarkerDOM(markerData);
                newMarkersCount++;
            }
        });
        
        console.log(`[V8.0] ${newMarkersCount} neue Marker gerendert, ${this.parent.markers.size} total im DOM`);
    }

    async deleteMarker(markerId) {
        // Nur GMs können löschen
        if (!game.user.isGM) {
            ui.notifications.error("Nur der GM kann Marker löschen!");
            return;
        }
        
        console.log(`[V8.0] Lösche Marker: ${markerId}`);
        
        // 1. DOM-Element sofort entfernen
        const marker = this.parent.markers.get(markerId);
        if (marker?.element) {
            marker.element.remove();
            console.log('[V8.0] DOM-Element entfernt');
        }

        // 2. Aus interner Map entfernen
        this.parent.markers.delete(markerId);
        console.log(`[V8.0] Aus Map entfernt. Verbleibend: ${this.parent.markers.size}`);

        // 3. Verhindere Reloads für 2 Sekunden
        this.parent.isDeleting = true;

        // 4. Scene-Flags mit scene.update aktualisieren
        const scene = canvas.scene;
        if (!scene) {
            console.error('[V8.0] Keine Scene gefunden!');
            this.parent.isDeleting = false;
            return;
        }

        try {
            // Primäre Methode: scene.update mit spezieller Lösch-Syntax
            await scene.update({
                [`flags.e9l-scene-marker.markers.-=${markerId}`]: null
            });
            
            console.log('[V8.0] Marker mit scene.update gelöscht');
            
            // Kurze Wartezeit für Foundry
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Backup-Methode: Falls der Marker noch existiert
            const currentMarkers = scene.getFlag('e9l-scene-marker', 'markers') || {};
            if (markerId in currentMarkers) {
                console.log('[V8.0] Backup-Löschung erforderlich');
                const updatedMarkers = foundry.utils.duplicate(currentMarkers);
                delete updatedMarkers[markerId];
                await scene.setFlag('e9l-scene-marker', 'markers', updatedMarkers);
            }
            
            ui.notifications.info("Marker dauerhaft gelöscht");
            
        } catch (error) {
            console.error('[V8.0] Fehler beim Löschen:', error);
            ui.notifications.error(`Fehler beim Löschen: ${error.message}`);
        } finally {
            // Reset isDeleting nach 2 Sekunden
            setTimeout(() => {
                this.parent.isDeleting = false;
                console.log('[V8.0] isDeleting zurückgesetzt');
            }, 2000);
        }
    }

    clearMarkersDOM() {
        // Entferne nur DOM-Elemente, behalte Overlay
        this.parent.markers.forEach(marker => {
            if (marker.element) {
                marker.element.remove();
            }
        });
        this.parent.markers.clear();
    }

    clearMarkers() {
        if (this.parent.markerOverlay) {
            this.parent.markerOverlay.remove();
            this.parent.markerOverlay = null;
        }
        this.parent.markers.clear();
    }

    async clearAllMarkers() {
        if (!game.user.isGM) {
            ui.notifications.error("Nur der GM kann alle Marker löschen!");
            return;
        }
        
        const confirmed = await Dialog.confirm({
            title: "Alle Marker löschen",
            content: `<p>Möchten Sie wirklich alle ${this.parent.markers.size} Marker in dieser Szene löschen?</p>`,
            yes: () => true,
            no: () => false
        });
        
        if (confirmed) {
            this.parent.isDeleting = true;
            await canvas.scene.unsetFlag('e9l-scene-marker', 'markers');
            this.clearMarkers();
            setTimeout(() => {
                this.parent.isDeleting = false;
                this.loadMarkers();
            }, 500);
            ui.notifications.info("Alle Marker wurden gelöscht");
        }
    }
}