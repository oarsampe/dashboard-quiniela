// --- CONFIGURACIÓN ---
const supabaseUrl = 'https://ubjwptgbrkxcnxhzmuid.supabase.co'; // <--- PEGA TU URL
const supabaseKey = 'sb_publishable_1R2hlpAUw_-129CsWjjRnQ_OLFQCd4B'; // <--- PEGA TU KEY
const clienteSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Esta función ahora acepta dos parámetros opcionales: inicio y fin
async function obtenerDatos(fechaInicio = null, fechaFin = null) {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    cuerpoTabla.innerHTML = '<tr><td colspan="4">Cargando... ⏳</td></tr>';

    try {
        // 1. Empezamos a construir la consulta (query) básica
        let consulta = clienteSupabase
            .from('quinielas')
            .select('fecha, provincia, modalidad, numero')
            .order('fecha', { ascending: false });

        // 2. Si el usuario eligió fecha de INICIO, aplicamos filtro "Mayor o igual que" (gte)
        if (fechaInicio) {
            consulta = consulta.gte('fecha', fechaInicio);
        }

        // 3. Si el usuario eligió fecha de FIN, aplicamos filtro "Menor o igual que" (lte)
        if (fechaFin) {
            consulta = consulta.lte('fecha', fechaFin);
        }

        // 4. Si NO hay filtros, limitamos a 20 para no saturar. 
        // Si HAY filtros, traemos hasta 100 resultados.
        if (!fechaInicio && !fechaFin) {
            consulta = consulta.limit(20);
        } else {
            consulta = consulta.limit(100);
        }

        // 5. Ejecutamos la consulta final
        const { data, error } = await consulta;

        if (error) {
            console.error('Error:', error);
            cuerpoTabla.innerHTML = `<tr><td colspan="4" style="color:red">Error: ${error.message}</td></tr>`;
        } else {
            renderizarTabla(data);
        }

    } catch (err) {
        console.error('Error inesperado:', err);
    }
}

// Función auxiliar para dibujar la tabla (para no repetir código)
function renderizarTabla(datos) {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');

    if (datos.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="4">No se encontraron resultados 🤷‍♂️</td></tr>';
        return;
    }

    cuerpoTabla.innerHTML = '';
    datos.forEach(sorteo => {
        const filaHTML = `
            <tr>
                <td>${sorteo.fecha}</td>
                <td>${sorteo.provincia}</td>
                <td>${sorteo.modalidad}</td>
                <td><b>${sorteo.numero}</b></td>
            </tr>
        `;
        cuerpoTabla.innerHTML += filaHTML;
    });
}

// Función que llama el botón "Buscar"
function aplicarFiltro() {
    const inicio = document.getElementById('fecha-inicio').value;
    const fin = document.getElementById('fecha-fin').value;
    obtenerDatos(inicio, fin);
}

// Función que llama el botón "Limpiar"
function limpiarFiltro() {
    document.getElementById('fecha-inicio').value = '';
    document.getElementById('fecha-fin').value = '';
    obtenerDatos(); // Llamamos sin fechas para recargar lo normal
}

// Iniciamos la carga normal al abrir la página
obtenerDatos();