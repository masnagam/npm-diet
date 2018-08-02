// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const showMeasure = require('./measure');
const showDelta = require('./delta');

function show(analysis, options) {
  switch (analysis.type) {
  case 'measure':
    return showMeasure(analysis, options);
  case 'delta':
    return showDelta(analysis, options);
  }
}

module.exports = show;
