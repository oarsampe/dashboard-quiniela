// --- CONFIGURACIÓN ---
const supabaseUrl = 'https://ubjwptgbrkxcnxhzmuid.supabase.co';
const supabaseKey = 'sb_publishable_1R2hlpAUw_-129CsWjjRnQ_OLFQCd4B';
const clienteSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- 1. CONFIGURACIÓN DEL ORDEN DE MODALIDADES ---
// Asignamos un número a cada modalidad para forzar el orden que pediste.
const ordenModalidad = {
    "MATUTINO": 1,
    "VESPERTINO": 2,
    "EXTRA": 3,
    "NOCTURNO": 4, // En la base de datos figura con 'O'
    "NOCTURNA": 4, // Lo pongo con 'A' también por si acaso
    "REVANCHA": 5
};

async function obtenerDatos(inicio = null, fin = null) {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    cuerpoTabla.innerHTML = '<tr><td colspan="5">Ordenando y agrupando datos... ⏳</td></tr>';

    try {
        // --- 2. CONSULTA A SUPABASE ---
        let consulta = clienteSupabase
            .from('quinielas')
            .select('posicion, fecha, provincia, modalidad, numero');

        // Filtros de fecha
        if (inicio) consulta = consulta.gte('fecha', inicio);
        if (fin) consulta = consulta.lte('fecha', fin);

        // Aumentamos el límite para asegurar que traemos sorteos completos.
        // Si pedimos solo 20, podríamos traer 5 de Salta y 5 de Jujuy y quedaría incompleto.
        // Traemos 500 por defecto para cubrir varios sorteos completos.
        if (!inicio && !fin) {
            consulta = consulta.order('fecha', { ascending: false }).limit(500);
        } else {
            // Si filtra por fecha, traemos TODO lo de esas fechas (hasta 2000 registros por seguridad)
            consulta = consulta.limit(2000); 
        }

        const { data, error } = await consulta;

        if (error) throw error;

        // --- 3. ORDENAMIENTO PERSONALIZADO (LA MAGIA) ---
        // Aquí ordenamos los datos en el navegador
        data.sort((a, b) => {
            // Criterio 1: Fecha (Más reciente primero)
            if (a.fecha !== b.fecha) {
                return new Date(b.fecha) - new Date(a.fecha);
            }
            
            // Criterio 2: Provincia (Alfabético A-Z)
            // Esto agrupa todo "JUJUY" primero, luego "SALTA", etc.
            if (a.provincia !== b.provincia) {
                return a.provincia.localeCompare(b.provincia);
            }

            // Criterio 3: Modalidad (Tu orden específico)
            // Buscamos el peso en nuestra tablita de arriba. Si no existe, le damos peso 99 (al final).
            const pesoA = ordenModalidad[a.modalidad] || 99;
            const pesoB = ordenModalidad[b.modalidad] || 99;
            if (pesoA !== pesoB) {
                return pesoA - pesoB;
            }

            // Criterio 4: Posición (1 al 20)
            return a.posicion - b.posicion;
        });

        renderizarTabla(data);

    } catch (err) {
        console.error('Error:', err);
        cuerpoTabla.innerHTML = `<tr><td colspan="5" style="color:red">Error: ${err.message}</td></tr>`;
    }
}

function renderizarTabla(datos) {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    cuerpoTabla.innerHTML = '';

    if (datos.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="5">No hay resultados.</td></tr>';
        return;
    }

    datos.forEach(sorteo => {
        // Un pequeño detalle visual: Si la posición es 1, la ponemos en negrita y color
        const estiloPosicion = sorteo.posicion === 1 ? 'font-weight: bold; color: #4CAF50;' : '';
        const estiloNumero = sorteo.posicion === 1 ? 'font-weight: bold; font-size: 1.2em;' : 'font-weight: bold;';

        const filaHTML = `
            <tr>
                <td style="${estiloPosicion}">${sorteo.posicion}º</td>
                <td>${sorteo.fecha}</td>
                <td>${sorteo.provincia}</td>
                <td>${sorteo.modalidad}</td>
                <td style="${estiloNumero}">${sorteo.numero}</td>
            </tr>`;
        cuerpoTabla.innerHTML += filaHTML;
    });
}

// Funciones de botones
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

// Inicializar
obtenerDatos();