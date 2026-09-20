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
        const resultadoHTML = procesarSLERDinamico(textoInput);
        const divResultado = document.getElementById('resultado');
        divResultado.style.display = 'block';
        divResultado.textContent = resultadoHTML;
    } catch (error) {
        console.error("Error:", error);
        alert("Ocurrió un error al procesar el texto.");
    } finally {
        boton.textContent = "🔄 Aplicar S.L.E.R.";
        boton.disabled = false;
    }
});

function procesarSLERDinamico(texto) {
    const anchoLinea = 35; 
    const palabras = texto.trim().replace(/\s+/g, ' ').split(' ');
    let lineas = [];
    let lineaActual = "";

    for (let palabra of palabras) {
        if ((lineaActual + " " + palabra).trim().length <= anchoLinea) {
            lineaActual = lineaActual ? lineaActual + " " + palabra : palabra;
        } else {
            if (lineaActual) lineas.push(lineaActual);
            lineaActual = palabra;
        }
    }
    if (lineaActual) {
        lineas.push(lineaActual);
    }

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
    const header = container.querySelector('h3');
    let isDragging = false;
    let startX, startY;

    container.style.position = 'absolute';
    container.style.top = '20px';
    container.style.left = '20px';

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - container.offsetLeft;
        startY = e.clientY - container.offsetTop;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        container.style.left = (e.clientX - startX) + 'px';
        container.style.top = (e.clientY - startY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// Función para abrir la ventana Picture-in-Picture independiente (Siempre Visible)
async function abrirVentanaFlotanteReal() {
    if ('documentPictureInPicture' in window) {
        try {
            const pipWindow = await documentPictureInPicture.requestWindow({
                width: 400,
                height: 500,
            });

            [...document.styleSheets].forEach((styleSheet) => {
                try {
                    const cssRules = [...styleSheet.cssRules].map(rule => rule.cssText).join('');
                    const style = document.createElement('style');
                    style.textContent = cssRules;
                    pipWindow.document.head.appendChild(style);
                } catch (e) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = styleSheet.href;
                    pipWindow.document.head.appendChild(link);
                }
            });

            const containerClone = document.querySelector('.container').cloneNode(true);
            pipWindow.document.body.style.margin = '10px';
            pipWindow.document.body.style.backgroundColor = '#f0f2f5';
            pipWindow.document.body.appendChild(containerClone);

            pipWindow.document.getElementById('btn-procesar').addEventListener('click', () => {
                const txt = pipWindow.document.getElementById('texto-input').value;
                const res = procesarSLERDinamico(txt);
                const out = pipWindow.document.getElementById('resultado');
                out.style.display = 'block';
                out.textContent = res;
            });

        } catch (err) {
            console.error("Error al abrir ventana flotante:", err);
        }
    } else {
        alert("Tu navegador no soporta ventanas flotantes independientes persistentes.");
    }
}
