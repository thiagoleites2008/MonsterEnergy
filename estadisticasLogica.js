document.addEventListener('DOMContentLoaded', async function () {

    // Configuración de Supabase
    const supabaseUrl = 'https://tuvpzybbktbspvfkuonv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1dnB6eWJia3Ric3B2Zmt1b252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNzIxODQsImV4cCI6MjA4Mzg0ODE4NH0.uWNz6bJQI_K4Vhav19cSexTi8jNxkosS9QRRxLryUGg';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    let estadisticasGlobales = {};
    let anoActual = new Date().getFullYear();
    
    await cargarEstadisticas();
    
    
    async function cargarEstadisticas() {
    try {
        const { data, error } = await supabase
            .from('registros_monster')
            .select('*')
            .order('fecha', { ascending: false });
        
        if (error) throw error;
        
        estadisticasGlobales = agruparPorAnoMes(data); // ← Guardar global
        
        const fechaActual = new Date();
        anoActual = fechaActual.getFullYear();
        const mesActual = fechaActual.getMonth();
        
        if (estadisticasGlobales[anoActual]) {
            mostrarCardMes(
                estadisticasGlobales[anoActual][mesActual], 
                mesActual, 
                anoActual, 
                estadisticasGlobales
            );
        }
        
        generarBotonesAnos(estadisticasGlobales);
        
    } catch (error) {
        console.error('Error:', error);
    }
}
window.cambiarMes = function(nuevoMes, ano) {
    if (estadisticasGlobales[ano] && estadisticasGlobales[ano][nuevoMes]) {
        mostrarCardMes(
            estadisticasGlobales[ano][nuevoMes], 
            nuevoMes, 
            ano, 
            estadisticasGlobales
        );
    }
};
    
    // Agrupa registros por año y mes
    function agruparPorAnoMes(registros) {
        const agrupado = {};
        
        registros.forEach(registro => {
            const fecha = new Date(registro.fecha + 'T00:00:00');
            const ano = fecha.getFullYear();
            const mes = fecha.getMonth();
            
            if (!agrupado[ano]) agrupado[ano] = {};
            if (!agrupado[ano][mes]) agrupado[ano][mes] = [];
            
            agrupado[ano][mes].push(registro);
        });
        
        return agrupado;
    }
    
    // Calcula estadísticas de un mes
    function calcularEstadisticasMes(registros) {
        if (!registros || registros.length === 0) return null;
        
        const total = registros.length;
        const totalML = registros.reduce((sum, r) => sum + r.cantidad_ml, 0);
        const totalGastado = registros.reduce((sum, r) => sum + parseFloat(r.precio), 0);
        
        // Día que más tomó
        const diasContador = {};
        registros.forEach(r => {
            diasContador[r.fecha] = (diasContador[r.fecha] || 0) + 1;
        });
        const diaMasTomo = Object.entries(diasContador)
            .sort((a, b) => b[1] - a[1])[0];
        
        // Edición más tomada
        const edicionesContador = {};
        registros.forEach(r => {
            edicionesContador[r.edicion] = (edicionesContador[r.edicion] || 0) + 1;
        });
        const edicionMasTomada = Object.entries(edicionesContador)
            .sort((a, b) => b[1] - a[1])[0];
        
        // Lugar más frecuente
        const lugaresContador = {};
        registros.forEach(r => {
            lugaresContador[r.lugar] = (lugaresContador[r.lugar] || 0) + 1;
        });
        const lugarMasFrecuente = Object.entries(lugaresContador)
            .sort((a, b) => b[1] - a[1])[0];
        
        // Calcular racha más larga
        const fechasOrdenadas = [...new Set(registros.map(r => r.fecha))].sort();
        let rachaActual = 1, rachaMax = 1;
        for (let i = 1; i < fechasOrdenadas.length; i++) {
            const diff = (new Date(fechasOrdenadas[i]) - new Date(fechasOrdenadas[i-1])) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
                rachaActual++;
                rachaMax = Math.max(rachaMax, rachaActual);
            } else {
                rachaActual = 1;
            }
        }
        
        return {
            total,
            totalML,
            totalGastado: totalGastado.toFixed(2),
            diaMasTomo: diaMasTomo ? { fecha: diaMasTomo[0], veces: diaMasTomo[1] } : null,
            edicionMasTomada: edicionMasTomada ? { nombre: edicionMasTomada[0], veces: edicionMasTomada[1] } : null,
            lugarMasFrecuente: lugarMasFrecuente ? { nombre: lugarMasFrecuente[0], veces: lugarMasFrecuente[1] } : null,
            racha: rachaMax
        };
    }
    
    // Muestra la card del mes
function mostrarCardMes(registrosMes, mesIndex, ano, estadisticasPorAnoMes) {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                   'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    
    const stats = calcularEstadisticasMes(registrosMes);
    
    if (!stats) {
        document.querySelector('.cards').innerHTML = '<p>No hay datos para este mes</p>';
        return;
    }
    
    // Verificar si hay mes anterior/siguiente
    const hayMesAnterior = mesIndex > 0 && estadisticasPorAnoMes[ano][mesIndex - 1];
    const haySiguienteMes = mesIndex < 11 && estadisticasPorAnoMes[ano][mesIndex + 1];
    
    document.querySelector('.cards').innerHTML = `
        <!-- Flecha izquierda -->
        <button class="flecha flecha-izq ${!hayMesAnterior ? 'disabled' : ''}" 
                onclick="cambiarMes(${mesIndex - 1}, ${ano})" 
                ${!hayMesAnterior ? 'disabled' : ''}>
            ◄
        </button>
        
        <!-- Flecha derecha -->
        <button class="flecha flecha-der ${!haySiguienteMes ? 'disabled' : ''}" 
                onclick="cambiarMes(${mesIndex + 1}, ${ano})"
                ${!haySiguienteMes ? 'disabled' : ''}>
            ►
        </button>
        
        <h2>${meses[mesIndex]}</h2>
        
        <div class="stat-item">
            <p class="stat-label">TOTAL DE MONSTER</p>
            <p class="stat-value">${stats.total} VECES</p>
        </div>
        
        <div class="stat-item">
            <p class="stat-label">DÍA QUE MÁS TOMÉ</p>
            <p class="stat-value">${stats.diaMasTomo ? formatearFechaCompleta(stats.diaMasTomo.fecha) : 'N/A'}</p>
        </div>
        
        <div class="stat-item">
            <p class="stat-label">RACHA</p>
            <p class="stat-value">${stats.racha} DÍAS DE RACHA</p>
        </div>
        
        <div class="stat-item">
            <p class="stat-label">EDICIÓN MÁS TOMADA</p>
            <p class="stat-value">${stats.edicionMasTomada ? stats.edicionMasTomada.nombre : 'N/A'}</p>
        </div>
        
        <div class="stat-item">
            <p class="stat-label">TOTAL GASTADO</p>
            <p class="stat-value">$${stats.totalGastado}</p>
        </div>
        
        <div class="stat-item">
            <p class="stat-label">TOTAL ML</p>
            <p class="stat-value">${stats.totalML} ML</p>
        </div>
        
        <div class="stat-item">
            <p class="stat-label">LUGAR MÁS FRECUENTE</p>
            <p class="stat-value">${stats.lugarMasFrecuente ? stats.lugarMasFrecuente.nombre.toUpperCase() : 'N/A'}</p>
        </div>
    `;
    }
    
    // Genera los botones de años
    function generarBotonesAnos(estadisticas) {
        const anos = Object.keys(estadisticas).sort((a, b) => b - a);
        const contenedor = document.querySelector('.años');
        
        contenedor.innerHTML = '';
        
        anos.forEach(ano => {
            const btn = document.createElement('div');
            btn.className = 'btn-ano';
            btn.textContent = `AÑO ${ano}`;
            btn.onclick = () => alert(`Próximamente: estadísticas del año ${ano}`);
            contenedor.appendChild(btn);
        });
    }

    function formatearFechaCompleta(fechaStr) {
    const fecha = new Date(fechaStr + 'T00:00:00');
    const opciones = { 
        weekday: 'long',  // Lunes, Martes...
        day: 'numeric',   // 15
        month: 'long',    // Enero
        year: 'numeric'   // 2026
    };
    
    const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
    
    // Capitalizar primera letra (lunes → Lunes)
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
    }
    
});