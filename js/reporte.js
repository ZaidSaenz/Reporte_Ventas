// ============================================================
// FORMATO DE PRECIOS Y HORARIOS
// ============================================================

function formatearMoneda(valor) {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN"
    }
  ).format(valor);
}


function formatearHora(fechaISO) {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(
    new Date(fechaISO)
  );
}


// ============================================================
// RESUMEN DEL DÍA
// ============================================================

function calcularResumenDia(ventas) {
  return ventas.reduce(
    (resumen, venta) => {
      resumen.ventas += 1;

      resumen.piezas +=
        venta.productos.reduce(
          (total, item) =>
            total + item.cantidad,
          0
        );

      resumen.total += venta.total;

      return resumen;
    },
    {
      ventas: 0,
      piezas: 0,
      total: 0
    }
  );
}


function crearResumenItem(valor, etiqueta) {
  const contenedor =
    document.createElement("div");

  const textoValor =
    document.createElement("strong");

  const textoEtiqueta =
    document.createElement("span");

  contenedor.className =
    "resumen-item";

  textoValor.textContent =
    valor;

  textoEtiqueta.textContent =
    etiqueta;

  contenedor.append(
    textoValor,
    textoEtiqueta
  );

  return contenedor;
}


function renderizarResumenDia(ventas) {
  const contenedor =
    document.querySelector("#resumen-dia");

  const resumen =
    calcularResumenDia(ventas);

  contenedor.replaceChildren(
    crearResumenItem(
      resumen.ventas,
      "Ventas"
    ),

    crearResumenItem(
      resumen.piezas,
      "Piezas"
    ),

    crearResumenItem(
      formatearMoneda(resumen.total),
      "Total"
    )
  );
}


// ============================================================
// HISTORIAL DEL DÍA
// ============================================================

function renderizarHistorialDia(
  ventas,
  alBorrarVenta
) {
  const contenedor =
    document.querySelector("#historial-dia");

  contenedor.replaceChildren();

  if (ventas.length === 0) {
    const mensaje =
      document.createElement("p");

    mensaje.className =
      "sin-registros";

    mensaje.textContent =
      "Todavía no hay ventas guardadas hoy.";

    contenedor.append(mensaje);

    return;
  }

  ventas.forEach((venta) => {
    const tarjeta =
      document.createElement("article");

    const encabezado =
      document.createElement("div");

    const hora =
      document.createElement("span");

    const total =
      document.createElement("strong");

    const lista =
      document.createElement("ul");

    const botonBorrar =
      document.createElement("button");

    tarjeta.className =
      "venta-historial";

    encabezado.className =
      "venta-historial-encabezado";

    hora.className =
      "venta-historial-hora";

    total.className =
      "venta-historial-total";

    lista.className =
      "venta-productos";

    botonBorrar.className =
      "btn-borrar-venta";

    botonBorrar.type =
      "button";

    hora.textContent =
      formatearHora(venta.fechaISO);

    total.textContent =
      formatearMoneda(venta.total);

    botonBorrar.textContent =
      "Borrar venta";

    venta.productos.forEach((item) => {
      const elemento =
        document.createElement("li");

      const piezas =
        item.cantidad === 1
          ? "pieza"
          : "piezas";

      elemento.textContent =
        `${item.producto} · ` +
        `${item.cantidad} ${piezas} · ` +
        `${formatearMoneda(item.precio)} c/u`;

      lista.append(elemento);
    });

    botonBorrar.addEventListener(
      "click",
      () => alBorrarVenta(venta.id)
    );

    encabezado.append(
      hora,
      total
    );

    tarjeta.append(
      encabezado,
      lista,
      botonBorrar
    );

    contenedor.append(tarjeta);
  });
}