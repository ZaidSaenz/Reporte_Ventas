// ============================================================
// REPORTE LISTO PARA COPIAR EN WHATSAPP
// ============================================================
//
// Este módulo:
// - Guarda tienda, demo, región, supervisor y horario.
// - Agrupa las piezas vendidas por producto.
// - Registra la cantidad de canjes.
// - Permite describir libremente qué objetos se entregaron.
// - Genera el texto listo para copiar.
// - Conserva los datos aunque se cierre la página.
//
// ============================================================

const CLAVE_DATOS_REPORTE =
  "tuny_ancla_datos_reporte_v2";

const CLAVE_CANJES_POR_DIA =
  "tuny_ancla_canjes_por_dia_v2";


const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
];


const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];


// ============================================================
// INICIO
// ============================================================

function iniciarReporteWhatsapp() {
  cargarDatosGeneralesReporte();
  cargarCanjesDeHoy();

  document
    .querySelector("#input-tienda")
    .addEventListener(
      "input",
      guardarDatosGeneralesDesdeFormulario
    );

  document
    .querySelector("#input-demo")
    .addEventListener(
      "input",
      guardarDatosGeneralesDesdeFormulario
    );

  document
    .querySelector("#input-region")
    .addEventListener(
      "input",
      guardarDatosGeneralesDesdeFormulario
    );

  document
    .querySelector("#input-supervisor")
    .addEventListener(
      "input",
      guardarDatosGeneralesDesdeFormulario
    );

  document
    .querySelector("#input-horario")
    .addEventListener(
      "input",
      guardarDatosGeneralesDesdeFormulario
    );

  document
    .querySelector("#btn-agregar-canje")
    .addEventListener(
      "click",
      agregarCanje
    );

  document
    .querySelector("#btn-quitar-canje")
    .addEventListener(
      "click",
      quitarCanje
    );

  document
    .querySelector("#input-detalle-canjes")
    .addEventListener(
      "input",
      guardarDetalleCanje
    );

  document
    .querySelector("#btn-copiar-reporte")
    .addEventListener(
      "click",
      copiarReporteWhatsapp
    );

  actualizarReporteWhatsapp();
}


// ============================================================
// DATOS GENERALES
// ============================================================

function obtenerDatosGeneralesReporte() {
  return leerJSON(
    CLAVE_DATOS_REPORTE,
    {
      tienda: "",
      demo: "",
      region: "Tijuana B.C.",
      supervisor: "",
      horario: ""
    }
  );
}


function guardarDatosGeneralesReporte(
  datos
) {
  return guardarJSON(
    CLAVE_DATOS_REPORTE,
    datos
  );
}


function cargarDatosGeneralesReporte() {
  const datos =
    obtenerDatosGeneralesReporte();

  document
    .querySelector("#input-tienda")
    .value =
      datos.tienda || "";

  document
    .querySelector("#input-demo")
    .value =
      datos.demo || "";

  document
    .querySelector("#input-region")
    .value =
      datos.region || "Tijuana B.C.";

  document
    .querySelector("#input-supervisor")
    .value =
      datos.supervisor || "";

  document
    .querySelector("#input-horario")
    .value =
      datos.horario || "";
}


function guardarDatosGeneralesDesdeFormulario() {
  const datos = {
    tienda:
      document
        .querySelector("#input-tienda")
        .value
        .trim(),

    demo:
      document
        .querySelector("#input-demo")
        .value
        .trim(),

    region:
      document
        .querySelector("#input-region")
        .value
        .trim(),

    supervisor:
      document
        .querySelector("#input-supervisor")
        .value
        .trim(),

    horario:
      document
        .querySelector("#input-horario")
        .value
        .trim()
  };

  guardarDatosGeneralesReporte(
    datos
  );

  actualizarReporteWhatsapp();
}


// ============================================================
// CANJES DEL DÍA
// ============================================================
//
// El registro ahora contiene:
//
// {
//   cantidad: 2,
//   detalle: "1 Bowl\n1 pala de cocina"
// }
//
// ============================================================

function obtenerCanjesDeHoy() {
  const registros =
    leerJSON(
      CLAVE_CANJES_POR_DIA,
      {}
    );

  const claveFecha =
    obtenerClaveFechaLocal();

  const registro =
    registros[
      claveFecha
    ];

  if (
    typeof registro !==
    "object" ||
    registro ===
    null
  ) {
    return {
      cantidad: 0,
      detalle: ""
    };
  }

  const cantidad =
    Number(
      registro.cantidad
    );

  return {
    cantidad:
      Number.isInteger(
        cantidad
      ) &&
      cantidad >= 0
        ? cantidad
        : 0,

    detalle:
      typeof registro.detalle ===
      "string"
        ? registro.detalle
        : ""
  };
}


function guardarCanjesDeHoy(
  canjes
) {
  const registros =
    leerJSON(
      CLAVE_CANJES_POR_DIA,
      {}
    );

  const claveFecha =
    obtenerClaveFechaLocal();

  registros[
    claveFecha
  ] = {
    cantidad:
      canjes.cantidad,

    detalle:
      canjes.detalle
  };

  return guardarJSON(
    CLAVE_CANJES_POR_DIA,
    registros
  );
}


function cargarCanjesDeHoy() {
  const canjes =
    obtenerCanjesDeHoy();

  document
    .querySelector("#input-detalle-canjes")
    .value =
      canjes.detalle;

  actualizarContadorCanjes();
}


function obtenerCantidadCanjesDeHoy() {
  return obtenerCanjesDeHoy()
    .cantidad;
}


function agregarCanje() {
  const canjes =
    obtenerCanjesDeHoy();

  guardarCanjesDeHoy({
    cantidad:
      canjes.cantidad + 1,

    detalle:
      canjes.detalle
  });

  actualizarContadorCanjes();
  actualizarReporteWhatsapp();

  mostrarMensaje(
    "Canje agregado."
  );
}


function quitarCanje() {
  const canjes =
    obtenerCanjesDeHoy();

  if (
    canjes.cantidad ===
    0
  ) {
    return;
  }

  guardarCanjesDeHoy({
    cantidad:
      canjes.cantidad - 1,

    detalle:
      canjes.detalle
  });

  actualizarContadorCanjes();
  actualizarReporteWhatsapp();

  mostrarMensaje(
    "Se quitó un canje."
  );
}


function guardarDetalleCanje() {
  const canjes =
    obtenerCanjesDeHoy();

  const detalle =
    document
      .querySelector("#input-detalle-canjes")
      .value
      .trim();

  guardarCanjesDeHoy({
    cantidad:
      canjes.cantidad,

    detalle
  });

  actualizarReporteWhatsapp();
}


function actualizarContadorCanjes() {
  const cantidad =
    obtenerCantidadCanjesDeHoy();

  document
    .querySelector("#contador-canjes")
    .textContent =
      String(
        cantidad
      );

  document
    .querySelector("#btn-quitar-canje")
    .disabled =
      cantidad === 0;
}


// ============================================================
// FECHA DEL REPORTE
// ============================================================

function formatearFechaReporte(
  fecha = new Date()
) {
  return (
    `${DIAS_SEMANA[fecha.getDay()]} ` +
    `${fecha.getDate()} de ` +
    `${MESES[fecha.getMonth()]} ` +
    `${fecha.getFullYear()}`
  );
}


// ============================================================
// AGRUPAR PRODUCTOS REPETIDOS
// ============================================================

function agruparProductosParaReporte(
  ventas
) {
  const agrupados =
    new Map();

  ventas.forEach(
    (
      venta
    ) => {
      venta.productos
        .forEach(
          (
            item
          ) => {
            const cantidadAnterior =
              agrupados.get(
                item.producto
              ) || 0;

            agrupados.set(
              item.producto,
              cantidadAnterior +
              item.cantidad
            );
          }
        );
    }
  );

  return [
    ...agrupados.entries()
  ]
    .map(
      (
        [
          producto,
          cantidad
        ]
      ) => ({
        producto,
        cantidad
      })
    );
}


// ============================================================
// GENERAR TEXTO PARA WHATSAPP
// ============================================================

function generarTextoReporteWhatsapp() {
  const datos =
    obtenerDatosGeneralesReporte();

  const ventas =
    obtenerVentasDeHoy();

  const productos =
    agruparProductosParaReporte(
      ventas
    );

  const canjes =
    obtenerCanjesDeHoy();

  const bloques = [
    `Fecha: ${formatearFechaReporte()}`,

    `Tienda: ${
      datos.tienda ||
      "[Escribe la tienda]"
    }`,

    `Demo: ${
      datos.demo ||
      "[Escribe el nombre]"
    }`,

    `Región: ${
      datos.region ||
      "[Escribe la región]"
    }`
  ];

  productos.forEach(
    (
      {
        producto,
        cantidad
      }
    ) => {
      const piezas =
        cantidad === 1
          ? "pieza"
          : "piezas";

      bloques.push(
        `${producto}\n` +
        `#${cantidad} ${piezas} de atún`
      );
    }
  );

  let bloqueCanje =
    `Canje\n` +
    `#${canjes.cantidad}`;

  if (
    canjes.detalle
  ) {
    bloqueCanje +=
      `\n${canjes.detalle}`;
  }

  bloques.push(
    bloqueCanje
  );

  return bloques.join(
    "\n\n"
  );
}


// ============================================================
// MOSTRAR EL REPORTE
// ============================================================

function actualizarReporteWhatsapp() {
  const textarea =
    document.querySelector(
      "#reporte-whatsapp"
    );

  if (!textarea) {
    return;
  }

  textarea.value =
    generarTextoReporteWhatsapp();
}


// ============================================================
// COPIAR EL REPORTE
// ============================================================

async function copiarReporteWhatsapp() {
  const textarea =
    document.querySelector(
      "#reporte-whatsapp"
    );

  const texto =
    textarea.value;

  try {
    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {
      await navigator
        .clipboard
        .writeText(
          texto
        );

    } else {
      copiarTextoConMetodoAlternativo(
        textarea
      );
    }

    mostrarMensaje(
      "Reporte copiado. Ya puedes pegarlo en WhatsApp."
    );

  } catch (
    error
  ) {
    console.error(
      "No fue posible copiar el reporte:",
      error
    );

    mostrarMensaje(
      "No se pudo copiar automáticamente. Mantén presionado el texto y cópialo manualmente.",
      true
    );
  }
}


function copiarTextoConMetodoAlternativo(
  textarea
) {
  textarea.focus();
  textarea.select();

  textarea.setSelectionRange(
    0,
    textarea.value.length
  );

  const copiado =
    document.execCommand(
      "copy"
    );

  textarea.blur();

  if (!copiado) {
    throw new Error(
      "El navegador rechazó la copia."
    );
  }
}