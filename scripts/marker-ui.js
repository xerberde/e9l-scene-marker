/**
 * e9l DSA5/TDE5 Scene Marker Module for Foundry VTT v12
 * Version: 13.1.0
 * Date: 2024
 * Description: Marker UI - Rendering und DOM-Manipulation mit Template-Support und Drag & Drop
 */

import { TemplateLoader } from './template-loader.js';

export class MarkerUI {
    constructor(parent) {
        this.parent = parent;
        this.version = parent.version || '13.1.0';
    }

    createMarkerOverlay() {
        // Nur GMs bekommen das Overlay
        if (!game.user.isGM) return;
        
        // Prüfe ob Overlay existiert und richtig positioniert ist
        if (document.getElementById('e9l-marker-overlay')) {
            this.parent.markerOverlay = document.getElementById('e9l-marker-overlay');
            // Stelle sicher, dass es im body ist
            if (this.parent.markerOverlay.parentElement !== document.body) {
                document.body.appendChild(this.parent.markerOverlay);
            }
            return;
        }

        // Erstelle neues Overlay
        this.parent.markerOverlay = document.createElement('div');
        this.parent.markerOverlay.id = 'e9l-marker-overlay';
        this.parent.markerOverlay.style.position = 'fixed';
        this.parent.markerOverlay.style.top = '0';
        this.parent.markerOverlay.style.left = '0';
        this.parent.markerOverlay.style.width = '100%';
        this.parent.markerOverlay.style.height = '100%';
        this.parent.markerOverlay.style.pointerEvents = 'none';
        this.parent.markerOverlay.style.zIndex = '30';
        this.parent.markerOverlay.dataset.gmOnly = 'true';
        
        document.body.appendChild(this.parent.markerOverlay);
    }

    renderMarkerDOM(markerData) {
        // Nur GMs können Marker sehen
        if (!game.user.isGM) {
            console.log(`[V${this.version}] Spieler - Marker wird nicht gerendert`);
            return;
        }
        
        if (!this.parent.markerOverlay) {
            this.createMarkerOverlay();
        }

        // WICHTIGE DUPLIKAT-PRÜFUNG - verhindert doppeltes Rendering
        const existingMarker = document.querySelector(`[data-marker-id="${markerData.id}"]`);
        if (existingMarker) {
            console.log(`[V${this.version}] Marker ${markerData.id} existiert bereits im DOM - überspringe Rendering`);
            return;
        }
        
        // Zusätzliche Prüfung über die Map
        if (this.parent.markers.has(markerData.id)) {
            console.log(`[V${this.version}] Marker ${markerData.id} existiert bereits in Map - überspringe Rendering`);
            return;
        }

        const markerElement = document.createElement('div');
        markerElement.className = 'e9l-scene-marker-dom gm-only';
        markerElement.dataset.markerId = markerData.id;
        markerElement.dataset.gmOnly = 'true';
        markerElement.style.pointerEvents = 'all';
        
        markerElement.innerHTML = `
            <div class="marker-box">
                <i class="${markerData.icon}"></i>
            </div>
            <div class="marker-label" style="display: none;">
                ${markerData.customName || markerData.label}
            </div>
        `;

        this.updateMarkerElementPosition(markerElement, markerData.x, markerData.y);

        markerElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showMarkerMenu(markerData, e);
        });

        markerElement.addEventListener('mouseenter', () => {
            markerElement.classList.add('hover');
            // Zeige Label beim Hovern
            const label = markerElement.querySelector('.marker-label');
            if (label) label.style.display = 'block';
        });
        
        markerElement.addEventListener('mouseleave', () => {
            markerElement.classList.remove('hover');
            // Verstecke Label
            const label = markerElement.querySelector('.marker-label');
            if (label) label.style.display = 'none';
        });

        this.parent.markerOverlay.appendChild(markerElement);

        // Erst NACH erfolgreichem DOM-Append zur Map hinzufügen
        this.parent.markers.set(markerData.id, {
            data: markerData,
            element: markerElement
        });
        
        console.log(`[V${this.version}] GM - Marker ${markerData.id} erfolgreich gerendert`);
    }

    updateMarkerElementPosition(element, canvasX, canvasY) {
        if (!element || !canvas.stage) return;
        
        const screenPos = canvas.stage.toGlobal({x: canvasX, y: canvasY});
        element.style.left = `${screenPos.x - 18}px`;
        element.style.top = `${screenPos.y - 18}px`;
    }

    updateMarkerPositions() {
        // Nur für GMs
        if (!game.user.isGM) return;
        
        this.parent.markers.forEach(marker => {
            this.updateMarkerElementPosition(
                marker.element, 
                marker.data.x, 
                marker.data.y
            );
        });
    }

    updateMarkerLabel(markerId, newName) {
        const marker = this.parent.markers.get(markerId);
        if (!marker) return;
        
        // Update DOM
        const labelElement = marker.element.querySelector('.marker-label');
        if (labelElement) {
            labelElement.textContent = newName || marker.data.label;
        }
        
        // Update data
        marker.data.customName = newName;
    }

    async showMarkerMenu(markerData, event) {
        // Nur GMs können das Menü öffnen
        if (!game.user.isGM) return;
        
        const existingMenu = document.querySelector('.e9l-marker-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'e9l-marker-menu gm-only';
        menu.dataset.gmOnly = 'true';
        
        // Template-Daten vorbereiten
        const templateData = {
            markerId: markerData.id,
            markerName: markerData.customName || markerData.label,
            
            // Status-Anzeigen
            talentStatus: markerData.talentConfig?.talent 
                ? `<span style="font-size: 10px; color: #888;">[${markerData.talentConfig.talent}]</span>`
                : '',
            
            scriptStatus: markerData.customScript 
                ? '<i class="fas fa-check-circle" style="color: #4CAF50; margin-left: auto; font-size: 10px;"></i>'
                : '',
            
            imageStatus: markerData.imageConfig?.path 
                ? '<i class="fas fa-check-circle" style="color: #4CAF50; margin-left: auto; font-size: 10px;"></i>'
                : '',
            
            darknessInfo: markerData.darknessConfig 
                ? `<span style="font-size: 10px; color: #888;">[${markerData.darknessConfig.low} - ${markerData.darknessConfig.high}]</span>`
                : ''
        };
        
        // Template laden und rendern
        const menuHtml = await TemplateLoader.renderTemplate(
            'modules/e9l-scene-marker/templates/marker-menu.html',
            templateData
        );
        
        menu.innerHTML = menuHtml;
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;

        document.body.appendChild(menu);

        // Event-Handler für Name-Input
        const nameInput = menu.querySelector('.marker-name-field');
        let saveTimeout;
        
        // Begrenze auf 50 Zeichen
        nameInput.maxLength = 50;
        
        nameInput.addEventListener('input', (e) => {
            // Begrenze auf 50 Zeichen (zusätzliche Sicherheit)
            if (e.target.value.length > 50) {
                e.target.value = e.target.value.substring(0, 50);
            }
            
            // Clear vorheriges Timeout
            if (saveTimeout) clearTimeout(saveTimeout);
            
            // Verzögertes Speichern (300ms nach letzter Eingabe)
            saveTimeout = setTimeout(async () => {
                const newName = e.target.value.trim().substring(0, 50);
                await this.parent.actions.renameMarker(markerData.id, newName);
                this.updateMarkerLabel(markerData.id, newName);
                
                // Update markerData für weitere Aktionen
                markerData.customName = newName;
                
                console.log(`[V${this.version}] Marker ${markerData.id} umbenannt zu: ${newName}`);
            }, 300);
        });

        // Verhindere Menü-Schließung beim Klick auf Input
        nameInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Enter-Taste schließt Menü
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                menu.remove();
            }
        });

        // Focus auf Input-Feld
        setTimeout(() => {
            nameInput.focus();
            nameInput.select();
        }, 10);

        // Event-Handler für Menü-Items
        menu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                const action = item.dataset.action;
                if (action) {
                    // Speichere Name bevor Aktion ausgeführt wird
                    if (saveTimeout) {
                        clearTimeout(saveTimeout);
                        const newName = nameInput.value.trim().substring(0, 50);
                        await this.parent.actions.renameMarker(markerData.id, newName);
                        this.updateMarkerLabel(markerData.id, newName);
                        markerData.customName = newName;
                    }
                    
                    await this.parent.actions.handleMarkerAction(action, markerData);
                    
                    // Schließe Menü nur wenn nicht Dialog-Aktionen
                    const keepMenuOpenActions = [
                        'configure-script', 
                        'configure-darkness',
                        'configure-image',
                        'configure-talent'
                    ];
                    
                    if (!keepMenuOpenActions.includes(action)) {
                        menu.remove();
                    }
                }
            });
        });

        // Click-Away Handler
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    // Speichere Name beim Schließen
                    if (saveTimeout) {
                        clearTimeout(saveTimeout);
                        const newName = nameInput.value.trim().substring(0, 50);
                        this.parent.actions.renameMarker(markerData.id, newName);
                        this.updateMarkerLabel(markerData.id, newName);
                    }
                    
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 100);
    }
}