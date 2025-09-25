// @ts-nocheck
/* eslint-env node */
'use strict';

function periodFromDate(d) {
  var date = d ? new Date(d) : new Date();
  var y = date.getUTCFullYear();
  var m = (date.getUTCMonth() + 1).toString();
  if (m.length < 2) m = '0' + m;
  return y + '-' + m;
}

module.exports = { periodFromDate };