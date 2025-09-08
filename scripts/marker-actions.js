/**
 * e9l DSA5/TDE5 Scene Marker Module for Foundry VTT v12
 * Version: 12.0
 * Date: 2024
 * Description: Marker Actions - Aktionslogik für Marker
 * Changes: Label über Code-Editor entfernt
 */

export class MarkerActions {
    constructor(parent) {
        this.parent = parent;
    }

    async handleMarkerAction(action, markerData) {
        // Basis-Check - nur GMs können Aktionen ausführen
        if (!game.user.isGM) {
            ui.notifications.error("Nur der GM kann Marker-Aktionen ausführen!");
            return;
        }
        
        switch (action) {
            case 'request-check':
                this.requestCheck(markerData);
                break;
            case 'configure-talent':
                this.configureTalent(markerData);
                break;
            case 'request-group-check':
                this.requestGroupCheck(markerData);
                break;
            case 'execute-script':
                this.executeScript(markerData);
                break;
            case 'toggle-darkness':
                this.toggleDarkness(markerData);
                break;
            case 'configure-darkness':
                this.configureDarkness(markerData);
                break;
            case 'show-image':
                this.showImage(markerData);
                break;
            case 'configure-image':
                this.configureImage(markerData);
                break;
            case 'delete-marker':
                await this.parent.manager.deleteMarker(markerData.id);
                break;
        }
    }

    async renameMarker(markerId, newName) {
        if (!game.user.isGM) return;
        
        const scene = canvas.scene;
        if (!scene) return;
        
        const markers = scene.getFlag('e9l-scene-marker', 'markers') || {};
        if (!markers[markerId]) return;
        
        // Update marker data mit custom name (max 50 Zeichen)
        markers[markerId].customName = newName ? newName.substring(0, 50) : '';
        
        // Speichere in Scene
        await scene.setFlag('e9l-scene-marker', 'markers', markers);
        
        // Update lokale Daten
        const localMarker = this.parent.markers.get(markerId);
        if (localMarker) {
            localMarker.data.customName = newName;
        }
        
        console.log(`[V12.0] Marker ${markerId} umbenannt zu: ${newName || 'default'}`);
    }

    async saveMarkerScript(markerId, script) {
        if (!game.user.isGM) return;
        
        const scene = canvas.scene;
        if (!scene) return;
        
        const markers = scene.getFlag('e9l-scene-marker', 'markers') || {};
        if (!markers[markerId]) return;
        
        // Speichere Skript am Marker
        markers[markerId].customScript = script || '';
        
        // Speichere in Scene
        await scene.setFlag('e9l-scene-marker', 'markers', markers);
        
        // Update lokale Daten
        const localMarker = this.parent.markers.get(markerId);
        if (localMarker) {
            localMarker.data.customScript = script;
        }
        
        console.log(`[V12.0] Skript für Marker ${markerId} gespeichert`);
    }

    async saveDarknessConfig(markerId, lowValue, highValue) {
        if (!game.user.isGM) return;
        
        const scene = canvas.scene;
        if (!scene) return;
        
        const markers = scene.getFlag('e9l-scene-marker', 'markers') || {};
        if (!markers[markerId]) return;
        
        // Speichere Dunkelheits-Konfiguration
        markers[markerId].darknessConfig = {
            low: Math.max(0, Math.min(1, lowValue || 0)),
            high: Math.max(0, Math.min(1, highValue || 1))
        };
        
        // Speichere in Scene
        await scene.setFlag('e9l-scene-marker', 'markers', markers);
        
        // Update lokale Daten
        const localMarker = this.parent.markers.get(markerId);
        if (localMarker) {
            localMarker.data.darknessConfig = markers[markerId].darknessConfig;
        }
        
        console.log(`[V12.0] Dunkelheits-Config für Marker ${markerId} gespeichert:`, markers[markerId].darknessConfig);
    }

    async saveImageConfig(markerId, imagePath, showAsPopup) {
        if (!game.user.isGM) return;
        
        const scene = canvas.scene;
        if (!scene) return;
        
        const markers = scene.getFlag('e9l-scene-marker', 'markers') || {};
        if (!markers[markerId]) return;
        
        // Speichere Bild-Konfiguration
        markers[markerId].imageConfig = {
            path: imagePath || '',
            showAsPopup: showAsPopup || false
        };
        
        // Speichere in Scene
        await scene.setFlag('e9l-scene-marker', 'markers', markers);
        
        // Update lokale Daten
        const localMarker = this.parent.markers.get(markerId);
        if (localMarker) {
            localMarker.data.imageConfig = markers[markerId].imageConfig;
        }
        
        console.log(`[V12.0] Bild-Config für Marker ${markerId} gespeichert:`, markers[markerId].imageConfig);
    }

    requestCheck(markerData) {
        if (!game.user.isGM) return;
        
        const markerName = markerData.customName || markerData.label;
        ui.notifications.info(`Talentprobe angefordert bei: ${markerName}`);
        
        // Whisper nur an GM
        ChatMessage.create({
            content: `<div class="e9l-check-request">
                <h3><i class="fas fa-wand-magic-sparkles"></i> ${markerName}</h3>
                <p>Eine Talentprobe wurde an dieser Position angefordert.</p>
                <p><em>Position: ${Math.round(markerData.x)}, ${Math.round(markerData.y)}</em></p>
            </div>`,
            whisper: game.users.filter(u => u.isGM).map(u => u.id)
        });
    }

    requestGroupCheck(markerData) {
        if (!game.user.isGM) return;
        
        const markerName = markerData.customName || markerData.label;
        ui.notifications.info(`Sammelprobe angefordert bei: ${markerName}`);
        
        // Diese Nachricht geht an alle (GM fordert Probe an)
        ChatMessage.create({
            content: `<div class="e9l-group-check-request">
                <h3><i class="fas fa-users"></i> Sammelprobe: ${markerName}</h3>
                <p>Der Spielleiter fordert alle Helden auf, eine Probe abzulegen.</p>
                <p><em>Position: ${Math.round(markerData.x)}, ${Math.round(markerData.y)}</em></p>
            </div>`
        });
    }

    executeScript(markerData) {
        if (!game.user.isGM) {
            ui.notifications.error("Nur der GM kann Skripte ausführen!");
            return;
        }
        
        const markerName = markerData.customName || markerData.label;
        
        // Verstecke Rechtsklick-Menü
        const contextMenu = document.querySelector('.e9l-marker-menu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
        
        const dialogOptions = {
            width: 800,
            height: 525,
            resizable: true,
            classes: ['e9l-script-dialog']
        };
        
        // Lade gespeichertes Skript oder verwende Default
        const savedScript = markerData.customScript || `// === Add your script here ===

// Beispiel 1: Console-Ausgabe
console.log("🎯 Marker '${markerName}' wurde aktiviert!");

// Beispiel 2: Chat-Nachricht an alle Spieler
ChatMessage.create({
    content: \`<div style="text-align: center;">
        <h3>⚡ Ereignis bei ${markerName}</h3>
        <p><em>Etwas geschieht an dieser Position...</em></p>
    </div>\`,
    speaker: { alias: "Erzähler" }
});`;
        
        // Hilfsfunktion für Validierung
        const validateScript = (script) => {
            const validationResult = this.validateJavaScript(script);
            if (validationResult.valid) {
                ui.notifications.info("✅ JavaScript-Syntax ist gültig!");
            } else {
                ui.notifications.error(`❌ Syntax-Fehler: ${validationResult.error}`);
            }
        };
        
        // Hilfsfunktion für Ausführung
        const runScript = (script) => {
            const validationResult = this.validateJavaScript(script);
            if (!validationResult.valid) {
                ui.notifications.error(`Syntax-Fehler: ${validationResult.error}`);
                return;
            }
            
            try {
                const context = {
                    marker: markerData,
                    markerName: markerName,
                    canvas: canvas,
                    scene: canvas.scene,
                    game: game,
                    ui: ui,
                    ChatMessage: ChatMessage,
                    Roll: Roll
                };
                
                const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
                const executeScript = new AsyncFunction('context', `
                    const { marker, markerName, canvas, scene, game, ui, ChatMessage, Roll } = context;
                    ${script}
                `);
                
                executeScript(context).then(() => {
                    ui.notifications.info(`✅ Skript für "${markerName}" erfolgreich ausgeführt`);
                }).catch(error => {
                    ui.notifications.error(`Laufzeitfehler: ${error.message}`);
                    console.error('[V12.0] Skript-Laufzeitfehler:', error);
                });
            } catch (error) {
                ui.notifications.error(`Fehler beim Ausführen: ${error.message}`);
            }
        };
        
        // Dialog mit Custom-HTML für bessere Kontrolle
        new Dialog({
            title: `Skript konfigurieren - ${markerName}`,
            content: `
                <div class="form-group">
                    <textarea id="marker-script" rows="20" style="width: 100%; font-family: 'Courier New', monospace; font-size: 12px; min-height: 400px; background: #1a1a1d; color: #e0e0e0; border: 1px solid #444; padding: 10px;">${savedScript}</textarea>
                </div>
                <div style="display: none;">
                    <button type="button" id="custom-validate">Prüfen</button>
                    <button type="button" id="custom-execute">Testen</button>
                </div>
            `,
            buttons: {
                validate: {
                    label: "Prüfen",
                    callback: () => {
                        // Dieser Callback tut nichts - wir nutzen den Custom-Handler
                    }
                },
                execute: {
                    label: "Testen", 
                    callback: () => {
                        // Dieser Callback tut nichts - wir nutzen den Custom-Handler
                    }
                },
                save: {
                    label: "Speichern",
                    callback: async (html) => {
                        const script = html.find('#marker-script').val();
                        await this.saveMarkerScript(markerData.id, script);
                        ui.notifications.info(`💾 Skript für "${markerName}" gespeichert`);
                        
                        const contextMenu = document.querySelector('.e9l-marker-menu');
                        if (contextMenu) {
                            contextMenu.style.display = '';
                        }
                        return true;
                    }
                },
                cancel: {
                    label: "Abbrechen",
                    callback: () => {
                        const contextMenu = document.querySelector('.e9l-marker-menu');
                        if (contextMenu) {
                            contextMenu.style.display = '';
                        }
                        return true;
                    }
                }
            },
            default: "execute",
            render: (html) => {
                // WICHTIG: Überschreibe die Standard-Click-Handler komplett
                setTimeout(() => {
                    const validateBtn = html.find('button[data-button="validate"]');
                    const executeBtn = html.find('button[data-button="execute"]');
                    
                    // Entferne alle existierenden Click-Handler
                    validateBtn.off('click');
                    executeBtn.off('click');
                    
                    // Füge neue Click-Handler hinzu
                    validateBtn.on('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        const script = html.find('#marker-script').val();
                        validateScript(script);
                        return false;
                    });
                    
                    executeBtn.on('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        const script = html.find('#marker-script').val();
                        runScript(script);
                        return false;
                    });
                }, 100);
            },
            close: () => {
                const contextMenu = document.querySelector('.e9l-marker-menu');
                if (contextMenu) {
                    contextMenu.style.display = '';
                }
            }
        }, dialogOptions).render(true);
    }

    /**
     * Validiert JavaScript-Syntax
     * @param {string} code - Der zu validierende JavaScript-Code
     * @returns {object} - { valid: boolean, error?: string }
     */
    validateJavaScript(code) {
        try {
            // Versuche den Code zu parsen (prüft Syntax)
            new Function(code);
            
            // Zusätzliche Prüfung für async/await Syntax
            try {
                const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
                new AsyncFunction(code);
            } catch (asyncError) {
                // Wenn async-Syntax-Fehler, aber normaler Code OK ist
                if (!asyncError.message.includes('await')) {
                    throw asyncError;
                }
            }
            
            return { valid: true };
        } catch (error) {
            // Extrahiere aussagekräftige Fehlermeldung
            let errorMsg = error.message;
            
            // Vereinfache typische Fehlermeldungen
            if (errorMsg.includes('Unexpected token')) {
                errorMsg = errorMsg.replace(/^.*Unexpected token/, 'Unerwartetes Zeichen');
            } else if (errorMsg.includes('Unexpected identifier')) {
                errorMsg = 'Unerwarteter Bezeichner - prüfe Tippfehler';
            } else if (errorMsg.includes('missing )')) {
                errorMsg = 'Fehlende schließende Klammer )';
            } else if (errorMsg.includes('missing }')) {
                errorMsg = 'Fehlende schließende geschweifte Klammer }';
            }
            
            return { 
                valid: false, 
                error: errorMsg 
            };
        }
    }

    async toggleDarkness(markerData) {
        if (!game.user.isGM) {
            ui.notifications.error("Nur der GM kann die Dunkelheit ändern!");
            return;
        }
        
        const markerName = markerData.customName || markerData.label;
        const scene = canvas.scene;
        
        // Verwende Foundry v12 kompatible API
        const currentDarkness = scene.environment?.darknessLevel ?? scene.darkness ?? 0;
        
        // Hole gespeicherte Konfiguration oder nutze Defaults
        const config = markerData.darknessConfig || { low: 0.0, high: 1.0 };
        const targetDarkness = currentDarkness >= 0.5 ? config.low : config.high;
        
        // Animierte Dunkelheitsänderung
        await this.animateDarkness(scene, currentDarkness, targetDarkness, 2000); // 2 Sekunden Animation
        
        ui.notifications.info(`Dunkelheit ${targetDarkness >= 0.5 ? 'aktiviert' : 'deaktiviert'} bei ${markerName}`);
        
        // Atmosphärische Nachricht
        if (targetDarkness >= 0.5) {
            ChatMessage.create({
                content: `<div style="text-align: center; font-style: italic;">
                    <i class="fas fa-moon"></i> Bei "${markerName}" senkt sich langsam Dunkelheit über die Szene...
                </div>`,
                speaker: { alias: "Erzähler" }
            });
        } else {
            ChatMessage.create({
                content: `<div style="text-align: center; font-style: italic;">
                    <i class="fas fa-sun"></i> Bei "${markerName}" kehrt das Licht allmählich zurück...
                </div>`,
                speaker: { alias: "Erzähler" }
            });
        }
    }

    async animateDarkness(scene, startValue, endValue, duration = 2000) {
        const steps = 60; // Erhöht für flüssigere Animation
        const stepDuration = duration / steps;
        const stepSize = (endValue - startValue) / steps;
        
        for (let i = 1; i <= steps; i++) {
            const currentValue = startValue + (stepSize * i);
            
            // Verwende Foundry v12 kompatible API
            if (scene.environment) {
                await scene.update({ 'environment.darknessLevel': currentValue });
            } else {
                // Fallback für ältere Versionen
                await scene.update({ darkness: currentValue });
            }
            
            await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
    }

    configureDarkness(markerData) {
        if (!game.user.isGM) {
            ui.notifications.error("Nur der GM kann die Dunkelheit konfigurieren!");
            return;
        }
        
        const markerName = markerData.customName || markerData.label;
        const config = markerData.darknessConfig || { low: 0.0, high: 1.0 };
        
        // Verstecke Rechtsklick-Menü
        const contextMenu = document.querySelector('.e9l-marker-menu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
        
        new Dialog({
            title: `Dunkelheits-Konfiguration - ${markerName}`,
            content: `
                <div class="form-group">
                    <label>Helligkeit (Tag/Hell):</label>
                    <input type="number" id="darkness-low" value="${config.low}" 
                           min="0" max="1" step="0.1" 
                           style="width: 100px;">
                </div>
                <div class="form-group">
                    <label>Dunkelheit (Nacht/Dunkel):</label>
                    <input type="number" id="darkness-high" value="${config.high}" 
                           min="0" max="1" step="0.1" 
                           style="width: 100px;">
                </div>
            `,
            buttons: {
                save: {
                    label: "Speichern",
                    callback: async (html) => {
                        const lowValue = parseFloat(html.find('#darkness-low').val());
                        const highValue = parseFloat(html.find('#darkness-high').val());
                        
                        await this.saveDarknessConfig(markerData.id, lowValue, highValue);
                        ui.notifications.info(`Dunkelheits-Konfiguration für "${markerName}" gespeichert`);
                        
                        // Zeige Rechtsklick-Menü wieder
                        const contextMenu = document.querySelector('.e9l-marker-menu');
                        if (contextMenu) {
                            contextMenu.style.display = '';
                        }
                    }
                },
                cancel: {
                    label: "Abbrechen",
                    callback: () => {
                        // Zeige Rechtsklick-Menü wieder
                        const contextMenu = document.querySelector('.e9l-marker-menu');
                        if (contextMenu) {
                            contextMenu.style.display = '';
                        }
                    }
                }
            },
            default: "save",
            close: () => {
                // Falls Dialog anders geschlossen wird (ESC, X-Button)
                const contextMenu = document.querySelector('.e9l-marker-menu');
                if (contextMenu) {
                    contextMenu.style.display = '';
                }
            }
        }).render(true);
    }

    showImage(markerData) {
        if (!game.user.isGM) {
            ui.notifications.error("Nur der GM kann Bilder zeigen!");
            return;
        }
        
        const markerName = markerData.customName || markerData.label;
        const imageConfig = markerData.imageConfig;
        
        if (!imageConfig?.path) {
            ui.notifications.warn(`Kein Bild für "${markerName}" konfiguriert`);
            this.configureImage(markerData);
            return;
        }
        
        if (imageConfig.showAsPopup) {
            // Als Popup anzeigen
            new ImagePopup(imageConfig.path, {
                title: markerName,
                shareable: true
            }).render(true);
            
            ui.notifications.info(`Bild-Popup für "${markerName}" geöffnet`);
        } else {
            // Im Chat anzeigen
            ChatMessage.create({
                content: `
                    <div class="e9l-marker-image">
                        <h3>${markerName}</h3>
                        <img src="${imageConfig.path}" alt="${markerName}" style="max-width: 100%; height: auto; display: block; margin: 10px auto; border-radius: 4px;">
                    </div>
                `,
                speaker: { alias: "Erzähler" }
            });
            
            ui.notifications.info(`Bild für "${markerName}" im Chat gezeigt`);
        }
    }

    configureImage(markerData) {
        if (!game.user.isGM) {
            ui.notifications.error("Nur der GM kann Bilder konfigurieren!");
            return;
        }
        
        const markerName = markerData.customName || markerData.label;
        const imageConfig = markerData.imageConfig || { path: '', showAsPopup: false };
        
        // Verstecke Rechtsklick-Menü
        const contextMenu = document.querySelector('.e9l-marker-menu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
        
        new Dialog({
            title: `Bild-Konfiguration - ${markerName}`,
            content: `
                <div class="form-group">
                    <label>Bild-Pfad:</label>
                    <div style="display: flex; gap: 5px;">
                        <input type="text" id="image-path" value="${imageConfig.path}" 
                               placeholder="Pfad zum Bild..." 
                               style="flex: 1;">
                        <button type="button" id="image-browse" class="file-picker" 
                                data-type="imagevideo" data-target="#image-path"
                                title="Bild auswählen">
                            <i class="fas fa-file-import"></i>
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="show-as-popup" ${imageConfig.showAsPopup ? 'checked' : ''}>
                        Als Popup anzeigen (sonst im Chat)
                    </label>
                </div>
                <div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                    <small><i class="fas fa-info-circle"></i> Das Bild wird allen Spielern angezeigt.</small>
                </div>
            `,
            buttons: {
                save: {
                    label: "Speichern",
                    callback: async (html) => {
                        const imagePath = html.find('#image-path').val();
                        const showAsPopup = html.find('#show-as-popup').prop('checked');
                        
                        await this.saveImageConfig(markerData.id, imagePath, showAsPopup);
                        ui.notifications.info(`Bild-Konfiguration für "${markerName}" gespeichert`);
                        
                        // Zeige Rechtsklick-Menü wieder
                        const contextMenu = document.querySelector('.e9l-marker-menu');
                        if (contextMenu) {
                            contextMenu.style.display = '';
                        }
                    }
                },
                cancel: {
                    label: "Abbrechen",
                    callback: () => {
                        // Zeige Rechtsklick-Menü wieder
                        const contextMenu = document.querySelector('.e9l-marker-menu');
                        if (contextMenu) {
                            contextMenu.style.display = '';
                        }
                    }
                }
            },
            default: "save",
            render: (html) => {
                // Aktiviere FilePicker Button
                html.find('#image-browse').click((event) => {
                    const fp = new FilePicker({
                        type: 'imagevideo',
                        current: html.find('#image-path').val(),
                        callback: (path) => {
                            html.find('#image-path').val(path);
                        }
                    });
                    fp.render(true);
                });
            },
            close: () => {
                // Falls Dialog anders geschlossen wird (ESC, X-Button)
                const contextMenu = document.querySelector('.e9l-marker-menu');
                if (contextMenu) {
                    contextMenu.style.display = '';
                }
            }
        }).render(true);
    }
}