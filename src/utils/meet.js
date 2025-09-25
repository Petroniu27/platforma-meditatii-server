// @ts-nocheck
/* eslint-env node */
'use strict';

const crypto = require('crypto');

/**
 * Generează un link unic pentru meet (placeholder).
 * @param {string} id - de ex. booking._id.toString()
 * @returns {string}
 */
function generateMeetUrl(id) {
  const token = crypto.randomBytes(6).toString('hex');
  // concatenare clasică în loc de backticks (ca să nu mai dea TS1005)
  return 'https://meet.jit.si/' + token + '-' + id;
}

module.exports = { generateMeetUrl };