/**
 * e9l DSA5/TDE5 Scene Marker Module for Foundry VTT v12
 * Version: 10.0
 * Date: 2024
 * Description: Hauptmodul - Orchestrierung und Initialisierung
 * Changes: Erweiterte Marker-Features, persistente Skripte und Dunkelheits-Animation
 */

import { MarkerManager } from './marker-manager.js';
import { MarkerUI } from './marker-ui.js';
import { MarkerActions } from './marker-actions.js';
import { MarkerEvents } from './marker-events.js';

class E9LSceneMarker {
    constructor() {
        this.isPlacing = false;
        this.markers = new Map();
        this.markerOverlay = null;
        this.isDeleting = false;
        
        // Module initialisieren
        this.manager = new MarkerManager(this);
        this.ui = new MarkerUI(this);
        this.actions = new MarkerActions(this);
        this.events = new MarkerEvents(this);
    }

    init() {
        console.log("e9l DSA5/TDE5 Scene Marker | Version 8.0 - Initialisierung...");
        
        this.isDeleting = false;
        
        // Hook für Scene Controls - nur für GM
        Hooks.on('getSceneControlButtons', (controls) => {
            if (game.user.isGM) {
                this.addSceneControl(controls);
            }
        });

        // Hook für Canvas Ready - nur für GM
        Hooks.on('canvasReady', (canvas) => {
            if (game.user.isGM) {
                this.onCanvasReady(canvas);
            }
        });

        // Hook für Scene Updates - nur für GM
        Hooks.on('updateScene', (scene, data) => {
            if (!game.user.isGM) return;
            
            if (this.isDeleting) {
                console.log('[V8.0] Überspringe Reload während Löschvorgang');
                return;
            }
            if (scene.id === canvas.scene?.id && data.flags?.['e9l-scene-marker']) {
                this.manager.loadMarkers();
            }
        });

        // Hook für Canvas Pan/Zoom - nur für GM
        Hooks.on('canvasPan', () => {
            if (game.user.isGM) {
                this.ui.updateMarkerPositions();
            }
        });
    }

    addSceneControl(controls) {
        controls.push({
            name: "e9l-markers",
            title: "Scene Marker",
            icon: "fas fa-map-pin",
            layer: "controls",
            visible: game.user.isGM,
            tools: [{
                name: "place-marker",
                title: "Marker setzen",
                icon: "fas fa-map-pin",
                toggle: true,
                active: false,
                onClick: (toggle) => this.toggleMarkerMode(toggle)
            }],
            activeTool: "place-marker"
        });
    }

    toggleMarkerMode(active) {
        if (!game.user.isGM) return;
        
        this.isPlacing = active;
        
        if (active) {
            this.events.activateMarkerMode();
        } else {
            this.events.deactivateMarkerMode();
        }
    }

    onCanvasReady(canvas) {
        if (!game.user.isGM) return;
        
        console.log("e9l Scene Marker | Canvas ready, lade Marker...");
        this.manager.clearMarkers();
        this.manager.loadMarkers();
    }

    /**
     * Debug-Funktion zum Prüfen der gespeicherten Marker
     */
    debugMarkers() {
        if (!game.user.isGM) {
            console.log('[DEBUG] Nur GMs können Debug-Informationen abrufen');
            return;
        }
        
        const scene = canvas.scene;
        if (!scene) {
            console.log('[DEBUG] Keine Scene aktiv');
            return;
        }
        
        const flags = scene.getFlag('e9l-scene-marker', 'markers') || {};
        console.log('[DEBUG] Gespeicherte Marker:', flags);
        console.log('[DEBUG] Anzahl gespeichert:', Object.keys(flags).length);
        console.log('[DEBUG] Anzahl im DOM:', this.markers.size);
        console.log('[DEBUG] DOM Marker IDs:', Array.from(this.markers.keys()));
        console.log('[DEBUG] isDeleting Flag:', this.isDeleting);
        console.log('[DEBUG] User ist GM:', game.user.isGM);
        
        return flags;
    }
}

// Modul initialisieren
Hooks.once('init', () => {
    game.e9lSceneMarker = new E9LSceneMarker();
    game.e9lSceneMarker.init();
});

Hooks.once('ready', () => {
    console.log("e9l DSA5/TDE5 Scene Marker | Version 11.0 bereit");
    if (game.user.isGM) {
        console.log("Debug mit: game.e9lSceneMarker.debugMarkers()");
    }
});

export { E9LSceneMarker };