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
    const computedStyle = window.getComputedStyle(contenedorSalida);
    const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
    const anchoUtilPx = contenedorSalida.clientWidth - paddingX;
    const maxWidth = anchoUtilPx > 0 ? anchoUtilPx : 300;

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

    document.body.removeChild(spanMedicion);

    // Procesamiento sin indicativos M/C, manteniendo la alternancia y la inversión
    let lineasProcesadas = lineas.map((linea, index) => {
        let numeroRenglon = index + 1;
        if (numeroRenglon % 2 !== 0) {
            return linea;
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
            return invertidas.join(' ');
        }
    });

    return lineasProcesadas.join('\n');
}

// Ventana flotante y arrastrable solo para escritorio
if (window.innerWidth > 768) {
    const container = document.querySelector('.container');
    let isDragging = false;
    let startX, startY;

    container.style.position = 'absolute';
    container.style.top = '50px';
    container.style.left = '50px';
    container.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';

    container.addEventListener('mousedown', (e) => {
        if (['TEXTAREA', 'BUTTON', 'INPUT'].includes(e.target.tagName)) return;
        isDragging = true;
        startX = e.clientX - container.offsetLeft;
        startY = e.clientY - container.offsetTop;
        container.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        container.style.left = (e.clientX - startX) + 'px';
        container.style.top = (e.clientY - startY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'default';
    });
}
