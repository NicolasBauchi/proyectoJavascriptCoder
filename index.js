class Articulo {
    constructor(id, nombre, precio, stock, categoriaProducto) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
        this.categoriaProducto = categoriaProducto;
        function aString() {
            return this.nombre + ", $" + this.precio + ", Qty:" + this.stock;
        }

    }

}

//Comienzo soft:
//Programa principal
const productosEnCarrito = [];
const productosAlmacen = [];
const categoriasDeLosProductos = [];
cargarProductosExterior(); // Trae los productos de la API productos.json.

//Llamo los demás métodos dentro de éste para que se ejecuten correctamente y en orden.
async function cargarProductosExterior() {

    await fetch('/productos.json')
        .then((response) => response.json())
        .then((data) => {

            data.forEach((post) => {
                let art = new Articulo(post["id"], post["nombre"], post["precio"],
                    post["stock"], post["categoriaProducto"]);
                productosAlmacen.push(art);
            });
            cargarPagina();

        });

}
function cargarPagina() {
    cargarProductos(); //Arma los objetos Producto.
    saludar();
    visita();
    cargarCarrito();
    crearComponenteFiltro();
    crearComponentes("Todos");
    cargarEventosComponentes();
}

//Creo las cartas y el filtro según los objetos.
function crearComponenteFiltro() {
    //Filtro para las OPT.
    let selector = document.getElementById("select_filtros");

    //OPT del Filtro.
    for (const i of categoriasDeLosProductos) {

        let filtro = document.createElement("option");
        filtro.className = "optFiltro";
        filtro.value = String(i);
        filtro.innerHTML = String(i);
        selector.append(filtro);

    }
}
function crearComponentes(categoria_param) {

    //Pantalla para las cartas
    let lasCartas = document.getElementById("carta-grupo");

    //Cartas de la pantalla.
    for (const i of productosAlmacen) {
        //Si son todos:

        //Desestructuracion:
        let { nombre, precio, stock, id, categoriaProducto } = i;

        if (categoria_param === "Todos") {
            let carta = document.createElement("div");
            carta.className = "carta";
            carta.innerHTML =
                `<img src="imagenes/${nombre}.jpg" alt="">
                <div><h5>${nombre}</h5></div>
                <div> <p>Precio: <b>$${precio}</b>
                <br> Quedan: <b>${stock}</b> en stock. </p></div>
                <div><button class="btnVerImg" id="${id}">Ver imagen</button>
                <button class="btnComprar" id="${id}">Comprar</button></div>`;
            lasCartas.append(carta);
        }
        //Filtrado: categoria
        else {
            if (categoria_param === categoriaProducto) {
                let carta = document.createElement("div");
                carta.className = "carta";
                carta.innerHTML =
                    `<img src="imagenes/${nombre}.jpg" alt="">
                <div><h5>${nombre}</h5></div>
                <div> <p>Precio: <b>$${precio}</b>
                <br> Quedan: <b>${stock}</b> en stock. </p></div>
                <div><button class="btnVerImg" id="${id}">Ver imagen</button>
                <button class="btnComprar" id="${id}">Comprar</button></div>`;
                lasCartas.append(carta);
            }
        }

    }


    cargarEventosCartas();

};


//Carga eventos a los componentes
function cargarEventosComponentes() {
    eventoEnFiltro();
    cargarEventosCartas();
    eventoCarrito();
};

//Borrar/limpiar pantalla/cartas
function limpiarPantalla() {

    //Quito las cartas:
    let carta_grupo = document.getElementById("carta-grupo");
    carta_grupo.innerHTML = "";

};


function cargarCarrito() {
    //depende de la visita del cliente el carro estará vacío o con productos.
    let contCarrito = document.getElementById("cont_carrito");//contador
    if (localStorage.getItem("primerVisita") == "no") {
        //Acá cargo todos los productos del carrito y también la cantidad en el carro:

        let contador = 0;
        if (localStorage.getItem("carrito_compras") != "vacio" && localStorage.getItem("carrito_compras") != null) {
            let array_aux = JSON.parse(localStorage.getItem("carrito_compras"));

            array_aux.forEach(el => {
                productosEnCarrito.push(el);
            });

            for (const i of productosEnCarrito) {
                let { id } = i;
                if (id > 0) {
                    contador++;
                }
            }

        }

        contCarrito.innerHTML = contador;

        console.log("prod en carrito: line 157: " + productosEnCarrito);

    } else if (localStorage.getItem("primerVisita") == "si") {
        //Acá cargo un carrito nuevo
        contCarrito.innerHTML = 0;
        localStorage.setItem("carrito_compras", "vacio");

    }



}


//Arma los objetos producto y cargo las categorias de los productos.
function cargarProductos() {

    //Acá cargo las categorias de los productos.
    categoriasDeLosProductos[0] = "Todos";
    for (const p of productosAlmacen) {

        let cont = 0;
        for (let index = 0; index < categoriasDeLosProductos.length; index++) {

            //Sugar Sintax  - operador terniario
            p.categoriaProducto === categoriasDeLosProductos[index] ? cont++ : null;

        }

        //Sugar Sintax  - operador terniario
        cont == 0 ? categoriasDeLosProductos.push(p.categoriaProducto) : null;

    }
}

function eventoEnFiltro() {
    let select_filtro = document.getElementById("select_filtros");
    select_filtro.onchange = () => {
        let cate = String(select_filtro.value);
        limpiarPantalla();
        crearComponentes(cate);
    };
}
function cargarEventosCartas() {

    //Botones Agregar al carrito:
    let losBotones = document.getElementsByClassName("btnComprar");
    for (const boton of losBotones) {

        //Desestructuracion: 
        let { id } = boton;
        boton.onclick = () => { agregarAlCarrito(id) };

    }

    //Botones Ver imagen en grande:
    let btnImg = document.getElementsByClassName("btnVerImg");
    for (const btn of btnImg) {



        let articulo = productosAlmacen.find((p) => p.id == btn.id);
        let { nombre, precio, stock } = articulo;
        btn.onclick = () => {

            Swal.fire({
                title: nombre,
                text: 'Precio: $' + precio,
                imageUrl: 'imagenes/' + nombre + '.jpg',
                imageWidth: 400,
                imageHeight: 200,
                imageAlt: 'Foto de: ' + nombre,
            })

        };

    }


}
function eventoCarrito() {
    //Evento carrito mostrar
    let btn_carro = document.getElementById("btnCarrito");
    btn_carro.onclick = () => {

        let list_productos;
        if (localStorage.getItem("carrito_compras") != "vacio") {// list_productos != null
            list_productos = JSON.parse(localStorage.getItem("carrito_compras"));
        }
        if (list_productos != null) {


            /* Aca tengo que preparar un var que contenga el string HTML
             encajonando item por item que esté en el carro de compras */
            let objetoCarroMostrar = "";
            for (const i of productosEnCarrito) {
                let { id, nombre, precio, stock, categoriaProducto } = i;
                objetoCarroMostrar +=
                    `<div class="carrito-container">
                    <div class="carrito-img">
                        <img src="imagenes/${nombre}.jpg" alt="">
                    </div>
                    <div class="carrito-info">
                        <div><span>Item: </span>${nombre}</div>
                        <div><span>Precio: $</span>${precio}</div>              
                    </div>
                </div>`;
            }
            let valorTotal = calcularTotalPrecioCarrito();
            objetoCarroMostrar += "<h5 id='totalPrecioCarro'>Total:  $" + valorTotal + "</h5>";


            //Acá muestro el listado de objetos en el carrito:
            Swal.fire({
                title: objetoCarroMostrar,
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Comprar',
                denyButtonText: `Vaciar carrito`,
            }).then((result) => {
                if (result.isConfirmed) {
                    /* Comienzo construccion formulario de cobro */
                    let formulariosPagar =
                        `<div id='formulariosPagarCarro'>
                            <div id="formularioCarro">
                                <h5>Datos del comprador:</h5>
                                <label for="nombre-form-carro">Nombre *</label>
                                <input type="text" id="nombre-form-carro" name="nombre-form-carro-name">
                                <label for="telefono-form">Teléfono *</label>
                                <input type="tel" id="telefono-form-carro" name="telefono-form-carro-name">
                                <label for="correo-form">Correo *</label>
                                <input type="email" id="correo-form-carro" name="correo-form-carro-name">
                                <label for="direccion-form-carro">Dirección *</label>
                                <input type="text" id="direccion-form-carro" name="direccion-form-carro-name">
                            </div>
                            <div>
                            <div id="formularioProductosCarro">
                                <h5>Datalle de compra:</h5>
                                <label for="nombre-form-carro">Nombre *</label>
                                <input type="text" id="nombre-form-carro" name="nombre-form-carro-name">
                                <label for="telefono-form">Teléfono *</label>
                                <input type="tel" id="telefono-form-carro" name="telefono-form-carro-name">
                                <label for="correo-form">Correo *</label>
                                <input type="email" id="correo-form-carro" name="correo-form-carro-name">
                                <label for="direccion-form-carro">Dirección *</label>
                                <input type="text" id="direccion-form-carro" name="direccion-form-carro-name">
                            </div>
                            </div>

                        </div>`

                    /* FIN formulario de cobro */

                    //Aca va el formulario de pago/cobro.
                    Swal.fire({
                        position: 'center',
                        title: formulariosPagar,
                        width: 1200,
                        showConfirmButton: true,
                        confirmButtonText: 'Pagar',
                        timer: 0,
                        backdrop: `rgba(205,163,63,0.8)`

                    }).then((eleccion) => {
                        if (eleccion.isConfirmed) {
                            //Mensaje de compra
                            Swal.fire({
                                position: 'center',
                                icon: 'success',
                                title: "Gracias por su compra",
                                showConfirmButton: false,
                                timer: 1000
                            })
                            //Borro carrito 
                            vaciarCarritoCompras();
                        }
                    })
                } else if (result.isDenied) {
                    vaciarCarritoCompras();
                    Swal.fire('Carrito de compras vaciado', '', 'success')
                }
            })

        } else {
            Swal.fire({
                position: 'top',
                title: "Tu carrito está vacío",
                showConfirmButton: false,
                timer: 1000
            })
        }
    };
}
function calcularTotalPrecioCarrito() {
    let total = 0;
    for (const i of productosEnCarrito) {
        total += i.precio;
    }
    return total;
}
function vaciarCarritoCompras() {
    localStorage.setItem("carrito_compras", "vacio");
    productosEnCarrito.length = 0;
    let btnCarro = document.querySelector("#cont_carrito");
    btnCarro.innerHTML = 0;
}

function agregarAlCarrito(id_producto) {
    /* if (localStorage.getItem("carrito_compras") != "vacio") {
        let objetosEnCarritoAntes = JSON.parse(localStorage.getItem("carrito_compras"));
    } */


    //Buscar producto:
    let resultado = productosAlmacen.find((p) => p.id == id_producto);

    //Acá encontró algo.
    if (resultado != null) {
        productosEnCarrito.push(resultado);

        //Agregar animacion al carrito:
        let contCarrito = document.getElementById("cont_carrito");
        let cant = parseInt(contCarrito.innerText);
        contCarrito.innerHTML = cant + 1;

        localStorage.removeItem("carrito_compras");
        //Uso sugar sintax - operador ternario:
        productosEnCarrito != null ? localStorage.setItem("carrito_compras", JSON.stringify(productosEnCarrito)) : null;

        //Menssaje de producto agregado al carrito:
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: resultado.nombre + ' Agregado al carrito',
            showConfirmButton: false,
            timer: 1000
        })


    } else {
        console.log("No se encontró id del producto. metodo'agregarAlCarrito' ");
    }

}

function visita() {
    if (sessionStorage.getItem("primeraVisita_sesion") != null ||
        sessionStorage.getItem("primeraVisita_sesion") === "si") {
        sessionStorage.setItem("primeraVisita_sesion", "no");
    } else {
        sessionStorage.setItem("primeraVisita_sesion", "si");

    }
}

function saludar() {

    const saludos_primer_visita = ["Bienvenido a la tienda de Nicolás", "BIENVENIDO A NUESTRA TIENDA", "PRIMERA VEZ QUE INGRESAS A COMPRAR? ADELANTE!!"];
    const saludos_nuevamente = ["UN PLACER VOLVER A VERTE", "Hola !!  Gracias por volver !", "te olvidaste de comprar algo?"];
    let eleccion;

    if (localStorage.getItem("primerVisita") == null) {
        console.log(localStorage.getItem("primerVisita"));
        //ya realizó una visita
        localStorage.setItem("primerVisita", "si");

        eleccion = Math.floor((Math.random() * ((saludos_primer_visita.length - 1) - 0 + 1)) + 0);
        console.log(saludos_primer_visita[eleccion]);

        Swal.fire({
            position: 'top',
            title: saludos_primer_visita[eleccion],
            showConfirmButton: false,
            timer: 3500
        })

    } else if (localStorage.getItem("primerVisita") === "si") {
        localStorage.setItem("primerVisita", "no");

        eleccion = Math.floor((Math.random() * ((saludos_nuevamente.length - 1) - 0 + 1)) + 0);
        console.log(saludos_nuevamente[eleccion]);


        Swal.fire({
            position: 'top',
            title: saludos_nuevamente[eleccion],
            showConfirmButton: false,
            timer: 3500
        })

    }



}
