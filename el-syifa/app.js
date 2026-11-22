(() => {
let C = window.CONFIG; const qs = new URLSearchParams(location.search);
const TEMPLATES = ["glassbox","exclusive","premium","minimalist","doodle","vintage","playful","envelope"];
let lang = qs.get("lang") || C.defaultLang || "id";
let TPL = TEMPLATES.includes(qs.get("tpl")) ? qs.get("tpl") : C.template;
let guest = qs.get("to") || qs.get("nama") || qs.get("guest") || "";

const UI = {
  id: { wi:"Undangan Pernikahan", dear:"Kepada Yth. Bapak/Ibu/Saudara/i", guest:"Tamu Undangan", open:"Buka Undangan", wo:"The Wedding Of", tap:"Ketuk amplop untuk membuka",
        son:"Putra dari", daughter:"Putri dari", story:"Kisah Cinta", save:"Save The Date", d:"Hari", h:"Jam", m:"Menit", s:"Detik",
        cal:"Simpan ke Kalender", events:"Detail Acara", maps:"Buka Google Maps", gift:"Hadiah Pernikahan", giftSub:"Doa restu Anda sudah cukup, namun jika ingin memberi tanda kasih:",
        copy:"Salin", copied:"Tersalin ✓", rsvp:"RSVP & Ucapan", name:"Nama", att:"Konfirmasi Kehadiran", yes:"Hadir", no:"Tidak Hadir",
        count:"Jumlah Tamu", msg:"Ucapan & doa", send:"Kirim", sent:"Terkirim ✓", gallery:"Galeri",
        brideLbl:"Mempelai Wanita", groomLbl:"Mempelai Pria", rsvpTitle:"Kehadiran & Doa", rsvpSub:"Mohon konfirmasi kehadiran Anda dan titipkan doa terbaik untuk kami.",
        formTitle:"RSVP Pernikahan", formSub:"Kami menantikan kehadiran Anda", fullName:"Nama Lengkap", fullPh:"Masukkan nama Anda...", msgLabel:"Ucapan & Doa",
        msgPh:"Tuliskan doa dan ucapan terbaik Anda...", attLabel:"Konfirmasi Kehadiran", pick:"-- Pilih Konfirmasi --", countLabel:"Jumlah Tamu" },
  en: { wi:"Wedding Invitation", dear:"Dear", guest:"Dear Guest", open:"Open Invitation", wo:"The Wedding Of", tap:"Tap the envelope to open",
        son:"Son of", daughter:"Daughter of", story:"Our Love Story", save:"Save The Date", d:"Days", h:"Hours", m:"Minutes", s:"Seconds",
        cal:"Add to Calendar", events:"Event Details", maps:"Open Google Maps", gift:"Wedding Gift", giftSub:"Your presence is the greatest gift, but if you wish to send a token of love:",
        copy:"Copy", copied:"Copied ✓", rsvp:"RSVP & Wishes", name:"Name", att:"Will you attend?", yes:"Attending", no:"Can't attend",
        count:"Number of guests", msg:"Your wishes", send:"Send", sent:"Sent ✓", gallery:"Gallery",
        brideLbl:"The Bride", groomLbl:"The Groom", rsvpTitle:"RSVP & Wishes", rsvpSub:"Please confirm your attendance and leave us your best wishes.",
        formTitle:"Wedding RSVP", formSub:"We look forward to seeing you", fullName:"Full Name", fullPh:"Enter your name...", msgLabel:"Your Wishes",
        msgPh:"Write your prayers and wishes...", attLabel:"Attendance", pick:"-- Select --", countLabel:"Number of Guests" }
};
const T = () => UI[lang];
const t = o => o == null ? "" : typeof o === "string" ? o : (o[lang] ?? o.id ?? "");
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

/* ---------- tema & warna ---------- */
const cmap = { bg:"--bg", fg:"--fg", accent:"--accent", card:"--card", border:"--border" };
const loadedFonts = new Set(); let fontTimer;
function loadFonts() {
  clearTimeout(fontTimer);
  fontTimer = setTimeout(() => Object.values(C.fonts || {}).forEach(o => Object.values(o || {}).forEach(n => {
    n = String(n || "").trim().replace(/[^\w \-]/g, ""); if (!n || loadedFonts.has(n)) return; loadedFonts.add(n);
    const l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(n).replace(/%20/g, "+") + "&display=swap"; document.head.appendChild(l);
  })), qs.has("builder") ? 700 : 0);
}
const TPL_FONTS = {
  glassbox: ["Great Vibes", "Cormorant Garamond:ital,wght@0,400;0,600;1,400", "Plus Jakarta Sans:wght@300;400;600"],
  exclusive: ["Alike", "Abel"], premium: ["Alike", "Abel", "Great Vibes", "Marcellus", "Lato:wght@400;700;900"],
  minimalist: ["Jost:wght@300;400;500"], doodle: ["Caveat:wght@500;700", "Patrick Hand"],
  vintage: ["Playfair Display:ital,wght@0,500;1,500", "Cormorant Garamond:ital,wght@0,400;0,600;1,400"], playful: ["Fredoka:wght@400;500;600"],
  envelope: ["Pinyon Script", "Playfair Display:wght@500;600", "Cormorant Garamond:wght@400;600"]
};
function loadTplFonts() {
  (TPL_FONTS[TPL] || []).forEach(spec => { if (loadedFonts.has(spec)) return; loadedFonts.add(spec);
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=" + spec.replace(/ /g, "+") + "&display=swap"; document.head.appendChild(l); });
}
function applyTheme() {
  document.body.className = document.body.className.replace(/\bt-\S+/g, "").trim();
  document.body.classList.add("t-" + TPL);
  Object.values(cmap).forEach(v => document.body.style.removeProperty(v));
  Object.entries(C.colors || {}).forEach(([k, v]) => v && cmap[k] && document.body.style.setProperty(cmap[k], v));
  loadFonts();
  loadTplFonts();
}
applyTheme();

/* ---------- helper section ---------- */
/* ---- background menempel: background "opening" dipakai semua bagian kecuali profil & detail acara ---- */
const STICKY_EXCL = ["bride", "groom", "events"];
const stickyOn = () => !!(C.stickyBg && C.stickyBg.enabled);
const stickySrc = () => (C.stickyBg && C.stickyBg.source) || "verse";
function inSticky(key) {
  if (!stickyOn() || STICKY_EXCL.includes(key)) return false;
  if (key === "cover") return !!C.stickyBg.cover && TPL !== "envelope";
  return true;
}
const effKey = key => inSticky(key) ? stickySrc() : key;
const isStk = inSticky;
const bgOf = key => (C.backgrounds || {})[effKey(key)] || {};
function gbgHTML() { // satu lapisan background (foto/video) di belakang semua bagian
  if (!stickyOn()) return "";
  const b = (C.backgrounds || {})[stickySrc()] || {}, k = esc((b.type || "") + "|" + (b.value || ""));
  if (b.type === "photo" && b.value) return `<div class="gbg" data-k="${k}"><img class="bg" src="${esc(b.value)}" alt=""></div>`;
  if (b.type === "video" && b.value) return `<div class="gbg" data-k="${k}"><video class="bg" src="${esc(b.value)}" autoplay muted loop playsinline></video></div>`;
  return `<div class="gbg" data-k="${k}" style="background:${b.type === "color" && b.value ? esc(b.value) : "var(--bg)"}"></div>`;
}
function bgHTML(key) {
  if (TPL === "envelope" && key === "cover") return "";
  const b = bgOf(key), ov = (b.type === "photo" || b.type === "video") && b.value ? '<div class="ov"></div>' : "";
  if (isStk(key)) return ov;
  if (b.type === "photo" && b.value) return `<img class="bg" src="${esc(b.value)}" alt="" loading="lazy">${ov}`;
  if (b.type === "video" && b.value) return `<video class="bg" src="${esc(b.value)}" autoplay muted loop playsinline></video>${ov}`;
  return "";
}
const bgColor = key => { const b = bgOf(key); return !isStk(key) && b.type === "color" && b.value ? `background:${esc(b.value)};` : ""; };
function styleVars(id) {
  const clean = o => Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v !== "" && v != null)), n = x => String(x).replace(/[^\w \-]/g, "");
  const g = C.fonts || {}, f = { ...clean(g.all), ...clean(g[id]) }, l = C.look || {}, k = { ...clean(l.all), ...clean(l[id]) };
  let v = (f.head ? `--nf:'${n(f.head)}',cursive;--tf:'${n(f.head)}',serif;--pnick:'${n(f.head)}',cursive;--pfull:'${n(f.head)}',serif;` : "") + (f.body ? `--bf:'${n(f.body)}',sans-serif;--plab:'${n(f.body)}',sans-serif;` : "");
  if (+k.size > 0) v += `--fs:${+k.size / 100};`;
  if (+k.shadow > 0) v += `--sh:${+k.shadow / 100};--cardsh:0 8px ${Math.round(k.shadow * .3)}px rgba(0,0,0,${(k.shadow / 200).toFixed(2)});`;
  if (k.fade !== undefined) v += `--fade:${Math.min(100, Math.max(0, +k.fade || 0)) / 100};`;
  return v;
}
const sec = (id, cls, inner) => { const st = styleVars(id) + bgColor(id);
  return `<section id="s-${id}" class="sec ${cls}${isStk(id) ? " stk" : ""}"${st ? ` style="${st}"` : ""}>${bgHTML(id)}<div class="in">${inner}</div></section>`; };
const title = txt => `<h2 class="h2">${esc(txt)}</h2>`;
const ig = u => u ? `<a class="ig" href="https://instagram.com/${esc(u)}" target="_blank" rel="noopener">@${esc(u)}</a>` : "";

const igIcon = () => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`;
function profile(key, p, role) {
  const r = t(p.role) || role, nick = p.nick || (p.name || "").split(" ")[0], parents = [p.father, p.mother].filter(Boolean).join(" & ");
  const showPh = !(C.photos && C.photos.profile === false), lbl = key === "groom" ? T().groomLbl : T().brideLbl;
  const sv = styleVars(key) + bgColor(key), st = sv ? ` style="${sv}"` : "";
  if (TPL === "exclusive") { // foto penuh, teks di bawah (pria kiri, wanita kanan)
    const bgh = showPh ? `<img class="bg" src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy"><div class="ov"></div>` : bgHTML(key);
    return `<section id="s-${key}" class="sec xprof ${key === "groom" ? "l" : "r"}${showPh ? "" : " nophoto"}"${st}>${bgh}
      <div class="in"><p class="lbl">${lbl}</p><h3 class="nick">${esc(nick)}</h3><h3 class="pname">${esc(p.name)}</h3><hr class="ln"><p>${esc(r)}</p><p class="par">${esc(parents)}</p>${ig(p.ig)}</div></section>`;
  }
  if (TPL === "premium") { // kartu foto + nama script yang menimpa foto
    return `<section id="s-${key}" class="sec pprof${showPh ? "" : " nophoto"}"${st}>${bgHTML(key)}<div class="in">
      <div class="pph">${showPh ? `<img class="pimg" src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">` : ""}<h3 class="pnick">${esc(nick)}</h3></div>
      <p class="pl">${lbl}</p><h3 class="pfull">${esc(p.name)}</h3><p class="pl">${esc(r)}</p><p class="ppar">${esc(parents)}</p>
      ${p.ig ? `<a class="pig" href="https://instagram.com/${esc(p.ig)}" target="_blank" rel="noopener">${igIcon()}<span>${esc(p.ig)}</span></a>` : ""}</div></section>`;
  }
  if (TPL === "glassbox") { // foto penuh, teks rata tengah di bawah
    const b = (C.backgrounds || {})[key] || {}, has = (b.type === "photo" || b.type === "video") && b.value;
    const bgh = b.type === "color" && b.value ? "" : has ? bgHTML(key) : showPh ? `<img class="bg" src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy"><div class="ov"></div>` : "";
    return `<section id="s-${key}" class="sec gprof${!has && !showPh ? " nophoto" : ""}"${st}>${bgh}<div class="in"><h3 class="pname">${esc(p.name)}</h3>${ig(p.ig)}<p class="rl">${esc(r)}</p><p class="par">${esc(parents)}</p><hr class="ln"><p class="lbl">${lbl}</p></div></section>`;
  }
  return sec(key, "profile", `${showPh ? `<img class="photo" src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">` : ""}
    <div class="card"><h3 class="pname">${esc(p.name)}</h3><p>${esc(r)}</p>
    <p class="par">${esc(p.father)}<br>&amp; ${esc(p.mother)}</p>${ig(p.ig)}</div>`);
}

const isVid = x => /\.(mp4|webm|mov|m4v|ogv)([?#].*)?$/i.test(String(x || ""));
const media = x => isVid(x) ? `<video src="${esc(x)}#t=0.1" muted playsinline preload="metadata"></video>` : `<img src="${esc(x)}" alt="" loading="lazy">`;
const mainHTML = x => isVid(x) ? `<video src="${esc(x)}" controls autoplay muted loop playsinline></video>` : `<img src="${esc(x)}" alt="">`;
function galGrid(a) { // 2 foto/video per baris, sisanya ke bawah; tinggi baris bergantian agar rapi
  let h = "", i = 0, r = 0; const im = (x, c, k) => `<figure class="gi ${c}" data-i="${k}">${media(x)}${isVid(x) ? '<i class="play">▶</i>' : ""}</figure>`;
  while (i < a.length) {
    if (a.length - i === 1) { h += im(a[i], "w", i); i++; }
    else { const c = r % 2 ? "sq" : "tl"; h += im(a[i], c, i) + im(a[i + 1], c, i + 1); i += 2; }
    r++;
  }
  return h;
}
let LB_I = 0;
function lbShow(n) {
  const lb = document.getElementById("lightbox"), g = C.gallery || []; if (!g.length) return;
  const im = lb.querySelector("img"), vd = lb.querySelector("video"); LB_I = (n + g.length) % g.length; const x = g[LB_I];
  if (isVid(x)) { im.hidden = true; vd.hidden = false; vd.src = x; vd.play().catch(() => {}); }
  else { vd.pause(); vd.hidden = true; im.hidden = false; im.src = x; }
  lb.hidden = false;
}
function closeLb() { const lb = document.getElementById("lightbox"); lb.hidden = true; lb.querySelector("video").pause(); }
addEventListener("keydown", e => { const lb = document.getElementById("lightbox"), qm = document.getElementById("qrmodal");
  if (qm && !qm.hidden && e.key === "Escape") qm.hidden = true;
  if (!lb || lb.hidden) return;
  if (e.key === "Escape") closeLb(); if (e.key === "ArrowRight") lbShow(LB_I + 1); if (e.key === "ArrowLeft") lbShow(LB_I - 1); });
function gallerySec() {
  const g = C.gallery || [], ttl = t(C.galleryTitle) || T().gallery;
  const mode = C.galleryStyle === "carousel" ? "carousel" : "grid", cls = TPL === "glassbox" && !bgOf("gallery").value ? "brush" : "";
  if (mode === "carousel" && g.length) return sec("gallery", cls, title(ttl) +
    `<div class="car"><div class="cm" id="car-media">${mainHTML(g[0])}</div><button type="button" class="cb prev" id="car-prev" aria-label="Prev">‹</button><button type="button" class="cb next" id="car-next" aria-label="Next">›</button></div>
     <div class="thumbs" id="thumbs">${g.map((x, i) => `<span class="th${i ? "" : " on"}" data-i="${i}">${media(x)}${isVid(x) ? '<i class="play">▶</i>' : ""}</span>`).join("")}</div>`);
  return sec("gallery", cls, title(ttl) + `<div class="gal">${galGrid(g)}</div>`);
}

/* ---------- QR undangan (opsional) ---------- */
const QRD = {
  line1: { id: "Kami akan menikah dan kamu termasuk dalam", en: "We're tying the knot and you're on" }, line2: { id: "Daftar Tamu!", en: "The Guest List!" },
  button: { id: "QR Undangan Kamu", en: "Your Invitation QR" }, title: { id: "QR Undangan Kamu", en: "Your Invitation QR" },
  note: { id: "Tunjukkan QR Code ini kepada tim resepsionis kami saat tiba.", en: "Please show this QR Code to our reception team upon arrival." }
};
const qt = k => t((C.qr || {})[k]) || t(QRD[k]);
const guestName = () => (guest || t((C.cover || {}).guest) || "Guest").trim().slice(0, 40);
function qrSec() { return sec("qr", "qr", `<p class="q1">${esc(qt("line1"))}</p><p class="q2">${esc(qt("line2"))}</p><button type="button" class="btn" id="qr-open">${esc(qt("button"))}</button>`); }
function qrText() {
  const q = C.qr || {}, mode = q.content || "auto", ep = ((C.rsvp || {}).endpoint || "").trim(), name = guestName(), id = qs.get("id") || "", pax = qs.get("pax") || "";
  const checkin = () => ep + (ep.includes("?") ? "&" : "?") + "checkin=" + encodeURIComponent(name) + (id ? "&id=" + encodeURIComponent(id) : "") + (pax ? "&pax=" + encodeURIComponent(pax) : "");
  const link = () => { const u = new URL(location.href); u.search = ""; u.hash = ""; return u.href + "?to=" + encodeURIComponent(name).replace(/%20/g, "+"); };
  const text = () => `${C.couple.names}\nGuest: ${name}` + (id ? `\nID: ${id}` : "") + (pax ? `\nPax: ${pax}` : "");
  if (mode === "link") return link();
  if ((mode === "checkin" || mode === "auto") && ep) return checkin();
  return text();
}
function openQR() {
  const m = document.getElementById("qrmodal"), cv = document.getElementById("qrc");
  m.querySelector(".qrt").textContent = qt("title");
  m.querySelector(".qrd").textContent = `${t((C.cover || {}).dear) || "Dear"} ${guestName()}`;
  m.querySelector(".qrn").textContent = qt("note");
  try { QRGen.draw(cv, qrText(), 264); } catch (e) { try { QRGen.draw(cv, `${C.couple.names} - ${guestName()}`.slice(0, 120), 264); } catch (e2) {} }
  m.hidden = false;
}
document.getElementById("qrmodal").addEventListener("click", e => { if (e.target.id === "qrmodal" || e.target.closest(".qrx")) e.currentTarget.hidden = true; });

function eventCard(e) {
  const src = e.mapEmbed || `https://maps.google.com/maps?q=${encodeURIComponent(e.mapQuery || e.address || "")}&output=embed`;
  const link = e.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.mapQuery || e.address || "")}`;
  return `<div class="card ev"><h3 class="h3">${esc(t(e.title))}</h3><p>${esc(t(e.date))}</p><p><b>${esc(t(e.time))}</b></p>
    <p>${esc(t(e.place))}</p><p class="addr">${esc(e.address)}</p>
    <iframe class="map" src="${esc(src)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="map"></iframe>
    <a class="btn sm" href="${esc(link)}" target="_blank" rel="noopener">${T().maps}</a></div>`;
}

function render() {
  const u = T(), co = C.couple, cvt = (k, d) => t((C.cover || {})[k]) || d, g = guest || cvt("guest", "Guest");
  document.documentElement.lang = lang;
  document.title = `${u.wi} - ${co.names}`;
  const flower = `<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(20 19)" fill="#6c231b" stroke="#a24a3d" stroke-width=".8">${[0,72,144,216,288].map(r => `<ellipse cx="0" cy="-8" rx="5.5" ry="7.5" transform="rotate(${r})"/>`).join("")}</g><circle cx="20" cy="19" r="3" fill="#43120c"/></svg>`;
  const env = TPL === "envelope" ? `<div class="envw"><div class="env" id="env"><div class="flap"></div><div class="pocket"></div><div class="seal">${flower}</div></div><p class="tap">${u.tap}</p></div>` : "";
  const html = [
    sec("cover", "cover", `<p class="eyebrow">${TPL === "envelope" ? u.wo : cvt("eyebrow", "Wedding Invitation")}</p><h1 class="names">${esc(co.names)}</h1>
      ${env}<div class="guest"><small>${cvt("dear", "Dear")}</small><b>${esc(g)}</b></div><button class="btn" id="open">${cvt("open", "Open Invitation")}</button>`),
        ...(C.qr && C.qr.enabled ? [qrSec()] : []),
    sec("verse", "", `<p class="quote">${esc(t(C.verse.text))}</p><p class="cite">${esc(t(C.verse.title))}</p><hr class="ln vl">`),
    sec("opening", "", `<h2 class="h2">${esc(t(C.opening.title))}</h2><p>${esc(t(C.opening.text))}</p>${C.opening.hashtag ? `<p class="tag">${esc(C.opening.hashtag)}</p>` : ""}`),
    profile("bride", co.bride, u.daughter),
    profile("groom", co.groom, u.son),
    sec("story", "", title(u.story) + `<div class="tl">${C.loveStory.map(s => `<div class="card"><span class="yr">${esc(s.year)}</span><h3 class="h3">${esc(t(s.title))}</h3><p>${esc(t(s.text))}</p></div>`).join("")}</div>`),
    sec("date", "", `${title(u.save)}<p class="big">${esc(t(C.date.text))}</p>
      <div class="cd">${["d","h","m","s"].map(k => `<div class="card"><b id="cd-${k}">0</b><small>${u[k]}</small></div>`).join("")}</div>
      <a class="btn sm" target="_blank" rel="noopener" href="${calUrl()}">${u.cal}</a>`),
    sec("events", "", title(u.events) + C.events.map(eventCard).join("")),
    sec("gift", "", title(u.gift) + `<p>${u.giftSub}</p>` + C.gifts.map((x, i) => `<div class="card gift"><div><small>${esc(x.provider)}</small><b>${esc(x.number)}</b><span>${esc(x.holder)}</span></div>
      <button class="btn sm" data-copy="${i}">${u.copy}</button></div>`).join("")),
    sec("rsvp", "", `${title(u.rsvpTitle)}<p>${u.rsvpSub}</p>
      <form id="rsvp" class="card form"><h3 class="ft">${u.formTitle}</h3><p class="fs">${u.formSub}</p>
      <label>${u.fullName} <i>*</i></label><input name="name" placeholder="${u.fullPh}" value="${esc(guest)}" required maxlength="60">
      <label>${u.msgLabel} <i>*</i></label><textarea name="msg" rows="5" placeholder="${u.msgPh}" required maxlength="300"></textarea>
      <label>${u.attLabel} <i>*</i></label><select name="att" required><option value="">${u.pick}</option><option value="yes">${u.yes}</option><option value="no">${u.no}</option></select>
      <label>${u.countLabel}</label><select name="count">${Array.from({length: C.rsvp.maxGuests || 5}, (_, i) => `<option value="${i+1}">${i+1}</option>`).join("")}</select>
      <button class="btn" type="submit">${u.send}</button></form><div id="wishes" class="wishes"></div>`),
    ...(C.photos && C.photos.gallery === false ? [] : [gallerySec()]),
    sec("closing", "", `<p class="quote">${esc(t(C.closing.text))}</p><p>${esc(t(C.closing.sign))}</p><h2 class="names">${esc(co.names)}</h2>`)
  ].join("");
  const appEl = document.getElementById("app"), oldG = appEl.querySelector(":scope > .gbg");
  appEl.classList.toggle("sticky", stickyOn()); appEl.innerHTML = gbgHTML() + html;
  const newG = appEl.querySelector(":scope > .gbg"); // video tidak dimuat ulang saat ganti bahasa
  if (oldG && newG && oldG.dataset.k === newG.dataset.k) { newG.replaceWith(oldG); const v = oldG.querySelector("video"); if (v) v.play().catch(() => {}); }
  if (TPL === "playful") flowers();
  bind(); renderWishes(); tick();
  document.getElementById("b-lang").innerHTML = (lang === "id" ? "EN" : "ID") + "<small>LANG</small>";
}

function calUrl() {
  const s = new Date(C.date.iso), e = new Date(s.getTime() + 2 * 3600e3), f = d => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(C.couple.names)}&dates=${f(s)}/${f(e)}`;
}
function flowers() {
  const F = ["🌸","🌼","🌷","🌺","🌻","💮"];
  document.querySelectorAll(".sec").forEach(s => {
    let h = ""; for (let i = 0; i < 16; i++) h += `<i style="left:${Math.random()*96}%;top:${Math.random()*96}%;font-size:${10+Math.random()*12}px;transform:rotate(${Math.random()*360}deg)">${F[i % F.length]}</i>`;
    s.insertAdjacentHTML("afterbegin", `<div class="fl" aria-hidden="true">${h}</div>`);
  });
}

/* ---------- countdown ---------- */
let timer;
function tick() {
  clearInterval(timer);
  const target = new Date(C.date.iso).getTime();
  const up = () => { const d = Math.max(0, target - Date.now()), set = (k, v) => { const el = document.getElementById("cd-" + k); if (el) el.textContent = v; };
    set("d", Math.floor(d / 864e5)); set("h", Math.floor(d / 36e5 % 24)); set("m", Math.floor(d / 6e4 % 60)); set("s", Math.floor(d / 1e3 % 60)); };
  up(); timer = setInterval(up, 1000);
}

/* ---------- RSVP & ucapan ---------- */
const KEY = "wishes_" + (C.couple.names || "").replace(/\W+/g, "_");
const local = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
let remote = [];
async function loadRemote() {
  if (!C.rsvp.endpoint) return;
  try { const r = await fetch(C.rsvp.endpoint); remote = await r.json(); renderWishes(); } catch {}
}
function renderWishes() {
  const all = C.rsvp.endpoint ? (Array.isArray(remote) ? remote : []) : [...local(), ...(C.rsvp.sampleWishes || [])];
  const el = document.getElementById("wishes");
  if (el) el.innerHTML = all.map(w => `<div class="card wish"><b>${esc(w.name)}</b> <small>${esc(w.time)}</small><p>${esc(w.text)}</p></div>`).join("");
}
function submitRsvp(ev) {
  ev.preventDefault();
  const f = new FormData(ev.target), now = new Date();
  const item = { name: f.get("name").trim(), att: f.get("att"), count: f.get("count"), text: f.get("msg").trim(),
    time: now.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { day:"numeric", month:"short", year:"numeric" }) };
  if (C.rsvp.endpoint) fetch(C.rsvp.endpoint, { method:"POST", mode:"no-cors", headers:{ "Content-Type":"text/plain" }, body: JSON.stringify(item) }).catch(() => {});
  if (C.rsvp.endpoint) remote = [item, ...(Array.isArray(remote) ? remote : [])]; else try { localStorage.setItem(KEY, JSON.stringify([item, ...local()])); } catch {}
  renderWishes();
  const b = ev.target.querySelector("button"); b.textContent = T().sent; setTimeout(() => b.textContent = T().send, 1800);
  ev.target.msg.value = "";
}

/* ---------- interaksi ---------- */
const audio = document.getElementById("audio"), bMusic = document.getElementById("b-music"), bScroll = document.getElementById("b-scroll");
audio.src = C.music.url || "";
function setMusic(on) { if (!audio.src) return; (on ? audio.play() : (audio.pause(), Promise.resolve())).then(() => bMusic.classList.toggle("on", on)).catch(() => {}); }

let resumeMusic = false; // musik berhenti saat undangan ditinggalkan (pindah tab/aplikasi), lanjut saat kembali
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { resumeMusic = !audio.paused; if (resumeMusic) setMusic(false); }
  else if (resumeMusic) { resumeMusic = false; setMusic(true); }
});
addEventListener("pagehide", () => audio.pause());

let scrolling = false, raf, acc = 0;
function setScroll(on) {
  scrolling = on; bScroll.classList.toggle("on", on); cancelAnimationFrame(raf);
  if (!on) return;
  const step = () => { acc += C.scrollSpeed || 0.7; if (acc >= 1) { window.scrollBy(0, Math.floor(acc)); acc %= 1; }
    if (window.innerHeight + scrollY >= document.body.scrollHeight - 2) return setScroll(false);
    raf = requestAnimationFrame(step); };
  raf = requestAnimationFrame(step);
}
["wheel","touchstart","keydown"].forEach(e => addEventListener(e, () => scrolling && setScroll(false), { passive: true }));

function enter() {
  document.body.classList.remove("locked");
  if (C.music.autoplay) setMusic(true);
  document.getElementById("s-verse").scrollIntoView({ behavior: "smooth" });
  if (C.autoscroll) setTimeout(() => setScroll(true), 1200);
}

function bind() {
  document.getElementById("open").onclick = () => {
    const env = document.getElementById("env");
    if (env) { env.classList.add("open"); setTimeout(enter, 1100); } else enter();
  };
  const ev = document.getElementById("env"); if (ev) ev.onclick = () => document.getElementById("open").click();
  document.getElementById("rsvp").onsubmit = submitRsvp;
  document.querySelectorAll("[data-copy]").forEach(b => b.onclick = async () => {
    const n = C.gifts[b.dataset.copy].number;
    try { await navigator.clipboard.writeText(n); } catch { const x = document.createElement("textarea"); x.value = n; document.body.appendChild(x); x.select(); document.execCommand("copy"); x.remove(); }
    b.textContent = T().copied; setTimeout(() => b.textContent = T().copy, 1600);
  });
  const cm = document.getElementById("car-media");
  if (cm) {
    const g = C.gallery, th = [...document.querySelectorAll("#thumbs .th")], strip = document.getElementById("thumbs"); let i = 0, x0 = null;
    const show = n => { i = (n + g.length) % g.length; cm.innerHTML = mainHTML(g[i]); th.forEach((x, k) => x.classList.toggle("on", k === i));
      strip.scrollTo({ left: th[i].offsetLeft - strip.clientWidth / 2 + th[i].clientWidth / 2, behavior: "smooth" }); };
    document.getElementById("car-prev").onclick = () => show(i - 1); document.getElementById("car-next").onclick = () => show(i + 1);
    th.forEach((x, k) => x.onclick = () => show(k));
    cm.onclick = e => { if (e.target.tagName === "IMG") lbShow(i); };
    const box = cm.parentNode; box.ontouchstart = e => x0 = e.touches[0].clientX;
    box.ontouchend = e => { if (x0 == null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) show(i + (d < 0 ? 1 : -1)); x0 = null; };
  }
  const lb = document.getElementById("lightbox");
  document.querySelectorAll(".gal .gi").forEach(f => f.onclick = () => lbShow(+f.dataset.i));
  lb.onclick = e => { const b = e.target.closest("button"); if (b && b.dataset.d) lbShow(LB_I + +b.dataset.d); else if (!["IMG", "VIDEO"].includes(e.target.tagName)) closeLb(); };
  const qo = document.getElementById("qr-open"); if (qo) qo.onclick = openQR;
}

document.getElementById("b-lang").onclick = () => { lang = lang === "id" ? "en" : "id"; render(); };
bMusic.onclick = () => setMusic(audio.paused);
bScroll.onclick = () => setScroll(!scrolling);

if (qs.has("preview")) { // ?preview=1 -> pemilih template
  const s = document.createElement("select"); s.id = "tpl-pick";
  s.innerHTML = TEMPLATES.map(x => `<option ${x === TPL ? "selected" : ""}>${x}</option>`).join("");
  s.onchange = () => { const p = new URLSearchParams(location.search); p.set("tpl", s.value); location.search = p; };
  document.body.appendChild(s);
}

if (qs.has("builder")) { // dipakai halaman generator (preview langsung)
  document.body.classList.remove("locked");
  addEventListener("message", e => { const d = e.data || {};
    if (d.cfg) { C = d.cfg; TPL = TEMPLATES.includes(C.template) ? C.template : "glassbox"; applyTheme(); }
    if ("guest" in d) guest = d.guest;
    if (d.musicPreview) audio.src = d.musicPreview;
    if (d.cfg || "guest" in d) render();
    if (d.goto) { const el = document.getElementById("s-" + d.goto); el && el.scrollIntoView({ behavior: "smooth" }); } });
  parent.postMessage({ ready: true }, "*");
}
render(); loadRemote();
})();
