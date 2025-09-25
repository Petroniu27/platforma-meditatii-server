// @ts-nocheck
/* eslint-env node */
'use strict';

/**
 * Creează conținut .ics pentru un eveniment (calendar invite).
 * @param {Object} opts
 * @returns {string}
 */
function toICS(opts) {
  opts = opts || {};
  var uid = opts.uid != null ? String(opts.uid) : '';
  var title = opts.title != null ? String(opts.title) : '';
  var description = opts.description != null ? String(opts.description) : '';
  var start = opts.start != null ? opts.start : new Date();
  var end = opts.end != null ? opts.end : new Date(new Date(start).getTime() + 30 * 60000);
  var url = opts.url != null ? String(opts.url) : '';

  function fmt(d) {
    var iso = new Date(d).toISOString();          // ex: 2025-09-09T08:00:00.000Z
    iso = iso.replace(/[-:]/g, '');               // 20250909T080000.000Z
    iso = iso.replace(/\.\d{3}Z$/, 'Z');          // 20250909T080000Z
    return iso;
  }

  function escapeText(s) {
    s = String(s);
    s = s.replace(/\\/g, '\\\\'); // backslash
    s = s.replace(/,/g, '\\,');
    s = s.replace(/;/g, '\\;');
    s = s.replace(/\r?\n/g, '\\n');
    return s;
  }

  var lines = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//platforma-meditatii//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push('BEGIN:VEVENT');
  lines.push('UID:' + uid);
  lines.push('SUMMARY:' + escapeText(title));
  lines.push('DESCRIPTION:' + escapeText(description));
  lines.push('DTSTART:' + fmt(start));
  lines.push('DTEND:' + fmt(end));
  if (url) lines.push('URL:' + url);
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

module.exports = { toICS };