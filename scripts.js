const G = (id) => document.getElementById(id);
const carta = G("carta");
let fidelityMode = "none"; // Modos estables: none, promo, stamps

// ── SECCIONES COLAPSABLES ──
function toggleSec(id) {
  const s = G(id);
  s.classList.toggle("open");
  s.querySelector(".sec-body").classList.toggle("hidden");
}

// Arrancar con el panel desplegado de forma limpia
document.querySelectorAll(".sec-body").forEach((b) => b.classList.remove("hidden"));

// ── CONTROL DE VISIBILIDAD DE FECHA ──
function toggleIt(el) {
  el.classList.toggle("on");
  render();
}
function isOn(id) {
  return G(id).classList.contains("on");
}

// ── SELECTOR DE MÓDULO DE RECOMPENSA ──
function changeFidelity(mode) {
  fidelityMode = mode;
  
  // Limpieza de estados activos en los botones del panel
  document.querySelectorAll('.liq-btn').forEach(btn => btn.classList.remove('active'));
  G(`btn-fid-${mode}`).classList.add('active');

  // Conmutación limpia de contenedores de configuración
  G('box-fid-promo').style.display = mode === 'promo' ? 'block' : 'none';
  G('box-fid-stamps').style.display = mode === 'stamps' ? 'block' : 'none';

  render();
}

// ── CONMUTADOR DE PALETA DE PAPEL ──
document.querySelectorAll(".th").forEach((th) => {
  th.addEventListener("click", () => {
    document.querySelectorAll(".th").forEach((t) => t.classList.remove("on"));
    th.classList.add("on");
    carta.dataset.t = th.dataset.t;
    render();
  });
});

// ── CONFIGURACIÓN REGIONAL DE FECHA ──
function fmtDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const ms = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${parseInt(d)} de ${ms[parseInt(m) - 1]} de ${y}`;
}

// ── MOTOR DE RENDERIZACIÓN DE DOCUMENTO ──
function render() {
  // Transferencia de textos base
  G("p-brand").textContent = G("f-brand").value || "Empresa";
  G("p-pre").textContent = G("f-pre").value || "";
  
  const n = G("f-nombre").value.trim();
  G("p-nombre").innerHTML = n ? `<em>${n}</em>` : "<em>—</em>";
  G("p-msg").textContent = G("f-msg").value || "";
  G("p-tag").textContent = G("f-tag").value ? `"${G("f-tag").value}"` : "";
  G("p-firma").textContent = G("f-firma").value || "";

  // Procesamiento de Fecha de Emisión
  const sf = isOn("tog-fecha");
  G("p-date-wrap").style.display = sf ? "" : "none";
  G("p-fecha").textContent = fmtDate(G("f-fecha").value);
  G("f-fecha").style.opacity = sf ? 1 : 0.3;
  G("f-fecha").style.pointerEvents = sf ? "auto" : "none";

  // Procesamiento de Nota Aclaratoria
  const nv = G("f-nota").value.trim();
  const ne = G("p-nota");
  if (nv) {
    ne.style.display = "block";
    ne.textContent = nv;
  } else {
    ne.style.display = "none";
  }

  // ── GENERACIÓN DINÁMICA DEL MÓDULO DE FIDELIDAD ──
  const pFidelity = G("p-fidelity");
  if (fidelityMode === "none") {
    pFidelity.style.display = "none";
    pFidelity.innerHTML = "";
  } 
  else if (fidelityMode === "promo") {
    pFidelity.style.display = "flex";
    const promoCode = G("f-promo").value.trim().toUpperCase() || "BENEFICIO";
    pFidelity.innerHTML = `
      <div class="c-fid-title">Código de beneficio exclusivo:</div>
      <div class="c-fid-code">${promoCode}</div>
    `;
  } 
  else if (fidelityMode === "stamps") {
    pFidelity.style.display = "flex";
    const totalStamps = parseInt(G("f-stamps").value) || 0;
    
    let stampsContainerHtml = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= totalStamps) {
        // Marcador corporativo sobrio (Número)
        stampsContainerHtml += `<div class="c-fid-stamp-circle filled">${i}</div>`;
      } else {
        // Marcador libre
        stampsContainerHtml += `<div class="c-fid-stamp-circle"></div>`;
      }
    }
    
    pFidelity.innerHTML = `
      <div class="c-fid-title">Estatus de consumos acumulados (${totalStamps} de 5)</div>
      <div class="c-fid-stamps">${stampsContainerHtml}</div>
    `;
  }

  // ── MÓDULO DE CONTACTO Y ENLACES (LIQUID MODE AUTOMÁTICO) ──
  const socialNetworks = [
    { inputId: "f-ig", prefix: "Instagram: " },
    { inputId: "f-tt", prefix: "TikTok: " },
    { inputId: "f-wa", prefix: "WhatsApp: " },
    { inputId: "f-web", prefix: "" },
    { inputId: "f-fb", prefix: "Facebook: " },
    { inputId: "f-mail", prefix: "Email: " }
  ];
  
  const elSocials = G("p-socials");
  elSocials.innerHTML = "";
  
  socialNetworks.forEach((net) => {
    const inputVal = G(net.inputId).value.trim();
    if (inputVal) {
      const p = document.createElement("div");
      p.className = "c-soc-pill v-social";
      p.textContent = `${net.prefix}${inputVal}`;
      elSocials.appendChild(p);
    }
  });
  elSocials.style.display = elSocials.children.length ? "flex" : "none";
}

// ── CONTROLADOR DE EXPORTACIÓN A IMAGEN ──
G("btn-exp").addEventListener("click", async () => {
  const btn = G("btn-exp");
  btn.textContent = "Procesando archivo…";
  btn.classList.add("busy");
  await document.fonts.ready;
  const c = await html2canvas(carta, {
    scale: 3, // Calidad de imprenta profesional
    useCORS: true,
    backgroundColor: null,
    logging: false,
  });
  const a = document.createElement("a");
  a.download = `documento_${(G("f-nombre").value || "cliente").toLowerCase().replace(/\s+/g, "_")}.png`;
  a.href = c.toDataURL("image/png");
  a.click();
  btn.textContent = "Descargar Documento (PNG)";
  btn.classList.remove("busy");
});

// ── REINICIO DE VALORES ──
G("btn-rst").addEventListener("click", () => {
  if (!confirm("¿Desea restablecer todos los campos a sus valores de fábrica?")) return;
  G("f-brand").value = "Neoclub";
  G("f-tag").value = "Transformamos ideas en piezas reales";
  G("f-firma").value = "El equipo Neoclub";
  G("f-pre").value = "Gracias por tu confianza,";
  G("f-nombre").value = "Andrea";
  G("f-fecha").value = new Date().toISOString().slice(0, 10);
  G("f-msg").value = "Cada pieza que hacemos lleva nuestra dedicación completa. Esperamos que la tuya supere tus expectativas y que pronto traigas una nueva idea para darle vida.";
  G("f-nota").value = "";
  G("f-promo").value = "PRIMERADE5";
  G("f-stamps").value = "4";
  G("f-ig").value = "@neoclub.mx";
  G("f-tt").value = "";
  G("f-wa").value = "+52 311 000 0000";
  G("f-web").value = "neoclub.mx";
  G("f-fb").value = "";
  G("f-mail").value = "";
  
  const tFecha = G("tog-fecha");
  if (!tFecha.classList.contains("on")) tFecha.classList.add("on");

  document.querySelectorAll(".th").forEach((t) => t.classList.remove("on"));
  document.querySelector('.th[data-t="ivory"]').classList.add("on");
  carta.dataset.t = "ivory";
  
  changeFidelity("none");
});

// ── CAPTURA DE EVENTOS EN TIEMPO REAL ──
document.querySelectorAll("input, textarea, select").forEach((el) => {
  el.addEventListener("input", render);
});

// Carga de fecha inicial de servidor local
G("f-fecha").value = new Date().toISOString().slice(0, 10);

// Ejecución del renderizado inicial
render();