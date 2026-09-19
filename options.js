document.addEventListener('DOMContentLoaded', () => {
    // Cargar valores guardados previamente
    chrome.storage.sync.get(['tonoPreferido', 'instruccionExtra'], (data) => {
        if (data.tonoPreferido) {
            document.getElementById('tonoSelect').value = data.tonoPreferido;
        }
        if (data.instruccionExtra) {
            document.getElementById('customPromptInput').value = data.instruccionExtra;
        }
    });

    // Guardar valores al hacer clic
    document.getElementById('saveBtn').addEventListener('click', () => {
        const tono = document.getElementById('tonoSelect').value;
        const instruccion = document.getElementById('customPromptInput').value;

        chrome.storage.sync.set({
            tonoPreferido: tono,
            instruccionExtra: instruccion
        }, () => {
            const statusDiv = document.getElementById('statusDiv');
            statusDiv.innerText = "¡Configuración guardada con éxito!";
            setTimeout(() => {
                statusDiv.innerText = "";
            }, 2500);
        });
    });
});