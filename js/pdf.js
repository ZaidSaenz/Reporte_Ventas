// ============================================================
// GENERADOR DE REPORTE PDF TUNY
// ============================================================
//
// Este archivo toma el PDF oficial como plantilla visual
// y escribe únicamente los datos que conocemos:
//
// - Fecha
// - Tienda
// - Región
// - Nombre de la demovendedora
// - Precio por producto vendido
// - Cantidad de piezas por producto vendido
// - Monto de compra por producto vendido
// - Total de piezas
// - Total monetario
// - Cantidad de canjes
//
// Los demás campos permanecen vacíos.
//
// ============================================================

const RUTA_PLANTILLA_PDF =
  "./assets/plantillas/Formulario_reporte_venta_diario_Tuny_estilo_original.pdf";

let ultimoArchivoPdf =
  null;

let ultimaUrlPdf =
  null;




// ============================================================
// INICIO
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  iniciarGeneradorPdf
);


function iniciarGeneradorPdf() {
  const botonGenerar =
    document.querySelector(
      "#btn-generar-pdf"
    );

  const botonCompartir =
    document.querySelector(
      "#btn-compartir-pdf"
    );

  if (
    !botonGenerar ||
    !botonCompartir
  ) {
    console.warn(
      "No se encontraron los botones del generador PDF."
    );

    return;
  }

  botonGenerar.addEventListener(
    "click",
    generarPdfYMostrar
  );

  botonCompartir.addEventListener(
    "click",
    compartirUltimoPdf
  );
}


// ============================================================
// FORMATO DE FECHA Y MONEDA
// ============================================================

function formatearFechaPdf(
  fecha = new Date()
) {
  const dia =
    String(
      fecha.getDate()
    )
      .padStart(
        2,
        "0"
      );

  const mes =
    String(
      fecha.getMonth() + 1
    )
      .padStart(
        2,
        "0"
      );

  const anio =
    fecha.getFullYear();

  return (
    `${dia}/${mes}/${anio}`
  );
}


function formatearMonedaPdf(
  valor
) {
  return (
    "$" +
    Number(
      valor
    )
      .toFixed(
        2
      )
  );
}


// ============================================================
// LIMPIAR TEXTO PARA EVITAR CARACTERES INCOMPATIBLES
// ============================================================
//
// Helvetica admite letras acentuadas comunes, pero no emojis.
// Si alguien escribe un carácter incompatible, se elimina.
//
// ============================================================

function limpiarTextoPdf(
  valor
) {
  return String(
    valor ?? ""
  )
    .replace(
      /\r/g,
      ""
    )
    .replace(
      /[^\x20-\x7E\u00A0-\u00FF]/g,
      ""
    );
}


// ============================================================
// OBTENER LOS DATOS GENERALES DISPONIBLES
// ============================================================

function obtenerDatosGeneralesParaPdf() {
  if (
    typeof obtenerDatosGeneralesReporte !==
    "function"
  ) {
    return {
      tienda:
        "",

      region:
        "",

      demo:
        "",

      supervisor:
        "",

      horario:
        ""
    };
  }

  const datos =
    obtenerDatosGeneralesReporte();

  return {
    tienda:
      datos.tienda || "",

    region:
      datos.region || "",

    demo:
      datos.demo || "",

    supervisor:
      datos.supervisor || "",

    horario:
      datos.horario || ""
  };
}


// ============================================================
// AGRUPAR LAS VENTAS DEL DÍA POR PRODUCTO
// ============================================================
//
// Ejemplo:
//
// - Ancla en Agua 120 g: 1 pieza
// - Ancla en Agua 120 g: 2 piezas
//
// Resultado:
//
// - Ancla en Agua 120 g: 3 piezas
//
// Si un mismo producto fue capturado con precios distintos,
// se calcula el precio unitario promedio ponderado.
//
// ============================================================

function obtenerResumenProductosPdf() {
  const agrupados =
    new Map();

  const productosNoReconocidos =
    new Set();

  const ventasHoy =
    obtenerVentasDeHoy();

  ventasHoy.forEach(
    (
      venta
    ) => {
      venta
        .productos
        .forEach(
          (
            item
          ) => {
            if (
              !FILAS_PRODUCTOS_PDF
                .has(
                  item.producto
                )
            ) {
              productosNoReconocidos
                .add(
                  item.producto
                );

              return;
            }

            const registro =
              agrupados.get(
                item.producto
              ) || {
                producto:
                  item.producto,

                piezas:
                  0,

                monto:
                  0
              };

            registro.piezas +=
              Number(
                item.cantidad
              );

            registro.monto +=
              Number(
                item.precio
              ) *
              Number(
                item.cantidad
              );

            agrupados.set(
              item.producto,
              registro
            );
          }
        );
    }
  );

  if (
    productosNoReconocidos
      .size >
    0
  ) {
    throw new Error(
      "Hay productos que no tienen un renglón asignado en el PDF: " +
      [
        ...productosNoReconocidos
      ]
        .join(
          ", "
        )
    );
  }

  return [
    ...agrupados
      .values()
  ]
    .map(
      (
        item
      ) => ({
        ...item,

        precio:
          item.piezas >
          0
            ? item.monto /
              item.piezas
            : 0,

        fila:
          FILAS_PRODUCTOS_PDF
            .get(
              item.producto
            )
      })
    );
}


// ============================================================
// DIBUJAR TEXTO CON ALINEACIÓN
// ============================================================

function dibujarTextoAlineado(
  pagina,
  fuente,
  texto,
  {
    x,
    y,
    ancho = 0,
    tamano = 7,
    alineacion = "izquierda"
  }
) {
  const valor =
    limpiarTextoPdf(
      texto
    );

  const anchoTexto =
    fuente
      .widthOfTextAtSize(
        valor,
        tamano
      );

  let posicionX =
    x;

  if (
    alineacion ===
    "centro"
  ) {
    posicionX =
      x +
      (
        ancho -
        anchoTexto
      ) /
      2;
  }

  if (
    alineacion ===
    "derecha"
  ) {
    posicionX =
      x +
      ancho -
      anchoTexto;
  }

  pagina.drawText(
    valor,
    {
      x:
        posicionX,

      y,

      size:
        tamano,

      font:
        fuente
    }
  );
}


// ============================================================
// DIBUJAR TEXTO REDUCIENDO EL TAMAÑO SI ES NECESARIO
// ============================================================
//
// Esto ayuda especialmente con nombres largos.
//
// ============================================================

function dibujarTextoAjustado(
  pagina,
  fuente,
  texto,
  {
    x,
    y,
    ancho,
    tamanoMaximo = 6.5,
    tamanoMinimo = 4.4
  }
) {
  const valor =
    limpiarTextoPdf(
      texto
    );

  if (!valor) {
    return;
  }

  let tamano =
    tamanoMaximo;

  while (
    tamano >
      tamanoMinimo &&
    fuente
      .widthOfTextAtSize(
        valor,
        tamano
      ) >
      ancho
  ) {
    tamano -=
      0.2;
  }

  pagina.drawText(
    valor,
    {
      x,

      y,

      size:
        tamano,

      font:
        fuente
    }
  );
}


// ============================================================
// CUBRIR EL INTERIOR DE UNA CELDA
// ============================================================
//
// La plantilla ya trae:
//
// TOTAL DE PIEZAS: 0
// TOTAL $: $0.00
//
// Antes de escribir los totales reales cubrimos solamente el
// interior blanco. Los bordes permanecen visibles.
//
// ============================================================

function cubrirInteriorCelda(
  pagina,
  {
    x,
    y,
    ancho,
    alto
  }
) {
  const {
    rgb
  } =
    PDFLib;

  pagina.drawRectangle({
    x,

    y,

    width:
      ancho,

    height:
      alto,

    color:
      rgb(
        1,
        1,
        1
      )
  });
}


// ============================================================
// ESCRIBIR EL TOTAL DE CANJES
// ============================================================
//
// La plantilla contiene el título, pero no una cantidad.
// Escribimos únicamente el número.
//
// ============================================================

function dibujarTotalCanjes(
  pagina,
  fuenteNegrita
) {
  const canjes =
    typeof obtenerCantidadCanjesDeHoy ===
    "function"
      ? obtenerCantidadCanjesDeHoy()
      : 0;

  dibujarTextoAlineado(
    pagina,
    fuenteNegrita,
    String(
      canjes
    ),
    {
      x:
        492,

      y:
        527,

      ancho:
        63.4,

      tamano:
        8,

      alineacion:
        "centro"
    }
  );
}


// ============================================================
// CONSTRUIR EL PDF FINAL
// ============================================================

async function construirPdfTuny() {
  if (
    !window.PDFLib
  ) {
    throw new Error(
      "No se cargó la librería para generar el PDF."
    );
  }

  const {
    PDFDocument,
    StandardFonts
  } =
    PDFLib;

  const respuesta =
    await fetch(
      RUTA_PLANTILLA_PDF
    );

  if (
    !respuesta.ok
  ) {
    throw new Error(
      "No se encontró la plantilla PDF. Revisa el nombre del archivo."
    );
  }

  const bytesPlantilla =
    await respuesta
      .arrayBuffer();

  const documento =
    await PDFDocument
      .load(
        bytesPlantilla
      );

  const pagina =
    documento
      .getPages()[0];

  const fuente =
    await documento
      .embedFont(
        StandardFonts
          .Helvetica
      );

  const fuenteNegrita =
    await documento
      .embedFont(
        StandardFonts
          .HelveticaBold
      );

  const datos =
    obtenerDatosGeneralesParaPdf();

  const resumenProductos =
    obtenerResumenProductosPdf();

  // ==========================================================
  // DATOS GENERALES
  // ==========================================================

  dibujarTextoAjustado(
    pagina,
    fuente,
    formatearFechaPdf(),
    {
      x:
        402,

      y:
        684,

      ancho:
        67
    }
  );

  dibujarTextoAjustado(
    pagina,
    fuente,
    datos.tienda,
    {
      x:
        192,

      y:
        663,

      ancho:
        88
    }
  );

  dibujarTextoAjustado(
    pagina,
    fuente,
    datos.region,
    {
      x:
        357,

      y:
        663,

      ancho:
        112
    }
  );
  
  dibujarTextoAjustado(
    pagina,
    fuente,
    datos.supervisor,
    {
      x:
        192,

      y:
        649,

      ancho:
        88,

      tamanoMaximo:
        5.9,

      tamanoMinimo:
        4.2
    }
  );

  dibujarTextoAjustado(
    pagina,
    fuente,
    datos.demo,
    {
      x:
        357,

      y:
        649,

      ancho:
        112,

      tamanoMaximo:
        5.9,

      tamanoMinimo:
        4.2
    }
  );

    dibujarTextoAjustado(
    pagina,
    fuente,
    datos.horario,
    {
      x:
        192,

      y:
        634,

      ancho:
        88,

      tamanoMaximo:
        6.2,

      tamanoMinimo:
        4.5
    }
  );

  // ==========================================================
  // PRODUCTOS VENDIDOS
  // ==========================================================

  const yPrimeraFila =
    591.82;

  const altoFila =
    12.96;

  let totalPiezas =
    0;

  let totalMonto =
    0;

  resumenProductos.forEach(
    (
      item
    ) => {
      const y =
        yPrimeraFila -
        item.fila *
        altoFila;

      totalPiezas +=
        item.piezas;

      totalMonto +=
        item.monto;

      // Precio unitario
      dibujarTextoAlineado(
        pagina,
        fuente,
        formatearMonedaPdf(
          item.precio
        ),
        {
          x:
            190.5,

          y,

          ancho:
            41.5,

          tamano:
            6.3,

          alineacion:
            "derecha"
        }
      );

      // Cantidad de piezas
      dibujarTextoAlineado(
        pagina,
        fuente,
        String(
          item.piezas
        ),
        {
          x:
            234,

          y,

          ancho:
            48,

          tamano:
            6.3,

          alineacion:
            "centro"
        }
      );

      // Monto total del producto
      dibujarTextoAlineado(
        pagina,
        fuente,
        formatearMonedaPdf(
          item.monto
        ),
        {
          x:
            400,

          y,

          ancho:
            70,

          tamano:
            6.3,

          alineacion:
            "derecha"
        }
      );
    }
  );

  // ==========================================================
  // TOTALES DEL DÍA
  // ==========================================================

  cubrirInteriorCelda(
    pagina,
    {
      x:
        234.1,

      y:
        298.9,

      ancho:
        48,

      alto:
        16.5
    }
  );

  cubrirInteriorCelda(
    pagina,
    {
      x:
        400.1,

      y:
        298.9,

      ancho:
        70.8,

      alto:
        16.5
    }
  );

  dibujarTextoAlineado(
    pagina,
    fuenteNegrita,
    String(
      totalPiezas
    ),
    {
      x:
        234,

      y:
        303,

      ancho:
        48,

      tamano:
        7,

      alineacion:
        "centro"
    }
  );

  dibujarTextoAlineado(
    pagina,
    fuenteNegrita,
    formatearMonedaPdf(
      totalMonto
    ),
    {
      x:
        400,

      y:
        303,

      ancho:
        70,

      tamano:
        7,

      alineacion:
        "derecha"
    }
  );

  dibujarTotalCanjes(
    pagina,
    fuenteNegrita
  );

  documento.setTitle(
    "Reporte de venta diario Tuny"
  );

  const bytesFinales =
    await documento
      .save();

  return new Blob(
    [
      bytesFinales
    ],
    {
      type:
        "application/pdf"
    }
  );
}


// ============================================================
// NOMBRE DEL ARCHIVO DESCARGABLE
// ============================================================

function crearNombreArchivoPdf() {
  return (
    "Reporte_Tuny_" +
    obtenerClaveFechaLocal() +
    ".pdf"
  );
}


// ============================================================
// PREPARAR EL ARCHIVO PARA DESCARGAR O COMPARTIR
// ============================================================

function prepararArchivoPdf(
  blob
) {
  if (
    ultimaUrlPdf
  ) {
    URL.revokeObjectURL(
      ultimaUrlPdf
    );
  }

  ultimaUrlPdf =
    URL.createObjectURL(
      blob
    );

  ultimoArchivoPdf =
    new File(
      [
        blob
      ],
      crearNombreArchivoPdf(),
      {
        type:
          "application/pdf"
      }
    );

  const enlaceDescarga =
    document.querySelector(
      "#btn-descargar-pdf"
    );

  enlaceDescarga.href =
    ultimaUrlPdf;

  enlaceDescarga.download =
    crearNombreArchivoPdf();

  document
    .querySelector(
      "#acciones-pdf"
    )
    .classList
    .remove(
      "oculto"
    );
}


// ============================================================
// GENERAR Y ABRIR EL PDF
// ============================================================

async function generarPdfYMostrar() {
  const ventanaPdf =
    window.open(
      "",
      "_blank"
    );

  mostrarMensajePdf(
    "Generando el PDF..."
  );

  try {
    const blob =
      await construirPdfTuny();

    prepararArchivoPdf(
      blob
    );

    if (
      ventanaPdf
    ) {
      ventanaPdf.location.href =
        ultimaUrlPdf;
    }

    mostrarMensajePdf(
      "PDF generado correctamente."
    );

  } catch (
    error
  ) {
    console.error(
      "No fue posible generar el PDF:",
      error
    );

    if (
      ventanaPdf
    ) {
      ventanaPdf.close();
    }

    mostrarMensajePdf(
      error.message ||
      "No fue posible generar el PDF.",
      true
    );
  }
}


// ============================================================
// COMPARTIR PDF DESDE EL CELULAR
// ============================================================

async function compartirUltimoPdf() {
  if (
    !ultimoArchivoPdf
  ) {
    mostrarMensajePdf(
      "Primero genera el PDF.",
      true
    );

    return;
  }

  const datosCompartir = {
    files: [
      ultimoArchivoPdf
    ],

    title:
      "Reporte de venta diario Tuny",

    text:
      "Reporte de venta diario Tuny"
  };

  try {
    if (
      navigator.canShare &&
      navigator.canShare({
        files:
          datosCompartir.files
      })
    ) {
      await navigator.share(
        datosCompartir
      );

      mostrarMensajePdf(
        "PDF listo para compartir."
      );

      return;
    }

    mostrarMensajePdf(
      "Este navegador no permite compartir archivos directamente. Usa Descargar PDF.",
      true
    );

  } catch (
    error
  ) {
    if (
      error.name ===
      "AbortError"
    ) {
      return;
    }

    console.error(
      "No fue posible compartir el PDF:",
      error
    );

    mostrarMensajePdf(
      "No fue posible compartir el PDF. Usa Descargar PDF.",
      true
    );
  }
}


// ============================================================
// MENSAJES DEL GENERADOR
// ============================================================

function mostrarMensajePdf(
  texto,
  esError = false
) {
  const mensaje =
    document.querySelector(
      "#mensaje-pdf"
    );

  if (!mensaje) {
    return;
  }

  mensaje.textContent =
    texto;

  mensaje.classList.toggle(
    "error",
    esError
  );
}