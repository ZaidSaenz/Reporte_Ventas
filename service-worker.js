// ============================================================
// ARCHIVOS DISPONIBLES SIN INTERNET
// ============================================================
//
// Cuando hagamos cambios importantes en la aplicación,
// incrementaremos el número de versión:
//
// v7 -> v8 -> v9
//
// Esto obliga al navegador a descargar los archivos nuevos.
//
// ============================================================

const NOMBRE_CACHE =
  "reporte-ventas-tuny-ancla-v9";

const ARCHIVOS_APP = [
  "./",
  "./index.html",
  "./manifest.json",

  "./css/styles.css",

  "./assets/plantillas/Formulario_reporte_venta_diario_Tuny_estilo_original.pdf",
  "./assets/vendor/pdf-lib.min.js",

  "./js/catalogo.js",
  "./js/almacenamiento.js",
  "./js/reporte.js",
  "./js/whatsapp.js",
  "./js/pdf.js",
  "./js/app.js"
];


// ============================================================
// INSTALAR Y GUARDAR ARCHIVOS
// ============================================================

self.addEventListener(
  "install",
  (evento) => {
    evento.waitUntil(
      caches
        .open(
          NOMBRE_CACHE
        )
        .then(
          (cache) =>
            cache.addAll(
              ARCHIVOS_APP
            )
        )
        .then(
          () =>
            self.skipWaiting()
        )
    );
  }
);


// ============================================================
// ELIMINAR VERSIONES ANTERIORES
// ============================================================

self.addEventListener(
  "activate",
  (evento) => {
    evento.waitUntil(
      caches
        .keys()
        .then(
          (nombres) =>
            Promise.all(
              nombres
                .filter(
                  (nombre) =>
                    nombre !==
                    NOMBRE_CACHE
                )
                .map(
                  (nombre) =>
                    caches.delete(
                      nombre
                    )
                )
            )
        )
        .then(
          () =>
            self.clients.claim()
        )
    );
  }
);


// ============================================================
// USAR COPIA LOCAL CUANDO NO HAYA INTERNET
// ============================================================

self.addEventListener(
  "fetch",
  (evento) => {
    if (
      evento.request.method !==
      "GET"
    ) {
      return;
    }

    evento.respondWith(
      caches
        .match(
          evento.request
        )
        .then(
          (respuestaGuardada) =>
            respuestaGuardada ||
            fetch(
              evento.request
            )
        )
    );
  }
);