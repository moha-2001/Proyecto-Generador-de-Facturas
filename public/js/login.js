document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const tipoUsuario = document.querySelector('input[name="tipoUsuario"]:checked').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Decidir a qué URL llamar según el botón seleccionado
    const url = tipoUsuario === 'empresa' 
        ? '/api/empresas/login' 
        : '/api/clientes/login';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            if (tipoUsuario === 'empresa') {
                // ... (lógica empresa igual)
                localStorage.setItem('empresaId', data.id);
                window.location.href = 'dashboard.html';
            } else {
                // LÓGICA CLIENTE
                localStorage.setItem('clienteId', data.id);
                localStorage.setItem('clienteNombre', data.nombre);
                
                // 🚨 COMPROBAMOS EL FLAG DE SEGURIDAD
                if (data.requiereCambio) {
                    window.location.href = 'cambiar-password.html'; // Redirigir a cambio forzoso
                } else {
                    window.location.href = 'panel-cliente.html'; // Entrar normal
                }
            }
        }
    } 
    catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
});