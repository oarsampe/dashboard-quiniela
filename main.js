// --- CONFIGURACIÓN ---
const supabaseUrl = 'https://ubjwptgbrkxcnxhzmuid.supabase.co';
const supabaseKey = 'sb_publishable_1R2hlpAUw_-129CsWjjRnQ_OLFQCd4B';
const clienteSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Función principal de carga con parámetros opcionales
async function obtenerDatos(inicio = null, fin = null) {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    cuerpoTabla.innerHTML = '<tr><td colspan="4">Buscando... ⏳</td></tr>';

    try {
        // Iniciamos la consulta base
        let consulta = clienteSupabase
            .from('quinielas')
            .select('fecha, provincia, modalidad, numero')
            .order('fecha', { ascending: false });

        // Aplicamos filtros de fecha si existen
        if (inicio) consulta = consulta.gte('fecha', inicio);
        if (fin) consulta = consulta.lte('fecha', fin);

        // Limitamos resultados si no hay filtros para no saturar
        if (!inicio && !fin) consulta = consulta.limit(20);

        const { data, error } = await consulta;

        if (error) {
            throw error;
        }

        renderizarTabla(data);

    } catch (err) {
        console.error('Error:', err);
        cuerpoTabla.innerHTML = `<tr><td colspan="4" style="color:red">Error: ${err.message}</td></tr>`;
    }
}

// Función para dibujar las filas en la tabla
function renderizarTabla(datos) {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    cuerpoTabla.innerHTML = '';

    if (datos.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="4">No hay resultados para estas fechas.</td></tr>';
        return;
    }

    datos.forEach(sorteo => {
        const filaHTML = `
            <tr>
                <td>${sorteo.fecha}</td>
                <td>${sorteo.provincia}</td>
                <td>${sorteo.modalidad}</td>
                <td><b>${sorteo.numero}</b></td>
            </tr>`;
        cuerpoTabla.innerHTML += filaHTML;
    });
}

// Funciones para los botones
function aplicarFiltro() {
    const inicio = document.getElementById('fecha-inicio').value;
    const fin = document.getElementById('fecha-fin').value;
    obtenerDatos(inicio, fin);
}

function limpiarFiltro() {
    document.getElementById('fecha-inicio').value = '';
    document.getElementById('fecha-fin').value = '';
    obtenerDatos();
}

// Carga inicial
obtenerDatos();