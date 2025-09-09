/**
 * e9l DSA5/TDE5 Scene Marker Module for Foundry VTT v12
 * Version: 13.1.0
 * Description: Template Loader - Lädt HTML-Templates aus Dateien
 */

export class TemplateLoader {
    static templateCache = new Map();
    
    /**
     * Lädt ein Template aus einer Datei
     * @param {string} templatePath - Pfad zur Template-Datei
     * @returns {Promise<string>} - HTML-String
     */
    static async loadTemplate(templatePath) {
        // Check Cache
        if (this.templateCache.has(templatePath)) {
            return this.templateCache.get(templatePath);
        }
        
        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Template nicht gefunden: ${templatePath}`);
            }
            
            const html = await response.text();
            
            // Cache das Template
            this.templateCache.set(templatePath, html);
            
            return html;
        } catch (error) {
            console.error(`[E9L v13.1.0] Fehler beim Laden des Templates:`, error);
            return '';
        }
    }
    
    /**
     * Rendert ein Template mit Daten
     * @param {string} templatePath - Pfad zur Template-Datei
     * @param {object} data - Daten für das Template
     * @returns {Promise<string>} - Gerendertes HTML
     */
    static async renderTemplate(templatePath, data = {}) {
        let html = await this.loadTemplate(templatePath);
        
        // Einfaches Template-System mit {{variable}}
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, data[key] || '');
        });
        
        return html;
    }
    
    /**
     * Lädt alle benötigten Templates beim Start
     */
    static async preloadTemplates() {
        const templates = [
            'modules/e9l-scene-marker/templates/script-dialog.html',
            'modules/e9l-scene-marker/templates/marker-menu.html',
            'modules/e9l-scene-marker/templates/darkness-config.html',
            'modules/e9l-scene-marker/templates/image-config.html'
        ];
        
        console.log('[E9L v13.1.0] Lade Templates...');
        
        for (const template of templates) {
            await this.loadTemplate(template);
        }
        
        console.log('[E9L v13.1.0] Templates geladen');
    }
}

// Exportiere als globale Funktion für einfachen Zugriff
window.e9lLoadTemplate = TemplateLoader.loadTemplate.bind(TemplateLoader);
window.e9lRenderTemplate = TemplateLoader.renderTemplate.bind(TemplateLoader);