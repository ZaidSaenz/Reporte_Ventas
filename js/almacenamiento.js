// ============================================================
// ALMACENAMIENTO LOCAL
// ============================================================
//
// Guarda las ventas en el navegador del dispositivo.
//
// ============================================================

const CLAVE_VENTAS = "tuny_ancla_ventas_v1";
const CLAVE_RECIENTES = "tuny_ancla_recientes_v1";

const LIMITE_RECIENTES = 6;


// ============================================================
// LECTURA Y ESCRITURA SEGURA
// ============================================================

function leerJSON(clave, valorPredeterminado) {
  try {
    const texto = localStorage.getItem(clave);

    return texto
      ? JSON.parse(texto)
      : valorPredeterminado;

  } catch (error) {
    console.error(`No fue posible leer ${clave}:`, error);

    return valorPredeterminado;
  }
}


function guardarJSON(clave, valor) {
  try {
    localStorage.setItem(
      clave,
      JSON.stringify(valor)
    );

    return true;

  } catch (error) {
    console.error(`No fue posible guardar ${clave}:`, error);

    return false;
  }
}


// ============================================================
// IDENTIFICADOR ÚNICO PARA CADA VENTA
// ============================================================

function crearIdVenta() {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}


// ============================================================
// VENTAS
// ============================================================

function obtenerVentas() {
  return leerJSON(CLAVE_VENTAS, []);
}


function guardarVentas(ventas) {
  return guardarJSON(CLAVE_VENTAS, ventas);
}


function agregarVenta(venta) {
  const ventas = obtenerVentas();

  ventas.unshift(venta);

  return guardarVentas(ventas);
}


function eliminarVentaPorId(idVenta) {
  const ventasActualizadas =
    obtenerVentas().filter(
      (venta) => venta.id !== idVenta
    );

  return guardarVentas(ventasActualizadas);
}


// ============================================================
// FILTRAR LAS VENTAS DEL DÍA ACTUAL
// ============================================================

function obtenerClaveFechaLocal(fecha = new Date()) {
  const valor =
    fecha instanceof Date
      ? fecha
      : new Date(fecha);

  const anio = valor.getFullYear();

  const mes =
    String(valor.getMonth() + 1)
      .padStart(2, "0");

  const dia =
    String(valor.getDate())
      .padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}


function obtenerVentasDeHoy() {
  const hoy = obtenerClaveFechaLocal();

  return obtenerVentas().filter(
    (venta) =>
      obtenerClaveFechaLocal(venta.fechaISO) === hoy
  );
}


// ============================================================
// PRODUCTOS RECIENTES
// ============================================================

function obtenerProductosRecientes() {
  return leerJSON(CLAVE_RECIENTES, []);
}


function registrarProductosRecientes(productos) {
  let recientes = obtenerProductosRecientes();

  productos.forEach(({ producto, precio }) => {
    recientes =
      recientes.filter(
        (item) => item.producto !== producto
      );

    recientes.unshift({
      producto,
      precio
    });
  });

  recientes =
    recientes.slice(0, LIMITE_RECIENTES);

  return guardarJSON(
    CLAVE_RECIENTES,
    recientes
  );
}