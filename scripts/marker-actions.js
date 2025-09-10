/**
 * e9l DSA5/TDE5 Scene Marker Module for Foundry VTT v12
 * Version: 13.3.5
 * Date: 2024
 * Description: Marker Actions - Korrigierte Button-Handler ohne Dialog-Konflikt
 */

import { TemplateLoader } from './template-loader.js';

export class MarkerActions {
    constructor(parent) {
        this.parent = parent;
        this.version = parent.version || '13.3.5';
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
                // TODO: Implementierung ausstehend
                ui.notifications.warn("Talentprobe-Konfiguration in Entwicklung");
                break;
            case 'request-group-check':
                this.requestGroupCheck(markerData);
                break;
            case 'configure-group-check':
                // TODO: Implementierung ausstehend
                ui.notifications.warn("Sammelprobe-Konfiguration in Entwicklung");
                break;
            case 'execute-script':
                this.executeScript(markerData);
                break;
            case 'configure-script':
                this.configureScript(markerData);
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
        
        console.log(`[V${this.version}] Marker ${markerId} umbenannt zu: ${newName || 'default'}`);
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
        
        console.log(`[V${this.version}] Skript für Marker ${markerId} gespeichert`);
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
        
        console.log(`[V${this.version}] Dunkelheits-Config für Marker ${markerId} gespeichert:`, markers[markerId].darknessConfig);
    }

    async saveImageConfig(markerId, imagePath, showAsPopup) {
        if (!game.user.isGM) return;
        
        const scene = canvas.scene;
        if (!scene) return;
        
        const markers = scene.getFlag('e9l-scene-marker', 'markers') || {};
        if (!markers[markerId]) return;
        
        // Vereinfachte Bild/Video-Konfiguration - keine Größe, fixe Video-Optionen
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
        
        console.log(`[V${this.version}] Bild/Video-Config für Marker ${markerId} gespeichert:`, markers[markerId].imageConfig);
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
        
        // Lade gespeichertes Skript falls vorhanden
        const savedScript = markerData.customScript;
        
        if (!savedScript) {
            ui.notifications.warn(`Kein Skript für "${markerName}" konfiguriert. Bitte erst konfigurieren.`);
            this.configureScript(markerData);
            return;
        }
        
        // Führe das gespeicherte Skript aus
        this.runScript(savedScript, markerData);
    }

    async configureScript(markerData) {
        if (!game.user.isGM) {
            ui.notifications.error("Nur der GM kann Skripte konfigurieren!");
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
        
        // Template-Daten vorbereiten
        const templateData = {
            scriptContent: savedScript
        };
        
        // Template laden
        const dialogContent = await TemplateLoader.renderTemplate(
            'modules/e9l-scene-marker/templates/script-dialog.html',
            templateData
        );
        
        // Dialog erstellen
        new Dialog({
            title: `Skript konfigurieren - ${markerName}`,
            content: dialogContent,
            buttons: {
                validate: {
                    label: "Prüfen",
                    callback: (html) => {
                        const script = html.find('#marker-script').val();
                        this.validateScript(script);
                        return false; // Dialog nicht schließen
                    }
                },
                test: {
                    label: "Testen", 
                    callback: (html) => {
                        const script = html.find('#marker-script').val();
                        this.runScript(script, markerData);
                        return false; // Dialog nicht schließen
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
            default: "test",
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
     */
    validateScript(script) {
        const validationResult = this.validateJavaScript(script);
        if (validationResult.valid) {
            ui.notifications.info("✅ JavaScript-Syntax ist gültig!");
        } else {
            ui.notifications.error(`❌ Syntax-Fehler: ${validationResult.error}`);
        }
    }

    /**
     * Führt ein Skript aus
     */
    runScript(script, markerData) {
        const markerName = markerData.customName || markerData.label;
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
                console.error(`[V${this.version}] Skript-Laufzeitfehler:`, error);
            });
        } catch (error) {
            ui.notifications.error(`Fehler beim Ausführen: ${error.message}`);
        }
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

    async configureDarkness(markerData) {
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
        
        // Template-Daten vorbereiten
        const templateData = {
            lowValue: config.low,
            highValue: config.high
        };
        
        // Template laden
        const dialogContent = await TemplateLoader.renderTemplate(
            'modules/e9l-scene-marker/templates/darkness-config.html',
            templateData
        );
        
        new Dialog({
            title: `Dunkelheits-Konfiguration - ${markerName}`,
            content: dialogContent,
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
            ui.notifications.error("Nur der GM kann Bilder/Videos zeigen!");
            return;
        }
        
        const markerName = markerData.customName || markerData.label;
        const imageConfig = markerData.imageConfig;
        
        if (!imageConfig?.path) {
            ui.notifications.warn(`Kein Bild/Video für "${markerName}" konfiguriert`);
            this.configureImage(markerData);
            return;
        }
        
        // Erkenne ob es ein Video ist
        const isVideo = /\.(mp4|webm|ogg)$/i.test(imageConfig.path);
        
        if (imageConfig.showAsPopup) {
            // Als Popup anzeigen - Dynamische Größe basierend auf Bildschirm
            const screenHeight = window.innerHeight;
            const popupHeight = Math.round(screenHeight * 0.3); // 30% der Bildschirmhöhe
            
            if (isVideo) {
                // Für Videos: Custom Dialog mit dynamischer Größe
                const content = `
                    <div style="width: 100%; height: ${popupHeight}px; display: flex; align-items: center; justify-content: center; background: #000;">
                        <video src="${imageConfig.path}" 
                               style="max-width: 100%; max-height: 100%; width: auto; height: auto;"
                               autoplay
                               loop
                               muted
                               controls>
                        </video>
                    </div>
                `;
                
                new Dialog({
                    title: markerName,
                    content: content,
                    buttons: {},
                    default: null
                }, {
                    width: Math.round(popupHeight * 1.78), // 16:9 Aspect Ratio
                    height: popupHeight + 50, // +50 für Titelleiste
                    resizable: true,
                    classes: ['e9l-media-popup']
                }).render(true);
            } else {
                // Für Bilder: Custom Popup mit dynamischer Größe
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    const dialogHeight = popupHeight;
                    const dialogWidth = Math.round(dialogHeight * aspectRatio);
                    
                    const content = `
                        <div style="width: 100%; height: ${dialogHeight}px; display: flex; align-items: center; justify-content: center; background: #000;">
                            <img src="${imageConfig.path}" 
                                 style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain;">
                        </div>
                    `;
                    
                    new Dialog({
                        title: markerName,
                        content: content,
                        buttons: {},
                        default: null
                    }, {
                        width: Math.min(dialogWidth, window.innerWidth * 0.8),
                        height: dialogHeight + 50, // +50 für Titelleiste
                        resizable: true,
                        classes: ['e9l-media-popup']
                    }).render(true);
                };
                img.src = imageConfig.path;
            }
            
            ui.notifications.info(`${isVideo ? 'Video' : 'Bild'}-Popup für "${markerName}" geöffnet`);
        } else {
            // Im Chat anzeigen - OHNE Titel, nur Bild/Video mit optimaler Größe
            let content = '';
            if (isVideo) {
                content = `
                    <div class="e9l-marker-media">
                        <video src="${imageConfig.path}" 
                               style="width: 100%; height: auto; display: block; margin: 0 auto;"
                               autoplay
                               loop
                               muted
                               controls>
                        </video>
                    </div>
                `;
            } else {
                content = `
                    <div class="e9l-marker-media">
                        <img src="${imageConfig.path}" 
                             style="width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 4px;">
                    </div>
                `;
            }
            
            ChatMessage.create({
                content: content,
                speaker: { alias: "Erzähler" }
            });
            
            ui.notifications.info(`${isVideo ? 'Video' : 'Bild'} im Chat gezeigt`);
        }
    }

    async configureImage(markerData) {
        if (!game.user.isGM) {
            ui.notifications.error("Nur der GM kann Bilder/Videos konfigurieren!");
            return;
        }
        
        const markerName = markerData.customName || markerData.label;
        const imageConfig = markerData.imageConfig || { 
            path: '', 
            showAsPopup: false
        };
        
        // Verstecke Rechtsklick-Menü
        const contextMenu = document.querySelector('.e9l-marker-menu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
        
        // Template-Daten vorbereiten
        const templateData = {
            imagePath: imageConfig.path,
            showAsPopup: imageConfig.showAsPopup
        };
        
        // Template laden
        const dialogContent = await TemplateLoader.renderTemplate(
            'modules/e9l-scene-marker/templates/image-config.html',
            templateData
        );
        
        new Dialog({
            title: `Bild/Video-Konfiguration - ${markerName}`,
            content: dialogContent,
            buttons: {
                save: {
                    label: "Speichern",
                    callback: async (html) => {
                        const imagePath = html.find('#media-path').val();
                        const displayMode = html.find('#display-mode').val();
                        const showAsPopup = displayMode === 'popup';
                        
                        await this.saveImageConfig(markerData.id, imagePath, showAsPopup);
                        ui.notifications.info(`Bild/Video-Konfiguration für "${markerName}" gespeichert`);
                        
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
                // Aktiviere FilePicker Button - WICHTIG: Event-Handler mit e.preventDefault()
                html.find('#media-browse').click((e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const fp = new FilePicker({
                        type: 'imagevideo',
                        current: html.find('#media-path').val(),
                        callback: (path) => {
                            html.find('#media-path').val(path);
                            this.updateMediaPreview(html, path);
                        }
                    });
                    fp.render(true);
                });
                
                // Clear Button - WICHTIG: Event-Handler mit e.preventDefault()
                html.find('#media-clear').click((e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    html.find('#media-path').val('');
                    this.updateMediaPreview(html, '');
                });
                
                // Initial Preview
                if (imageConfig.path) {
                    this.updateMediaPreview(html, imageConfig.path);
                }
                
                // Initial: Setze Display-Mode
                html.find('#display-mode').val(imageConfig.showAsPopup ? 'popup' : 'chat');
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
    
    /**
     * Aktualisiert die Media-Vorschau im Dialog
     */
    updateMediaPreview(html, path) {
        const previewContainer = html.find('#media-preview');
        
        if (!path) {
            // Zeige Placeholder
            previewContainer.html(`
                <div class="preview-placeholder">
                    <i class="fas fa-image"></i>
                    <span>Keine Datei ausgewählt</span>
                </div>
            `);
            return;
        }
        
        // Erkenne ob es ein Video ist
        const isVideo = /\.(mp4|webm|ogg)$/i.test(path);
        
        if (isVideo) {
            // Video-Vorschau
            previewContainer.html(`
                <video src="${path}" style="max-width: 100%; max-height: 100%;" controls muted></video>
            `);
        } else {
            // Bild-Vorschau
            previewContainer.html(`
                <img src="${path}" style="max-width: 100%; max-height: 100%;" 
                     onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'preview-placeholder\\'><i class=\\'fas fa-exclamation-triangle\\'></i><span>Bild konnte nicht geladen werden</span></div>'">
            `);
        }
    }
}