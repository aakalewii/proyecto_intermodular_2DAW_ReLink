/* ============================================================
   app.js — Lógica principal de ReLink
   Incluye:
   - Gestión de usuarios y autenticación
   - Gestión de anuncios (crear, editar, borrar)
   - Modales (<dialog>)
   - Renderizado dinámico del grid de productos
   - Favoritos y descartados
   ============================================================ */

(() => {
  const RL = window.ReLink;

  /* =========================
     USUARIOS / AUTENTICACIÓN
     ========================= */

  RL.loadUsers = () => RL.loadJSON(RL.KEYS.USERS, []);
  RL.saveUsers = (users) => RL.saveJSON(RL.KEYS.USERS, users);

  RL.getMe = () => RL.loadJSON(RL.KEYS.ME, null);
  RL.setMe = (me) => RL.saveJSON(RL.KEYS.ME, me);

  // Usuarios de demostración
  RL.DEMO_USERS = RL.DEMO_USERS || [
    { name: "Nerea",  email: "nerea@relink.demo",  pass: "demo" },
    { name: "Dani",   email: "dani@relink.demo",   pass: "demo" },
    { name: "Laura",  email: "laura@relink.demo",  pass: "demo" },
    { name: "Héctor", email: "hector@relink.demo", pass: "demo" }
  ];

  // Inserta usuarios demo si no existen
  RL.ensureDemoUsers = () => {
    const users = RL.loadUsers();
    let changed = false;

    for (const u of RL.DEMO_USERS) {
      if (!users.some((x) => x.email === u.email)) {
        users.push({
          ...u,
          createdAt: Date.now() - Math.floor(Math.random() * 1e9)
        });
        changed = true;
      }
    }
    if (changed) RL.saveUsers(users);
  };

  // Actualiza UI según sesión
  RL.setAuthUI = (me) => {
    const guest = RL.$("#authGuest");
    const user = RL.$("#authUser");
    const chip = RL.$("#userChip");

    if (chip) {
      chip.textContent = me ? `👤 ${me.name}` : "👤";
      chip.style.cursor = "pointer";
      chip.onclick = () => {
        const who = me?.email
          ? `perfil.html?u=${encodeURIComponent(me.email)}`
          : "perfil.html";
        window.location.href = who;
      };
    }

    RL.setHidden(guest, !!me);
    RL.setHidden(user, !me);
  };

  /* =========================
     ANUNCIOS (LOAD / SAVE)
     ========================= */

  RL.loadAds = () => RL.loadJSON(RL.KEYS.ADS, []);
  RL.saveAds = (ads) => RL.saveJSON(RL.KEYS.ADS, ads);

  /* ============================================================
     SEED DESDE DOM (opcional)
     Lee tarjetas HTML existentes y las convierte en anuncios.
     ============================================================ */
  RL.seedAdsFromDomIfNeeded = () => {
    const grid = RL.$("#grid");
    const existing = RL.loadAds();
    if (!grid || existing.length) return;

    const cards = RL.$$(".card", grid);
    if (!cards.length) return;

    const lang = RL.getLang?.() || "es";
    const likeNew = lang === "en" ? "Like new" : "Como nuevo";

    const seeded = cards.map((card, i) => {
      const title = RL.$(".card__title a", card)?.textContent?.trim() || "Producto";
      const price = RL.eurosToNumber(RL.$(".price", card)?.textContent);
      const cond = RL.$(".tag", card)?.textContent?.trim() || likeNew;
      const meta = RL.$(".card__meta", card)?.textContent?.trim() || "";
      const loc = (meta.split("·")[0] || "").trim() || "—";
      const ship = !!RL.$(".pill--ship", card);
      const cat = card.dataset.category || "all";

      const owner = RL.DEMO_USERS[i % RL.DEMO_USERS.length];
      const id = RL.slugify(`${title}-${loc}-${price}-${cat}-${owner.email}`);

      return {
        id, title, price, cond, loc, ship, cat,
        img: "",
        desc: "",
        createdAt: Date.now() - i * 3600_000,
        ownerEmail: owner.email,
        ownerName: owner.name
      };
    });

    RL.saveAds(seeded);
  };

  /* ============================================================
     SEED DEMO REAL (12 anuncios)
     Generación de imágenes SVG dinámicas en base64
     ============================================================ */
  RL.ensureDemoAds = () => {
    const existing = RL.loadAds();
    if (existing && existing.length) return;

    const svgCard = (title, a = "#26d07c", b = "#7c3aed") => {
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop stop-color="${a}" stop-opacity="0.35"/>
            <stop offset="1" stop-color="${b}" stop-opacity="0.35"/>
          </linearGradient>
        </defs>
        <rect width="900" height="520" fill="#0b1020"/>
        <rect x="40" y="40" width="820" height="440" rx="36" fill="url(#g)"/>
        <text x="70" y="430" fill="rgba(255,255,255,.92)" font-family="system-ui,Segoe UI,Arial" font-size="44" font-weight="800">
          ${String(title).replace(/[<>]/g,"")}
        </text>
      </svg>`.trim();

      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    };

    const demo = [
      { title:"iPhone 12 128GB", price:420, cat:"tech",    loc:"Las Palmas",  cond:"Como nuevo",  ship:true,  colors:["#26d07c","#7c3aed"] },
      { title:"PS5 + mando",      price:390, cat:"tech",    loc:"Telde",       cond:"Buen estado", ship:true,  colors:["#7c3aed","#26d07c"] },
      { title:"Bicicleta MTB",    price:220, cat:"sport",   loc:"Arucas",      cond:"Buen estado", ship:false, colors:["#26d07c","#0ea5e9"] },
      { title:"Sofá 3 plazas",    price:160, cat:"home",    loc:"Vecindario",  cond:"A reparar",   ship:false, colors:["#f59e0b","#7c3aed"] },
      { title:"Portátil i5 16GB", price:520, cat:"tech",    loc:"Gáldar",      cond:"Como nuevo",  ship:true,  colors:["#22c55e","#a855f7"] },
      { title:"Chaqueta denim",   price:25,  cat:"fashion", loc:"Tafira",      cond:"Buen estado", ship:true,  colors:["#60a5fa","#7c3aed"] },
      { title:"Casco de moto",    price:45,  cat:"motor",   loc:"Ingenio",     cond:"Nuevo",       ship:true,  colors:["#ef4444","#7c3aed"] },
      { title:"Silla gaming",     price:85,  cat:"home",    loc:"Maspalomas",  cond:"Buen estado", ship:true,  colors:["#26d07c","#f97316"] },
      { title:"Cámara réflex",    price:300, cat:"tech",    loc:"Teror",       cond:"Como nuevo",  ship:true,  colors:["#7c3aed","#14b8a6"] },
      { title:"Patinete",         price:110, cat:"sport",   loc:"Santa Lucía", cond:"Buen estado", ship:false, colors:["#06b6d4","#7c3aed"] },
      { title:"Mesa escritorio",  price:70,  cat:"home",    loc:"Agüimes",     cond:"Buen estado", ship:false, colors:["#84cc16","#7c3aed"] },
      { title:"Oferta empleo",    price:0,   cat:"jobs",    loc:"Las Palmas",  cond:"Nuevo",       ship:false, colors:["#7c3aed","#26d07c"] }
    ];

    const ads = demo.map((d, i) => {
      const owner = RL.DEMO_USERS[i % RL.DEMO_USERS.length];
      return {
        id: RL.slugify(`${d.title}-${d.loc}-${d.price}-${d.cat}-${owner.email}`),
        title: d.title,
        price: d.price,
        cat: d.cat,
        loc: d.loc,
        cond: d.cond,
        ship: d.ship,
        desc: "",
        img: svgCard(d.title, d.colors[0], d.colors[1]),
        createdAt: Date.now() - i * 3600_000,
        ownerEmail: owner.email,
        ownerName: owner.name
      };
    });

    RL.saveAds(ads);
  };

  /* =========================
     FAVORITOS / DESCARTADOS
     ========================= */

  RL.loadFavsSet = () => RL.loadSet(RL.KEYS.FAVS);
  RL.loadDismissedSet = () => RL.loadSet(RL.KEYS.DISMISSED);

  /* =========================
     MODALES (<dialog>)
     ========================= */

  RL.openModal = (id) => {
    const d = RL.$("#modal-" + id);
    if (!d) return;

    // ShowModal() es propio de <dialog>
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "open");
  };

  RL.closeModal = (d) => {
    if (!d) return;
    if (typeof d.close === "function") d.close();
    else d.removeAttribute("open");
  };

  // Cerrar modal haciendo clic fuera
  RL.initModalOutsideClick = () => {
    RL.$$("dialog.modal").forEach((d) => {
      d.addEventListener("click", (e) => {
        const r = d.getBoundingClientRect();
        const inside =
          e.clientX >= r.left && e.clientX <= r.right &&
          e.clientY >= r.top  && e.clientY <= r.bottom;

        if (!inside) RL.closeModal(d);
      });
    });
  };

  /* =========================
     GESTIÓN GLOBAL DE CLICS
     ========================= */

  RL.initGlobalClicks = () => {
    document.addEventListener("click", (e) => {
      const open = e.target.closest("[data-open]");
      if (open) {
        const id = open.dataset.open;

        // Publicar exige sesión
        if (id === "post" && !RL.getMe()) {
          const dict = RL.I18N?.[RL.getLang?.() || "es"] || RL.I18N?.es || {};
          RL.toast(
            dict["toast.signinToPublish"] || "Primero inicia sesión para publicar",
            "warn"
          );
          RL.openModal("auth");
          RL.setAuthTab?.("login");
          return;
        }

        // Modal de auth con pestaña específica
        if (id === "auth") {
          const mode = open.dataset.authMode || "login";
          RL.openModal("auth");
          RL.setAuthTab?.(mode);
          return;
        }

        RL.openModal(id);
        return;
      }

      // Botón de cerrar modal
      if (e.target.matches("[data-close]") || e.target.closest("[data-close]")) {
        const d = e.target.closest("dialog");
        RL.closeModal(d);
      }
    });
  };

  /* =========================
     AUTH: TABS + FORMULARIOS
     ========================= */

  RL.setAuthTab = (which) => {
    const authModal = RL.$("#modal-auth");
    if (!authModal) return;

    const loginForm = RL.$("#loginForm");
    const registerForm = RL.$("#registerForm");
    const authTitle = RL.$("#authTitle");
    const tabs = RL.$$(".tab", authModal);

    const isLogin = which === "login";

    tabs.forEach((t) =>
      t.classList.toggle("is-active", t.dataset.tab === which)
    );

    RL.setHidden(loginForm, !isLogin);
    RL.setHidden(registerForm, isLogin);

    const dict = RL.I18N?.[RL.getLang?.() || "es"] || RL.I18N?.es || {};
    if (authTitle)
      authTitle.textContent =
        dict[isLogin ? "auth.login" : "auth.register"] ||
        (isLogin ? "Entrar" : "Registro");
  };

  RL.initAuthForms = () => {
    const authModal = RL.$("#modal-auth");
    if (!authModal) return;

    const dict = () =>
      RL.I18N?.[RL.getLang?.() || "es"] || RL.I18N?.es || {};

    // Tabs
    RL.$$(".tab", authModal).forEach((t) =>
      t.addEventListener("click", () => RL.setAuthTab(t.dataset.tab))
    );

    // Login
    RL.$("#loginForm")?.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = (RL.$("#loginEmail")?.value || "").trim().toLowerCase();
      const pass = (RL.$("#loginPass")?.value || "");

      const users = RL.loadUsers();
      const u = users.find((x) => x.email === email && x.pass === pass);

      if (!u)
        return RL.toast(
          dict()["toast.wrongCred"] || "Credenciales incorrectas",
          "warn"
        );

      RL.setMe({ name: u.name, email: u.email });
      RL.setAuthUI(RL.getMe());

      RL.toast(dict()["toast.loggedIn"] || "Sesión iniciada", "ok");
      RL.closeModal(authModal);

      RL.renderIfNeeded?.();
    });

    // Register
    RL.$("#registerForm")?.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = (RL.$("#regName")?.value || "").trim();
      const email = (RL.$("#regEmail")?.value || "").trim().toLowerCase();
      const pass = (RL.$("#regPass")?.value || "");

      const users = RL.loadUsers();

      if (users.some((x) => x.email === email))
        return RL.toast(
          dict()["toast.emailExists"] || "Ese email ya existe",
          "warn"
        );

      users.push({ name, email, pass, createdAt: Date.now() });
      RL.saveUsers(users);

      RL.setMe({ name, email });
      RL.setAuthUI(RL.getMe());

      RL.toast(dict()["toast.accountCreated"] || "Cuenta creada", "ok");
      RL.closeModal(authModal);

      RL.renderIfNeeded?.();
    });

    // Logout
    RL.$("#logoutBtn")?.addEventListener("click", () => {
      localStorage.removeItem(RL.KEYS.ME);
      RL.setAuthUI(null);
      RL.toast(dict()["toast.loggedOut"] || "Sesión cerrada", "ok");
      RL.renderIfNeeded?.();
    });
  };

  /* =========================
     FORMULARIO DE ANUNCIOS
     ========================= */

  let editingAdId = null;

  // Lectura de archivos con async/await
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result || ""));
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  // Rellena el formulario con datos del anuncio
  function fillPostForm(ad) {
    RL.$("#pTitle") && (RL.$("#pTitle").value = ad?.title || "");
    RL.$("#pPrice") && (RL.$("#pPrice").value = ad?.price ?? "");
    RL.$("#pCat") && (RL.$("#pCat").value = ad?.cat || "all");
    RL.$("#pLoc") && (RL.$("#pLoc").value = ad?.loc || "");
    RL.$("#pCond") && (RL.$("#pCond").value = ad?.cond || "Como nuevo");
    RL.$("#pShip") && (RL.$("#pShip").checked = !!(ad?.ship ?? true));
    RL.$("#pDesc") && (RL.$("#pDesc").value = ad?.desc || "");

    RL.$("#pImgFile") && (RL.$("#pImgFile").value = "");
    RL.$("#pImgUrl") && (RL.$("#pImgUrl").value =
      ad?.img && !String(ad.img).startsWith("data:") ? ad.img : "");
  }

  // Abrir modal de edición
  RL.openEditAd = (adId) => {
    const me = RL.getMe();
    const dict = RL.I18N?.[RL.getLang?.() || "es"] || RL.I18N?.es || {};

    if (!me)
      return RL.toast(
        dict["toast.signinFirst"] || "Primero inicia sesión",
        "warn"
      );

    const ads = RL.loadAds();
    const ad = ads.find((a) => a.id === adId);
    if (!ad) return;

    if (ad.ownerEmail !== me.email) {
      return RL.toast(
        RL.getLang?.() === "en"
          ? "You can only edit your own listings"
          : "Solo puedes editar tus anuncios",
        "warn"
      );
    }

    editingAdId = adId;
    fillPostForm(ad);
    RL.openModal("post");
  };

  // Eliminar anuncio
  RL.deleteAd = (adId) => {
    const me = RL.getMe();
    const ads = RL.loadAds();
    const idx = ads.findIndex((a) => a.id === adId);
    if (idx === -1) return;

    if (me && ads[idx].ownerEmail && ads[idx].ownerEmail !== me.email) {
      RL.toast(
        RL.getLang?.() === "en"
          ? "You can only delete your own listings"
          : "Solo puedes eliminar tus anuncios",
        "warn"
      );
      return;
    }

    ads.splice(idx, 1);
    RL.saveAds(ads);

    const favs = RL.loadFavsSet();
    favs.delete(adId);
    RL.saveSet(RL.KEYS.FAVS, favs);

    const dismissed = RL.loadDismissedSet();
    dismissed.delete(adId);
    RL.saveSet(RL.KEYS.DISMISSED, dismissed);

    const dict = RL.I18N?.[RL.getLang?.() || "es"] || RL.I18N?.es || {};
    RL.toast(dict["toast.deleted"] || "Anuncio eliminado", "ok");
  };

  // Inicializar formulario de crear/editar anuncio
  RL.initPostForm = () => {
    const postForm = RL.$("#postForm");
    if (!postForm) return;

    postForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const dict = RL.I18N?.[RL.getLang?.() || "es"] || RL.I18N?.es || {};

      const me = RL.getMe();
      if (!me) {
        RL.toast(
          dict["toast.signinToPublish"] || "Primero inicia sesión para publicar",
          "warn"
        );
        RL.openModal("auth");
        RL.setAuthTab("login");
        return;
      }

      const title = (RL.$("#pTitle")?.value || "").trim();
      const price = RL.eurosToNumber(RL.$("#pPrice")?.value || 0);
      const cat = RL.$("#pCat")?.value || "all";
      const loc = (RL.$("#pLoc")?.value || "").trim();
      const cond = RL.$("#pCond")?.value || "Como nuevo";
      const ship = !!RL.$("#pShip")?.checked;
      const desc = (RL.$("#pDesc")?.value || "").trim();

      let img = "";
      const file = RL.$("#pImgFile")?.files?.[0] || null;
      const url = (RL.$("#pImgUrl")?.value || "").trim();

      // Async/await + FileReader
      try {
        if (file) img = await readFileAsDataURL(file);
        else if (url) img = RL.safeUrl(url);
      } catch {
        img = "";
      }

      const ads = RL.loadAds();

      // MODO EDICIÓN
      if (editingAdId) {
        const idx = ads.findIndex((a) => a.id === editingAdId);
        if (idx !== -1) {
          const old = ads[idx];
          ads[idx] = {
            ...old,
            title,
            price,
            cat,
            loc,
            cond,
            ship,
            desc,
            img: img || old.img || ""
          };
          RL.saveAds(ads);
        }
        editingAdId = null;
        RL.closeModal(RL.$("#modal-post"));
        RL.toast(dict["toast.updated"] || "Anuncio actualizado", "ok");
        RL.renderIfNeeded?.();
        return;
      }

      // MODO CREACIÓN
      const id = RL.slugify(
        `${title}-${loc}-${price}-${cat}-${me.email}-${Date.now()}`
      );

      ads.unshift({
        id,
        title,
        price,
        cat,
        loc,
        cond,
        ship,
        desc,
        img,
        createdAt: Date.now(),
        ownerEmail: me.email,
        ownerName: me.name
      });

      RL.saveAds(ads);
      RL.closeModal(RL.$("#modal-post"));
      RL.toast(dict["toast.published"] || "Anuncio publicado", "ok");
      postForm.reset();
      RL.$("#pShip") && (RL.$("#pShip").checked = true);
      RL.renderIfNeeded?.();
    });
  };

  /* =========================
     MODAL DE PRODUCTO
     ========================= */

  RL.ensureProductModal = () => {
    if (RL.$("#modal-product")) return;

    const d = document.createElement("dialog");
    d.id = "modal-product";
    d.className = "modal";
    d.innerHTML = `
      <div class="modal__box">
        <div class="modal__head">
          <h2 id="productTitle">Anuncio</h2>
          <button class="icon-btn" type="button" data-close aria-label="Cerrar">✕</button>
        </div>

        <div class="product">
          <div class="product__media" id="productMedia"></div>

          <div class="product__body">
            <div class="product__price" id="productPrice">—</div>
            <div class="product__meta muted" id="productMeta">—</div>
            <div class="product__cond" id="productCond">—</div>
            <div class="product__desc" id="productDesc">—</div>

            <div class="product__seller">
              <a id="productSeller" class="seller" href="#">Usuario</a>
            </div>

            <div class="product__actions">
              <button id="btnBuy" class="btn btn--primary" type="button">Comprar</button>
              <button id="btnContact" class="btn btn--ghost" type="button">Contactar</button>
              <button id="btnReport" class="btn btn--ghost" type="button">Denunciar anuncio</button>
              <button id="btnEdit" class="btn btn--ghost" type="button" hidden>Modificar</button>
              <button id="btnDelete" class="btn btn--ghost" type="button" hidden>Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(d);
  };

  RL.showProductModal = (adId) => {
    RL.ensureProductModal();

    const ads = RL.loadAds();
    const ad = ads.find((a) => a.id === adId);
    if (!ad) return;

    const dict = RL.I18N?.[RL.getLang?.() || "es"] || RL.I18N?.es || {};
    const me = RL.getMe();
    const isMine = !!me && !!ad.ownerEmail && me.email === ad.ownerEmail;

    const titleEl = RL.$("#productTitle");
    const mediaEl = RL.$("#productMedia");
    const priceEl = RL.$("#productPrice");
    const metaEl = RL.$("#productMeta");
    const condEl = RL.$("#productCond");
    const descEl = RL.$("#productDesc");
    const sellerEl = RL.$("#productSeller");

    if (titleEl)
      titleEl.textContent = ad.title || dict["product.title"] || "Anuncio";
    if (priceEl) priceEl.textContent = `${Number(ad.price || 0).toFixed(0)} €`;
    if (metaEl)
      metaEl.textContent = `${ad.loc || "—"} · ${dict.today || "Hoy"}`;
    if (condEl) condEl.textContent = ad.cond || "—";
    if (descEl)
      descEl.textContent = ad.desc?.trim()
        ? ad.desc.trim()
        : RL.getLang?.() === "en"
        ? "No description."
        : "Sin descripción.";

    if (sellerEl) {
      sellerEl.textContent = ad.ownerName || "Usuario";
      sellerEl.href = `perfil.html?u=${encodeURIComponent(
        ad.ownerEmail || ""
      )}`;
    }

    if (mediaEl) {
      const img = ad.img ? RL.safeUrl(ad.img) : "";
      mediaEl.innerHTML = img
        ? `<div class="product__img" style="background:url('${img.replace(
            /'/g,
            "%27"
          )}') center/cover no-repeat;"></div>`
        : `<div class="product__img thumb"></div>`;

      if (ad.ship) {
        const pill = document.createElement("span");
        pill.className = "pill pill--ship";
        pill.textContent = dict["pill.ship"] || "Envío";
        mediaEl.appendChild(pill);
      }
    }

    const btnBuy = RL.$("#btnBuy");
    const btnContact = RL.$("#btnContact");
    const btnReport = RL.$("#btnReport");
    const btnEdit = RL.$("#btnEdit");
    const btnDelete = RL.$("#btnDelete");

    RL.setHidden(btnEdit, !isMine);
    RL.setHidden(btnDelete, !isMine);

    btnBuy &&
      (btnBuy.onclick = () =>
        RL.toast(
          dict["toast.buy"] || "Simulación de compra (demo)",
          "ok"
        ));

    btnContact &&
      (btnContact.onclick = () =>
        RL.toast(
          dict["toast.contact"] || "Abriendo contacto…",
          "info"
        ));

    btnReport &&
      (btnReport.onclick = () =>
        RL.toast(
          dict["toast.reported"] || "Gracias, revisaremos el anuncio",
          "ok"
        ));

    btnEdit && (btnEdit.onclick = () => RL.openEditAd(adId));

    btnDelete &&
      (btnDelete.onclick = () => {
        const ok = confirm(
          RL.getLang?.() === "en"
            ? "Delete this listing?"
            : "¿Eliminar este anuncio?"
        );
        if (!ok) return;
        RL.deleteAd(adId);
        RL.closeModal(RL.$("#modal-product"));
        RL.renderIfNeeded?.();
      });

    RL.openModal("product");
  };

  /* =========================
     RENDER DEL GRID DE PRODUCTOS
     ========================= */

  RL.renderIfNeeded = () => {
    const grid = RL.$("#grid");
    if (!grid) return;

    const ads = RL.loadAds();
    const dismissed = RL.loadDismissedSet();
    const favs = RL.loadFavsSet();

    // Filtrar anuncios descartados
    const visible = ads.filter((ad) => !dismissed.has(ad.id));

    // Renderizar tarjetas
    grid.innerHTML = visible
      .map(
        (ad) => `
      <div class="card" data-id="${ad.id}" data-category="${ad.cat}">
        <div class="card__img" style="background:url('${(ad.img || "").replace(
          /'/g,
          "%27"
        )}') center/cover no-repeat;">
          ${
            ad.ship
              ? '<span class="pill pill--ship">' +
                (RL.I18N?.[RL.getLang?.() || "es"]?.["pill.ship"] ||
                  "Envío") +
                "</span>"
              : ""
          }
        </div>
        <div class="card__body">
          <h3 class="card__title"><a href="#">${RL.safeText(
            ad.title
          )}</a></h3>
          <div class="price">${Number(ad.price || 0).toFixed(0)} €</div>
          <div class="card__meta">${RL.safeText(ad.loc)} · ${RL.safeText(
          ad.cond
        )}</div>
          <div class="card__actions">
            <button class="btn btn--sm btn--ghost favor-btn" data-id="${
              ad.id
            }" type="button">
              ${favs.has(ad.id) ? "Guardado" : "Me interesa"}
            </button>
            <button class="btn btn--sm btn--ghost dismiss-btn" data-id="${
              ad.id
            }" type="button">
              No me interesa
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    // Descripción de resultados
    const resultsDesc = RL.$("#resultsDesc");
    if (resultsDesc) {
      resultsDesc.textContent = `Mostrando ${visible.length} · Página 1/1`;
    }

    // Listeners de cada tarjeta
    RL.$$(".card", grid).forEach((card) => {
      // Abrir modal al hacer clic en la tarjeta (pero no en los botones)
      card.addEventListener("click", (e) => {
        if (
          e.target.closest(".favor-btn") ||
          e.target.closest(".dismiss-btn")
        )
          return;
        const id = card.dataset.id;
        RL.showProductModal(id);
      });

      // Botón favoritos
      const favorBtn = RL.$(".favor-btn", card);
      if (favorBtn) {
        favorBtn.addEventListener("click", () => {
          const id = card.dataset.id;
          const favs = RL.loadFavsSet();
          if (favs.has(id)) {
            favs.delete(id);
            RL.toast(
              RL.getLang?.() === "en"
                ? "Removed from favorites"
                : "Eliminado de favoritos",
              "ok"
            );
          } else {
            favs.add(id);
            RL.toast(
              RL.getLang?.() === "en"
                ? "Added to favorites"
                : "Agregado a favoritos",
              "ok"
            );
          }
          RL.saveSet(RL.KEYS.FAVS, favs);
          RL.renderIfNeeded();
        });
      }

      // Botón descartar
      const dismissBtn = RL.$(".dismiss-btn", card);
      if (dismissBtn) {
        dismissBtn.addEventListener("click", () => {
          const id = card.dataset.id;
          const dismissed = RL.loadDismissedSet();
          dismissed.add(id);
          RL.saveSet(RL.KEYS.DISMISSED, dismissed);
          RL.renderIfNeeded();
        });
      }
    });
  };
})();