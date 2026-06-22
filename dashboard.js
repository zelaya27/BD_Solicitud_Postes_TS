/************************************************************
 * APP SOLICITUD DE MATERIALES - dashboard.js
 * Conectado a Google Apps Script - Sin modo prueba
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

  const optInicial = document.createElement("option");

  if (incluirTodos) {
    optInicial.value = "ALL";
    optInicial.textContent = "Todos";
  } else {
    optInicial.value = "";
    optInicial.textContent = "Seleccione...";
  }

  select.appendChild(optInicial);

  lista.forEach(valor => {
    const opt = document.createElement("option");
    opt.value = valor;
    opt.textContent = valor;
    select.appendChild(opt);
  });

  if (valorAnterior) {
    select.value = valorAnterior;
  }
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
    opt.dataset.unidad = m.unidad || "UND";
    select.appendChild(opt);
  });

  if (valorAnterior) select.value = valorAnterior;
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
  tbody.innerHTML = "";

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center">No hay registros para mostrar.</td></tr>`;
    return;
  }

  lista.forEach(r => {
    const consumido = r.ESTADO === "CONSUMIDO";
    const puedeAuditar = idTipoUsuario === 1;
    const tr = document.createElement("tr");
    const advertencia = r.OBSERVACIONES_AUDITORIA ? `<i class="fas fa-triangle-exclamation audit-warning" title="${escaparAtributo(r.OBSERVACIONES_AUDITORIA)}"></i>` : "";

    tr.innerHTML = `
      <td title="${escaparAtributo(r.ITEM)}"><strong>${r.ITEM}</strong>${advertencia}</td>
      <td>${selectEstadoPanel(r)}</td>
      <td><input class="edit-tabla" type="number" value="${escaparAtributo(r.REQUISA || "")}" onchange="actualizarCampoTabla('${r.ITEM}','REQUISA',this.value)"></td>
      <td><input class="edit-tabla" type="date" value="${r.FECHA_CAMBIO || ""}" onchange="actualizarCampoTabla('${r.ITEM}','FECHA_CAMBIO',this.value)"></td>
      <td title="${escaparAtributo(r.CIRCUITO)}"><strong>${r.CIRCUITO || "-"}</strong></td>
      <td class="td-material" title="${escaparAtributo(r.NOMBRE_SOLICITADO)}">${r.NOMBRE_SOLICITADO || "-"}</td>
      <td class="td-direccion" title="${escaparAtributo(r.SITIO)}">${r.SITIO || "-"}</td>
      <td><input class="edit-tabla" type="number" value="${escaparAtributo(r.EVENTO || "")}" onchange="actualizarCampoTabla('${r.ITEM}','EVENTO',this.value)"></td>
      <td>
        <div class="acciones-td">
          <button class="btn-accion btn-solicitud" onclick="abrirSolicitudDesdeTabla('${r.ITEM}')" title="Solicitud"><i class="fas fa-clipboard-list"></i> Solicitud</button>
          <button class="btn-accion btn-excel-row" onclick="exportarExcelIndividual('${r.ITEM}')" title="Exportar Excel"><i class="fas fa-file-excel"></i></button>
          ${puedeAuditar ? `<button class="btn-accion btn-auditar" onclick="abrirModalAuditoria('${r.ITEM}')" title="Auditar"><i class="fas fa-magnifying-glass"></i></button>` : ""}
          <button class="btn-accion btn-eliminar ${consumido ? "btn-disabled" : ""}" onclick="eliminarSolicitud('${r.ITEM}')" title="Eliminar"><i class="fas fa-trash"></i></button>
        </div>
      </td>`;

    tbody.appendChild(tr);
  });
}

function selectEstadoPanel(r) {
  const cls = claseEstadoPanel(r.ESTADO);
  return `
    <select class="estado-panel-select ${cls}" onchange="cambiarEstadoPanel('${r.ITEM}', this.value)">
      <option value="SOLICITADO" ${r.ESTADO === "SOLICITADO" ? "selected" : ""}>SOLICITADO</option>
      <option value="REQUISADO" ${r.ESTADO === "REQUISADO" ? "selected" : ""}>REQUISADO</option>
      <option value="CONSUMIDO" ${r.ESTADO === "CONSUMIDO" ? "selected" : ""}>CONSUMIDO</option>
    </select>`;
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
    await obtenerDatosIniciales();
    cargarCombos();
    renderizarTabla();
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

  r[campo] = campo === "REQUISA" || campo === "EVENTO" ? String(valor || "").trim() : valor;
  r.USUARIO = usuarioActual;

  try {
    await apiPost({ action: "actualizarSolicitud", registro: r });
    await obtenerDatosIniciales();
    renderizarTabla();
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

function abrirModalSolicitud() {
  itemEditando = null;
  estadoAnteriorEditando = null;
  limpiarModalSolicitud();

  const nuevoItem = generarNuevoItemLocal();
  setValue("modoSolicitud", "NUEVO");
  setValue("item", nuevoItem);
  setValue("estado", "SOLICITADO");
  setValue("fechaSolicitud", obtenerFechaHoraActual());
  setValue("fechaCambio", "");
  setValue("gestionadoPor", usuarioActual);
  setValue("cantidadSolicitada", 1);
  setValue("tipoEvento", "");

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
  ["item", "fechaSolicitud", "fechaCambio", "reporte", "sitio", "codigoSolicitado", "cantidadSolicitada", "pintadoApoyo", "utmX", "utmY", "observaciones", "evento", "serie", "requisa", "cuadrilla"].forEach(id => setValue(id, ""));
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
  const partesUTM = obtenerPartesUTM(r);

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
  setValue("utmX", partesUTM.x);
  setValue("utmY", partesUTM.y);
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
  ["fechaCambio", "reporte", "circuito", "sitio", "nombreSolicitado", "cantidadSolicitada", "pintadoApoyo", "utmX", "utmY", "observaciones", "tipoEvento", "evento", "serie"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = bloquear;
  });

  const btnGps = document.querySelector(".btn-gps");
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
    UTM: textoUTMDesdeXY(getValue("utmX"), getValue("utmY")),
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
  if (error) return alert(error);

  const mat = obtenerMaterialPorCodigo(registro.CODIGO_SOLICITADO);
  if (!mat || mat.descripcion !== registro.NOMBRE_SOLICITADO) return alert("El material solicitado no coincide con la base de materiales.");


  if (btnGuardar) {
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Guardando...`;
  }

  try {
    await apiPost({ action: modo === "NUEVO" ? "guardarSolicitud" : "actualizarSolicitud", registro });
    await obtenerDatosIniciales();
    cargarCombos();
    cerrarModalSolicitud();
    renderizarTabla();
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
  if (!String(r.REPORTE || "").trim())
  return "Ingrese el reporte.";
  if (!r.CIRCUITO) return "Seleccione Circuito.";
  if (!r.SITIO) return "Ingrese Dirección.";
  if (!r.PINTADO_APOYO) return "Ingrese Apoyo.";
  if (!r.UTM_X || !r.UTM_Y) return "Ingrese Coordenadas UTM X y UTM Y.";
  if (!r.CODIGO_SOLICITADO) return "Seleccione Material Solicitado.";
  if (!r.NOMBRE_SOLICITADO) return "Seleccione Material Solicitado.";
  if (!r.CANTIDAD_SOLICITADA || Number(r.CANTIDAD_SOLICITADA) < 1 || Number(r.CANTIDAD_SOLICITADA) > 999) return "Cantidad solicitada debe ser entre 1 y 999.";
  return "";
}

async function eliminarSolicitud(item) {
  const r = datos.find(x => String(x.ITEM) === String(item));
  if (!r) return;
  if (r.ESTADO === "CONSUMIDO") return alert("No se puede eliminar una solicitud en estado CONSUMIDO.");
  if (!confirm("¿Desea eliminar esta solicitud?")) return;
  const confirmacion = prompt("Para eliminar escriba ELIMINAR");
  if (!confirmacion || confirmacion.toUpperCase().trim() !== "ELIMINAR") return alert("Eliminación cancelada.");

  try {
    await apiPost({ action: "eliminarSolicitud", item });
    await obtenerDatosIniciales();
    renderizarTabla();
  } catch (err) {
    alert("Error eliminando solicitud: " + err.message);
  }
}

function abrirModalAuditoria(item) {
  if (idTipoUsuario !== 1) return alert("No tiene permiso para auditar.");
  const r = datos.find(x => String(x.ITEM) === String(item));
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

  if (resultado === "CON ERRORES") box.classList.remove("disabled");
  else {
    box.classList.add("disabled");
    document.querySelectorAll(".obs-auditoria").forEach(chk => chk.checked = false);
  }
}

async function guardarAuditoria() {
  const item = getValue("auditoriaItem");
  const resultado = getValue("auditado");
  const seleccionadas = [...document.querySelectorAll(".obs-auditoria:checked")].map(x => x.value);
  if (resultado === "CON ERRORES" && !seleccionadas.length) return alert("Debe seleccionar al menos una observación de auditoría.");

  try {
    await apiPost({
      action: "guardarAuditoria",
      item,
      usuario: usuarioActual,
      resultado,
      observaciones: resultado === "CON ERRORES" ? seleccionadas.join(", ") : ""
    });
    await obtenerDatosIniciales();
    cerrarModalAuditoria();
    renderizarTabla();
  } catch (err) {
    alert("Error guardando auditoría: " + err.message);
  }
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
  const tab = document.querySelectorAll(".dash-tab")[tabs[tipo] || 0];
  if (tab) tab.classList.add("active");

  let titulo = "";
  let resumen = [];
  if (tipo === "postes") { titulo = "Postes consumidos por material"; resumen = agruparPorMaterial("POSTE"); }
  if (tipo === "transformadores") { titulo = "Transformadores consumidos por material"; resumen = agruparPorMaterial("TRANSFORMADOR"); }
  if (tipo === "postesCircuito") { titulo = "Postes consumidos por circuito"; resumen = agruparPorCircuito("POSTE"); }
  if (tipo === "transformadoresCircuito") { titulo = "Transformadores consumidos por circuito"; resumen = agruparPorCircuito("TRANSFORMADOR"); }
  if (tipo === "gestionado") { titulo = "Conteo de solicitudes por gestionado por"; resumen = agruparPorCampo(datos, "SOLICITADO_POR"); }

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
  return Object.keys(mapa).map(k => ({ descripcion: k, cantidad: mapa[k] })).sort((a, b) => b.cantidad - a.cantidad || a.descripcion.localeCompare(b.descripcion));
}

function renderizarTablaDashboard(resumen) {
  const tbody = document.getElementById("dashboardContenido");
  if (!tbody) return;
  if (!resumen.length) {
    tbody.innerHTML = `<tr><td colspan="2" class="text-center">Sin datos para mostrar.</td></tr>`;
    return;
  }
  tbody.innerHTML = resumen.map(r => `<tr><td><strong>${r.descripcion}</strong></td><td class="num">${r.cantidad}</td></tr>`).join("");
}

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
  if (mat && mat.categoria === "TRANSFORMADOR") serieBox.classList.remove("oculto");
  else {
    serieBox.classList.add("oculto");
    setValue("serie", "");
  }
}

function obtenerMaterialPorCodigo(codigo) {
  return materiales.find(m => String(m.codigo) === String(codigo));
}

async function buscarUTMPorApoyoManual() {
  const apoyo = getValue("pintadoApoyo");

  if (!apoyo) {
    alert("Ingrese el apoyo/pintado antes de buscar coordenadas.");
    return;
  }

  const actualX = getValue("utmX");
  const actualY = getValue("utmY");

  if ((actualX || actualY) && !confirm("Ya existen coordenadas registradas.\n\n¿Desea reemplazarlas?")) {
    return;
  }

  const btn = document.querySelector(".btn-gps");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
  }

  try {
    const data = await apiPost({ action: "buscarUTMPorApoyo", apoyo });

    if (!data.ok || (!data.utm_x && !data.utm_y && !data.UTM_X && !data.UTM_Y)) {
      alert(data.mensaje || "No se encontraron coordenadas para este apoyo.");
      return;
    }

    setValue("utmX", data.utm_x || data.UTM_X || "");
    setValue("utmY", data.utm_y || data.UTM_Y || "");

  } catch (err) {
    alert("Error buscando coordenadas: " + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-location-crosshairs"></i>`;
    }
  }
}

function obtenerPartesUTM(r) {
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
  const p = obtenerPartesUTM(r);
  return textoUTMDesdeXY(p.x, p.y);
}

function textoUTMDesdeXY(x, y) {
  const ux = String(x || "").trim();
  const uy = String(y || "").trim();

  if (ux && uy) return `${ux} - ${uy}`;
  if (ux) return ux;
  if (uy) return uy;
  return "";
}

function actualizarInfoModalSolicitud() {
  setText("infoSolicitudItem", getValue("item") || "-");
  setText("infoSolicitudUsuario", getValue("gestionadoPor") || usuarioActual || "-");
}

function exportarExcelIndividual(item) {
  const r = datos.find(x => String(x.ITEM) === String(item));
  if (!r) return alert("No se encontró la solicitud.");
  generarExcelSolicitudes([r], `Solicitud_${r.ITEM}.xlsx`);
}

function exportarExcelFiltrado() {
  const lista = obtenerDatosFiltrados();
  if (!lista.length) return alert("No hay solicitudes para exportar.");
  generarExcelSolicitudes(lista, "Solicitudes_Materiales.xlsx");
}

function generarExcelSolicitudes(lista, nombreArchivo) {
  if (typeof XLSX === "undefined") {
    alert("No se cargó la librería de Excel. Verifique conexión a internet.");
    return;
  }

  const encabezados = ["ITEM", "", "CODIGO SAP", "DESCRIPCION DEL MATERIAL", "SERIE", "UNIDAD DE\nMEDIDA", "CANTIDAD\nSOLICITADA", "CANTIDAD\nAPROBADA", "BODEGA", "", "REPORTE", "SITIO", "APOYO/PINTADO", "UBICACIÓN GPS (UTM)", "FECHA", "OBSERVACIONES"];
  const filas = lista.map((r, index) => {
    const mat = obtenerMaterialPorCodigo(r.CODIGO_SOLICITADO);
    return [
      r.ITEM || "", "", r.CODIGO_SOLICITADO || "", r.NOMBRE_SOLICITADO || "", r.SERIE || "",
      mat?.unidad || "UND", r.CANTIDAD_SOLICITADA || "", "", "", "", r.REPORTE || "", r.SITIO || "",
      r.PINTADO_APOYO || "", textoUTM(r), formatearFechaExcel(r.FECHA_CAMBIO), r.OBSERVACIONES || ""
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);
  ws["!cols"] = [
    { wch: 8 }, { wch: 3 }, { wch: 14 }, { wch: 36 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 24 }, { wch: 3 }, { wch: 14 }, { wch: 32 }, { wch: 18 }, { wch: 24 }, { wch: 14 }, { wch: 48 }
  ];
  ws["!rows"] = [{ hpt: 32 }, ...filas.map(() => ({ hpt: 27 }))];

  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const ref = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[ref]) ws[ref] = { t: "s", v: "" };
      const esColumnaVacia = C === 1 || C === 9;
      ws[ref].s = {
        font: { name: "Arial", sz: R === 0 ? 9 : 8, bold: R === 0, color: { rgb: "000000" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        fill: R === 0 && !esColumnaVacia ? { fgColor: { rgb: "D9EAF7" } } : { fgColor: { rgb: "FFFFFF" } },
        border: esColumnaVacia ? {} : {
          top: { style: "thin", color: { rgb: "000000" } }, bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } }, right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Solicitud");
  XLSX.writeFile(wb, nombreArchivo);
}

function generarNuevoItemLocal() {
  const hoy = new Date();
  const fecha = hoy.getFullYear().toString() + String(hoy.getMonth() + 1).padStart(2, "0") + String(hoy.getDate()).padStart(2, "0");
  const itemsHoy = datos.filter(x => String(x.ITEM).startsWith(fecha)).map(x => Number(String(x.ITEM).slice(-3)) || 0);
  const consecutivo = itemsHoy.length ? Math.max(...itemsHoy) + 1 : 1;
  return fecha + String(consecutivo).padStart(3, "0");
}

function obtenerFechaActual() {
  return new Date().toISOString().split("T")[0];
}

function obtenerFechaHoraActual() {
  return new Date().toLocaleString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
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

function normalizar(valor) { return (valor || "").toString().trim().toUpperCase(); }
function mayus(valor) { return (valor || "").toString().trim().toUpperCase(); }
function escaparAtributo(valor) { return (valor || "").toString().replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function getValue(id, def = "") { const el = document.getElementById(id); return el ? el.value : def; }
function setValue(id, value) { const el = document.getElementById(id); if (el) el.value = value; }
function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
function addListener(id, eventName, fn) { const el = document.getElementById(id); if (el) el.addEventListener(eventName, fn); }

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = "index.html";
}
