function mostrarOtroCampo() {
    const seleccion = document.getElementById("edicion").value;
    const otroCampo = document.getElementById("otraE");
    
    if (seleccion === "Otra") {
        otroCampo.style.display = "block";
    } else {
        otroCampo.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Configuración de Supabase
    const supabaseUrl = 'https://tuvpzybbktbspvfkuonv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1dnB6eWJia3Ric3B2Zmt1b252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNzIxODQsImV4cCI6MjA4Mzg0ODE4NH0.uWNz6bJQI_K4Vhav19cSexTi8jNxkosS9QRRxLryUGg';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Agregar evento al botón
    document.getElementById("enviar").addEventListener("click", registrarConsumo);

    async function registrarConsumo() {

        // Obtener valores de los inputs
        const fecha = document.getElementById('fecha').value;
        const edicion = document.getElementById('edicion').value;
        const edicionPersonalizada = document.getElementById('otraE').value;
        const cantidad = document.getElementById('cantidadml').value;
        const precio = document.getElementById('precio').value;
        const lugar = document.getElementById('lugar').value;
        
        // Validar campos obligatorios
        if (!fecha || !edicion || (edicion === 'Otra' && !edicionPersonalizada) || !cantidad || !precio || !lugar) {
            alert("Por favor, complete todos los campos correctamente, sino, el Dios de la Monster lo va a penetrar con su Monster magica");
            return;
        }

        // 3. Validar números positivos
        if (precio < 0 || cantidad <= 0) {
            mostrarMensaje('error');
            return;
        }

        // 4. Guardar en Supabase
        try {
            // Preparar datos
            const datos = {
                fecha: fecha,
                edicion: edicion === 'Otra' ? edicionPersonalizada : edicion,
                edicion_personalizada: edicion === 'Otra' ? edicionPersonalizada : null,
                cantidad_ml: parseInt(cantidad),
                precio: parseFloat(precio),
                lugar: lugar.trim().toLowerCase()
            };
            
            // Insertar en la base de datos
            const { data, error } = await supabase.from('registros_monster').insert([datos]).select();
            
            if (error) {
                throw error;
            }
            
            console.log('Monster registrado con éxito:', data);
            mostrarMensaje('correcto');
            
            document.getElementById('fecha').value = '';
            document.getElementById('edicion').value = '';
            document.getElementById('otraE').value = '';
            document.getElementById('otraE').style.display = 'none';
            document.getElementById('cantidadml').value = '';
            document.getElementById('precio').value = '';
            document.getElementById('lugar').value = '';
            
        } catch (error) {
    
            console.error('Error al guardar:', error);
            mostrarMensaje('error');
        }
    }

    function mostrarMensaje(tipo) {
        const mensajeExito = document.querySelector('.mensaje-correcto p');
        const mensajeError = document.querySelector('.mensaje-error p');
        
       
        mensajeExito.style.display = 'none';
        mensajeError.style.display = 'none';
        
        if (tipo === 'correcto') {
            mensajeExito.style.display = 'block';
            
            
            setTimeout(() => {
                mensajeExito.style.display = 'none';
            }, 3000);
            
        } else if (tipo === 'error') {
            mensajeError.style.display = 'block';
            
            
            setTimeout(() => {
                mensajeError.style.display = 'none';
            }, 3000);
        }
    }

});