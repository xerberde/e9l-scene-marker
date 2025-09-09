/**
 * e9l DSA5/TDE5 Scene Marker Module for Foundry VTT v12
 * Version: 13.1.0
 * Date: 2024
 * Description: Hauptmodul - Orchestrierung und Initialisierung mit Drag & Drop Support
 */

import { MarkerManager } from './marker-manager.js';
import { MarkerUI } from './marker-ui.js';
import { MarkerActions } from './marker-actions.js';
import { MarkerEvents } from './marker-events.js';
import { TemplateLoader } from './template-loader.js';

class E9LSceneMarker {
    constructor() {
        this.isPlacing = false;
        this.markers = new Map();
        this.markerOverlay = null;
        this.isDeleting = false;
        
        // Version aus module.json
        this.version = '13.1.0';
        
        // Module initialisieren
        this.templateLoader = new TemplateLoader();
        this.manager = new MarkerManager(this);
        this.ui = new MarkerUI(this);
        this.actions = new MarkerActions(this);
        this.events = new MarkerEvents(this);
    }

    async init() {
        console.log(`e9l DSA5/TDE5 Scene Marker | Version ${this.version} - Initialisierung...`);
        
        // Templates vorladen
        await TemplateLoader.preloadTemplates();
        
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
                console.log(`[V${this.version}] Überspringe Reload während Löschvorgang`);
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
        
        // Hook für Control-Rendering
        Hooks.on('renderSceneControls', () => {
            if (game.user.isGM) {
                this.setupDirectClick();
            }
        });
    }

    addSceneControl(controls) {
        // Eigene Control-Gruppe mit nur einem Tool
        const markerControl = {
            name: "e9l-markers",
            title: "e9l Scene Marker",
            icon: "fa-solid fa-wand-magic-sparkles",
            layer: "controls",
            visible: game.user.isGM,
            tools: [{
                name: "place-marker",
                title: "e9l Scene Marker",
                icon: "fa-solid fa-wand-magic-sparkles",
                toggle: true,
                active: false,
                onClick: (toggle) => this.toggleMarkerMode(toggle)
            }],
            activeTool: "place-marker"
        };
        
        controls.push(markerControl);
    }
    
    /**
     * Überschreibt das Standard-Verhalten für Direkt-Klick
     */
    setupDirectClick() {
        const controlButton = document.querySelector('[data-control="e9l-markers"]');
        if (!controlButton) return;
        
        // Speichere Referenz zum Button für spätere Updates
        this.controlButton = controlButton;
        
        // Entferne das title-Attribut (Foundry nutzt das für das Dropdown)
        controlButton.removeAttribute('title');
        controlButton.setAttribute('data-tooltip', 'e9l Scene Marker');
        
        // Überschreibe den Click-Handler
        controlButton.replaceWith(controlButton.cloneNode(true));
        const newButton = document.querySelector('[data-control="e9l-markers"]');
        this.controlButton = newButton;  // Update Referenz
        
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Toggle direkt
            this.isPlacing = !this.isPlacing;
            this.toggleMarkerMode(this.isPlacing);
            
            // Visual Update
            if (this.isPlacing) {
                newButton.classList.add('active');
            } else {
                newButton.classList.remove('active');
            }
            
            return false;
        }, true);
    }

    toggleMarkerMode(active) {
        if (!game.user.isGM) return;
        
        this.isPlacing = active;
        
        if (active) {
            this.events.activateMarkerMode();
        } else {
            this.events.deactivateMarkerMode();
            // Stelle sicher dass Button nicht active bleibt
            if (this.controlButton) {
                this.controlButton.classList.remove('active');
            }
        }
    }

    onCanvasReady(canvas) {
        if (!game.user.isGM) return;
        
        console.log(`e9l Scene Marker | Version ${this.version} - Canvas ready, lade Marker...`);
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
        console.log('[DEBUG] Module Version:', this.version);
        
        return flags;
    }

    /**
     * Gibt die aktuelle Version zurück
     */
    getVersion() {
        return this.version;
    }
}

// Modul initialisieren
Hooks.once('init', async () => {
    console.log("e9l Scene Marker | Initialisierung gestartet...");
    game.e9lSceneMarker = new E9LSceneMarker();
    await game.e9lSceneMarker.init();
});

Hooks.once('ready', () => {
    const version = game.e9lSceneMarker.getVersion();
    console.log(`e9l DSA5/TDE5 Scene Marker | Version ${version} bereit`);
    if (game.user.isGM) {
        console.log("e9l Scene Marker | Du bist GM - alle Funktionen verfügbar");
        console.log("Debug mit: game.e9lSceneMarker.debugMarkers()");
    } else {
        console.log("e9l Scene Marker | Du bist Spieler - Marker sind nicht sichtbar");
    }
});

export { E9LSceneMarker };