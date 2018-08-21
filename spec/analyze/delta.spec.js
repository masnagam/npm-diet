// Copyright 2018 Masayuki Nagamachi <masayuki.nagamachi@gmail.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
