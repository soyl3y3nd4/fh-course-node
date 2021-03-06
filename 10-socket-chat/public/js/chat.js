
var url = window.location.hostname.includes('localhost')
    ? 'http://localhost:8080/api/auth/'
    : 'CAMBIAR_url_de_producción';


let usuario = null;
let socket = null;


const txtUid = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir = document.querySelector('#btnSalir');


// Validar el token del localStorage
const validarJWT = async () => {

    const token = localStorage.getItem('token') || '';

    if (token.length <= 10) {
        window.location = 'index.html';
        throw new Error('No hay token en el servidor');
    }

    try {
        const resp = await fetch(url, {
            headers: { 'x-token': token }
        });

        const { usuario: userDB, token: tokenDB } = await resp.json();
        localStorage.setItem('token', tokenDB);
        usuario = userDB;
        document.title = usuario.nombre;
    } catch (error) {
        document.location = 'index.html';
        console.log(error);
    }

    conectarSocker();
}

const conectarSocker = () => {

    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect', () => {
        console.log('Sockets onlinen')
    });

    socket.on('disconnect', () => {
        console.log('Sockets offline')
    });

    socket.on('recibir-mensajes', dibujarMensaje);

    socket.on('usuarios-activos', dibujarUsuarios);

    socket.on('mensaje-privado', (payload) => {
        // TODO
        console.log('Privado ', payload)
    });

}

const dibujarUsuarios = (usuarios = []) => {

    let usersHtml = '';

    usuarios.forEach(({ nombre, uid }) => {

        usersHtml += `
            <li>
                <p>
                    <h5 class="text-success">${nombre}</h5>
                    <span class="fs-6 text-muted">${uid}</span>
                </p>
            </li>
        `;

        ulUsuarios.innerHTML = usersHtml;

    });

}

const dibujarMensaje = (mensaje = []) => {

    let mensajeHtml = '';

    mensaje.forEach(({ nombre, mensaje }) => {

        mensajeHtml += `
            <li>
                <p>
                    <span class="text-primary">${nombre}</span>
                    <span>${mensaje}</span>
                </p>
            </li>
        `;

        ulMensajes.innerHTML = mensajeHtml;

    });

}

txtMensaje.addEventListener('keyup', ({ keyCode }) => {

    const mensaje = txtMensaje.value;
    const uid = txtUid.value;

    if (keyCode !== 13) { return; }
    if (mensaje.trim().length === 0) { return; }
    if (!socket) { return; }

    socket.emit('enviar-mensaje', { mensaje, uid });

    txtMensaje.value = '';
});

const main = async () => {



    await validarJWT();


}
main();