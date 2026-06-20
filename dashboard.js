/************************************************************
 * APP SOLICITUD DE MATERIALES - dashboard.js
 * Versión compacta: panel + modal industrial, datos simulados
 ************************************************************/

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

  setText("nombreUsuario", usuarioActual);
  setText("nombreSector", sectorActual);
}

function cargarDatosPrueba() {
  ingenieros = ["ALLAN.ZELAYA", "OSMAN.LAGOS", "LUIS.LOPEZ", "NELSON.POSADAS"];
  circuitos = ["CAT-L375", "CAT-L376", "JUT-L379", "JUT-L380"];
  cuadrillas = ["CUADRILLA 48", "CUADRILLA 49", "CUADRILLA 50"];

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
      ITEM: "20260618003", GESTIONADO_POR: "ALLAN.ZELAYA", ESTADO: "CONSUMIDO",
      FECHA_SOLICITUD: "18/06/2026 08:00", FECHA_CAMBIO: "2026-06-18", REPORTE: "3917965",
      CIRCUITO: "CAT-L375", SITIO: "COL. PALMIRA, CATACAMAS", CODIGO_SOLICITADO: 130005,
      NOMBRE_SOLICITADO: "POSTE MADERA CLASE 5 30ft", CANTIDAD_SOLICITADA: 1,
      PINTADO_APOYO: "7157711", UTM: "618878 - 1639784", OBSERVACIONES: "CAMBIO DE POSTE MADERA 30 FT EN COL. PALMIRA",
      TIPO_EVENTO: "INCIDENCIA", EVENTO: "14243", SERIE: "", REQUISA: "2865", CUADRILLA: "CUADRILLA 48",
      AUDITADO: "CON ERRORES", OBSERVACIONES_AUDITORIA: "REQUISA, GPS", USUARIO: "ALLAN.ZELAYA", SECTOR: "JUTICALPA"
    },
    {
      ITEM: "20260618002", GESTIONADO_POR: "OSMAN.LAGOS", ESTADO: "REQUISADO",
      FECHA_SOLICITUD: "18/06/2026 08:20", FECHA_CAMBIO: "2026-06-18", REPORTE: "3917998",
      CIRCUITO: "CAT-L376", SITIO: "ALDEA EL AGUACATE, CATACAMAS", CODIGO_SOLICITADO: 70022,
      NOMBRE_SOLICITADO: "TRANSFORMADOR 25kVa19.9/34.5kV-120/240V", CANTIDAD_SOLICITADA: 1,
      PINTADO_APOYO: "7157722", UTM: "618000 - 1639000", OBSERVACIONES: "CAMBIO DE TRANSFORMADOR POR DAÑO",
      TIPO_EVENTO: "MANTENIMIENTO", EVENTO: "14244", SERIE: "ABC123", REQUISA: "2866", CUADRILLA: "CUADRILLA 49",
      AUDITADO: "", OBSERVACIONES_AUDITORIA: "", USUARIO: "OSMAN.LAGOS", SECTOR: "JUTICALPA"
    },
    {
      ITEM: "20260618001", GESTIONADO_POR: "ALLAN.ZELAYA", ESTADO: "SOLICITADO",
      FECHA_SOLICITUD: "18/06/2026 08:40", FECHA_CAMBIO: "2026-06-18", REPORTE: "3918005",
      CIRCUITO: "JUT-L379", SITIO: "BARRIO EL CENTRO, JUTICALPA", CODIGO_SOLICITADO: 130004,
      NOMBRE_SOLICITADO: "POSTE CONCRETO VIB/CFU 30ft - 9m x450kg", CANTIDAD_SOLICITADA: 2,
      PINTADO_APOYO: "7157755", UTM: "619000 - 1639500", OBSERVACIONES: "CAMBIO DE DOS POSTES DE CONCRETO",
      TIPO_EVENTO: "OPERACIÓN", EVENTO: "14245", SERIE: "", REQUISA: "", CUADRILLA: "CUADRILLA 50",
      AUDITADO: "SIN ERRORES", OBSERVACIONES_AUDITORIA: "", USUARIO: "ALLAN.ZELAYA", SECTOR: "JUTICALPA"
    }
  ];
}

function cargarCombos() {
  llenarSelect("filtroCircuito", circuitos, true);
  llenarSelect("filtroGestionado", ingenieros, true);

  llenarSelect("gestionadoPor", ingenieros, false);
  llenarSelect("circuito", circuitos, false);
  llenarSelect("cuadrilla", cuadrillas, false);

  cargarComboMateriales("nombreSolicitado");

  addListener("nombreSolicitado", "change", seleccionarMaterialPorNombre);
  addListener("nombreSolicitado", "change", mostrarSerieSegunMaterial);
  addListener("codigoSolicitado", "input", seleccionarMaterialPorCodigo);
  addListener("pintadoApoyo", "input", buscarUTMSimulado);
  addListener("estado", "change", pintarEstadoSelect);
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

function obtenerDatosFiltrados() {
  const mostrar = getValue("filtroMostrar", "10");
  const item = normalizar(getValue("filtroItem"));
  const reporte = normalizar(getValue("filtroReporte"));
  const circuito = getValue("filtroCircuito", "ALL");
  const evento = normalizar(getValue("filtroEvento"));
  const tipoEvento = getValue("filtroTipoEvento", "ALL");
  const requisa = normalizar(getValue("filtroRequisa"));
  const estado = getValue("filtroEstado", "ALL");
  const gestionado = getValue("filtroGestionado", "ALL");
  const direccion = normalizar(getValue("filtroDireccion"));
  const fechaDesde = getValue("filtroFechaDesde");
  const fechaHasta = getValue("filtroFechaHasta");

  let lista = datos.filter(r => {
    const cumpleItem = !item || normalizar(r.ITEM) === item;
    const cumpleReporte = !reporte || normalizar(r.REPORTE) === reporte;
    const cumpleCircuito = circuito === "ALL" || r.CIRCUITO === circuito;
    const cumpleEvento = !evento || normalizar(r.EVENTO) === evento;
    const cumpleTipoEvento = tipoEvento === "ALL" || r.TIPO_EVENTO === tipoEvento;
    const cumpleRequisa = !requisa || normalizar(r.REQUISA) === requisa;
    const cumpleEstado = estado === "ALL" || r.ESTADO === estado;
    const cumpleGestionado = gestionado === "ALL" || r.GESTIONADO_POR === gestionado;
    const cumpleDireccion = !direccion || normalizar(r.SITIO).includes(direccion);
    const cumpleFechaDesde = !fechaDesde || (r.FECHA_CAMBIO || "") >= fechaDesde;
    const cumpleFechaHasta = !fechaHasta || (r.FECHA_CAMBIO || "") <= fechaHasta;

    return cumpleItem && cumpleReporte && cumpleCircuito && cumpleEvento && cumpleTipoEvento &&
      cumpleRequisa && cumpleEstado && cumpleGestionado && cumpleDireccion && cumpleFechaDesde && cumpleFechaHasta;
  });

  lista.sort((a, b) => Number(b.ITEM) - Number(a.ITEM));
  actualizarContadores(lista);

  if (mostrar !== "ALL") lista = lista.slice(0, Number(mostrar));
  return lista;
}

function renderizarTabla() {
  const tbody = document.getElementById("tablaBody");
  const lista = obtenerDatosFiltrados();
  tbody.innerHTML = "";

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">No hay registros para mostrar.</td></tr>`;
    return;
  }

  lista.forEach(r => {
    const consumido = r.ESTADO === "CONSUMIDO";
    const puedeAuditar = idTipoUsuario === 1;
    const tr = document.createElement("tr");

    const advertencia = r.AUDITADO === "CON ERRORES"
      ? `<i class="fas fa-triangle-exclamation audit-warning" title="${escaparAtributo(r.OBSERVACIONES_AUDITORIA)}"></i>`
      : "";

    tr.innerHTML = `
      <td class="col-item"><strong>${r.ITEM}</strong>${advertencia}</td>
      <td class="col-estado">${selectEstadoPanel(r)}</td>
      <td class="col-requisa"><strong>${r.REQUISA || "-"}</strong></td>
      <td class="col-fecha">${formatearFecha(r.FECHA_CAMBIO)}</td>
      <td class="col-circuito"><strong>${r.CIRCUITO || "-"}</strong></td>
      <td class="col-material">${r.NOMBRE_SOLICITADO || "-"}</td>
      <td class="col-direccion">${r.SITIO || "-"}</td>
      <td class="col-acciones">
        <div class="acciones-td">
          <button class="btn-accion btn-editar ${consumido ? "btn-disabled" : ""}"
            onclick="editarSolicitud('${r.ITEM}')" title="Editar">
            <i class="fas fa-pen"></i> Editar
          </button>
          ${puedeAuditar ? `
          <button class="btn-accion btn-auditar" onclick="abrirModalAuditoria('${r.ITEM}')" title="Auditar">
            <i class="fas fa-magnifying-glass"></i> Auditar
          </button>` : ""}
          <button class="btn-accion btn-eliminar ${consumido ? "btn-disabled" : ""}"
            onclick="eliminarSolicitud('${r.ITEM}')" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

function selectEstadoPanel(r) {
  const cls = claseEstadoPanel(r.ESTADO);
  const disabled = r.ESTADO === "CONSUMIDO" ? "disabled" : "";
  return `
    <select class="estado-panel-select ${cls}" ${disabled} onchange="cambiarEstadoPanel('${r.ITEM}', this.value)">
      <option value="SOLICITADO" ${r.ESTADO === "SOLICITADO" ? "selected" : ""}>SOLICITADO</option>
      <option value="REQUISADO" ${r.ESTADO === "REQUISADO" ? "selected" : ""}>REQUISADO</option>
      <option value="CONSUMIDO" ${r.ESTADO === "CONSUMIDO" ? "selected" : ""}>CONSUMIDO</option>
    </select>`;
}

function cambiarEstadoPanel(item, nuevoEstado) {
  const r = datos.find(x => x.ITEM === item);
  if (!r) return;

  if (r.ESTADO === nuevoEstado) return;

  if (nuevoEstado === "CONSUMIDO") {
    const ok = confirm("¿Desea cambiar esta solicitud a CONSUMIDO?\n\nDespués de guardar como CONSUMIDO ya no podrá editarse ni eliminarse, solo visualizarse.");
    if (!ok) {
      renderizarTabla();
      return;
    }
  } else {
    const ok = confirm(`¿Desea cambiar el estado a ${nuevoEstado}?`);
    if (!ok) {
      renderizarTabla();
      return;
    }
  }

  r.ESTADO = nuevoEstado;
  renderizarTabla();
}

function actualizarContadores(lista) {
  setText("countSolicitado", lista.filter(r => r.ESTADO === "SOLICITADO").length);
  setText("countRequisado", lista.filter(r => r.ESTADO === "REQUISADO").length);
  setText("countConsumido", lista.filter(r => r.ESTADO === "CONSUMIDO").length);
}

function limpiarFiltros() {
  setValue("filtroMostrar", "10");
  setValue("filtroItem", "");
  setValue("filtroReporte", "");
  setValue("filtroCircuito", "ALL");
  setValue("filtroEvento", "");
  setValue("filtroTipoEvento", "ALL");
  setValue("filtroRequisa", "");
  setValue("filtroEstado", "ALL");
  setValue("filtroGestionado", "ALL");
  setValue("filtroDireccion", "");
  setValue("filtroFechaDesde", "");
  setValue("filtroFechaHasta", "");
  renderizarTabla();
}

function abrirModalSolicitud() {
  itemEditando = null;
  estadoAnteriorEditando = null;
  limpiarModalSolicitud();

  const nuevoItem = generarNuevoItem();
  setValue("modoSolicitud", "NUEVO");
  setValue("item", nuevoItem);
  setValue("estado", "SOLICITADO");
  setValue("fechaSolicitud", obtenerFechaHoraActual());
  setValue("fechaCambio", obtenerFechaActual());
  setValue("gestionadoPor", usuarioActual);
  setValue("cantidadSolicitada", 1);
  setValue("tipoEvento", "INCIDENCIA");

  actualizarHeaderModal(nuevoItem, usuarioActual);
  pintarEstadoSelect();
  mostrarSerieSegunMaterial();
  bloquearModalSolicitud(false);

  document.getElementById("modalSolicitud").classList.add("abierto");
}

function cerrarModalSolicitud() {
  document.getElementById("modalSolicitud").classList.remove("abierto");
}

function limpiarModalSolicitud() {
  ["item", "fechaSolicitud", "fechaCambio", "reporte", "sitio", "codigoSolicitado",
   "cantidadSolicitada", "pintadoApoyo", "utm", "observaciones", "evento", "serie",
   "requisa", "cuadrilla"].forEach(id => setValue(id, ""));

  setValue("estado", "SOLICITADO");
  setValue("tipoEvento", "INCIDENCIA");
  setValue("nombreSolicitado", "");
  pintarEstadoSelect();
  mostrarSerieSegunMaterial();
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
  setValue("modoSolicitud", soloLectura ? "VER" : "EDITAR");
  setValue("item", r.ITEM);
  setValue("gestionadoPor", r.GESTIONADO_POR || usuarioActual);
  setValue("estado", r.ESTADO || "SOLICITADO");
  setValue("fechaSolicitud", r.FECHA_SOLICITUD || "");
  setValue("fechaCambio", r.FECHA_CAMBIO || "");
  setValue("reporte", r.REPORTE || "");
  setValue("circuito", r.CIRCUITO || "");
  setValue("sitio", r.SITIO || "");
  setValue("codigoSolicitado", r.CODIGO_SOLICITADO || "");
  setValue("nombreSolicitado", r.NOMBRE_SOLICITADO || "");
  setValue("cantidadSolicitada", r.CANTIDAD_SOLICITADA || 1);
  setValue("pintadoApoyo", r.PINTADO_APOYO || "");
  setValue("utm", r.UTM || "");
  setValue("observaciones", r.OBSERVACIONES || "");
  setValue("tipoEvento", r.TIPO_EVENTO || "INCIDENCIA");
  setValue("evento", r.EVENTO || "");
  setValue("serie", r.SERIE || "");
  setValue("requisa", r.REQUISA || "");
  setValue("cuadrilla", r.CUADRILLA || "");

  actualizarHeaderModal(r.ITEM, r.GESTIONADO_POR || usuarioActual);
  pintarEstadoSelect();
  mostrarSerieSegunMaterial();
  bloquearModalSolicitud(soloLectura);
}

function bloquearModalSolicitud(bloquear) {
  const campos = ["estado", "fechaCambio", "reporte", "circuito", "sitio", "nombreSolicitado",
    "cantidadSolicitada", "pintadoApoyo", "utm", "observaciones", "tipoEvento", "evento", "serie"];

  campos.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = bloquear;
  });

  const btnGuardar = document.querySelector("#modalSolicitud .btn-guardar");
  if (btnGuardar) btnGuardar.style.display = bloquear ? "none" : "inline-flex";
}

function guardarSolicitud() {
  const btnGuardar = document.querySelector("#modalSolicitud .btn-guardar");
  const modo = getValue("modoSolicitud");

  if (modo === "VER") {
    cerrarModalSolicitud();
    return;
  }

  const item = getValue("item");
  const nuevoEstado = getValue("estado");

  if (modo === "EDITAR" && estadoAnteriorEditando && nuevoEstado !== estadoAnteriorEditando) {
    if (nuevoEstado === "CONSUMIDO") {
      const ok = confirm("¿Desea cambiar esta solicitud a CONSUMIDO?\n\nDespués de guardar como CONSUMIDO ya no podrá editarse ni eliminarse, solo visualizarse.");
      if (!ok) {
        setValue("estado", estadoAnteriorEditando);
        pintarEstadoSelect();
        return;
      }
    } else if (!confirm(`¿Desea cambiar el estado a ${nuevoEstado}?`)) {
      setValue("estado", estadoAnteriorEditando);
      pintarEstadoSelect();
      return;
    }
  }

  seleccionarMaterialPorNombre();

  const registro = {
    ITEM: item,
    GESTIONADO_POR: getValue("gestionadoPor") || usuarioActual,
    ESTADO: nuevoEstado,
    FECHA_SOLICITUD: getValue("fechaSolicitud"),
    FECHA_CAMBIO: getValue("fechaCambio"),
    REPORTE: getValue("reporte"),
    CIRCUITO: getValue("circuito"),
    SITIO: mayus(getValue("sitio")),
    CODIGO_SOLICITADO: Number(getValue("codigoSolicitado") || 0),
    NOMBRE_SOLICITADO: getValue("nombreSolicitado"),
    CANTIDAD_SOLICITADA: Number(getValue("cantidadSolicitada") || 1),
    PINTADO_APOYO: getValue("pintadoApoyo"),
    UTM: getValue("utm"),
    OBSERVACIONES: mayus(getValue("observaciones")),
    TIPO_EVENTO: getValue("tipoEvento"),
    EVENTO: getValue("evento"),
    SERIE: mayus(getValue("serie")),
    REQUISA: getValue("requisa"),
    CUADRILLA: getValue("cuadrilla"),
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
    alert("El material solicitado no coincide con la hoja materiales.");
    return;
  }

  if (mat.categoria === "TRANSFORMADOR" && !registro.SERIE) {
    alert("Ingrese la serie del transformador.");
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
  if (!r.FECHA_CAMBIO) return "Seleccione Fecha Cambio.";
  if (!r.REPORTE || String(r.REPORTE).length !== 7) return "El reporte debe tener 7 dígitos.";
  if (!r.CIRCUITO) return "Seleccione Circuito.";
  if (!r.SITIO) return "Ingrese Dirección.";
  if (!r.CODIGO_SOLICITADO) return "Seleccione Material Solicitado.";
  if (!r.NOMBRE_SOLICITADO) return "Seleccione Material Solicitado.";
  if (!r.CANTIDAD_SOLICITADA || r.CANTIDAD_SOLICITADA < 1 || r.CANTIDAD_SOLICITADA > 999) return "Cantidad solicitada debe ser entre 1 y 999.";
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

function abrirModalAuditoria(item) {
  if (idTipoUsuario !== 1) {
    alert("No tiene permiso para auditar.");
    return;
  }

  const r = datos.find(x => x.ITEM === item);
  if (!r) return;

  setValue("auditoriaItem", item);
  setValue("auditado", r.AUDITADO || "SIN ERRORES");

  document.querySelectorAll(".obs-auditoria").forEach(chk => chk.checked = false);
  const obs = (r.OBSERVACIONES_AUDITORIA || "").split(",").map(x => x.trim());
  document.querySelectorAll(".obs-auditoria").forEach(chk => chk.checked = obs.includes(chk.value));

  controlarObservacionesAuditoria();
  document.getElementById("modalAuditoria").classList.add("abierto");
}

function cerrarModalAuditoria() {
  document.getElementById("modalAuditoria").classList.remove("abierto");
}

function controlarObservacionesAuditoria() {
  const resultado = getValue("auditado");
  const box = document.getElementById("boxObservacionesAuditoria");
  if (!box) return;

  if (resultado === "CON ERRORES") {
    box.classList.remove("disabled");
  } else {
    box.classList.add("disabled");
    document.querySelectorAll(".obs-auditoria").forEach(chk => chk.checked = false);
  }
}

function guardarAuditoria() {
  const item = getValue("auditoriaItem");
  const resultado = getValue("auditado");
  const seleccionadas = [...document.querySelectorAll(".obs-auditoria:checked")].map(x => x.value);

  if (resultado === "CON ERRORES" && seleccionadas.length === 0) {
    alert("Debe seleccionar al menos una observación de auditoría.");
    return;
  }

  const r = datos.find(x => x.ITEM === item);
  if (!r) return;

  r.AUDITADO = resultado;
  r.OBSERVACIONES_AUDITORIA = resultado === "CON ERRORES" ? seleccionadas.join(", ") : "";

  cerrarModalAuditoria();
  renderizarTabla();
}

function abrirModalDashboard() {
  document.getElementById("modalDashboard").classList.add("abierto");
  mostrarDashboard("postes");
}

function cerrarModalDashboard() {
  document.getElementById("modalDashboard").classList.remove("abierto");
}

function mostrarDashboard(tipo) {
  document.querySelectorAll(".dash-tab").forEach(btn => btn.classList.remove("active"));
  const tabs = { postes: 0, transformadores: 1, postesCircuito: 2, transformadoresCircuito: 3, gestionado: 4 };
  const index = tabs[tipo] || 0;
  const tab = document.querySelectorAll(".dash-tab")[index];
  if (tab) tab.classList.add("active");

  let titulo = "";
  let resumen = [];

  if (tipo === "postes") { titulo = "Postes consumidos por material"; resumen = agruparPorMaterial("POSTE"); }
  if (tipo === "transformadores") { titulo = "Transformadores consumidos por material"; resumen = agruparPorMaterial("TRANSFORMADOR"); }
  if (tipo === "postesCircuito") { titulo = "Postes consumidos por circuito"; resumen = agruparPorCircuito("POSTE"); }
  if (tipo === "transformadoresCircuito") { titulo = "Transformadores consumidos por circuito"; resumen = agruparPorCircuito("TRANSFORMADOR"); }
  if (tipo === "gestionado") { titulo = "Conteo de solicitudes por gestionado por"; resumen = agruparPorCampo(datos, "GESTIONADO_POR"); }

  setText("dashboardTitulo", titulo);
  if (document.getElementById("dashboardTotal")) {
    setText("dashboardTotal", resumen.reduce((a, b) => a + b.cantidad, 0));
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
  if (!tbody) return;

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

function seleccionarMaterialPorNombre() {
  const nombre = getValue("nombreSolicitado");
  const mat = materiales.find(m => m.descripcion === nombre);
  if (!mat) return;
  setValue("codigoSolicitado", mat.codigo);
}

function seleccionarMaterialPorCodigo() {
  const codigo = Number(getValue("codigoSolicitado"));
  const mat = materiales.find(m => Number(m.codigo) === codigo);
  if (!mat) return;
  setValue("nombreSolicitado", mat.descripcion);
  mostrarSerieSegunMaterial();
}

function mostrarSerieSegunMaterial() {
  const mat = obtenerMaterialPorCodigo(getValue("codigoSolicitado"));
  const serieBox = document.getElementById("serieBox");
  if (!serieBox) return;

  if (mat && mat.categoria === "TRANSFORMADOR") {
    serieBox.classList.remove("oculto");
  } else {
    serieBox.classList.add("oculto");
    setValue("serie", "");
  }
}

function obtenerMaterialPorCodigo(codigo) {
  return materiales.find(m => Number(m.codigo) === Number(codigo));
}

function buscarUTMSimulado() {
  const apoyo = getValue("pintadoApoyo");
  if (!apoyo) {
    setValue("utm", "");
    return;
  }
  const ultimos = String(apoyo).slice(-3);
  setValue("utm", `618${ultimos} - 1639${ultimos}`);
}

function generarNuevoItem() {
  const hoy = new Date();
  const fecha = hoy.getFullYear().toString() +
    String(hoy.getMonth() + 1).padStart(2, "0") +
    String(hoy.getDate()).padStart(2, "0");

  const itemsHoy = datos
    .filter(x => String(x.ITEM).startsWith(fecha))
    .map(x => Number(String(x.ITEM).slice(-3)));

  const consecutivo = itemsHoy.length === 0 ? 1 : Math.max(...itemsHoy) + 1;
  return fecha + String(consecutivo).padStart(3, "0");
}

function obtenerFechaActual() {
  return new Date().toISOString().split("T")[0];
}

function obtenerFechaHoraActual() {
  const f = new Date();
  return f.toLocaleString("es-HN", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
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
  if (e === "SOLICITADO") return `<span class="badge badge-solicitado">SOLICITADO</span>`;
  if (e === "REQUISADO") return `<span class="badge badge-requisado">REQUISADO</span>`;
  if (e === "CONSUMIDO") return `<span class="badge badge-consumido">CONSUMIDO</span>`;
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

function claseEstadoPanel(estado) {
  if (estado === "SOLICITADO") return "solicitado";
  if (estado === "REQUISADO") return "requisado";
  if (estado === "CONSUMIDO") return "consumido";
  return "";
}

function actualizarHeaderModal(item, usuario) {
  setText("modalHeaderInfo", `${item || ""} | ${usuario || usuarioActual}`);
}

function normalizar(valor) {
  return (valor || "").toString().trim().toUpperCase();
}

function mayus(valor) {
  return (valor || "").toString().trim().toUpperCase();
}

function escaparAtributo(valor) {
  return (valor || "").toString().replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function getValue(id, def = "") {
  const el = document.getElementById(id);
  return el ? el.value : def;
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function addListener(id, eventName, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(eventName, fn);
}

function sincronizarDatos() {
  alert("Modo prueba: datos sincronizados localmente.");
  renderizarTabla();
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = "index.html";
}
