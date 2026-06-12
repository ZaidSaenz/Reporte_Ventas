// ============================================================
// TEXTOS VISIBLES DE LA INTERFAZ
// ============================================================
//
// Si después el cliente desea una versión más formal,
// podemos cambiar estas frases sin modificar la lógica.
//
// ============================================================

const TEXTOS_UI = {
  ventaGuardada:
    "Venta guardada correctamente.",

  ventaRapidaGuardada:
    "Se agregó otra igual: 1 pieza.",

  errorProducto:
    "Elige un producto antes de guardar.",

  errorPrecio:
    "Revisa el precio. Puedes escribir coma o punto.",

  errorCantidad:
    "Escribe cuántas piezas vendiste.",

  errorGuardado:
    "No fue posible guardar la venta en este dispositivo.",

  ventaBorrada:
    "La venta fue borrada."
};


// ============================================================
// INICIO DE LA APLICACIÓN
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {
    document
      .querySelector("#btn-agregar-producto")
      .addEventListener(
        "click",
        () => crearFilaProducto()
      );

    document
      .querySelector("#btn-guardar-venta")
      .addEventListener(
        "click",
        guardarVentaFormulario
      );

    crearFilaProducto();

    iniciarModuloWhatsappSiExiste();

    actualizarPantalla();

    registrarServiceWorker();
  }
);


// ============================================================
// CONECTAR EL MÓDULO DE CONSULTA RÁPIDA
// ============================================================
//
// Estas validaciones evitan que toda la aplicación se detenga
// si el archivo whatsapp.js todavía no está conectado.
//
// ============================================================

function iniciarModuloWhatsappSiExiste() {
  if (
    typeof iniciarReporteWhatsapp ===
    "function"
  ) {
    iniciarReporteWhatsapp();

    return;
  }

  console.warn(
    "No se encontró whatsapp.js. " +
    "La captura de ventas funcionará, " +
    "pero la consulta rápida no estará disponible."
  );
}


function actualizarReporteWhatsappSiExiste() {
  if (
    typeof actualizarReporteWhatsapp ===
    "function"
  ) {
    actualizarReporteWhatsapp();
  }
}


// ============================================================
// CREAR UN RENGLÓN DE PRODUCTO
// ============================================================

function crearFilaProducto(
  productoInicial = "",
  precioInicial = "",
  cantidadInicial = 1
) {
  const plantilla =
    document.querySelector(
      "#plantilla-fila-producto"
    );

  const fila =
    plantilla
      .content
      .firstElementChild
      .cloneNode(true);

  const selectProducto =
    fila.querySelector(
      ".input-producto"
    );

  const inputPrecio =
    fila.querySelector(
      ".input-precio"
    );

  const inputCantidad =
    fila.querySelector(
      ".input-cantidad"
    );

  const botonQuitar =
    fila.querySelector(
      ".btn-quitar"
    );

  CATALOGO_PRODUCTOS.forEach(
    (nombreProducto) => {
      const opcion =
        document.createElement(
          "option"
        );

      opcion.value =
        nombreProducto;

      opcion.textContent =
        nombreProducto;

      selectProducto.append(
        opcion
      );
    }
  );

  selectProducto.value =
    productoInicial;

  inputPrecio.value =
    precioInicial === ""
      ? ""
      : Number(
          precioInicial
        ).toFixed(2);

  inputCantidad.value =
    String(
      cantidadInicial
    );

  inputPrecio.addEventListener(
    "blur",
    () => {
      const precio =
        normalizarPrecio(
          inputPrecio.value
        );

      if (precio !== null) {
        inputPrecio.value =
          precio.toFixed(2);
      }
    }
  );

  fila.addEventListener(
    "input",
    actualizarTotalCaptura
  );

  fila.addEventListener(
    "change",
    actualizarTotalCaptura
  );

  botonQuitar.addEventListener(
    "click",
    () => {
      const filas =
        document.querySelectorAll(
          ".fila-producto"
        );

      if (filas.length === 1) {
        selectProducto.value =
          "";

        inputPrecio.value =
          "";

        inputCantidad.value =
          "1";

        limpiarErroresFila(
          fila
        );

      } else {
        fila.remove();
      }

      actualizarTotalCaptura();
    }
  );

  document
    .querySelector(
      "#lista-productos"
    )
    .append(
      fila
    );

  actualizarTotalCaptura();

  return fila;
}


// ============================================================
// NORMALIZAR PRECIO
// ============================================================
//
// Entradas válidas:
//
// 25
// 25.5
// 25.50
// 25,5
// 25,50
// $25.50
//
// Resultado guardado:
//
// 25.00
// 25.50
//
// ============================================================

function normalizarPrecio(valor) {
  const texto =
    String(valor)
      .trim()
      .replace(
        /\s+/g,
        ""
      )
      .replace(
        /\$/g,
        ""
      );

  if (
    !/^\d+(?:[.,]\d{0,2})?$/.test(
      texto
    )
  ) {
    return null;
  }

  const numero =
    Number(
      texto.replace(
        ",",
        "."
      )
    );

  if (
    !Number.isFinite(
      numero
    ) ||
    numero <= 0
  ) {
    return null;
  }

  return Number(
    numero.toFixed(2)
  );
}


// ============================================================
// NORMALIZAR CANTIDAD
// ============================================================

function normalizarCantidad(valor) {
  const texto =
    String(valor).trim();

  if (
    !/^\d+$/.test(
      texto
    )
  ) {
    return null;
  }

  const numero =
    Number(
      texto
    );

  if (
    !Number.isInteger(
      numero
    ) ||
    numero <= 0
  ) {
    return null;
  }

  return numero;
}


// ============================================================
// LEER PRODUCTOS CAPTURADOS
// ============================================================

function leerProductosFormulario() {
  const filas = [
    ...document.querySelectorAll(
      ".fila-producto"
    )
  ];

  const productos = [];

  for (
    const fila of filas
  ) {
    limpiarErroresFila(
      fila
    );

    const selectProducto =
      fila.querySelector(
        ".input-producto"
      );

    const inputPrecio =
      fila.querySelector(
        ".input-precio"
      );

    const inputCantidad =
      fila.querySelector(
        ".input-cantidad"
      );

    const producto =
      selectProducto.value;

    const precio =
      normalizarPrecio(
        inputPrecio.value
      );

    const cantidad =
      normalizarCantidad(
        inputCantidad.value
      );

    if (!producto) {
      marcarError(
        selectProducto
      );

      mostrarMensaje(
        TEXTOS_UI.errorProducto,
        true
      );

      selectProducto.focus();

      return null;
    }

    if (
      precio === null
    ) {
      marcarError(
        inputPrecio.closest(
          ".entrada-moneda"
        )
      );

      mostrarMensaje(
        TEXTOS_UI.errorPrecio,
        true
      );

      inputPrecio.focus();

      return null;
    }

    if (
      cantidad === null
    ) {
      marcarError(
        inputCantidad
      );

      mostrarMensaje(
        TEXTOS_UI.errorCantidad,
        true
      );

      inputCantidad.focus();

      return null;
    }

    inputPrecio.value =
      precio.toFixed(2);

    inputCantidad.value =
      String(
        cantidad
      );

    productos.push({
      producto,
      precio,
      cantidad
    });
  }

  return productos;
}


// ============================================================
// CONSTRUIR OBJETO DE VENTA
// ============================================================

function construirVenta(productos) {
  const total =
    productos.reduce(
      (
        acumulado,
        item
      ) =>
        acumulado +
        item.precio *
        item.cantidad,
      0
    );

  return {
    id:
      crearIdVenta(),

    fechaISO:
      new Date().toISOString(),

    productos,

    total:
      Number(
        total.toFixed(2)
      )
  };
}


// ============================================================
// GUARDAR VENTA DEL FORMULARIO
// ============================================================

function guardarVentaFormulario() {
  const productos =
    leerProductosFormulario();

  if (!productos) {
    return;
  }

  const venta =
    construirVenta(
      productos
    );

  if (
    !agregarVenta(
      venta
    )
  ) {
    mostrarMensaje(
      TEXTOS_UI.errorGuardado,
      true
    );

    return;
  }

  registrarProductosRecientes(
    productos
  );

  reiniciarFormulario();

  actualizarPantalla();

  mostrarMensaje(
    TEXTOS_UI.ventaGuardada
  );
}


// ============================================================
// GUARDAR VENTA RÁPIDA
// ============================================================
//
// Al tocar "+ Otra igual":
//
// - Se registra el mismo producto.
// - Se conserva el último precio capturado.
// - Se registra una sola pieza.
// - No obliga a volver a abrir el formulario.
//
// ============================================================

function guardarVentaRapida(
  productoReciente
) {
  const productos = [
    {
      producto:
        productoReciente.producto,

      precio:
        Number(
          productoReciente.precio
        ),

      cantidad:
        1
    }
  ];

  const venta =
    construirVenta(
      productos
    );

  if (
    !agregarVenta(
      venta
    )
  ) {
    mostrarMensaje(
      TEXTOS_UI.errorGuardado,
      true
    );

    return;
  }

  registrarProductosRecientes(
    productos
  );

  actualizarPantalla();

  mostrarMensaje(
    TEXTOS_UI.ventaRapidaGuardada
  );
}


// ============================================================
// REINICIAR FORMULARIO
// ============================================================

function reiniciarFormulario() {
  const lista =
    document.querySelector(
      "#lista-productos"
    );

  lista.replaceChildren();

  crearFilaProducto();
}


// ============================================================
// ACTUALIZAR INTERFAZ
// ============================================================

function actualizarPantalla() {
  const ventasHoy =
    obtenerVentasDeHoy();

  renderizarResumenDia(
    ventasHoy
  );

  renderizarHistorialDia(
    ventasHoy,
    borrarVenta
  );

  renderizarProductosRecientes();

  actualizarTotalCaptura();

  actualizarReporteWhatsappSiExiste();
}


// ============================================================
// PRODUCTOS RECIENTES
// ============================================================

function renderizarProductosRecientes() {
  const seccion =
    document.querySelector(
      "#seccion-recientes"
    );

  const contenedor =
    document.querySelector(
      "#productos-recientes"
    );

  const productosRecientes =
    obtenerProductosRecientes();

  contenedor.replaceChildren();

  seccion.classList.toggle(
    "oculto",
    productosRecientes.length === 0
  );

  productosRecientes.forEach(
    (
      productoReciente
    ) => {
      const tarjeta =
        document.createElement(
          "button"
        );

      const nombre =
        document.createElement(
          "span"
        );

      const precio =
        document.createElement(
          "span"
        );

      const accion =
        document.createElement(
          "span"
        );

      tarjeta.type =
        "button";

      tarjeta.className =
        "tarjeta-reciente";

      nombre.className =
        "tarjeta-reciente-nombre";

      precio.className =
        "tarjeta-reciente-precio";

      accion.className =
        "tarjeta-reciente-accion";

      nombre.textContent =
        productoReciente.producto;

      precio.textContent =
        `${
          formatearMoneda(
            productoReciente.precio
          )
        } · 1 pieza`;

      accion.textContent =
        "+ Otra igual";

      tarjeta.append(
        nombre,
        precio,
        accion
      );

      tarjeta.addEventListener(
        "click",
        () =>
          guardarVentaRapida(
            productoReciente
          )
      );

      contenedor.append(
        tarjeta
      );
    }
  );
}


// ============================================================
// BORRAR UNA VENTA
// ============================================================

function borrarVenta(idVenta) {
  if (
    !window.confirm(
      "¿Borrar esta venta?"
    )
  ) {
    return;
  }

  eliminarVentaPorId(
    idVenta
  );

  actualizarPantalla();

  mostrarMensaje(
    TEXTOS_UI.ventaBorrada
  );
}


// ============================================================
// CALCULAR TOTAL EN TIEMPO REAL
// ============================================================

function actualizarTotalCaptura() {
  const filas = [
    ...document.querySelectorAll(
      ".fila-producto"
    )
  ];

  const total =
    filas.reduce(
      (
        acumulado,
        fila
      ) => {
        const precio =
          normalizarPrecio(
            fila
              .querySelector(
                ".input-precio"
              )
              .value
          );

        const cantidad =
          normalizarCantidad(
            fila
              .querySelector(
                ".input-cantidad"
              )
              .value
          );

        if (
          precio === null ||
          cantidad === null
        ) {
          return acumulado;
        }

        return (
          acumulado +
          precio *
          cantidad
        );
      },
      0
    );

  document
    .querySelector(
      "#total-captura"
    )
    .textContent =
      formatearMoneda(
        total
      );
}


// ============================================================
// MENSAJES Y ERRORES
// ============================================================

function mostrarMensaje(
  texto,
  esError = false
) {
  const mensaje =
    document.querySelector(
      "#mensaje-app"
    );

  mensaje.textContent =
    texto;

  mensaje.classList.toggle(
    "error",
    esError
  );
}


function limpiarErroresFila(fila) {
  fila
    .querySelectorAll(
      ".invalido"
    )
    .forEach(
      (
        elemento
      ) =>
        elemento.classList.remove(
          "invalido"
        )
    );
}


function marcarError(elemento) {
  elemento.classList.add(
    "invalido"
  );
}


// ============================================================
// SERVICE WORKER PARA MODO SIN INTERNET
// ============================================================

function registrarServiceWorker() {
  if (
    !(
      "serviceWorker" in
      navigator
    )
  ) {
    return;
  }

  window.addEventListener(
    "load",
    () => {
      navigator
        .serviceWorker
        .register(
          "./service-worker.js"
        )
        .catch(
          (
            error
          ) => {
            console.error(
              "No fue posible registrar el service worker:",
              error
            );
          }
        );
    }
  );
}