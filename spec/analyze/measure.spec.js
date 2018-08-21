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

const EventEmitter = require('events');
const path = require('path');
const proxyquire = require('proxyquire');
const memfs = require('memfs');
const { exec } = require('child_process');

const stubs = {
  child_process: {
    exec: jasmine.createSpy('child_process.exec', exec)
  },
  fs: memfs.fs
};

const {
  measure, parseSpec_, normalizeSpecs_, computeInstallArgs_
} = proxyquire('../../lib/analyze/measure', stubs);

// inverse transformation of Object.entries()
function pack(entries) {
  return entries.reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {});
}

describe('measure', () => {
  const WORKDIR = process.cwd();

  const FOO = { name: 'foo', version: '1.0.0' };
  const FOO_PATH = path.join('node_modules', FOO.name);
  const FOO_LIB_INDEX_JS_PATH = path.join(FOO_PATH, 'lib', 'index.js');
  const FOO_LIB_INDEX_JS = 'module.exports.foo = 1;';
  const FOO_LIB_SYMLINK_JS_PATH = path.join(FOO_PATH, 'lib', 'symlink.js');
  const FOO_PACKAGE_JSON_PATH = path.join(FOO_PATH, 'package.json');
  const FOO_PACKAGE_JSON = JSON.stringify(FOO);
  const BAR = { name: 'bar', version: '2.0.0' };
  const BAR_PATH = path.join(FOO_PATH, 'node_modules', BAR.name);
  const BAR_PACKAGE_JSON_PATH = path.join(BAR_PATH, 'package.json');
  const BAR_PACKAGE_JSON = JSON.stringify(BAR);

  const FILES = [
    [FOO_LIB_INDEX_JS_PATH, FOO_LIB_INDEX_JS],
    [FOO_PACKAGE_JSON_PATH, FOO_PACKAGE_JSON],
    [BAR_PACKAGE_JSON_PATH, BAR_PACKAGE_JSON]
  ];

  const VOLUME = pack(FILES);

  const NUM_PKGS = 2;
  const SIZE = FILES.reduce((a, e) => a + e[1].length, 0);
  const NUM_FILES = FILES.length;

  const EVENT_NAMES = [
    'start', 'prepare', 'install', 'analyze', 'done'
  ];

  const ERROR_MESSAGE = 'failed to install';
  const ERROR = new Error(ERROR_MESSAGE);

  let listeners = {};
  let analysis = null;

  beforeEach(() => {
    stubs.child_process.exec
      .withArgs('npm init -y --scope=npm-diet', { cwd: WORKDIR },
                jasmine.any(Function))
      .and.callFake((command, options, callback) => {
        callback(null, { stdout: '', stderr: '' });
      });

    stubs.child_process.exec
      .withArgs('npm install foo', { cwd: WORKDIR }, jasmine.any(Function))
      .and.callFake((command, options, callback) => {
        memfs.vol.fromJSON(VOLUME, options.cwd);
        memfs.vol.symlinkSync(FOO_LIB_INDEX_JS, FOO_LIB_SYMLINK_JS_PATH);
        callback(null, { stdout: '', stderr: '' });
      });

    stubs.child_process.exec
      .withArgs('npm install bad', { cwd: WORKDIR }, jasmine.any(Function))
      .and.throwError(ERROR);

    stubs.child_process.exec
      .withArgs('npm ls --parseable', { cwd: WORKDIR }, jasmine.any(Function))
      .and.callFake((command, options, callback) => {
        const stdout = [
          options.cwd,
          path.join(options.cwd, FOO_PATH),
          path.join(options.cwd, BAR_PATH)
        ].join(' ');
        callback(null, { stdout, stderr: '' })
      });

    EVENT_NAMES.forEach((name) => listeners[name] = jasmine.createSpy(name));
  });

  afterEach(() => {
    analysis = null;
    listeners = {};
    memfs.vol.reset();
    stubs.child_process.exec.calls.reset();
  });

  describe('returns an analysis', () => {
    beforeEach(async () => {
      const emitter = new EventEmitter();
      Object.entries(listeners)
        .forEach(([name, listener]) => emitter.on(name, listener));
      analysis = await measure(['foo'], WORKDIR, emitter);
    });

    it('having the type property', () => {
      expect(analysis.type).toBe('measure');
    });

    it('having the specs property', () => {
      expect(analysis.specs).toEqual([{ name: 'foo', detail: '*' }]);
    });

    it('having the numPkgs property', () => {
      expect(analysis.numPkgs).toBe(NUM_PKGS);
    });

    it('having the size property', () => {
      expect(analysis.size).toBe(SIZE)
    });

    it('having the numFiles property', () => {
      expect(analysis.numFiles).toBe(NUM_FILES);
    });

    it('having the packages property', () => {
      expect(analysis.packages).toEqual([{
        name: FOO.name,
        version: FOO.version,
        size: FOO_LIB_INDEX_JS.length + FOO_PACKAGE_JSON.length,
        files: [{
          path: path.relative(FOO_PATH, FOO_LIB_INDEX_JS_PATH),
          size: FOO_LIB_INDEX_JS.length
        }, {
          path: path.relative(FOO_PATH, FOO_PACKAGE_JSON_PATH),
          size: FOO_PACKAGE_JSON.length
        }],
        path: FOO_PATH
      }, {
        name: BAR.name,
        version: BAR.version,
        size: BAR_PACKAGE_JSON.length,
        files: [{
          path: path.relative(BAR_PATH, BAR_PACKAGE_JSON_PATH),
          size: BAR_PACKAGE_JSON.length
        }],
        path: BAR_PATH
      }]);
    });

    it('and emits the `start` event', () => {
      expect(listeners.start).toHaveBeenCalled();
    });

    it('and emits the `prepare` event', () => {
      expect(listeners.prepare).toHaveBeenCalled();
    });

    it('and emits the `install` event', () => {
      expect(listeners.install).toHaveBeenCalled();
    });

    it('and emits the `analyze` event', () => {
      expect(listeners.analyze).toHaveBeenCalled();
    });

    it('and emits the `done` event', () => {
      expect(listeners.done).toHaveBeenCalled();
    });
  });

  describe('when `npm install` failed', () => {

    let error = null;

    beforeEach(async () => {
      const emitter = new EventEmitter();
      Object.entries(listeners)
        .forEach(([name, listener]) => emitter.on(name, listener));
      try {
        await measure(['bad'], WORKDIR, emitter);
      } catch (e) {
        error = e;
      }
    });

    it('throws an Error', () => {
      expect(error).toBe(ERROR);
    });

    it('emits the `start` event', () => {
      expect(listeners.start).toHaveBeenCalled();
    });

    it('emits the `prepare` event', () => {
      expect(listeners.prepare).toHaveBeenCalled();
    });

    it('emits the `install` event', () => {
      expect(listeners.install).toHaveBeenCalled();
    });

    it('does not emit the `analyze` event', () => {
      expect(listeners.analyze).not.toHaveBeenCalled();
    });

    it('does not emit the `done` event', () => {
      expect(listeners.done).not.toHaveBeenCalled();
    });
  });
});

describe('parseSpec_', () => {
  it('supports the scoped package name', () => {
    const spec = parseSpec_('@masnagam/npm-diet@^1.0.0');
    expect(spec).toEqual({
      name: '@masnagam/npm-diet',
      detail: '^1.0.0'
    });
  })

  it('supports the github path format', () => {
    const spec = parseSpec_('foo@bar/baz');
    expect(spec).toEqual({
      name: 'foo',
      detail: 'bar/baz'
    });
  });

  it('supports the url format', () => {
    const spec = parseSpec_('foo@git+https://bar@github.com/bar/baz.git');
    expect(spec).toEqual({
      name: 'foo',
      detail: 'git+https://bar@github.com/bar/baz.git'
    });
  });
});

describe('normalizeSpecs_', () => {
  it('supports "_" prefix', () => {
    const specs = normalizeSpecs_([
      { name: 'aaa', details: '*' },
      { name: 'bbb', details: '*' },
      { name: '_aaa', details: '1.0.0' },
      { name: '_ccc', details: '*' },
      { name: 'bbb', details: '1.0.0' }
    ]);
    expect(specs).toEqual([{ name: 'bbb', details: '*' }]);
  });
});

describe('computeInstallArgs_', () => {
  it('supports the sevmer format', () => {
    const args = computeInstallArgs_([{
      name: '@masnagam/npm-diet',
      detail: '^1.0.0'
    }]);
    expect(args).toEqual(['@masnagam/npm-diet@>=1.0.0 <2.0.0']);
  });

  it('supports the url format', () => {
    const args = computeInstallArgs_([{
      name: 'foo',
      detail: 'git+https://bar@github.com/bar/baz.git'
    }]);
    expect(args).toEqual(['git+https://bar@github.com/bar/baz.git']);
  });
});
