const GEMINI_API_KEY = "AQ.Ab8RN6IyTgrRPouAFdWrfTNaVoYICrDnwo4M8mm79TjO_Xa8Qw";

console.log("Filtro y Tono IA: Inicializado correctamente.");

// Función para obtener la configuración guardada por el usuario
async function obtenerConfiguracion() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['tonoPreferido', 'instruccionExtra'], (data) => {
            resolve({
                tono: data.tonoPreferido || 'diplomatico',
                instruccion: data.instruccionExtra || ''
            });
        });
    });
}

// Función que realiza la llamada directa a la API de Gemini
async function consultarGemini(textoOriginal) {
    const config = await obtenerConfiguracion();

    let descripcionTono = "Diplomático y Respetuoso";
    if (config.tono === 'formal') descripcionTono = "Formal y Académico";
    if (config.tono === 'conciso') descripcionTono = "Directo, Breve y Conciso";

    const prompt = `Actúa estrictamente como un intermediario traductor de estilo, tono y semántica. Tu función es reescribir el mensaje de entrada aplicando un tono ${descripcionTono}. ${config.instruccion ? 'Instrucción adicional del usuario: ' + config.instruccion : ''} Si el usuario menciona hechos históricos, personajes o ejemplos, debes reformularlos adecuadamente manteniendo la referencia cultural o histórica de forma culta, eliminando por completo cualquier tono agresivo, groserías o modismos vulgares. Devuelve únicamente el texto adaptado en una sola versión, sin preámbulos, sin comillas, sin explicaciones y sin repetir el mensaje original: "${textoOriginal}"`;
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text.trim();
        } else {
            console.error("Detalle del error de Gemini:", JSON.stringify(data, null, 2));
            return textoOriginal;
        }
    } catch (error) {
        console.error("Error al conectar con la API de Gemini:", error);
        return textoOriginal;
    }
}

// Inyección del botón y la caja de previsualización en la interfaz de WhatsApp Web
function injectFilterButton() {
    const chatFooter = document.querySelector('footer');

    if (chatFooter && !document.getElementById('ai-filter-btn')) {
        const customBtn = document.createElement('button');
        customBtn.id = 'ai-filter-btn';
        customBtn.innerText = '✨ Filtrar IA';
        customBtn.style.cssText = `
            margin: 0 10px;
            padding: 6px 12px;
            background-color: #00a884;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
        `;

        customBtn.addEventListener('click', async () => {
            const editableDiv = document.querySelector('div[contenteditable="true"][data-tab="10"]');
            if (editableDiv && editableDiv.innerText.trim() !== "") {
                const textoOriginal = editableDiv.innerText;
                customBtn.innerText = "Procesando...";
                
                const textoFiltrado = await consultarGemini(textoOriginal);
                customBtn.innerText = '✨ Filtrar IA';

                // Crear o reutilizar el contenedor de previsualización flotante
                let previewBox = document.getElementById('ai-preview-box');
                if (previewBox) previewBox.remove();

                previewBox = document.createElement('div');
                previewBox.id = 'ai-preview-box';
                previewBox.style.cssText = `
                    position: absolute;
                    bottom: 70px;
                    left: 20px;
                    right: 20px;
                    background: #ffffff;
                    border: 2px solid #00a884;
                    border-radius: 8px;
                    padding: 15px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                    font-family: Arial, sans-serif;
                `;

                previewBox.innerHTML = `
                    <div style="font-weight: bold; color: #00a884; margin-bottom: 8px;">Transcripción Propuesta (IA):</div>
                    <div style="background: #f0f2f5; padding: 10px; border-radius: 4px; margin-bottom: 12px; color: #333; max-height: 100px; overflow-y: auto;">${textoFiltrado}</div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="ai-cancel-btn" style="padding: 6px 12px; background: #e1e2e5; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
                        <button id="ai-accept-btn" style="padding: 6px 12px; background: #00a884; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Usar y Enviar</button>
                    </div>
                `;

                chatFooter.style.position = 'relative';
                chatFooter.appendChild(previewBox);

                // Botón cancelar
                document.getElementById('ai-cancel-btn').addEventListener('click', () => {
                    previewBox.remove();
                });

                // Botón aceptar y volcar al chat
                document.getElementById('ai-accept-btn').addEventListener('click', () => {
                    editableDiv.focus();
                    document.execCommand('selectAll', false, null);
                    document.execCommand('insertText', false, textoFiltrado);
                    previewBox.remove();
                });
            }
        });

        chatFooter.prepend(customBtn);
    }
}

// Observador de cambios para detectar cuando se abre un chat en WhatsApp Web
const observer = new MutationObserver(() => {
    injectFilterButton();
});

observer.observe(document.body, { childList: true, subtree: true });