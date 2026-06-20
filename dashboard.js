/************************************************************
 * APP SOLICITUD DE MATERIALES - dashboard.js
 * Versión actualizada: datos simulados, sin gráficos
 ************************************************************/

/* =========================
   VARIABLES GLOBALES
========================= */

let usuarioActual = "";
let sectorActual = "";
let idTipoUsuario = 0;

let datos = [];
let materiales = [];
let circuitos = [];
let ingenieros = [];
let cuadrillas = [];

let itemEditando = null;
let estadoAnteriorEditando = null;

/* =========================
   INICIO
========================= */

document.addEventListener("DOMContentLoaded", iniciarApp);

function iniciarApp() {
  cargarSesion();
  cargarDatosPrueba();
  cargarCombos();
  renderizarTabla();
  controlarObservacionesAuditoria();
}

function cargarSesion() {
  usuarioActual = sessionStorage.getItem("usuario") || "ALLAN.ZELAYA";
  sectorActual = sessionStorage.getItem("sector") || "JUTICALPA";
  idTipoUsuario = Number(sessionStorage.getItem("id_tipous") || 1);

  document.getElementById("nombreUsuario").textContent = usuarioActual;
  document.getElementById("nombreSector").textContent = sectorActual;
}

/* =========================
   DATOS SIMULADOS
========================= */

function cargarDatosPrueba() {
  ingenieros = [
    "ALLAN.ZELAYA",
    "OSMAN.LAGOS",
    "LUIS.LOPEZ",
    "NELSON.POSADAS"
  ];

  circuitos = [
    "CAT-L375",
    "CAT-L376",
    "JUT-L379",
    "JUT-L380"
  ];

  cuadrillas = [
    "CUADRILLA 48",
    "CUADRILLA 49",
    "CUADRILLA 50"
  ];

  materiales = [
    { codigo: 130005, descripcion: "POSTE MADERA CLASE 5 30ft", unidad: "UN", categoria: "POSTE", tipo: "MADERA" },
    { codigo: 130006, descripcion: "POSTE MADERA CLASE 5 35ft", unidad: "UN", categoria: "POSTE", tipo: "MADERA" },
    { codigo: 130007, descripcion: "POSTE MADERA CLASE 4 40ft", unidad: "UN", categoria: "POSTE", tipo: "MADERA" },
    { codigo: 130012, descripcion: "POSTE METALICO SECCIONADO 35FT X500LB/F", unidad: "UN", categoria: "POSTE", tipo: "METALICO" },
    { codigo: 130004, descripcion: "POSTE CONCRETO VIB/CFU 30ft - 9m x450kg", unidad: "UN", categoria: "POSTE", tipo: "CONCRETO" },
    { codigo: 130028, descripcion: "POSTE DE FIBRA DE VIDRIO 35 PIES", unidad: "UN", categoria: "POSTE", tipo: "FIBRA" },
    { codigo: 70021, descripcion: "TRANSFORMADOR 15kVa 19.9/34.5kV-120/240V", unidad: "UN", categoria: "TRANSFORMADOR", tipo: "TS NUEVO 34.5KV" },
    { codigo: 70022, descripcion: "TRANSFORMADOR 25kVa19.9/34.5kV-120/240V", unidad: "UN", categoria: "TRANSFORMADOR", tipo: "TS NUEVO 34.5KV" },
    { codigo: 70024, descripcion: "TRANSFORMADOR 50kVa 19.9/34.5kV-120/240V", unidad: "UN", categoria: "TRANSFORMADOR", tipo: "TS NUEVO 34.5KV" },
    { codigo: 99000018, descripcion: "TRAFO URE 25kVA 19,9/34.5kV 120/240V", unidad: "UN", categoria: "TRANSFORMADOR", tipo: "TS URE 34.5KV" }
  ];

  datos = [
    {
      ITEM: "20260618003",
      GESTIONADO_POR: "ALLAN.ZELAYA",
      ESTADO: "CONSUMIDO",
      FECHA_SOLICITUD: "18/06/2026 08:00",
      FECHA_CAMBIO: "2026-06-18",
      REPORTE: "3917965",
      CIRCUITO: "CAT-L375",
      SITIO: "COL. PALMIRA, CATACAMAS",
      CODIGO_SOLICITADO: 130005,
      NOMBRE_SOLICITADO: "POSTE MADERA CLASE 5 30ft",
      CANTIDAD_SOLICITADA: 1,
      MATERIAL_DANADO: "POSTE MADERA CLASE 5 30ft",
      PINTADO_APOYO: "7157711",
      ESTRUCTURA: "B-II-4",
      UTM: "618878 - 1639784",
      OBSERVACIONES: "CAMBIO DE POSTE MADERA 30 FT EN COL. PALMIRA",
      TIPO_EVENTO: "INCIDENCIA",
      EVENTO: "14243",
      SERIE: "",
      REQUISA: "2865",
      CUADRILLA: "CUADRILLA 48",
      AUDITADO: "CON ERRORES",
      OBSERVACIONES_AUDITORIA: "REQUISA, GPS",
      USUARIO: "ALLAN.ZELAYA",
      SECTOR: "JUTICALPA"
    },
    {
      ITEM: "20260618002",
      GESTIONADO_POR: "OSMAN.LAGOS",
      ESTADO: "REQUISADO",
      FECHA_SOLICITUD: "18/06/2026 08:20",
      FECHA_CAMBIO: "2026-06-18",
      REPORTE: "3917998",
      CIRCUITO: "CAT-L376",
      SITIO: "ALDEA EL AGUACATE, CATACAMAS",
      CODIGO_SOLICITADO: 70022,
      NOMBRE_SOLICITADO: "TRANSFORMADOR 25kVa19.9/34.5kV-120/240V",
      CANTIDAD_SOLICITADA: 1,
      MATERIAL_DANADO: "TRANSFORMADOR 25kVa19.9/34.5kV-120/240V",
      PINTADO_APOYO: "7157722",
      ESTRUCTURA: "TS-II",
      UTM: "618000 - 1639000",
      OBSERVACIONES: "CAMBIO DE TRANSFORMADOR POR DAÑO",
      TIPO_EVENTO: "MANTENIMIENTO",
      EVENTO: "14244",
      SERIE: "ABC123",
      REQUISA: "2866",
      CUADRILLA: "CUADRILLA 49",
      AUDITADO: "",
      OBSERVACIONES_AUDITORIA: "",
      USUARIO: "OSMAN.LAGOS",
      SECTOR: "JUTICALPA"
    },
    {
      ITEM: "20260618001",
      GESTIONADO_POR: "ALLAN.ZELAYA",
      ESTADO: "SOLICITADO",
      FECHA_SOLICITUD: "18/06/2026 08:40",
      FECHA_CAMBIO: "2026-06-18",
      REPORTE: "3918005",
      CIRCUITO: "JUT-L379",
      SITIO: "BARRIO EL CENTRO, JUTICALPA",
      CODIGO_SOLICITADO: 130004,
      NOMBRE_SOLICITADO: "POSTE CONCRETO VIB/CFU 30ft - 9m x450kg",
      CANTIDAD_SOLICITADA: 2,
      MATERIAL_DANADO: "POSTE CONCRETO VIB/CFU 30ft - 9m x450kg",
      PINTADO_APOYO: "7157755",
      ESTRUCTURA: "B-II-4",
      UTM: "619000 - 1639500",
      OBSERVACIONES: "CAMBIO DE DOS POSTES DE CONCRETO",
      TIPO_EVENTO: "OPERACIÓN",
      EVENTO: "14245",
      SERIE: "",
      REQUISA: "",
      CUADRILLA: "CUADRILLA 50",
      AUDITADO: "SIN ERRORES",
      OBSERVACIONES_AUDITORIA: "",
      USUARIO: "ALLAN.ZELAYA",
      SECTOR: "JUTICALPA"
    }
  ];
}

/* =========================
   COMBOS
========================= */

function cargarCombos() {
  llenarSelect("filtroCircuito", circuitos, true);
  llenarSelect("filtroGestionado", ingenieros, true);

  llenarSelect("gestionadoPor", ingenieros, false);
  llenarSelect("circuito", circuitos, false);
  llenarSelect("cuadrilla", cuadrillas, false);

  cargarComboMateriales("nombreSolicitado");
  cargarComboMateriales("materialDanado");

  document.getElementById("nombreSolicitado").addEventListener("change", seleccionarMaterialPorNombre);
  document.getElementById("codigoSolicitado").addEventListener("input", seleccionarMaterialPorCodigo);
  document.getElementById("pintadoApoyo").addEventListener("input", buscarUTMSimulado);
  document.getElementById("estado").addEventListener("change", pintarEstadoSelect);
}

function llenarSelect(id, lista, incluirTodos) {
  const select = document.getElementById(id);
  if (!select) return;

  select.innerHTML = "";

  if (incluirTodos) {
    const opt = document.createElement("option");
    opt.value = "ALL";
    opt.textContent = "Todos";
    select.appendChild(opt);
  }

  lista.forEach(valor => {
    const opt = document.createElement("option");
    opt.value = valor;
    opt.textContent = valor;
    select.appendChild(opt);
  });
}

function cargarComboMateriales(id) {
  const select = document.getElementById(id);
  if (!select) return;

  select.innerHTML = `<option value="">Seleccione material...</option>`;

  materiales.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.descripcion;
    opt.textContent = `${m.codigo} - ${m.descripcion}`;
    opt.dataset.codigo = m.codigo;
    opt.dataset.categoria = m.categoria;
    select.appendChild(opt);
  });
}

/* =========================
   FILTROS Y TABLA
========================= */

function obtenerDatosFiltrados() {
  const mostrar = document.getElementById("filtroMostrar").value;
  const item = normalizar(document.getElementById("filtroItem").value);
  const reporte = normalizar(document.getElementById("filtroReporte").value);
  const circuito = document.getElementById("filtroCircuito").value;
  const evento = normalizar(document.getElementById("filtroEvento").value);
  const tipoEvento = document.getElementById("filtroTipoEvento").value;
  const requisa = normalizar(document.getElementById("filtroRequisa").value);
  const estado = document.getElementById("filtroEstado").value;
  const gestionado = document.getElementById("filtroGestionado").value;
  const buscar = normalizar(document.getElementById("filtroBuscar").value);
  const fechaCambio = document.getElementById("filtroFechaCambio")
    ? document.getElementById("filtroFechaCambio").value
    : "";

  let lista = datos.filter(r => {
    const cumpleItem = !item || normalizar(r.ITEM) === item;
    const cumpleReporte = !reporte || normalizar(r.REPORTE) === reporte;
    const cumpleCircuito = circuito === "ALL" || r.CIRCUITO === circuito;
    const cumpleEvento = !evento || normalizar(r.EVENTO) === evento;
    const cumpleTipoEvento = tipoEvento === "ALL" || r.TIPO_EVENTO === tipoEvento;
    const cumpleRequisa = !requisa || normalizar(r.REQUISA) === requisa;
    const cumpleEstado = estado === "ALL" || r.ESTADO === estado;
    const cumpleGestionado = gestionado === "ALL" || r.GESTIONADO_POR === gestionado;
    const cumpleFechaCambio = !fechaCambio || r.FECHA_CAMBIO === fechaCambio;

    const textoBuscar = `${r.SITIO || ""} ${r.OBSERVACIONES || ""}`;
    const cumpleBuscar = !buscar || normalizar(textoBuscar).includes(buscar);

    return (
      cumpleItem &&
      cumpleReporte &&
      cumpleCircuito &&
      cumpleEvento &&
      cumpleTipoEvento &&
      cumpleRequisa &&
      cumpleEstado &&
      cumpleGestionado &&
      cumpleFechaCambio &&
      cumpleBuscar
    );
  });

  lista.sort((a, b) => Number(b.ITEM) - Number(a.ITEM));

  actualizarContadores(lista);

  if (mostrar !== "ALL") {
    lista = lista.slice(0, Number(mostrar));
  }

  return lista;
}

function renderizarTabla() {
  const tbody = document.getElementById("tablaBody");
  const lista = obtenerDatosFiltrados();

  tbody.innerHTML = "";

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">No hay registros para mostrar.</td></tr>`;
    return;
  }

  lista.forEach(r => {
    const consumido = r.ESTADO === "CONSUMIDO";
    const puedeAuditar = idTipoUsuario === 1;

    const tr = document.createElement("tr");

    const advertencia = r.AUDITADO === "CON ERRORES"
      ? `<i class="fas fa-triangle-exclamation audit-warning" title="${r.OBSERVACIONES_AUDITORIA}"></i>`
      : "";

    tr.innerHTML = `
      <td><strong>${r.ITEM}</strong>${advertencia}</td>
      <td>${badgeEstado(r.ESTADO)}</td>
      <td>${formatearFecha(r.FECHA_CAMBIO)}</td>
      <td>${r.CIRCUITO || "-"}</td>
      <td>${r.PINTADO_APOYO || "-"}</td>
      <td>${r.SITIO || "-"}</td>
      <td>
        <div class="acciones-td">
          <button class="btn-accion btn-editar ${consumido ? "btn-disabled" : ""}"
            onclick="editarSolicitud('${r.ITEM}')"
            title="Editar">
            <i class="fas fa-pen"></i> Editar
          </button>

          ${puedeAuditar ? `
          <button class="btn-accion btn-auditar"
            onclick="abrirModalAuditoria('${r.ITEM}')"
            title="Auditar">
            <i class="fas fa-magnifying-glass"></i> Auditar
          </button>` : ""}

          <button class="btn-accion btn-eliminar ${consumido ? "btn-disabled" : ""}"
            onclick="eliminarSolicitud('${r.ITEM}')"
            title="Eliminar">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function actualizarContadores(lista) {
  document.getElementById("countSolicitado").textContent =
    lista.filter(r => r.ESTADO === "SOLICITADO").length;

  document.getElementById("countRequisado").textContent =
    lista.filter(r => r.ESTADO === "REQUISADO").length;

  document.getElementById("countConsumido").textContent =
    lista.filter(r => r.ESTADO === "CONSUMIDO").length;
}

function limpiarFiltros() {
  document.getElementById("filtroMostrar").value = "10";
  document.getElementById("filtroItem").value = "";
  document.getElementById("filtroReporte").value = "";
  document.getElementById("filtroCircuito").value = "ALL";
  document.getElementById("filtroEvento").value = "";
  document.getElementById("filtroTipoEvento").value = "ALL";
  document.getElementById("filtroRequisa").value = "";
  document.getElementById("filtroEstado").value = "ALL";
  document.getElementById("filtroGestionado").value = "ALL";
  document.getElementById("filtroBuscar").value = "";

  if (document.getElementById("filtroFechaCambio")) {
    document.getElementById("filtroFechaCambio").value = "";
  }

  renderizarTabla();
}

/* =========================
   MODAL SOLICITUD
========================= */

function abrirModalSolicitud() {
  itemEditando = null;
  estadoAnteriorEditando = null;

  limpiarModalSolicitud();

  document.getElementById("modoSolicitud").value = "NUEVO";
  document.getElementById("item").value = generarNuevoItem();
  document.getElementById("estado").value = "SOLICITADO";
  document.getElementById("fechaSolicitud").value = obtenerFechaHoraActual();
  document.getElementById("fechaCambio").value = obtenerFechaActual();
  document.getElementById("gestionadoPor").value = usuarioActual;
  document.getElementById("cantidadSolicitada").value = 1;

  pintarEstadoSelect();

  document.getElementById("modalSolicitud").classList.add("abierto");
}

function cerrarModalSolicitud() {
  document.getElementById("modalSolicitud").classList.remove("abierto");
}

function limpiarModalSolicitud() {
  const ids = [
    "item", "fechaSolicitud", "fechaCambio", "reporte", "sitio",
    "codigoSolicitado", "cantidadSolicitada", "pintadoApoyo",
    "estructura", "utm", "observaciones", "evento", "serie", "requisa"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.getElementById("estado").value = "SOLICITADO";
  document.getElementById("tipoEvento").value = "INCIDENCIA";

  if (document.getElementById("nombreSolicitado")) document.getElementById("nombreSolicitado").value = "";
  if (document.getElementById("materialDanado")) document.getElementById("materialDanado").value = "";

  pintarEstadoSelect();
}

function editarSolicitud(item) {
  const r = datos.find(x => x.ITEM === item);
  if (!r) return;

  if (r.ESTADO === "CONSUMIDO") {
    alert("Esta solicitud está en estado CONSUMIDO. Solo se permite visualización.");
    abrirSolicitudSoloLectura(r);
    return;
  }

  itemEditando = item;
  estadoAnteriorEditando = r.ESTADO;

  cargarRegistroEnModal(r, false);

  document.getElementById("modalSolicitud").classList.add("abierto");
}

function abrirSolicitudSoloLectura(r) {
  itemEditando = r.ITEM;
  estadoAnteriorEditando = r.ESTADO;

  cargarRegistroEnModal(r, true);

  document.getElementById("modalSolicitud").classList.add("abierto");
}

function cargarRegistroEnModal(r, soloLectura) {
  document.getElementById("modoSolicitud").value = soloLectura ? "VER" : "EDITAR";

  document.getElementById("item").value = r.ITEM;
  document.getElementById("gestionadoPor").value = r.GESTIONADO_POR;
  document.getElementById("estado").value = r.ESTADO;
  document.getElementById("fechaSolicitud").value = r.FECHA_SOLICITUD || "";
  document.getElementById("fechaCambio").value = r.FECHA_CAMBIO || "";
  document.getElementById("reporte").value = r.REPORTE || "";
  document.getElementById("circuito").value = r.CIRCUITO || "";
  document.getElementById("sitio").value = r.SITIO || "";
  document.getElementById("codigoSolicitado").value = r.CODIGO_SOLICITADO || "";
  document.getElementById("nombreSolicitado").value = r.NOMBRE_SOLICITADO || "";
  document.getElementById("cantidadSolicitada").value = r.CANTIDAD_SOLICITADA || 1;
  document.getElementById("materialDanado").value = r.MATERIAL_DANADO || "";
  document.getElementById("pintadoApoyo").value = r.PINTADO_APOYO || "";
  document.getElementById("estructura").value = r.ESTRUCTURA || "";
  document.getElementById("utm").value = r.UTM || "";
  document.getElementById("observaciones").value = r.OBSERVACIONES || "";
  document.getElementById("tipoEvento").value = r.TIPO_EVENTO || "INCIDENCIA";
  document.getElementById("evento").value = r.EVENTO || "";
  document.getElementById("serie").value = r.SERIE || "";
  document.getElementById("requisa").value = r.REQUISA || "";
  document.getElementById("cuadrilla").value = r.CUADRILLA || "";

  pintarEstadoSelect();
  bloquearModalSolicitud(soloLectura);
}

function bloquearModalSolicitud(bloquear) {
  const campos = [
    "gestionadoPor", "estado", "fechaCambio", "reporte", "circuito", "sitio",
    "codigoSolicitado", "nombreSolicitado", "cantidadSolicitada", "materialDanado",
    "pintadoApoyo", "estructura", "utm", "observaciones", "tipoEvento",
    "evento", "serie", "requisa", "cuadrilla"
  ];

  campos.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = bloquear;
  });

  const btnGuardar = document.querySelector("#modalSolicitud .btn-guardar");
  if (btnGuardar) {
    btnGuardar.style.display = bloquear ? "none" : "inline-flex";
  }
}

function guardarSolicitud() {
  const btnGuardar = document.querySelector("#modalSolicitud .btn-guardar");
  const modo = document.getElementById("modoSolicitud").value;

  if (modo === "VER") {
    cerrarModalSolicitud();
    return;
  }

  const item = document.getElementById("item").value;
  const nuevoEstado = document.getElementById("estado").value;

  if (modo === "EDITAR" && estadoAnteriorEditando && nuevoEstado !== estadoAnteriorEditando) {
    if (nuevoEstado === "CONSUMIDO") {
      const ok = confirm(
        "¿Desea cambiar esta solicitud a CONSUMIDO?\n\nDespués de guardar como CONSUMIDO ya no podrá editarse ni eliminarse, solo visualizarse."
      );

      if (!ok) {
        document.getElementById("estado").value = estadoAnteriorEditando;
        pintarEstadoSelect();
        return;
      }
    } else {
      if (!confirm(`¿Desea cambiar el estado a ${nuevoEstado}?`)) {
        document.getElementById("estado").value = estadoAnteriorEditando;
        pintarEstadoSelect();
        return;
      }
    }
  }

  const registro = {
    ITEM: item,
    GESTIONADO_POR: document.getElementById("gestionadoPor").value,
    ESTADO: nuevoEstado,
    FECHA_SOLICITUD: document.getElementById("fechaSolicitud").value,
    FECHA_CAMBIO: document.getElementById("fechaCambio").value,
    REPORTE: document.getElementById("reporte").value,
    CIRCUITO: document.getElementById("circuito").value,
    SITIO: mayus(document.getElementById("sitio").value),
    CODIGO_SOLICITADO: Number(document.getElementById("codigoSolicitado").value || 0),
    NOMBRE_SOLICITADO: document.getElementById("nombreSolicitado").value,
    CANTIDAD_SOLICITADA: Number(document.getElementById("cantidadSolicitada").value || 1),
    MATERIAL_DANADO: document.getElementById("materialDanado").value,
    PINTADO_APOYO: document.getElementById("pintadoApoyo").value,
    ESTRUCTURA: mayus(document.getElementById("estructura").value),
    UTM: document.getElementById("utm").value,
    OBSERVACIONES: mayus(document.getElementById("observaciones").value),
    TIPO_EVENTO: document.getElementById("tipoEvento").value,
    EVENTO: document.getElementById("evento").value,
    SERIE: mayus(document.getElementById("serie").value),
    REQUISA: document.getElementById("requisa").value,
    CUADRILLA: document.getElementById("cuadrilla").value,
    AUDITADO: "",
    OBSERVACIONES_AUDITORIA: "",
    USUARIO: usuarioActual,
    SECTOR: sectorActual
  };

  const error = validarSolicitud(registro);
  if (error) {
    alert(error);
    return;
  }

  const mat = obtenerMaterialPorCodigo(registro.CODIGO_SOLICITADO);
  if (!mat || mat.descripcion !== registro.NOMBRE_SOLICITADO) {
    alert("El Código SAP y el Material Solicitado no coinciden con la hoja materiales.");
    return;
  }

  if (btnGuardar) {
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Guardando...`;
  }

  try {
    if (modo === "NUEVO") {
      datos.push(registro);
    } else {
      const idx = datos.findIndex(x => x.ITEM === itemEditando);
      if (idx >= 0) {
        registro.AUDITADO = datos[idx].AUDITADO || "";
        registro.OBSERVACIONES_AUDITORIA = datos[idx].OBSERVACIONES_AUDITORIA || "";
        datos[idx] = registro;
      }
    }

    cerrarModalSolicitud();
    renderizarTabla();

  } finally {
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = `<i class="fas fa-save"></i> Guardar`;
    }
  }
}

function validarSolicitud(r) {
  if (!r.GESTIONADO_POR) return "Seleccione Gestionado por.";
  if (!r.FECHA_CAMBIO) return "Seleccione Fecha Cambio.";
  if (!r.REPORTE || String(r.REPORTE).length !== 7) return "El reporte debe tener 7 dígitos.";
  if (!r.CIRCUITO) return "Seleccione Circuito.";
  if (!r.SITIO) return "Ingrese Dirección / Sitio.";
  if (!r.CODIGO_SOLICITADO) return "Ingrese Código SAP.";
  if (!r.NOMBRE_SOLICITADO) return "Seleccione Material Solicitado.";
  if (!r.CANTIDAD_SOLICITADA || r.CANTIDAD_SOLICITADA < 1 || r.CANTIDAD_SOLICITADA > 999) {
    return "Cantidad solicitada debe ser entre 1 y 999.";
  }
  if (!r.PINTADO_APOYO) return "Ingrese Pintado Apoyo.";
  if (!r.TIPO_EVENTO) return "Seleccione Tipo de Evento.";
  return "";
}

function eliminarSolicitud(item) {
  const r = datos.find(x => x.ITEM === item);
  if (!r) return;

  if (r.ESTADO === "CONSUMIDO") {
    alert("No se puede eliminar una solicitud en estado CONSUMIDO.");
    return;
  }

  if (!confirm("¿Desea eliminar esta solicitud?")) return;

  const confirmacion = prompt("Para eliminar escriba ELIMINAR");
  if (!confirmacion || confirmacion.toUpperCase().trim() !== "ELIMINAR") {
    alert("Eliminación cancelada.");
    return;
  }

  datos = datos.filter(x => x.ITEM !== item);
  renderizarTabla();
}

/* =========================
   AUDITORIA
========================= */

function abrirModalAuditoria(item) {
  if (idTipoUsuario !== 1) {
    alert("No tiene permiso para auditar.");
    return;
  }

  const r = datos.find(x => x.ITEM === item);
  if (!r) return;

  document.getElementById("auditoriaItem").value = item;
  document.getElementById("auditado").value = r.AUDITADO || "SIN ERRORES";

  document.querySelectorAll(".obs-auditoria").forEach(chk => {
    chk.checked = false;
  });

  const obs = (r.OBSERVACIONES_AUDITORIA || "").split(",").map(x => x.trim());

  document.querySelectorAll(".obs-auditoria").forEach(chk => {
    chk.checked = obs.includes(chk.value);
  });

  controlarObservacionesAuditoria();

  document.getElementById("modalAuditoria").classList.add("abierto");
}

function cerrarModalAuditoria() {
  document.getElementById("modalAuditoria").classList.remove("abierto");
}

function controlarObservacionesAuditoria() {
  const resultado = document.getElementById("auditado").value;
  const box = document.getElementById("boxObservacionesAuditoria");

  if (resultado === "CON ERRORES") {
    box.classList.remove("disabled");
  } else {
    box.classList.add("disabled");
    document.querySelectorAll(".obs-auditoria").forEach(chk => chk.checked = false);
  }
}

function guardarAuditoria() {
  const item = document.getElementById("auditoriaItem").value;
  const resultado = document.getElementById("auditado").value;

  const seleccionadas = [...document.querySelectorAll(".obs-auditoria:checked")]
    .map(x => x.value);

  if (resultado === "CON ERRORES" && seleccionadas.length === 0) {
    alert("Debe seleccionar al menos una observación de auditoría.");
    return;
  }

  const r = datos.find(x => x.ITEM === item);
  if (!r) return;

  r.AUDITADO = resultado;
  r.OBSERVACIONES_AUDITORIA = resultado === "CON ERRORES"
    ? seleccionadas.join(", ")
    : "";

  cerrarModalAuditoria();
  renderizarTabla();
}

/* =========================
   DASHBOARDS TABULARES
========================= */

function abrirModalDashboard() {
  document.getElementById("modalDashboard").classList.add("abierto");
  mostrarDashboard("postes");
}

function cerrarModalDashboard() {
  document.getElementById("modalDashboard").classList.remove("abierto");
}

function mostrarDashboard(tipo) {
  document.querySelectorAll(".dash-tab").forEach(btn => btn.classList.remove("active"));

  const tabs = {
    postes: 0,
    transformadores: 1,
    postesCircuito: 2,
    transformadoresCircuito: 3,
    gestionado: 4
  };

  const index = tabs[tipo] || 0;
  document.querySelectorAll(".dash-tab")[index].classList.add("active");

  let titulo = "";
  let resumen = [];

  if (tipo === "postes") {
    titulo = "Postes consumidos por material";
    resumen = agruparPorMaterial("POSTE");
  }

  if (tipo === "transformadores") {
    titulo = "Transformadores consumidos por material";
    resumen = agruparPorMaterial("TRANSFORMADOR");
  }

  if (tipo === "postesCircuito") {
    titulo = "Postes consumidos por circuito";
    resumen = agruparPorCircuito("POSTE");
  }

  if (tipo === "transformadoresCircuito") {
    titulo = "Transformadores consumidos por circuito";
    resumen = agruparPorCircuito("TRANSFORMADOR");
  }

  if (tipo === "gestionado") {
    titulo = "Conteo de solicitudes por gestionado por";
    resumen = agruparPorCampo(datos, "GESTIONADO_POR");
  }

  document.getElementById("dashboardTitulo").textContent = titulo;

  if (document.getElementById("dashboardTotal")) {
    document.getElementById("dashboardTotal").textContent =
      resumen.reduce((a, b) => a + b.cantidad, 0);
  }

  renderizarTablaDashboard(resumen);
}

function agruparPorMaterial(categoria) {
  const lista = datos.filter(r => {
    const mat = obtenerMaterialPorCodigo(r.CODIGO_SOLICITADO);
    return r.ESTADO === "CONSUMIDO" && mat && mat.categoria === categoria;
  });

  return agruparPorCampo(lista, "NOMBRE_SOLICITADO");
}

function agruparPorCircuito(categoria) {
  const lista = datos.filter(r => {
    const mat = obtenerMaterialPorCodigo(r.CODIGO_SOLICITADO);
    return r.ESTADO === "CONSUMIDO" && mat && mat.categoria === categoria;
  });

  return agruparPorCampo(lista, "CIRCUITO");
}

function agruparPorCampo(lista, campo) {
  const mapa = {};

  lista.forEach(r => {
    const key = r[campo] || "SIN DATO";
    mapa[key] = (mapa[key] || 0) + 1;
  });

  return Object.keys(mapa)
    .map(k => ({ descripcion: k, cantidad: mapa[k] }))
    .sort((a, b) => b.cantidad - a.cantidad || a.descripcion.localeCompare(b.descripcion));
}

function renderizarTablaDashboard(resumen) {
  const tbody = document.getElementById("dashboardContenido");

  if (!resumen.length) {
    tbody.innerHTML = `<tr><td colspan="2" class="text-center">Sin datos para mostrar.</td></tr>`;
    return;
  }

  tbody.innerHTML = resumen.map(r => `
    <tr>
      <td><strong>${r.descripcion}</strong></td>
      <td class="num">${r.cantidad}</td>
    </tr>
  `).join("");
}

/* =========================
   MATERIAL / UTM
========================= */

function seleccionarMaterialPorNombre() {
  const nombre = document.getElementById("nombreSolicitado").value;
  const mat = materiales.find(m => m.descripcion === nombre);

  if (!mat) return;

  document.getElementById("codigoSolicitado").value = mat.codigo;
}

function seleccionarMaterialPorCodigo() {
  const codigo = Number(document.getElementById("codigoSolicitado").value);
  const mat = materiales.find(m => Number(m.codigo) === codigo);

  if (!mat) return;

  document.getElementById("nombreSolicitado").value = mat.descripcion;
}

function obtenerMaterialPorCodigo(codigo) {
  return materiales.find(m => Number(m.codigo) === Number(codigo));
}

function buscarUTMSimulado() {
  const apoyo = document.getElementById("pintadoApoyo").value;

  if (!apoyo) {
    document.getElementById("utm").value = "";
    return;
  }

  const ultimos = String(apoyo).slice(-3);
  document.getElementById("utm").value = `618${ultimos} - 1639${ultimos}`;
}

/* =========================
   UTILIDADES
========================= */

function generarNuevoItem() {
  const hoy = new Date();

  const fecha =
    hoy.getFullYear().toString() +
    String(hoy.getMonth() + 1).padStart(2, "0") +
    String(hoy.getDate()).padStart(2, "0");

  const itemsHoy = datos
    .filter(x => String(x.ITEM).startsWith(fecha))
    .map(x => Number(String(x.ITEM).slice(-3)));

  const consecutivo = itemsHoy.length === 0
    ? 1
    : Math.max(...itemsHoy) + 1;

  return fecha + String(consecutivo).padStart(3, "0");
}

function obtenerFechaActual() {
  return new Date().toISOString().split("T")[0];
}

function obtenerFechaHoraActual() {
  const f = new Date();
  return f.toLocaleString("es-HN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatearFecha(fecha) {
  if (!fecha) return "-";

  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function badgeEstado(estado) {
  const e = estado || "SOLICITADO";

  if (e === "SOLICITADO") {
    return `<span class="badge badge-solicitado">SOLICITADO</span>`;
  }

  if (e === "REQUISADO") {
    return `<span class="badge badge-requisado">REQUISADO</span>`;
  }

  if (e === "CONSUMIDO") {
    return `<span class="badge badge-consumido">CONSUMIDO</span>`;
  }

  return `<span class="badge">${e}</span>`;
}

function pintarEstadoSelect() {
  const estado = document.getElementById("estado");
  if (!estado) return;

  estado.classList.remove("estado-solicitado", "estado-requisado", "estado-consumido");

  if (estado.value === "SOLICITADO") estado.classList.add("estado-solicitado");
  if (estado.value === "REQUISADO") estado.classList.add("estado-requisado");
  if (estado.value === "CONSUMIDO") estado.classList.add("estado-consumido");
}

function normalizar(valor) {
  return (valor || "").toString().trim().toUpperCase();
}

function mayus(valor) {
  return (valor || "").toString().trim().toUpperCase();
}

function sincronizarDatos() {
  alert("Modo prueba: datos sincronizados localmente.");
  renderizarTabla();
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = "index.html";
}
