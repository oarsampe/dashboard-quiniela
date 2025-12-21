// Archivo: main.js

// --- CONFIGURACIÓN ---
// const supabaseUrl = 'AQUI_TU_PROJECT_URL'; // <--- PEGA TU URL DE NUEVO SI ES NECESARIO
// const supabaseKey = 'AQUI_TU_API_KEY_ANON'; // <--- PEGA TU KEY DE NUEVO SI ES NECESARIO

const supabaseUrl = 'https://ubjwptgbrkxcnxhzmuid.supabase.co';
const supabaseKey = 'sb_publishable_1R2hlpAUw_-129CsWjjRnQ_OLFQCd4B';

const clienteSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function obtenerDatos() {
    try {
        let { data, error } = await clienteSupabase
            .from('quinielas')
            .select('fecha, provincia, modalidad, numero')
            .order('fecha', { ascending: false })
            .limit(20);

        const cuerpoTabla = document.getElementById('cuerpo-tabla');

        if (error) {
            console.error('Error:', error);
            cuerpoTabla.innerHTML = `<tr><td colspan="4" style="color:red">Error: ${error.message}</td></tr>`;
        } else {
            cuerpoTabla.innerHTML = '';
            data.forEach(sorteo => {
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
    } catch (err) {
        console.error('Error inesperado:', err);
    }
}

// Iniciamos la carga
obtenerDatos();