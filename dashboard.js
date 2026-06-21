/************************************************************
 * APP SOLICITUD DE MATERIALES - dashboard.js
 * Panel principal editable + exportacion Excel + modal moderno
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
    { codigo: 130005, descripcion: "POSTE MADERA CLASE 5 30ft", unidad: "UND", categoria: "POSTE", tipo: "MADERA" },
    { codigo: 130006, descripcion: "POSTE MADERA CLASE 5 35ft", unidad: "UND", categoria: "POSTE", tipo: "MADERA" },
    { codigo: 130007, descripcion: "POSTE MADERA CLASE 4 40ft", unidad: "UND", categoria: "POSTE", tipo: "MADERA" },
    { codigo: 130012, descripcion: "POSTE METALICO SECCIONADO 35FT X500LB/F", unidad: "UND", categoria: "POSTE", tipo: "METALICO" },
    { codigo: 130004, descripcion: "POSTE CONCRETO VIB/CFU 30ft - 9m x450kg", unidad: "UND", categoria: "POSTE", tipo: "CONCRETO" },
    { codigo: 130028, descripcion: "POSTE DE FIBRA DE VIDRIO 35 PIES", unidad: "UND", categoria: "POSTE", tipo: "FIBRA" },
    { codigo: 70021, descripcion: "TRANSFORMADOR 15kVa 19.9/34.5kV-120/240V", unidad: "UND", categoria: "TRANSFORMADOR", tipo: "TS NUEVO 34.5KV" },
    { codigo: 70022, descripcion: "TRANSFORMADOR 25kVa19.9/34.5kV-120/240V", unidad: "UND", categoria: "TRANSFORMADOR", tipo: "TS NUEVO 34.5KV" },
    { codigo: 70024, descripcion: "TRANSFORMADOR 50kVa 19.9/34.5kV-120/240V", unidad: "UND", categoria: "TRANSFORMADOR", tipo: "TS NUEVO 34.5KV" },
    { codigo: 99000018, descripcion: "TRAFO URE 25kVA 19,9/34.5kV 120/240V", unidad: "UND", categoria: "TRANSFORMADOR", tipo: "TS URE 34.5KV" }
  ];

  datos = [
    {
      ITEM: "20260618003", ESTADO: "CONSUMIDO", FECHA_CAMBIO: "2026-06-18",
      TIPO_EVENTO: "INCIDENCIA", EVENTO: "14243", REPORTE: "3917965",
      CIRCUITO: "CAT-L375", SITIO: "COL. PALMIRA, CATACAMAS",
      PINTADO_APOYO: "7157711", UTM: "618878 - 1639784",
      CODIGO_SOLICITADO: 130005, NOMBRE_SOLICITADO: "POSTE MADERA CLASE 5 30ft", CANTIDAD_SOLICITADA: 1,
      SERIE: "", OBSERVACIONES: "CAMBIO DE POSTE MADERA 30 FT EN COL. PALMIRA",
      SOLICITADO_POR: "ALLAN.ZELAYA", FECHA_SOLICITUD: "18/06/2026 08:00",
      REQUISADO_POR: "OSMAN.LAGOS", CONSUMIDO_POR: "ALLAN.ZELAYA",
      AUDITADO: "CON ERRORES", OBSERVACIONES_AUDITORIA: "REQUISA, GPS", FECHA_AUDITADO: "18/06/2026 10:00",
      REQUISA: "2865", CUADRILLA: "CUADRILLA 48", USUARIO: "ALLAN.ZELAYA", SECTOR: "JUTICALPA"
    },
    {
      ITEM: "20260618002", ESTADO: "REQUISADO", FECHA_CAMBIO: "2026-06-18",
      TIPO_EVENTO: "MANTENIMIENTO", EVENTO: "14244", REPORTE: "3917998",
      CIRCUITO: "CAT-L376", SITIO: "ALDEA EL AGUACATE, CATACAMAS",
      PINTADO_APOYO: "7157722", UTM: "618000 - 1639000",
      CODIGO_SOLICITADO: 70022, NOMBRE_SOLICITADO: "TRANSFORMADOR 25kVa19.9/34.5kV-120/240V", CANTIDAD_SOLICITADA: 1,
      SERIE: "ABC123", OBSERVACIONES: "CAMBIO DE TRANSFORMADOR POR DAÑO",
      SOLICITADO_POR: "OSMAN.LAGOS", FECHA_SOLICITUD: "18/06/2026 08:20",
      REQUISADO_POR: "OSMAN.LAGOS", CONSUMIDO_POR: "",
      AUDITADO: "", OBSERVACIONES_AUDITORIA: "", FECHA_AUDITADO: "",
      REQUISA: "2866", CUADRILLA: "CUADRILLA 49", USUARIO: "OSMAN.LAGOS", SECTOR: "JUTICALPA"
    },
    {
      ITEM: "20260618001", ESTADO: "SOLICITADO", FECHA_CAMBIO: "2026-06-18",
      TIPO_EVENTO: "OPERACIÓN", EVENTO: "14245", REPORTE: "3918005",
      CIRCUITO: "JUT-L379", SITIO: "BARRIO EL CENTRO, JUTICALPA",
      PINTADO_APOYO: "7157755", UTM: "619000 - 1639500",
      CODIGO_SOLICITADO: 130004, NOMBRE_SOLICITADO: "POSTE CONCRETO VIB/CFU 30ft - 9m x450kg", CANTIDAD_SOLICITADA: 2,
      SERIE: "", OBSERVACIONES: "CAMBIO DE DOS POSTES DE CONCRETO",
      SOLICITADO_POR: "ALLAN.ZELAYA", FECHA_SOLICITUD: "18/06/2026 08:40",
      REQUISADO_POR: "", CONSUMIDO_POR: "",
      AUDITADO: "SIN ERRORES", OBSERVACIONES_AUDITORIA: "", FECHA_AUDITADO: "18/06/2026 09:10",
      REQUISA: "", CUADRILLA: "CUADRILLA 50", USUARIO: "ALLAN.ZELAYA", SECTOR: "JUTICALPA"
    }
  ];
}

function cargarCombos() {
  llenarSelect("filtroCircuito", circuitos, true);
  llenarSelect("filtroGestionado", ingenieros, true);
  llenarSelect("circuito", circuitos, false);
  cargarComboMateriales("nombreSolicitado");

  addListener("nombreSolicitado", "change", seleccionarMaterialPorNombre);
  addListener("nombreSolicitado", "change", mostrarSerieSegunMaterial);
  addListener("pintadoApoyo", "input", buscarUTMSimulado);
  addListener("fechaCambio", "change", actualizarInfoModalSolicitud);
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
    const cumpleGestionado = gestionado === "ALL" || r.SOLICITADO_POR === gestionado || r.USUARIO === gestionado;
    const cumpleDireccion = !direccion || normalizar(r.SITIO).includes(direccion) || normalizar(r.OBSERVACIONES).includes(direccion) || normalizar(r.NOMBRE_SOLICITADO).includes(direccion);
    const cumpleFechaDesde = !fechaDesde || (r.FECHA_CAMBIO || "") >= fechaDesde;
    const cumpleFechaHasta = !fechaHasta || (r.FECHA_CAMBIO || "") <= fechaHasta;
    return cumpleItem && cumpleReporte && cumpleCircuito && cumpleEvento && cumpleTipoEvento && cumpleRequisa && cumpleEstado && cumpleGestionado && cumpleDireccion && cumpleFechaDesde && cumpleFechaHasta;
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
    tbody.innerHTML = `<tr><td colspan="9" class="text-center">No hay registros para mostrar.</td></tr>`;
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
      <td title="${escaparAtributo(r.ITEM)}"><strong>${r.ITEM}</strong>${advertencia}</td>
      <td>${selectEstadoPanel(r)}</td>
      <td><input class="cell-input" type="number" value="${escaparAtributo(r.REQUISA || "")}" onchange="actualizarCampoTabla('${r.ITEM}','REQUISA',this.value)" title="Requisa"></td>
      <td><input class="cell-date" type="date" value="${escaparAtributo(r.FECHA_CAMBIO || "")}" onchange="actualizarCampoTabla('${r.ITEM}','FECHA_CAMBIO',this.value)"></td>
      <td title="${escaparAtributo(r.CIRCUITO || "")}"><strong>${r.CIRCUITO || "-"}</strong></td>
      <td title="${escaparAtributo(r.NOMBRE_SOLICITADO || "")}">${r.NOMBRE_SOLICITADO || "-"}</td>
      <td title="${escaparAtributo(r.SITIO || "")}">${r.SITIO || "-"}</td>
      <td><input class="cell-input" type="number" value="${escaparAtributo(r.EVENTO || "")}" onchange="actualizarCampoTabla('${r.ITEM}','EVENTO',this.value)" title="Evento"></td>
      <td>
        <div class="acciones-td">
          <button class="btn-solicitud" onclick="editarSolicitud('${r.ITEM}')" title="Editar / Ver Solicitud"><i class="fas fa-clipboard-list"></i> Solicitud</button>
          <button class="btn-icon-tabla btn-excel-row" onclick="exportarSolicitudIndividual('${r.ITEM}')" title="Exportar solicitud individual"><i class="fas fa-file-excel"></i></button>
          ${puedeAuditar ? `<button class="btn-icon-tabla btn-auditar" onclick="abrirModalAuditoria('${r.ITEM}')" title="Auditar"><i class="fas fa-magnifying-glass"></i></button>` : ""}
          <button class="btn-icon-tabla btn-eliminar ${consumido ? "btn-disabled" : ""}" onclick="eliminarSolicitud('${r.ITEM}')" title="Eliminar"><i class="fas fa-trash"></i></button>
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

function cambiarEstadoPanel(item, nuevoEstado) {
  const r = datos.find(x => x.ITEM === item);
  if (!r || r.ESTADO === nuevoEstado) return;

  if (nuevoEstado === "REQUISADO" && !String(r.REQUISA || "").trim()) {
    alert("Para cambiar a REQUISADO debe llenar primero el campo REQUISA.");
    renderizarTabla();
    return;
  }

  const msg = nuevoEstado === "CONSUMIDO"
    ? "¿Desea cambiar esta solicitud a CONSUMIDO?\n\nDespués de confirmar, la solicitud quedará cerrada para eliminación."
    : `¿Desea cambiar el estado a ${nuevoEstado}?`;

  if (!confirm(msg)) {
    renderizarTabla();
    return;
  }

  r.ESTADO = nuevoEstado;
  if (nuevoEstado === "REQUISADO") r.REQUISADO_POR = usuarioActual;
  if (nuevoEstado === "CONSUMIDO") r.CONSUMIDO_POR = usuarioActual;
  renderizarTabla();
}

function actualizarCampoTabla(item, campo, valor) {
  const r = datos.find(x => x.ITEM === item);
  if (!r) return;

  let nuevo = String(valor || "").trim();
  if (campo === "EVENTO" || campo === "REQUISA") {
    nuevo = nuevo.replace(/\D/g, "").slice(0, campo === "REQUISA" ? 10 : 12);
  }

  if (campo === "FECHA_CAMBIO") {
    if (!nuevo) {
      alert("La fecha de cambio no puede quedar vacía.");
      renderizarTabla();
      return;
    }
    if (!confirm("¿Desea modificar la fecha de cambio?")) {
      renderizarTabla();
      return;
    }
  }

  if (campo === "EVENTO" && !confirm("¿Desea modificar el evento?")) {
    renderizarTabla();
    return;
  }

  if (campo === "REQUISA" && r.ESTADO === "REQUISADO" && !nuevo) {
    alert("No puede borrar la requisa si la solicitud está en estado REQUISADO.");
    renderizarTabla();
    return;
  }

  r[campo] = nuevo;
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

  actualizarInfoModalSolicitud();
  mostrarSerieSegunMaterial();
  bloquearModalSolicitud(false);
  document.getElementById("modalSolicitud").classList.add("abierto");
}

function cerrarModalSolicitud() {
  document.getElementById("modalSolicitud").classList.remove("abierto");
}

function limpiarModalSolicitud() {
  ["item", "fechaSolicitud", "fechaCambio", "reporte", "sitio", "codigoSolicitado", "cantidadSolicitada", "pintadoApoyo", "utm", "observaciones", "evento", "serie", "requisa", "cuadrilla"].forEach(id => setValue(id, ""));
  setValue("estado", "SOLICITADO");
  setValue("tipoEvento", "INCIDENCIA");
  setValue("nombreSolicitado", "");
  mostrarSerieSegunMaterial();
}

function editarSolicitud(item) {
  const r = datos.find(x => x.ITEM === item);
  if (!r) return;
  itemEditando = item;
  estadoAnteriorEditando = r.ESTADO;
  cargarRegistroEnModal(r, r.ESTADO === "CONSUMIDO");
  document.getElementById("modalSolicitud").classList.add("abierto");
}

function cargarRegistroEnModal(r, soloLectura) {
  setValue("modoSolicitud", soloLectura ? "VER" : "EDITAR");
  setValue("item", r.ITEM);
  setValue("gestionadoPor", r.SOLICITADO_POR || r.USUARIO || usuarioActual);
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

  actualizarInfoModalSolicitud();
  mostrarSerieSegunMaterial();
  bloquearModalSolicitud(soloLectura);
}

function bloquearModalSolicitud(bloquear) {
  const campos = ["fechaCambio", "reporte", "circuito", "sitio", "nombreSolicitado", "cantidadSolicitada", "pintadoApoyo", "utm", "observaciones", "tipoEvento", "evento", "serie"];
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

  seleccionarMaterialPorNombre();

  const item = getValue("item");
  const nuevoEstado = getValue("estado", "SOLICITADO");
  const registro = {
    ITEM: item,
    ESTADO: nuevoEstado,
    FECHA_CAMBIO: getValue("fechaCambio"),
    TIPO_EVENTO: getValue("tipoEvento"),
    EVENTO: getValue("evento"),
    REPORTE: getValue("reporte"),
    CIRCUITO: getValue("circuito"),
    SITIO: mayus(getValue("sitio")),
    PINTADO_APOYO: getValue("pintadoApoyo"),
    UTM: getValue("utm"),
    CODIGO_SOLICITADO: Number(getValue("codigoSolicitado") || 0),
    NOMBRE_SOLICITADO: getValue("nombreSolicitado"),
    CANTIDAD_SOLICITADA: Number(getValue("cantidadSolicitada") || 1),
    SERIE: mayus(getValue("serie")),
    OBSERVACIONES: mayus(getValue("observaciones")),
    SOLICITADO_POR: getValue("gestionadoPor") || usuarioActual,
    FECHA_SOLICITUD: getValue("fechaSolicitud") || obtenerFechaHoraActual(),
    REQUISADO_POR: "",
    CONSUMIDO_POR: "",
    AUDITADO: "",
    OBSERVACIONES_AUDITORIA: "",
    FECHA_AUDITADO: "",
    REQUISA: getValue("requisa"),
    CUADRILLA: getValue("cuadrilla"),
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
    if (modo === "NUEVO") {
      datos.push(registro);
    } else {
      const idx = datos.findIndex(x => x.ITEM === itemEditando);
      if (idx >= 0) {
        registro.ESTADO = datos[idx].ESTADO || registro.ESTADO;
        registro.REQUISA = datos[idx].REQUISA || registro.REQUISA;
        registro.REQUISADO_POR = datos[idx].REQUISADO_POR || "";
        registro.CONSUMIDO_POR = datos[idx].CONSUMIDO_POR || "";
        registro.AUDITADO = datos[idx].AUDITADO || "";
        registro.OBSERVACIONES_AUDITORIA = datos[idx].OBSERVACIONES_AUDITORIA || "";
        registro.FECHA_AUDITADO = datos[idx].FECHA_AUDITADO || "";
        datos[idx] = registro;
      }
    }
    cerrarModalSolicitud();
    renderizarTabla();
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
  if (!r.UTM) return "Ingrese Coordenadas UTM.";
  if (!r.CODIGO_SOLICITADO) return "Seleccione Material Solicitado.";
  if (!r.NOMBRE_SOLICITADO) return "Seleccione Material Solicitado.";
  if (!r.CANTIDAD_SOLICITADA || r.CANTIDAD_SOLICITADA < 1 || r.CANTIDAD_SOLICITADA > 999) return "Cantidad solicitada debe ser entre 1 y 999.";
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
  r.AUDITADO = usuarioActual;
  r.OBSERVACIONES_AUDITORIA = resultado === "CON ERRORES" ? seleccionadas.join(", ") : "SIN ERRORES";
  r.FECHA_AUDITADO = obtenerFechaHoraActual();
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
  if (tipo === "gestionado") { titulo = "Conteo de solicitudes por solicitado por"; resumen = agruparPorCampo(datos, "SOLICITADO_POR"); }
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

function actualizarInfoModalSolicitud() {
  setText("infoSolicitudItem", getValue("item") || "-");
  setText("infoSolicitudUsuario", getValue("gestionadoPor") || usuarioActual || "-");
}

function exportarExcelIndividual(item) {
  const r = datos.find(x => String(x.ITEM) === String(item));
  if (!r) {
    alert("No se encontró la solicitud.");
    return;
  }

  generarExcelSolicitudes([r], `Solicitud_${r.ITEM}.xlsx`);
}

function exportarExcelFiltrado() {
  const lista = obtenerDatosFiltrados();

  if (!lista.length) {
    alert("No hay solicitudes para exportar.");
    return;
  }

  generarExcelSolicitudes(lista, "Solicitudes_Materiales.xlsx");
}

function generarExcelSolicitudes(lista, nombreArchivo) {
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

  const filas = lista.map((r, index) => {
    const mat = obtenerMaterialPorCodigo(r.CODIGO_SOLICITADO);
    return [
      index + 1,
      "",
      r.CODIGO_SOLICITADO || "",
      r.NOMBRE_SOLICITADO || "",
      r.SERIE || "",
      mat?.unidad || "UND",
      r.CANTIDAD_SOLICITADA || "",
      "",
      "",
      "",
      r.REPORTE || "",
      r.SITIO || "",
      r.PINTADO_APOYO || "",
      r.UTM || "",
      formatearFechaExcel(r.FECHA_CAMBIO),
      r.OBSERVACIONES || ""
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);

  ws["!cols"] = [
    { wch: 8 },   // ITEM
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

function formatearFechaExcel(fecha) {
  if (!fecha) return "";
  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;
  return `${Number(partes[2])}/${Number(partes[1])}/${partes[0]}`;
}

function generarNuevoItem() {
  const hoy = new Date();
  const fecha = hoy.getFullYear().toString() + String(hoy.getMonth() + 1).padStart(2, "0") + String(hoy.getDate()).padStart(2, "0");
  const itemsHoy = datos.filter(x => String(x.ITEM).startsWith(fecha)).map(x => Number(String(x.ITEM).slice(-3)));
  const consecutivo = itemsHoy.length === 0 ? 1 : Math.max(...itemsHoy) + 1;
  return fecha + String(consecutivo).padStart(3, "0");
}

function obtenerFechaActual() {
  return new Date().toISOString().split("T")[0];
}

function obtenerFechaHoraActual() {
  const f = new Date();
  return f.toLocaleString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatearFecha(fecha) {
  if (!fecha) return "";
  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function claseEstadoPanel(estado) {
  if (estado === "SOLICITADO") return "solicitado";
  if (estado === "REQUISADO") return "requisado";
  if (estado === "CONSUMIDO") return "consumido";
  return "";
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

function escaparHtml(valor) {
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

function sincronizarDatos() {
  alert("Modo prueba: datos sincronizados localmente.");
  renderizarTabla();
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = "index.html";
}
