(() => {
  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));

  // Reduced motion support
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year
  const y = new Date().getFullYear();
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(y);

  // Theme toggle (persist)
  const themeBtn = $("#themeBtn");
  const saved = localStorage.getItem("dz_theme");
  if (saved === "light") document.documentElement.setAttribute("data-theme", "light");
  updateThemeIcon();

  themeBtn?.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("dz_theme", isLight ? "dark" : "light");
    updateThemeIcon();
    toast(isLight ? "Tema oscuro activado" : "Tema claro activado");
  });

  function updateThemeIcon(){
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (themeBtn) themeBtn.querySelector(".iconbtn__icon").textContent = isLight ? "☀" : "☾";
  }

  // Mobile menu (simple overlay)
  const menuBtn = $("#menuBtn");
  let menuOpen = false;
  menuBtn?.addEventListener("click", () => {
    menuOpen = !menuOpen;
    if (menuOpen) openMenu();
    else closeMenu();
  });

  function openMenu(){
    const overlay = document.createElement("div");
    overlay.id = "overlayMenu";
    overlay.innerHTML = `
      <div class="overlay__panel" role="dialog" aria-label="Menú">
        <div class="overlay__head">
          <div style="font-weight:900;letter-spacing:-.2px">Menú</div>
          <button id="overlayClose" class="iconbtn" type="button" aria-label="Cerrar">×</button>
        </div>
        <div class="overlay__links">
          ${["perfil","habilidades","experiencia","educacion","proyectos","certificados","contacto"].map(id=>(
            `<a href="#${id}" class="overlay__a">${id.charAt(0).toUpperCase()+id.slice(1)}</a>`
          )).join("")}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // styles injected for overlay only
    const style = document.createElement("style");
    style.id = "overlayStyle";
    style.textContent = `
      #overlayMenu{
        position:fixed; inset:0; z-index:70;
        background: rgba(0,0,0,.45);
        backdrop-filter: blur(10px);
        display:flex; align-items:flex-start; justify-content:center;
        padding: 80px 16px 16px;
      }
      .overlay__panel{
        width:min(520px,100%);
        border:1px solid rgba(255,255,255,0.16);
        background: rgba(10,12,22,0.55);
        border-radius: 18px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        padding: 14px;
      }
      [data-theme="light"] .overlay__panel{ background: rgba(255,255,255,0.75); }
      .overlay__head{ display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px; }
      .overlay__links{ display:grid; gap:8px; }
      .overlay__a{
        border:1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.04);
        padding: 12px 12px;
        border-radius: 14px;
        font-weight: 800;
        text-transform: capitalize;
      }
    `;
    document.head.appendChild(style);

    $("#overlayClose")?.addEventListener("click", closeMenu);
    $$(".overlay__a", overlay).forEach(a => a.addEventListener("click", closeMenu));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeMenu(); });
    toast("Menú abierto");
  }

  function closeMenu(){
    menuOpen = false;
    $("#overlayMenu")?.remove();
    $("#overlayStyle")?.remove();
  }

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    for (const e of entries){
      if (e.isIntersecting){
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });

  $$(".reveal").forEach(el => io.observe(el));

  // Copy to clipboard
  $$("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const value = btn.getAttribute("data-copy") || "";
      try{
        await navigator.clipboard.writeText(value);
        toast("Copiado: " + value);
      }catch{
        toast("No se pudo copiar (permiso del navegador)");
      }
    });
  });

  // Typing effect (subtle)
  const typeTarget = $("#typeTarget");
  const phrases = [
    "Construyendo soluciones tecnológicas",
    "Enfoque en calidad y escalabilidad",
    "APIs, datos y experiencia de usuario",
    "Trabajo ágil con Scrum y sprints"
  ];
  if (typeTarget){
    let i=0, j=0, deleting=false;
    const tick = () => {
      const full = phrases[i];
      if (!deleting){
        j++;
        typeTarget.textContent = full.slice(0, j);
        if (j >= full.length){
          deleting = true;
          setTimeout(tick, 1000);
          return;
        }
      } else {
        j--;
        typeTarget.textContent = full.slice(0, j);
        if (j <= 0){
          deleting = false;
          i = (i + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 28 : 34);
    };
    tick();
  }

  // Contact form: generate mailto
  const form = $("#contactForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();
    const subject = encodeURIComponent(`Contacto desde portafolio — ${name}`);
    const body = encodeURIComponent(
`Hola Danny,

Mi nombre es ${name} (${email}).

${message}

Saludos.`
    );
    const to = "danny.zambrana.sanabria@gmail.com";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    toast("Abriendo tu cliente de correo…");
  });

  // Print
  $("#printBtn")?.addEventListener("click", () => {
    toast("Generando vista de impresión…");
    window.print();
  });

  // Download button feedback
  document.querySelectorAll(".btn--download").forEach(a => {
    a.addEventListener("click", () => {
      // allow download to proceed
      // show feedback
      const el = document.getElementById("toast");
      if (el){
        el.textContent = "Descargando PDF…";
        el.classList.add("is-on");
        setTimeout(() => el.classList.remove("is-on"), 1400);
      }
    });
  });

  // Toast test
  $("#toastTest")?.addEventListener("click", (e) => {
    e.preventDefault();
    toast("Sitio listo para GitHub Pages ✅");
  });

  // Toast helper
  let toastTimer;
  function toast(msg){
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-on"), 2200);
  }
})();