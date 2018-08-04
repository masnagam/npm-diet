// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const measure = require('./measure');
const delta = require('./delta');

function summary(analysis, options) {
  switch (analysis.type) {
  case 'measure':
    return measure.summary(analysis, options);
  case 'delta':
    return delta.summary(analysis, options);
  }
}

module.exports.summary = summary;
module.exports.measure = measure;
module.exports.delta = delta;
