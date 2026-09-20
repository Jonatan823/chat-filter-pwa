document.getElementById('btn-procesar').addEventListener('click', () => {
    const textoInput = document.getElementById('texto-input').value;

    if (!textoInput.trim()) {
        alert("Por favor, ingresa algún texto.");
        return;
    }

    const boton = document.getElementById('btn-procesar');
    boton.textContent = "Procesando S.L.E.R...";
    boton.disabled = true;

    try {
        const divResultado = document.getElementById('resultado');
        divResultado.style.display = 'block';
        
        // Ejecutamos el procesamiento adaptativo basado en el ancho real del contenedor
        const resultadoHTML = procesarSLERDinamico(textoInput, divResultado);
        divResultado.textContent = resultadoHTML;
    } catch (error) {
        console.error("Error:", error);
        alert("Ocurrió un error al procesar el texto.");
    } finally {
        boton.textContent = "🔄 Aplicar S.L.E.R.";
        boton.disabled = false;
    }
});

function procesarSLERDinamico(texto, contenedorSalida) {
    // 1. Obtenemos el ancho útil en píxeles del contenedor de salida
    const computedStyle = window.getComputedStyle(contenedorSalida);
    const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
    const anchoUtilPx = contenedorSalida.clientWidth - paddingX;

    // Si por alguna razón el ancho es 0 (elemento oculto momentáneamente), usamos un valor por defecto seguro
    const maxWidth = anchoUtilPx > 0 ? anchoUtilPx : 300;

    // 2. Creamos un span temporal invisible para medir el ancho exacto de las palabras en píxeles
    const spanMedicion = document.createElement('span');
    spanMedicion.style.visibility = 'hidden';
    spanMedicion.style.position = 'absolute';
    spanMedicion.style.whiteSpace = 'nowrap';
    spanMedicion.style.font = computedStyle.font;
    document.body.appendChild(spanMedicion);

    function medirTexto(str) {
        spanMedicion.textContent = str;
        return spanMedicion.getBoundingClientRect().width;
    }

    const palabras = texto.trim().replace(/\s+/g, ' ').split(' ');
    let lineas = [];
    let lineaActual = "";

    // 3. Distribución dinámica de palabras según el ancho en píxeles
    for (let palabra of palabras) {
        let pruebaLinea = lineaActual ? lineaActual + " " + palabra : palabra;
        if (medirTexto(pruebaLinea) <= maxWidth) {
            lineaActual = pruebaLinea;
        } else {
            if (lineaActual) lineas.push(lineaActual);
            lineaActual = palabra;
        }
    }
    if (lineaActual) {
        lineas.push(lineaActual);
    }

    // Limpiamos el span de medición
    document.body.removeChild(spanMedicion);

    // 4. Aplicación de la lógica S.L.E.R. (Impares M, Pares C con inversión y signos)
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
