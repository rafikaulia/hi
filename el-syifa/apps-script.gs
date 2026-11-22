/* GOOGLE APPS SCRIPT untuk undangan: RSVP + ucapan + check-in QR.
   Tempel SELURUH isi ini di: Google Sheet -> Extensions -> Apps Script (hapus kode lama dulu).
   JANGAN menempel isi file app.js / config.js di sini. */
const RSVP_SHEET = "RSVP";
const CHECKIN_SHEET = "Check-in";

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(header); }
  return sh;
}
function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Menerima kiriman form RSVP dari undangan
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  sheet_(RSVP_SHEET, ["Waktu", "Nama", "Kehadiran", "Jumlah tamu", "Ucapan"])
    .appendRow([new Date(), String(d.name || "").slice(0, 60), d.att === "yes" ? "Hadir" : "Tidak hadir", Number(d.count) || 1, String(d.text || "").slice(0, 300)]);
  return json_({ ok: true });
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.checkin) return checkin_(p);                       // QR di-scan petugas resepsionis
  const rows = sheet_(RSVP_SHEET, ["Waktu", "Nama", "Kehadiran", "Jumlah tamu", "Ucapan"]).getDataRange().getValues().slice(1).reverse().slice(0, 100);
  return json_(rows.map(function (r) {                     // daftar ucapan untuk ditampilkan di undangan
    return { name: String(r[1]), time: Utilities.formatDate(new Date(r[0]), "Asia/Jakarta", "d MMM yyyy"), text: String(r[4]) };
  }));
}

// Check-in: dipanggil saat QR tamu di-scan dengan kamera HP
function checkin_(p) {
  const sh = sheet_(CHECKIN_SHEET, ["Waktu", "Nama", "ID", "Jumlah (pax)", "Scan ke-"]);
  const name = String(p.checkin).slice(0, 60), id = String(p.id || "").slice(0, 30), pax = String(p.pax || "").slice(0, 5);
  const n = sh.getDataRange().getValues().slice(1).filter(function (r) { return String(r[1]) === name && String(r[2]) === id; }).length + 1;
  sh.appendRow([new Date(), name, id, pax, n]);
  const html = '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<body style="font-family:sans-serif;text-align:center;padding:48px 20px"><div style="font-size:56px">&#9989;</div>' +
    '<h2>Check-in berhasil</h2><h1>' + esc_(name) + '</h1>' +
    (pax ? '<p>Jumlah tamu: ' + esc_(pax) + '</p>' : '') +
    (n > 1 ? '<p style="color:#b45309">QR ini sudah dipindai ' + n + ' kali</p>' : '<p>Selamat datang!</p>') + '</body>';
  return HtmlService.createHtmlOutput(html).setTitle("Check-in");
}
