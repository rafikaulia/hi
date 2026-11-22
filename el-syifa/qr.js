/* Generator QR code kecil, berdiri sendiri (tanpa internet / library luar).
   Mode byte (UTF-8), koreksi kesalahan level L, versi 1-10 (sampai +-270 karakter).
   Pakai: QRGen.draw(canvasElement, "teks", 240) */
(function (g) {
  const ECC = [7, 10, 15, 20, 26, 18, 20, 24, 30, 18], NB = [1, 1, 1, 1, 1, 2, 2, 2, 2, 4];
  const rawModules = v => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const a = Math.floor(v / 7) + 2; r -= (25 * a - 10) * a - 55; if (v >= 7) r -= 36; } return r; };
  const dataCw = v => Math.floor(rawModules(v) / 8) - ECC[v - 1] * NB[v - 1];
  const mul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z; };
  function divisor(d) {
    const r = new Array(d - 1).fill(0); r.push(1); let root = 1;
    for (let i = 0; i < d; i++) { for (let j = 0; j < r.length; j++) { r[j] = mul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; } root = mul(root, 2); }
    return r;
  }
  function remainder(data, div) {
    const r = div.map(() => 0);
    for (const b of data) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => { r[i] ^= mul(c, f); }); }
    return r;
  }
  function encode(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    let ver = 0;
    for (let v = 1; v <= 10; v++) if (4 + (v <= 9 ? 8 : 16) + bytes.length * 8 <= dataCw(v) * 8) { ver = v; break; }
    if (!ver) throw new Error("QR: teks terlalu panjang");
    const bits = [], put = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, ver <= 9 ? 8 : 16); bytes.forEach(b => put(b, 8));
    const cap = dataCw(ver) * 8; put(0, Math.min(4, cap - bits.length)); while (bits.length % 8) bits.push(0);
    for (let p = 0xEC; bits.length < cap; p ^= 0xEC ^ 0x11) put(p, 8);
    const data = []; for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; data.push(b); }
    const nb = NB[ver - 1], el = ECC[ver - 1], raw = Math.floor(rawModules(ver) / 8), ns = nb - raw % nb, sl = Math.floor(raw / nb);
    const div = divisor(el), blocks = []; let k = 0;
    for (let i = 0; i < nb; i++) {
      const dat = data.slice(k, k + sl - el + (i < ns ? 0 : 1)); k += dat.length;
      const ecc = remainder(dat, div); if (i < ns) dat.push(0); blocks.push(dat.concat(ecc));
    }
    const out = [];
    for (let i = 0; i < blocks[0].length; i++) blocks.forEach((bl, j) => { if (i !== sl - el || j >= ns) out.push(bl[i]); });
    return { ver, cw: out };
  }
  const count = (s, p) => { let c = 0, i = -1; while ((i = s.indexOf(p, i + 1)) >= 0) c++; return c; };
  function penalty(m, n) {
    let p = 0, dark = 0;
    for (let pass = 0; pass < 2; pass++) for (let a = 0; a < n; a++) {
      let run = 1, s = "";
      for (let b = 0; b < n; b++) {
        const v = pass ? m[b][a] : m[a][b]; s += v ? "1" : "0";
        if (b > 0) { const pv = pass ? m[b - 1][a] : m[a][b - 1]; if (v === pv) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; }
      }
      p += 40 * (count(s, "10111010000") + count(s, "00001011101"));
    }
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (m[y][x]) dark++;
      if (x < n - 1 && y < n - 1 && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
    }
    return p + (Math.ceil(Math.abs(dark * 20 - n * n * 10) / (n * n)) - 1) * 10;
  }
  function make(text, forceMask) {
    const { ver, cw } = encode(text), n = ver * 4 + 17;
    const mod = [], fn = [];
    for (let i = 0; i < n; i++) { mod.push(new Array(n).fill(false)); fn.push(new Array(n).fill(false)); }
    const setF = (x, y, d) => { mod[y][x] = d; fn[y][x] = true; };
    for (let i = 0; i < n; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
    const finder = (x, y) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy)), xx = x + dx, yy = y + dy;
      if (xx >= 0 && xx < n && yy >= 0 && yy < n) setF(xx, yy, d !== 2 && d !== 4); } };
    finder(3, 3); finder(n - 4, 3); finder(3, n - 4);
    const na = ver === 1 ? 0 : Math.floor(ver / 7) + 2, pos = [];
    if (ver > 1) { const step = Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2; pos.push(6); for (let p = n - 7; pos.length < na; p -= step) pos.splice(1, 0, p); }
    for (let i = 0; i < na; i++) for (let j = 0; j < na; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setF(pos[i] + dx, pos[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    const bit = (x, i) => ((x >>> i) & 1) !== 0;
    const drawFormat = (m, mask) => {
      const data = (1 << 3) | mask; let rem = data; // level L = 01
      for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      const bits = ((data << 10) | rem) ^ 0x5412, set = (x, y, d) => { m[y][x] = d; fn[y][x] = true; };
      for (let i = 0; i <= 5; i++) set(8, i, bit(bits, i));
      set(8, 7, bit(bits, 6)); set(8, 8, bit(bits, 7)); set(7, 8, bit(bits, 8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, bit(bits, i));
      for (let i = 0; i < 8; i++) set(n - 1 - i, 8, bit(bits, i));
      for (let i = 8; i < 15; i++) set(8, n - 15 + i, bit(bits, i));
      set(8, n - 8, true);
    };
    drawFormat(mod, 0);
    if (ver >= 7) {
      let rem = ver; for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      const bits = (ver << 12) | rem;
      for (let i = 0; i < 18; i++) { const c = bit(bits, i), a = n - 11 + (i % 3), b = Math.floor(i / 3); setF(a, b, c); setF(b, a, c); }
    }
    let i = 0;
    for (let right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < n; vert++) for (let j = 0; j < 2; j++) {
        const x = right - j, up = ((right + 1) & 2) === 0, y = up ? n - 1 - vert : vert;
        if (!fn[y][x] && i < cw.length * 8) { mod[y][x] = bit(cw[i >>> 3], 7 - (i & 7)); i++; }
      }
    }
    const cond = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
      (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
      (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0];
    let best = null, bestP = Infinity;
    for (let mask = 0; mask < 8; mask++) {
      if (forceMask !== undefined && mask !== forceMask) continue;
      const m = mod.map(r => r.slice());
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!fn[y][x] && cond[mask](x, y)) m[y][x] = !m[y][x];
      drawFormat(m, mask);
      const p = penalty(m, n); if (p < bestP) { bestP = p; best = m; }
    }
    return { size: n, dark: (x, y) => best[y][x] };
  }
  function draw(canvas, text, px, forceMask) {
    const q = make(text, forceMask), dpr = Math.max(1, Math.min(3, g.devicePixelRatio || 1)), quiet = 2, total = q.size + quiet * 2;
    const cell = Math.max(2, Math.floor(px * dpr / total));
    canvas.width = canvas.height = cell * total; canvas.style.width = canvas.style.height = cell * total / dpr + "px";
    const c = canvas.getContext("2d"); c.fillStyle = "#fff"; c.fillRect(0, 0, canvas.width, canvas.height); c.fillStyle = "#111";
    for (let y = 0; y < q.size; y++) for (let x = 0; x < q.size; x++) if (q.dark(x, y)) c.fillRect((x + quiet) * cell, (y + quiet) * cell, cell, cell);
    return q;
  }
  g.QRGen = { make, draw };
})(window);
