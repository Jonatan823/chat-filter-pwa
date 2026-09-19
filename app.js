document.getElementById('btn-procesar').addEventListener('click', () => {
    const textoInput = document.getElementById('texto-input').value;

    if (!textoInput.trim()) {
        alert("Por favor, ingresa algún texto.");
        return;
    }

    const boton = document.getElementById('btn-procesar');
    boton.textContent = "Procesando...";
    boton.disabled = true;

    try {
        const resultadoHTML = procesarSLER(textoInput);
        const divResultado = document.getElementById('resultado');
        divResultado.style.display = 'block';
        divResultado.innerHTML = resultadoHTML;
    } catch (error) {
        console.error("Error:", error);
        alert("Ocurrió un error al procesar el texto.");
    } finally {
        boton.textContent = "🔄 Aplicar S.L.E.R.";
        boton.disabled = false;
    }
});

function procesarSLER(texto) {
    const anchoLinea = 35; 
    const palabras = texto.trim().replace(/\s+/g, ' ').split(' ');
    let lineas = [];
    let lineaActual = "";

    for (let palabra of palabras) {
        if ((lineaActual + " " + palabra).trim().length <= anchoLinea) {
            lineaActual = lineaActual ? lineaActual + " " + palabra : palabra;
        } else {
            lineas.push(lineaActual);
            lineaActual = palabra;
        }
    }
    if (lineaActual) {
        lineas.push(lineaActual);
    }

    let lineasProcesadas = lineas.map((linea, index) => {
        let numeroRenglon = index + 1;
        if (numeroRenglon % 2 !== 0) {
            return `M${numeroRenglon}: ${linea}`;
        } else {
            let palabrasLinea = linea.split(' ');
            let invertidas = palabrasLinea.reverse().map(p => {
                if (p.endsWith(',') || p.endsWith('.')) {
                    let signo = p.slice(-1);
                    let limpia = p.slice(0, -1);
                    return signo + limpia;
                }
                return p;
            });
            return `C${numeroRenglon}: ${invertidas.join(' ')}`;
        }
    });

    return lineasProcesadas.join('\n');
}
