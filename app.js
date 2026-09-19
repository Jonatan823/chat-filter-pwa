const GEMINI_API_KEY = "MI_TOKEN_DE_PRUEBA_12345";

document.getElementById('btn-procesar').addEventListener('click', async () => {
    const textoInput = document.getElementById('texto-input').value;
    
    if (!textoInput.trim()) {
        alert("Por favor, escribe algún texto para filtrar.");
        return;
    }

    const boton = document.getElementById('btn-procesar');
    boton.textContent = "Procesando con IA...";
    boton.disabled = true;

    try {
        const prompt = `Mejora y da un tono elegante y formal al siguiente mensaje: "${textoInput}"`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
        
        if (data.candidates && data.candidates.length > 0) {
            const textoGenerado = data.candidates[0].content.parts[0].text;
            document.getElementById('texto-input').value = textoGenerado.trim();
        } else {
            alert("No se pudo obtener respuesta de la IA.");
        }

    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Ocurrió un error al conectar con la API.");
    } finally {
        boton.textContent = "✨ Filtrar Texto";
        boton.disabled = false;
    }
});