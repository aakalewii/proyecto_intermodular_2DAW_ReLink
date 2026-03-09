/* =========================================================
   Funciones base del proyecto:
   - Selectores rápidos
   - Normalización de texto
   - Conversión de precios
   - Gestión de localStorage
   - Toasts (notificaciones)
   - Sistema de idiomas (i18n)
   ========================================================= */

/* IIFE (Immediately Invoked Function Expression)
   ------------------------------------------------
   Encapsula el código y evita contaminar el scope global. 
   Simplemente ejecuta la función inmediatamente y mantiene las variables dentro.
*/
(() => {

  /* Namespace RL
     Crea un objeto global ReLink donde guardamos todas las funciones. 
  */
  const RL = (window.ReLink = window.ReLink || {});

  /* Selectores rápidos
     ------------------------------------------------
  */
  RL.$ = (s, r = document) => r.querySelector(s);
  RL.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* Normalizar texto
     ------------------------------------------------
     Quita acentos, espacios extra, mayúsculas…
  */
  RL.normalize = (s) =>
    (s || "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")                // Separa caracteres y acentos
      .replace(/[\u0300-\u036f]/g, ""); // elimina acentos

  /* Crear slugs (urls amigables)
     ------------------------------------------------ */
  RL.slugify = (s) =>
    RL.normalize(s)
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  /* Evitar inyección HTML
     ------------------------------------------------
     Reemplaza < y > para evitar que el usuario meta HTML.
  */
  RL.safeText = (s) => String(s ?? "").replace(/[<>]/g, "");

  /* Convertir texto con € a número
     ------------------------------------------------ */
  RL.eurosToNumber = (text) => {
    const n = (text || "").toString().replace(/[^\d,.-]/g, "").replace(",", ".");
    const v = Number(n);
    return Number.isFinite(v) ? v : 0;
  };

  /* Mostrar/ocultar elementos
     ------------------------------------------------
     Usa hidden + display:none + clase CSS.
  */
  RL.setHidden = (el, hide) => {
    if (!el) return;
    el.toggleAttribute("hidden", hide);
    el.classList.toggle("is-hidden", hide);
    el.style.display = hide ? "none" : "";
  };

  /* Validar URLs
     ------------------------------------------------
    Usa el constructor URL para validar.
  */
  RL.safeUrl = (url) => {
    try {
      const u = new URL(url);
      const ok = ["http:", "https:", "data:", "blob:"].includes(u.protocol);
      return ok ? u.href : "";
    } catch {
      return "";
    }
  };

  /* Claves de localStorage
     ------------------------------------------------ */
  RL.KEYS = {
    USERS: "relink:users",
    ME: "relink:me",
    ADS: "relink:ads",
    FAVS: "relink:favs",
    DISMISSED: "relink:dismissed",
    LANG: "relink:lang",
    SAVED_SEARCH: "relink:saved-search"
  };

  /* Cargar JSON desde localStorage */
  RL.loadJSON = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  /* Guardar JSON */
  RL.saveJSON = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  /* Cargar un Set desde localStorage */
  RL.loadSet = (key) => {
    try {
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  };

  /* Guardar un Set */
  RL.saveSet = (key, set) => {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  };

  /* =========================================================
     TOASTS — Notificaciones flotantes
     ========================================================= */

  /* Inyectar CSS de los toasts si no existe
     ------------------------------------------------
     Genera CSS dinámicamente para los toasts.
  */
  function ensureToastCSS() {
    if (RL.$("#rl-toast-style")) return;
    const st = document.createElement("style");
    st.id = "rl-toast-style";
    st.textContent = `
      #rl-toast-wrap{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);display:grid;gap:10px;z-index:99999;pointer-events:none;}
      .rl-toast{pointer-events:none;min-width:240px;max-width:min(560px,calc(100vw - 24px));padding:12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.45);backdrop-filter:blur(10px);color:rgba(255,255,255,.92);box-shadow:0 18px 40px rgba(0,0,0,.35);opacity:0;transform:translateY(8px);transition:opacity .2s ease,transform .2s ease;font:800 13px/1.25 system-ui;}
      .rl-toast.is-in{opacity:1;transform:translateY(0);}
      .rl-toast--ok{border-color:rgba(38,208,124,.35);}
      .rl-toast--warn{border-color:rgba(255,77,109,.35);}
      .rl-toast--info{border-color:rgba(124,58,237,.35);}
    `;
    document.head.appendChild(st);
  }

  /* Crear un toast */
  RL.toast = (msg, type = "info") => {
    ensureToastCSS();
    let wrap = RL.$("#rl-toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "rl-toast-wrap";
      document.body.appendChild(wrap);
    }
    const t = document.createElement("div");
    t.className = `rl-toast rl-toast--${type}`;
    t.textContent = msg;
    wrap.appendChild(t);

    requestAnimationFrame(() => t.classList.add("is-in"));
    setTimeout(() => t.classList.remove("is-in"), 2600);
    setTimeout(() => t.remove(), 3200);
  };

  /* =========================================================
     SISTEMA DE IDIOMAS (i18n)
     ========================================================= */

  RL.getLang = () => localStorage.getItem(RL.KEYS.LANG) || "es";

  RL.applyLang = (lang) => {
    const dict = (RL.I18N && (RL.I18N[lang] || RL.I18N.es)) || null;

    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;

    if (dict) {
      RL.$$("[data-i18n]").forEach((el) => {
        const k = el.dataset.i18n;
        if (dict[k] != null) el.textContent = dict[k];
      });

      RL.$$("[data-i18n-placeholder]").forEach((el) => {
        const k = el.dataset.i18nPlaceholder;
        if (dict[k] != null) el.setAttribute("placeholder", dict[k]);
      });
    }

    const langBtn = RL.$("#langBtn");
    if (langBtn) langBtn.textContent = lang === "en" ? "EN ▾" : "ES ▾";
    localStorage.setItem(RL.KEYS.LANG, lang);

    const langMenu = RL.$("#langMenu");
    if (langMenu) RL.setHidden(langMenu, true);
    if (langBtn) langBtn.setAttribute("aria-expanded", "false");
  };

  /* Inicializar menú de idiomas */
  RL.initLangMenu = () => {
    const langBtn = RL.$("#langBtn");
    const langMenu = RL.$("#langMenu");
    if (!langBtn || !langMenu) return;

    RL.setHidden(langMenu, true);
    langBtn.setAttribute("aria-expanded", "false");

    langBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = !langMenu.hasAttribute("hidden");
      RL.setHidden(langMenu, open);
      langBtn.setAttribute("aria-expanded", open ? "false" : "true");
    });

    langMenu.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-lang]");
      if (!b) return;
      RL.applyLang(b.dataset.lang);
      RL.renderIfNeeded?.();
    });

    document.addEventListener("click", (e) => {
      if (langMenu.contains(e.target) || langBtn.contains(e.target)) return;
      RL.setHidden(langMenu, true);
      langBtn.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      RL.setHidden(langMenu, true);
      langBtn.setAttribute("aria-expanded", "false");
    });
  };

  /* =========================================================
     INICIALIZACIÓN GLOBAL
     ========================================================= */

  document.addEventListener("DOMContentLoaded", () => {
    RL.ensureDemoUsers?.();
    RL.ensureDemoAds?.();
    RL.setAuthUI?.(RL.getMe?.());
    RL.applyLang(RL.getLang());
    RL.initLangMenu();
    RL.initGlobalClicks?.();
    RL.initModalOutsideClick?.();
    RL.initAuthForms?.();
    RL.initPostForm?.();
    RL.renderIfNeeded?.();
  });

})();