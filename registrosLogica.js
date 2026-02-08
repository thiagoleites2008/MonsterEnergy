document.addEventListener('DOMContentLoaded', async function () {

    // Configuración de Supabase
    const supabaseUrl = 'https://tuvpzybbktbspvfkuonv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1dnB6eWJia3Ric3B2Zmt1b252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNzIxODQsImV4cCI6MjA4Mzg0ODE4NH0.uWNz6bJQI_K4Vhav19cSexTi8jNxkosS9QRRxLryUGg';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Cargar registros al iniciar
    await cargarRegistros();

    async function cargarRegistros() {
        try {
            const { data, error } = await supabase
                .from('registros_monster')
                .select('*')
                .order('fecha', { ascending: false });

            if (error) {
                throw error;
            }

            console.log('Registros cargados:', data);

            // Si no hay registros
            if (data.length === 0) {
                document.getElementById('sinRegistros').style.display = 'block';
                return;
            }

            // Ocultar mensaje "sin registros"
            document.getElementById('sinRegistros').style.display = 'none';

            // Crear elementos HTML
            const contenedor = document.getElementById('contenedor-registros');

            data.forEach(registro => {
                const item = crearRegistroHTML(registro);
                contenedor.appendChild(item);
            });

        } catch (error) {
            console.error('Error al cargar los registros:', error);
            alert('Error al cargar los registros');
        }
    }

    function crearRegistroHTML(registro) {
        const div = document.createElement('div');
        div.className = 'registro-item'; // ← Cambio: era 'registro'
        
        div.innerHTML = `
            <div class="registro-header">
                <h3>${registro.edicion}</h3>
                <span class="fecha">${formatearFecha(registro.fecha)}</span>
            </div>
            <div class="registro-info">
                <p><span>Cantidad:</span> ${registro.cantidad_ml} ml</p>
                <p><span>Precio:</span> $${registro.precio}</p>
                <p><span>Lugar:</span> ${registro.lugar}</p>
            </div>
            <button class="btn-eliminar" onclick="eliminarRegistro(${registro.id})">
                Eliminar
            </button>
        `;
        
        return div;
    }

    function formatearFecha(fecha) {
        const date = new Date(fecha + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }


    window.eliminarRegistro = async function(id) {
        if (!confirm('¿Estás seguro de eliminar este registro?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('registros_monster')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('Registro eliminado correctamente');
            location.reload(); // Recarga la página

        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar el registro');
        }
    };

    window.eliminarTodosRegistros = async function() {
        
        if (!confirm('¿Estás seguro de eliminar TODOS los registros?')) {
            return;
        }
        try {
            const { error } = await supabase
                .from('registros_monster')
                .delete()
                .neq('id', 0); // Elimina todos los registros

            if (error) throw error;

            alert('Todos los registros han sido eliminados');
            location.reload(); // Recarga la página
            
        } catch (error) {
            console.error('Error al eliminar todos los registros:', error);
            alert('Error al eliminar todos los registros');
        }

    }

});