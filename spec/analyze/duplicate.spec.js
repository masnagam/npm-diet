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
