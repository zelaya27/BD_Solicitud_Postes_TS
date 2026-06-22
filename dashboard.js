/************************************************************
 * APP SOLICITUD DE MATERIALES - dashboard.js
 * Conectado a Google Apps Script - UTM X/Y + Vista Excel en pestaña
 ************************************************************/

let usuarioActual = "";
let sectorActual = "";
let idTipoUsuario = 0;
let cuadrillaActual = "";

let datos = [];
let materiales = [];
let circuitos = [];
let usuarios = [];
let ingenieros = [];

let itemEditando = null;
let estadoAnteriorEditando = null;

let datosVistaExcelActual = [];
let nombreArchivoVistaExcelActual = "Solicitudes_Materiales.xlsx";

document.addEventListener("DOMContentLoaded", iniciarApp);

async function iniciarApp() {
  cargarSesion();
  await obtenerDatosIniciales();
  cargarCombos();
  renderizarTabla();
  controlarObservacionesAuditoria();
}

function cargarSesion() {
  usuarioActual = sessionStorage.getItem("usuario") || "";
  sectorActual = sessionStorage.getItem("sector") || "";
  idTipoUsuario = Number(sessionStorage.getItem("id_tipous") || 0);
  cuadrillaActual = sessionStorage.getItem("cuadrilla") || "";

  if (!usuarioActual || !sectorActual) {
    window.location.href = "index.html";
    return;
  }

  setText("nombreUsuario", usuarioActual);
  setText("nombreSector", sectorActual);
}

async function apiPost(payload) {
  const res = await fetch(CONFIG.ENDPOINTS.API, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error en API");
  return data;
}

async function obtenerDatosIniciales() {
  try {
    const data = await apiPost({ action: "obtenerDatosIniciales" });

    datos = data.solicitudes || [];
    materiales = data.materiales || [];
    circuitos = data.circuitos || [];
    usuarios = data.usuarios || [];
    ingenieros = usuarios.map(u => u.usuario).filter(Boolean).sort();

  } catch (err) {
    console.error(err);
    alert("Error cargando datos desde Google Sheets: " + err.message);
  }
}

/* =====================================================
   COMBOS
===================================================== */

function cargarCombos() {
  llenarSelect("filtroCircuito", circuitos, true);
  llenarSelect("filtroGestionado", ingenieros, true);
  llenarSelect("circuito", circuitos, false);
  cargarComboMateriales("nombreSolicitado");

  addListener("nombreSolicitado", "change", seleccionarMaterialPorNombre);
  addListener("nombreSolicitado", "change", mostrarSerieSegunMaterial);
  addListener("fechaCambio", "change", actualizarInfoModalSolicitud);
}

function llenarSelect(id, lista, incluirTodos) {
  const select = document.getElementById(id);
  if (!select) return;

  const valorAnterior = select.value;
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

  if (valorAnterior) select.value = valorAnterior;
}

function cargarComboMateriales(id) {
  const select = document.getElementById(id);
  if (!select) return;

  const valorAnterior = select.value;
  select.innerHTML = `<option value="">Seleccione material...</option>`;

  materiales.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.descripcion;
    opt.textContent = `${m.codigo} - ${m.descripcion}`;
    opt.dataset.codigo = m.codigo;
    opt.dataset.categoria = m.categoria;
    opt.dataset.unidad = "UND";
    select.appendChild(opt);
  });

  if (valorAnterior) select.value = valorAnterior;
}

/* =====================================================
   FILTROS / TABLA
===================================================== */

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
    const cumpleGestionado = gestionado === "ALL" || (r.SOLICITADO_POR || r.GESTIONADO_POR) === gestionado;
    const cumpleDireccion = !direccion || normalizar(r.SITIO).includes(direccion) || normalizar(r.OBSERVACIONES).includes(direccion);
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

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center">No hay registros para mostrar.</td></tr>`;
    return;
  }

  lista.forEach(r => {
    const consumido = r.ESTADO === "CONSUMIDO";
    const puedeAuditar = idTipoUsuario === 1;
    const tr = document.createElement("tr");

    const advertencia = r.OBSERVACIONES_AUDITORIA
      ? `<i class="fas fa-triangle-exclamation audit-warning" title="${escaparAtributo(r.OBSERVACIONES_AUDITORIA)}"></i>`
      : "";

    tr.innerHTML = `
      <td title="${escaparAtributo(r.ITEM)}"><strong>${r.ITEM}</strong>${advertencia}</td>
      <td>${selectEstadoPanel(r)}</td>
      <td>
        <input class="edit-tabla" type="number" value="${escaparAtributo(r.REQUISA || "")}"
          onchange="actualizarCampoTabla('${escaparAtributo(r.ITEM)}','REQUISA',this.value)">
      </td>
      <td>
        <input class="edit-tabla" type="date" value="${r.FECHA_CAMBIO || ""}"
          onchange="actualizarCampoTabla('${escaparAtributo(r.ITEM)}','FECHA_CAMBIO',this.value)">
      </td>
      <td title="${escaparAtributo(r.CIRCUITO)}"><strong>${r.CIRCUITO || "-"}</strong></td>
      <td class="td-material" title="${escaparAtributo(r.NOMBRE_SOLICITADO)}">${r.NOMBRE_SOLICITADO || "-"}</td>
      <td class="td-direccion" title="${escaparAtributo(r.SITIO)}">${r.SITIO || "-"}</td>
      <td>
        <input class="edit-tabla" type="number" value="${escaparAtributo(r.EVENTO || "")}"
          onchange="actualizarCampoTabla('${escaparAtributo(r.ITEM)}','EVENTO',this.value)">
      </td>
      <td>
        <div class="acciones-td">
          <button class="btn-accion btn-solicitud" onclick="abrirSolicitudDesdeTabla('${escaparAtributo(r.ITEM)}')" title="Solicitud">
            <i class="fas fa-clipboard-list"></i> Solicitud
          </button>
          <button class="btn-accion btn-excel-row" onclick="abrirVistaExcelIndividual('${escaparAtributo(r.ITEM)}')" title="Vista Excel">
            <i class="fas fa-file-excel"></i>
          </button>
          ${puedeAuditar ? `
          <button class="btn-accion btn-auditar" onclick="abrirModalAuditoria('${escaparAtributo(r.ITEM)}')" title="Auditar">
            <i class="fas fa-magnifying-glass"></i>
          </button>` : ""}
          <button class="btn-accion btn-eliminar ${consumido ? "btn-disabled" : ""}" onclick="eliminarSolicitud('${escaparAtributo(r.ITEM)}')" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function selectEstadoPanel(r) {
  const cls = claseEstadoPanel(r.ESTADO);

  return `
    <select class="estado-panel-select ${cls}" onchange="cambiarEstadoPanel('${escaparAtributo(r.ITEM)}', this.value)">
      <option value="SOLICITADO" ${r.ESTADO === "SOLICITADO" ? "selected" : ""}>SOLICITADO</option>
      <option value="REQUISADO" ${r.ESTADO === "REQUISADO" ? "selected" : ""}>REQUISADO</option>
      <option value="CONSUMIDO" ${r.ESTADO === "CONSUMIDO" ? "selected" : ""}>CONSUMIDO</option>
    </select>
  `;
}

async function cambiarEstadoPanel(item, nuevoEstado) {
  const r = datos.find(x => String(x.ITEM) === String(item));
  if (!r || r.ESTADO === nuevoEstado) return;

  if (nuevoEstado === "REQUISADO" && !String(r.REQUISA || "").trim()) {
    alert("Para cambiar a REQUISADO primero debe llenar el campo REQUISA.");
    renderizarTabla();
    return;
  }

  const msg = nuevoEstado === "CONSUMIDO"
    ? "¿Desea cambiar esta solicitud a CONSUMIDO?\n\nDespués de pasar a CONSUMIDO no podrá eliminarse."
    : `¿Desea cambiar el estado a ${nuevoEstado}?`;

  if (!confirm(msg)) {
    renderizarTabla();
    return;
  }

  const anterior = r.ESTADO;
  r.ESTADO = nuevoEstado;
  r.USUARIO = usuarioActual;

  try {
    await apiPost({ action: "actualizarSolicitud", registro: r });
    await sincronizarDatos();
  } catch (err) {
    r.ESTADO = anterior;
    alert("Error actualizando estado: " + err.message);
    renderizarTabla();
  }
}

async function actualizarCampoTabla(item, campo, valor) {
  const r = datos.find(x => String(x.ITEM) === String(item));
  if (!r) return;

  const anterior = r[campo] || "";
  if (String(anterior) === String(valor)) return;

  let etiqueta = campo;
  if (campo === "FECHA_CAMBIO") etiqueta = "FECHA CAMBIO";

  if (!confirm(`¿Desea modificar ${etiqueta}?`)) {
    renderizarTabla();
    return;
  }

  r[campo] = campo === "REQUISA" || campo === "EVENTO"
    ? String(valor || "").trim()
    : valor;

  r.USUARIO = usuarioActual;

  try {
    await apiPost({ action: "actualizarSolicitud", registro: r });
    await sincronizarDatos();
  } catch (err) {
    r[campo] = anterior;
    alert("Error actualizando campo: " + err.message);
    renderizarTabla();
  }
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

async function sincronizarDatos() {
  await obtenerDatosIniciales();
  cargarCombos();
  renderizarTabla();
}

/* =====================================================
   MODAL SOLICITUD
===================================================== */

function abrirModalSolicitud() {
  itemEditando = null;
  estadoAnteriorEditando = null;

  limpiarModalSolicitud();

  const nuevoItem = generarNuevoItemLocal();

  setValue("modoSolicitud", "NUEVO");
  setValue("item", nuevoItem);
  setValue("estado", "SOLICITADO");
  setValue("fechaSolicitud", obtenerFechaHoraActual());
  setValue("fechaCambio", obtenerFechaActual());
  setValue("gestionadoPor", usuarioActual);
  setValue("cantidadSolicitada", 1);
  setValue("tipoEvento", "INCIDENCIA");

  actualizarInfoModalSolicitud();
  mostrarSerieSegunMaterial();
  bloquearModalSolicitud(false);

  document.getElementById("modalSolicitud").classList.add("abierto");
}

function abrirSolicitudDesdeTabla(item) {
  const r = datos.find(x => String(x.ITEM) === String(item));
  if (!r) return;

  if (r.ESTADO === "CONSUMIDO") abrirSolicitudSoloLectura(r);
  else editarSolicitud(item);
}

function cerrarModalSolicitud() {
  document.getElementById("modalSolicitud").classList.remove("abierto");
}

function limpiarModalSolicitud() {
  [
    "item", "fechaSolicitud", "fechaCambio", "reporte", "sitio",
    "codigoSolicitado", "cantidadSolicitada", "pintadoApoyo",
    "utmX", "utmY", "observaciones", "evento", "serie", "requisa", "cuadrilla"
  ].forEach(id => setValue(id, ""));

  setValue("estado", "SOLICITADO");
  setValue("tipoEvento", "INCIDENCIA");
  setValue("nombreSolicitado", "");

  mostrarSerieSegunMaterial();
}

function editarSolicitud(item) {
  const r = datos.find(x => String(x.ITEM) === String(item));
  if (!r) return;

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
  const utmPartes = obtenerUTMPartes(r);

  setValue("modoSolicitud", soloLectura ? "VER" : "EDITAR");
  setValue("item", r.ITEM);
  setValue("gestionadoPor", r.SOLICITADO_POR || r.GESTIONADO_POR || usuarioActual);
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
  setValue("utmX", utmPartes.x);
  setValue("utmY", utmPartes.y);
  setValue("observaciones", r.OBSERVACIONES || "");
  setValue("tipoEvento", r.TIPO_EVENTO || "INCIDENCIA");
  setValue("evento", r.EVENTO || "");
  setValue("serie", r.SERIE || "");
  setValue("requisa", r.REQUISA || "");

  actualizarInfoModalSolicitud();
  mostrarSerieSegunMaterial();
  bloquearModalSolicitud(soloLectura);
}

function bloquearModalSolicitud(bloquear) {
  [
    "fechaCambio", "reporte", "circuito", "sitio", "nombreSolicitado",
    "cantidadSolicitada", "pintadoApoyo", "utmX", "utmY", "observaciones",
    "tipoEvento", "evento", "serie"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = bloquear;
  });

  const btnGps = document.querySelector(".btn-gps-buscar");
  if (btnGps) btnGps.disabled = bloquear;

  const btnGuardar = document.querySelector("#modalSolicitud .btn-guardar");
  if (btnGuardar) btnGuardar.style.display = bloquear ? "none" : "inline-flex";
}

async function guardarSolicitud() {
  const btnGuardar = document.querySelector("#modalSolicitud .btn-guardar");
  const modo = getValue("modoSolicitud");

  if (modo === "VER") {
    cerrarModalSolicitud();
    return;
  }

  seleccionarMaterialPorNombre();

  const registro = {
    ITEM: getValue("item"),
    ESTADO: getValue("estado", "SOLICITADO"),
    FECHA_CAMBIO: getValue("fechaCambio"),
    TIPO_EVENTO: getValue("tipoEvento"),
    EVENTO: getValue("evento"),
    REPORTE: getValue("reporte"),
    CIRCUITO: getValue("circuito"),
    SITIO: mayus(getValue("sitio")),
    PINTADO_APOYO: getValue("pintadoApoyo"),
    UTM_X: getValue("utmX"),
    UTM_Y: getValue("utmY"),
    CODIGO_SOLICITADO: getValue("codigoSolicitado"),
    NOMBRE_SOLICITADO: getValue("nombreSolicitado"),
    CANTIDAD_SOLICITADA: getValue("cantidadSolicitada"),
    SERIE: mayus(getValue("serie")),
    OBSERVACIONES: mayus(getValue("observaciones")),
    SOLICITADO_POR: getValue("gestionadoPor") || usuarioActual,
    FECHA_SOLICITUD: getValue("fechaSolicitud") || obtenerFechaHoraActual(),
    REQUISA: getValue("requisa"),
    USUARIO: usuarioActual
  };

  const actual = datos.find(x => String(x.ITEM) === String(itemEditando));
  if (actual) {
    registro.REQUISADO_POR = actual.REQUISADO_POR || "";
    registro.CONSUMIDO_POR = actual.CONSUMIDO_POR || "";
    registro.AUDITADO = actual.AUDITADO || "";
    registro.OBSERVACIONES_AUDITORIA = actual.OBSERVACIONES_AUDITORIA || "";
    registro.FECHA_AUDITADO = actual.FECHA_AUDITADO || "";
  }

  const error = validarSolicitud(registro);
  if (error) {
    alert(error);
    return;
  }

  const mat = obtenerMaterialPorCodigo(registro.CODIGO_SOLICITADO);
  if (!mat || mat.descripcion !== registro.NOMBRE_SOLICITADO) {
    alert("El material solicitado no coincide con la base de materiales.");
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
    await apiPost({
      action: modo === "NUEVO" ? "guardarSolicitud" : "actualizarSolicitud",
      registro
    });

    await sincronizarDatos();
    cerrarModalSolicitud();

  } catch (err) {
    alert("Error guardando solicitud: " + err.message);
  } finally {
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = `<i class="fas fa-save"></i> GUARDAR SOLICITUD`;
    }
  }
}

function validarSolicitud(r) {
  if (!r.FECHA_CAMBIO) return "Seleccione Fecha Cambio.";
  if (!r.TIPO_EVENTO) return "Seleccione Tipo de Evento.";
  if (!r.EVENTO) return "Ingrese Evento.";
  if (!r.REPORTE || String(r.REPORTE).length !== 7) return "El reporte debe tener 7 dígitos.";
  if (!r.CIRCUITO) return "Seleccione Circuito.";
  if (!r.SITIO) return "Ingrese Dirección.";
  if (!r.PINTADO_APOYO) return "Ingrese Apoyo.";
  if (!r.UTM_X || !r.UTM_Y) return "Ingrese Coordenadas UTM X y UTM Y.";
  if (!r.CODIGO_SOLICITADO) return "Seleccione Material Solicitado.";
  if (!r.NOMBRE_SOLICITADO) return "Seleccione Material Solicitado.";
  if (!r.CANTIDAD_SOLICITADA || Number(r.CANTIDAD_SOLICITADA) < 1 || Number(r.CANTIDAD_SOLICITADA) > 999) {
    return "Cantidad solicitada debe ser entre 1 y 999.";
  }
  return "";
}

async function eliminarSolicitud(item) {
  const r = datos.find(x => String(x.ITEM) === String(item));
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

  try {
    await apiPost({ action: "eliminarSolicitud", item });
    await sincronizarDatos();
  } catch (err) {
    alert("Error eliminando solicitud: " + err.message);
  }
}

/* =====================================================
   GPS / UTM
===================================================== */

async function buscarCoordenadasApoyo() {
  const apoyo = getValue("pintadoApoyo");

  if (!apoyo) {
    alert("Ingrese el apoyo/pintado antes de buscar coordenadas.");
    return;
  }

  const actualX = getValue("utmX");
  const actualY = getValue("utmY");

  try {
    const btn = document.querySelector(".btn-gps-buscar");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
    }

    const data = await apiPost({
      action: "buscarUTMPorApoyo",
      apoyo
    });

    if (!data.ok || (!data.utm_x && !data.utm_y)) {
      alert(data.mensaje || "No se encontraron coordenadas para este apoyo. Puede ingresarlas manualmente.");
      return;
    }

    if ((actualX || actualY) && !confirm("Ya existen coordenadas registradas.\n\n¿Desea reemplazarlas?")) {
      return;
    }

    setValue("utmX", data.utm_x || "");
    setValue("utmY", data.utm_y || "");

  } catch (err) {
    alert("Error buscando coordenadas: " + err.message);
  } finally {
    const btn = document.querySelector(".btn-gps-buscar");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-location-crosshairs"></i>`;
    }
  }
}

function obtenerUTMPartes(r) {
  if (!r) return { x: "", y: "" };

  if (r.UTM_X || r.UTM_Y) {
    return {
      x: String(r.UTM_X || ""),
      y: String(r.UTM_Y || "")
    };
  }

  const texto = String(r.UTM || "").trim();
  if (!texto) return { x: "", y: "" };

  const partes = texto
    .replace(",", " - ")
    .split("-")
    .map(x => x.trim())
    .filter(Boolean);

  return {
    x: partes[0] || "",
    y: partes[1] || ""
  };
}

function textoUTM(r) {
  const p = obtenerUTMPartes(r);
  if (p.x && p.y) return `${p.x} - ${p.y}`;
  if (p.x) return p.x;
  if (p.y) return p.y;
  return "";
}

/* =====================================================
   AUDITORIA
===================================================== */

function abrirModalAuditoria(item) {
  if (idTipoUsuario !== 1) {
    alert("No tiene permiso para auditar.");
    return;
  }

  const r = datos.find(x => String(x.ITEM) === String(item));
  if (!r) return;

  setValue("auditoriaItem", item);
  setValue("auditado", r.AUDITADO || "SIN ERRORES");

  document.querySelectorAll(".obs-auditoria").forEach(chk => chk.checked = false);

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

async function guardarAuditoria() {
  const item = getValue("auditoriaItem");
  const resultado = getValue("auditado");
  const seleccionadas = [...document.querySelectorAll(".obs-auditoria:checked")].map(x => x.value);

  if (resultado === "CON ERRORES" && !seleccionadas.length) {
    alert("Debe seleccionar al menos una observación de auditoría.");
    return;
  }

  try {
    await apiPost({
      action: "guardarAuditoria",
      item,
      usuario: usuarioActual,
      resultado,
      observaciones: resultado === "CON ERRORES" ? seleccionadas.join(", ") : ""
    });

    await sincronizarDatos();
    cerrarModalAuditoria();

  } catch (err) {
    alert("Error guardando auditoría: " + err.message);
  }
}

/* =====================================================
   DASHBOARDS
===================================================== */

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

  const tab = document.querySelectorAll(".dash-tab")[tabs[tipo] || 0];
  if (tab) tab.classList.add("active");

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
    resumen = agruparPorCampo(datos, "SOLICITADO_POR");
  }

  setText("dashboardTitulo", titulo);
  setText("dashboardTotal", resumen.reduce((a, b) => a + b.cantidad, 0));

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

/* =====================================================
   MATERIALES
===================================================== */

function seleccionarMaterialPorNombre() {
  const nombre = getValue("nombreSolicitado");
  const mat = materiales.find(m => m.descripcion === nombre);

  if (!mat) {
    setValue("codigoSolicitado", "");
    mostrarSerieSegunMaterial();
    return;
  }

  setValue("codigoSolicitado", mat.codigo);
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
  return materiales.find(m => String(m.codigo) === String(codigo));
}

/* =====================================================
   VISTA EXCEL EN NUEVA PESTAÑA + DESCARGA
===================================================== */

function abrirVistaExcelIndividual(item) {
  const r = datos.find(x => String(x.ITEM) === String(item));

  if (!r) {
    alert("No se encontró la solicitud.");
    return;
  }

  datosVistaExcelActual = [r];
  nombreArchivoVistaExcelActual = `Solicitud_${r.ITEM}.xlsx`;

  abrirVentanaVistaExcel(datosVistaExcelActual, nombreArchivoVistaExcelActual);
}

function abrirVistaExcelFiltrado() {
  const lista = obtenerDatosFiltrados();

  if (!lista.length) {
    alert("No hay solicitudes para exportar.");
    return;
  }

  datosVistaExcelActual = lista;
  nombreArchivoVistaExcelActual = "Solicitudes_Materiales.xlsx";

  abrirVentanaVistaExcel(datosVistaExcelActual, nombreArchivoVistaExcelActual);
}

function abrirVentanaVistaExcel(lista, nombreArchivo) {
  const win = window.open("", "_blank");

  if (!win) {
    alert("El navegador bloqueó la ventana emergente. Permita ventanas emergentes para esta aplicación.");
    return;
  }

  win.document.open();
  win.document.write(generarHtmlVistaExcel(lista, nombreArchivo));
  win.document.close();
}

function generarHtmlVistaExcel(lista, nombreArchivo) {
  const encabezados = [
    "ITEM", "", "CODIGO SAP", "DESCRIPCION DEL MATERIAL", "SERIE",
    "UNIDAD DE MEDIDA", "CANTIDAD SOLICITADA", "CANTIDAD APROBADA",
    "BODEGA", "", "REPORTE", "SITIO", "APOYO/PINTADO",
    "UBICACIÓN GPS (UTM)", "FECHA", "OBSERVACIONES"
  ];

  const filas = lista.map(r => [
    r.ITEM || "",
    "",
    r.CODIGO_SOLICITADO || "",
    r.NOMBRE_SOLICITADO || "",
    r.SERIE || "",
    "UND",
    r.CANTIDAD_SOLICITADA || "",
    "",
    "",
    "",
    r.REPORTE || "",
    r.SITIO || "",
    r.PINTADO_APOYO || "",
    textoUTM(r),
    formatearFechaExcel(r.FECHA_CAMBIO),
    r.OBSERVACIONES || ""
  ]);

  const thead = encabezados.map((h, i) => `
    <th class="${i === 1 || i === 9 ? "col-vacia" : ""}">${escaparHTML(h)}</th>
  `).join("");

  const tbody = filas.map(f => `
    <tr>
      ${f.map((v, i) => `
        <td class="${[
          i === 1 || i === 9 ? "col-vacia" : "",
          [3, 11, 15].includes(i) ? "txt-left" : ""
        ].join(" ")}">${escaparHTML(v)}</td>
      `).join("")}
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Vista Excel - ${escaparHTML(nombreArchivo)}</title>
  <script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"></script>
  <style>
    body{
      margin:0;
      font-family:Arial, sans-serif;
      background:#f3f6fb;
      color:#111827;
    }
    .toolbar{
      position:sticky;
      top:0;
      z-index:20;
      background:#ffffff;
      border-bottom:1px solid #cbd5e1;
      box-shadow:0 6px 18px rgba(15,23,42,.10);
      padding:12px 16px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
    }
    .toolbar h2{
      margin:0;
      font-size:18px;
      font-weight:900;
    }
    .btns{
      display:flex;
      gap:8px;
      flex-wrap:wrap;
    }
    button{
      height:36px;
      padding:0 12px;
      border:none;
      border-radius:8px;
      font-weight:900;
      cursor:pointer;
    }
    .btn-copy{background:#2563eb;color:white}
    .btn-xlsx{background:#15803d;color:white}
    .btn-close{background:#ef4444;color:white}
    .wrap{
      padding:14px;
      overflow:auto;
    }
    table{
      border-collapse:collapse;
      background:white;
      min-width:1700px;
      width:100%;
    }
    th,td{
      border:1px solid #111827;
      padding:10px 8px;
      font-size:12px;
      text-align:center;
      vertical-align:middle;
      white-space:normal;
      height:34px;
    }
    th{
      background:#d9eaf7;
      font-weight:900;
    }
    .col-vacia{
      border:none !important;
      background:#ffffff !important;
      width:28px;
      min-width:28px;
    }
    .txt-left{text-align:left}
    .nota{
      font-size:12px;
      color:#475569;
      margin-left:8px;
      font-weight:700;
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <h2>Vista Excel - Solicitud de Materiales</h2>
      <span class="nota">Puede seleccionar/copiar celdas o descargar el archivo Excel.</span>
    </div>
    <div class="btns">
      <button class="btn-copy" onclick="copiarTabla()">Copiar tabla</button>
      <button class="btn-xlsx" onclick="window.opener.generarExcelSolicitudes(window.opener.datosVistaExcelActual, window.opener.nombreArchivoVistaExcelActual)">Descargar Excel</button>
      <button class="btn-close" onclick="window.close()">Cerrar</button>
    </div>
  </div>
  <div class="wrap">
    <table id="tablaVistaExcel">
      <thead><tr>${thead}</tr></thead>
      <tbody>${tbody}</tbody>
    </table>
  </div>
  <script>
    function copiarTabla(){
      const tabla = document.getElementById("tablaVistaExcel");
      const range = document.createRange();
      range.selectNode(tabla);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        document.execCommand("copy");
        alert("Tabla copiada. Puede pegarla en Excel, correo o WhatsApp.");
      } catch(e) {
        alert("No se pudo copiar automáticamente. Seleccione la tabla y presione Ctrl + C.");
      }
      selection.removeAllRanges();
    }
  </script>
</body>
</html>`;
}

function generarExcelSolicitudes(lista, nombreArchivo) {
  if (typeof XLSX === "undefined") {
    alert("No se cargó la librería de Excel. Verifique conexión a internet.");
    return;
  }

  const encabezados = [
    "ITEM",
    "",
    "CODIGO SAP",
    "DESCRIPCION DEL MATERIAL",
    "SERIE",
    "UNIDAD DE\nMEDIDA",
    "CANTIDAD\nSOLICITADA",
    "CANTIDAD\nAPROBADA",
    "BODEGA",
    "",
    "REPORTE",
    "SITIO",
    "APOYO/PINTADO",
    "UBICACIÓN GPS (UTM)",
    "FECHA",
    "OBSERVACIONES"
  ];

  const filas = lista.map(r => [
    r.ITEM || "",
    "",
    r.CODIGO_SOLICITADO || "",
    r.NOMBRE_SOLICITADO || "",
    r.SERIE || "",
    "UND",
    r.CANTIDAD_SOLICITADA || "",
    "",
    "",
    "",
    r.REPORTE || "",
    r.SITIO || "",
    r.PINTADO_APOYO || "",
    textoUTM(r),
    formatearFechaExcel(r.FECHA_CAMBIO),
    r.OBSERVACIONES || ""
  ]);

  const ws = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);

  ws["!cols"] = [
    { wch: 14 },  // ITEM
    { wch: 3 },   // VACÍA
    { wch: 14 },  // CODIGO SAP
    { wch: 36 },  // DESCRIPCION
    { wch: 20 },  // SERIE
    { wch: 10 },  // UNIDAD
    { wch: 12 },  // CANT SOLICITADA
    { wch: 12 },  // CANT APROBADA
    { wch: 24 },  // BODEGA
    { wch: 3 },   // VACÍA
    { wch: 14 },  // REPORTE
    { wch: 32 },  // SITIO
    { wch: 18 },  // APOYO
    { wch: 24 },  // UTM
    { wch: 14 },  // FECHA
    { wch: 48 }   // OBSERVACIONES
  ];

  ws["!rows"] = [
    { hpt: 32 },
    ...filas.map(() => ({ hpt: 27 }))
  ];

  const range = XLSX.utils.decode_range(ws["!ref"]);

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const ref = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[ref]) ws[ref] = { t: "s", v: "" };

      const esColumnaVacia = C === 1 || C === 9;

      ws[ref].s = {
        font: {
          name: "Arial",
          sz: R === 0 ? 9 : 8,
          bold: R === 0,
          color: { rgb: "000000" }
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: true
        },
        fill: R === 0 && !esColumnaVacia
          ? { fgColor: { rgb: "D9EAF7" } }
          : { fgColor: { rgb: "FFFFFF" } },
        border: esColumnaVacia
          ? {}
          : {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Solicitud");
  XLSX.writeFile(wb, nombreArchivo);
}

/* =====================================================
   UTILIDADES
===================================================== */

function generarNuevoItemLocal() {
  const hoy = new Date();
  const fecha =
    hoy.getFullYear().toString() +
    String(hoy.getMonth() + 1).padStart(2, "0") +
    String(hoy.getDate()).padStart(2, "0");

  const itemsHoy = datos
    .filter(x => String(x.ITEM).startsWith(fecha))
    .map(x => Number(String(x.ITEM).slice(-3)) || 0);

  const consecutivo = itemsHoy.length ? Math.max(...itemsHoy) + 1 : 1;

  return fecha + String(consecutivo).padStart(3, "0");
}

function obtenerFechaActual() {
  return new Date().toISOString().split("T")[0];
}

function obtenerFechaHoraActual() {
  return new Date().toLocaleString("es-HN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatearFecha(fecha) {
  if (!fecha) return "-";

  const partes = String(fecha).split("-");
  if (partes.length !== 3) return fecha;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearFechaExcel(fecha) {
  if (!fecha) return "";

  const partes = String(fecha).split("-");
  if (partes.length !== 3) return fecha;

  return `${Number(partes[2])}/${Number(partes[1])}/${partes[0]}`;
}

function claseEstadoPanel(estado) {
  if (estado === "SOLICITADO") return "solicitado";
  if (estado === "REQUISADO") return "requisado";
  if (estado === "CONSUMIDO") return "consumido";
  return "";
}

function actualizarInfoModalSolicitud() {
  setText("infoSolicitudItem", getValue("item") || "-");
  setText("infoSolicitudUsuario", getValue("gestionadoPor") || usuarioActual || "-");
}

function normalizar(valor) {
  return (valor || "").toString().trim().toUpperCase();
}

function mayus(valor) {
  return (valor || "").toString().trim().toUpperCase();
}

function escaparAtributo(valor) {
  return (valor || "").toString()
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escaparHTML(valor) {
  return (valor || "").toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = "index.html";
}
