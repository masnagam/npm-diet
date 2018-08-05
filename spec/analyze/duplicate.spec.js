// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const fs = require('fs');
const path = require('path');

const SUPPORT_DIR = path.join(__dirname, '..', 'support');

const MEASURE_JSON_PATH = path.join(SUPPORT_DIR, 'livereload.measure.json');
const MEASURE =
  JSON.parse(fs.readFileSync(MEASURE_JSON_PATH, { encoding: 'utf8' }));

const { duplicate } = require('../../lib/analyze/duplicate');

describe('duplicate', () => {
  let analysis = null;

  describe('returns an analysis', () => {
    beforeAll(() => {
      analysis = duplicate(MEASURE);
    })

    afterAll(() => {
      analysis = null;
    });

    it('having the type property', () => {
      expect(analysis.type).toBe('duplicate');
    });
  });
});
