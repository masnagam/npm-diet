// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const fs = require('fs');
const path = require('path');

const SUPPORT_DIR = path.join(__dirname, '..', 'support');

const MINILR_JSON_PATH = path.join(SUPPORT_DIR, 'mini-lr.measure.json');
const MINILR_ANALYSIS =
  JSON.parse(fs.readFileSync(MINILR_JSON_PATH, { encoding: 'utf8' }));

const TINYLR_JSON_PATH = path.join(SUPPORT_DIR, 'tiny-lr.measure.json');
const TINYLR_ANALYSIS =
  JSON.parse(fs.readFileSync(TINYLR_JSON_PATH, { encoding: 'utf8' }));

const { delta } = require('../../lib/analyze/delta');

describe('delta', () => {
  let analysis = null;

  describe('returns an analysis', () => {
    beforeAll(() => {
      analysis = delta(MINILR_ANALYSIS, TINYLR_ANALYSIS);
    })

    afterAll(() => {
      analysis = null;
    });

    it('having the type property', () => {
      expect(analysis.type).toBe('delta');
    });

    it('having the baseline property', () => {
      expect(analysis.baseline).toEqual(MINILR_ANALYSIS);
    });

    it('having the subject property', () => {
      expect(analysis.subject).toEqual(TINYLR_ANALYSIS);
    });

    it('having the delta property', () => {
      expect(analysis.delta).toEqual({
        numPkgs: TINYLR_ANALYSIS.numPkgs - MINILR_ANALYSIS.numPkgs,
        size: TINYLR_ANALYSIS.size - MINILR_ANALYSIS.size,
        numFiles: TINYLR_ANALYSIS.numFiles - MINILR_ANALYSIS.numFiles
      });
    });

    it('having the increase property', () => {
      expect(analysis.increase).toBeDefined();
      expect(analysis.increase.numPkgs).toBeDefined();
      expect(analysis.increase.size).toBeDefined();
      expect(analysis.increase.numFiles).toBeDefined();
      expect(analysis.increase.packages).toBeDefined();
    });

    it('having the decreasee property', () => {
      expect(analysis.decrease).toBeDefined();
      expect(analysis.decrease.numPkgs).toBeDefined();
      expect(analysis.decrease.size).toBeDefined();
      expect(analysis.decrease.numFiles).toBeDefined();
      expect(analysis.decrease.packages).toBeDefined();
    });

    it('having the common property', () => {
      expect(analysis.common).toBeDefined();
      expect(analysis.common.numPkgs).toBeDefined();
      expect(analysis.common.size).toBeDefined();
      expect(analysis.common.numFiles).toBeDefined();
      expect(analysis.common.packages).toBeDefined();
    });
  });
});
