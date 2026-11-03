/**
 * Flowers by Melibee: sign-up email alerts
 *
 * Runs in the flowersbymelibee@gmail.com Google account (script.google.com).
 * The website's "Conéctate con nosotros" form sends each new sign-up here
 * after it is saved in Firebase, and this script emails an alert to the
 * business inbox. The alert has a one-tap button that opens WhatsApp with the
 * right confirmation message already typed for that person.
 *
 * Deploy: Deploy > New deployment > Web app
 *   Execute as: Me (flowersbymelibee@gmail.com)
 *   Who has access: Anyone
 * Then paste the web app URL into src/pages/ClubPage.js (NOTIFY_URL).
 */

var ALERT_TO = 'flowersbymelibee@gmail.com';
var MAX_ALERTS_PER_HOUR = 30; // protects the inbox from floods

var SOURCE_LABELS = {
  website: 'Sitio web',
  bouquet_card: 'Tarjeta del ramo (QR)',
  checkout: 'Pedido',
  giveaway: 'Sorteo',
  event: 'Evento'
};

// Confirmation messages, matched to the boxes the person checked.
var CONFIRMATIONS = {
  es: {
    both: 'Flowers by Melibee: ¡Gracias por suscribirte! Recibirás avisos de tus pedidos y también ofertas, recordatorios de fechas especiales y avisos de temporada. La frecuencia varía. Pueden aplicar tarifas de mensajes y datos. Responde HELP para ayuda o STOP para cancelar. Términos: melibee.art/terminos.html',
    orders: 'Flowers by Melibee: ¡Gracias! Te enviaremos mensajes sobre tus pedidos, entregas o recogidas, y respuestas a tus preguntas. La frecuencia varía. Pueden aplicar tarifas de mensajes y datos. Responde HELP para ayuda o STOP para cancelar. Términos: melibee.art/terminos.html',
    promos: 'Flowers by Melibee: ¡Gracias por suscribirte a nuestras ofertas! Recibirás promociones, recordatorios de fechas especiales y avisos de temporada. La frecuencia varía. Pueden aplicar tarifas de mensajes y datos. Responde HELP para ayuda o STOP para cancelar. Términos: melibee.art/terminos.html'
  },
  en: {
    both: "Flowers by Melibee: Thanks for signing up! You'll get updates about your orders plus offers, special-date reminders and seasonal news. Msg frequency varies. Msg & data rates may apply. Reply HELP for help or STOP to cancel. Terms: melibee.art/terminos.html",
    orders: "Flowers by Melibee: Thanks! We'll send you messages about your orders, delivery or pickup, and answers to your questions. Msg frequency varies. Msg & data rates may apply. Reply HELP for help or STOP to cancel. Terms: melibee.art/terminos.html",
    promos: "Flowers by Melibee: Thanks for signing up for our offers! You'll get promotions, special-date reminders and seasonal news. Msg frequency varies. Msg & data rates may apply. Reply HELP for help or STOP to cancel. Terms: melibee.art/terminos.html"
  }
};

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var signup = cleanSignup(data);
    if (!signup) return reply({ ok: false, error: 'invalid' });
    if (overHourlyLimit()) return reply({ ok: false, error: 'rate_limited' });

    var email = buildAlertEmail(signup);
    MailApp.sendEmail({
      to: ALERT_TO,
      subject: email.subject,
      htmlBody: email.html,
      body: email.text,
      replyTo: signup.email,
      name: 'Flowers by Melibee (sitio web)'
    });
    return reply({ ok: true });
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: 'server' });
  }
}

// Only accept the fields the form sends, with sane sizes.
function cleanSignup(d) {
  function str(v, max) { return typeof v === 'string' ? v.trim().slice(0, max) : ''; }
  var s = {
    id: str(d.id, 40),
    name: str(d.name, 60),
    email: str(d.email, 100),
    phone: str(d.phone, 15),
    language: d.language === 'en' ? 'en' : 'es',
    source: str(d.source, 20),
    optInTransactional: d.optInTransactional === true,
    optInMarketing: d.optInMarketing === true
  };
  if (s.name.length < 2) return null;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email)) return null;
  if (s.phone && !/^\+1\d{10}$/.test(s.phone)) return null;
  return s;
}

function overHourlyLimit() {
  var cache = CacheService.getScriptCache();
  var key = 'alerts_' + Utilities.formatDate(new Date(), 'Etc/UTC', 'yyyyMMddHH');
  var count = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(count), 3600);
  return count > MAX_ALERTS_PER_HOUR;
}

function confirmationFor(s) {
  var t = CONFIRMATIONS[s.language];
  if (s.optInTransactional && s.optInMarketing) return t.both;
  if (s.optInMarketing) return t.promos;
  if (s.optInTransactional) return t.orders;
  return '';
}

function formatPhone(e164) {
  var d = e164.replace(/\D/g, '').slice(-10);
  return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
}

function esc(v) {
  return String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildAlertEmail(s) {
  var perms = [];
  if (s.optInTransactional) perms.push('pedidos');
  if (s.optInMarketing) perms.push('promociones');
  var permLabel = perms.length ? perms.join(' + ') : 'solo correo';
  var subject = 'Nuevo registro: ' + s.name + ' (' + permLabel + ')';

  var confirmation = confirmationFor(s);
  var waLink = s.phone && confirmation
    ? 'https://wa.me/' + s.phone.replace(/\D/g, '') + '?text=' + encodeURIComponent(confirmation)
    : '';
  var source = SOURCE_LABELS[s.source] || s.source || '—';
  var lang = s.language === 'en' ? 'Inglés' : 'Español';

  var row = function (label, value) {
    return '<tr><td style="padding:6px 12px 6px 0;color:#7a6a6a;white-space:nowrap;vertical-align:top">' + label +
      '</td><td style="padding:6px 0;color:#3f3333">' + value + '</td></tr>';
  };
  var yes = '<span style="color:#2f6b3f;font-weight:600">Sí</span>';
  var no = '<span style="color:#9a8a8a">No</span>';

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#3f3333">' +
    '<h2 style="color:#9d7373;margin:0 0 12px">Nuevo registro en el sitio</h2>' +
    '<table style="border-collapse:collapse;font-size:15px">' +
    row('Nombre', esc(s.name)) +
    row('Teléfono', s.phone ? esc(formatPhone(s.phone)) : '<i>No dejó teléfono</i>') +
    row('Correo', '<a href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a>') +
    row('Mensajes de pedidos', s.optInTransactional ? yes : no) +
    row('Promociones', s.optInMarketing ? yes : no) +
    row('Idioma', lang) +
    row('De dónde vino', esc(source)) +
    '</table>';

  if (waLink) {
    html +=
      '<p style="margin:22px 0 8px">Envíale la confirmación (ya está escrita, solo presiona enviar):</p>' +
      '<p style="margin:0 0 8px"><a href="' + esc(waLink) + '" style="display:inline-block;background:#25a35a;color:#fff;' +
      'text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:8px">Enviar confirmación por WhatsApp</a></p>' +
      '<p style="font-size:13px;color:#7a6a6a;margin:0 0 4px">Mensaje que se enviará:</p>' +
      '<blockquote style="margin:0;padding:10px 14px;background:#f9f3ee;border-left:3px solid #d4a5a5;font-size:14px">' +
      esc(confirmation) + '</blockquote>';
  } else if (!s.phone) {
    html += '<p style="margin:22px 0 0">No dejó teléfono ni aceptó textos. Si quieres, respóndele por correo (solo contesta este email).</p>';
  }

  html +=
    '<hr style="border:none;border-top:1px solid #e8d5ce;margin:24px 0 12px">' +
    '<p style="font-size:12px;color:#9a8a8a;line-height:1.5">' +
    (s.optInMarketing ? 'Puedes agregarle a tu lista de promociones. ' : 'No le envíes promociones por texto/WhatsApp (no lo aceptó). ') +
    'Si responde <b>STOP</b>: contesta una sola vez que ya no recibirá mensajes, quítalo de tus listas y anótalo en Firebase (consentLog).' +
    (s.id ? '<br>ID del registro en Firebase: ' + esc(s.id) : '') + '</p></div>';

  var text =
    'Nuevo registro en el sitio\n' +
    'Nombre: ' + s.name + '\n' +
    'Teléfono: ' + (s.phone ? formatPhone(s.phone) : 'no dejó') + '\n' +
    'Correo: ' + s.email + '\n' +
    'Mensajes de pedidos: ' + (s.optInTransactional ? 'Sí' : 'No') + '\n' +
    'Promociones: ' + (s.optInMarketing ? 'Sí' : 'No') + '\n' +
    'De dónde vino: ' + source + '\n' +
    (waLink ? '\nEnviar confirmación por WhatsApp: ' + waLink + '\n' : '');

  return { subject: subject, html: html, text: text };
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the editor (select "testAlert" > Run) to see a sample alert in the inbox.
function testAlert() {
  var sample = {
    name: 'Prueba Ejemplo', email: 'prueba@example.com', phone: '+19155551234', language: 'es',
    source: 'website', optInTransactional: true, optInMarketing: true, id: 'prueba123'
  };
  var email = buildAlertEmail(cleanSignup(sample));
  MailApp.sendEmail({ to: ALERT_TO, subject: '[PRUEBA] ' + email.subject, htmlBody: email.html, body: email.text });
}
