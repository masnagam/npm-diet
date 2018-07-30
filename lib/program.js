// This file is distributed under the MIT license.
// See LICENSE file in the project root for details.

'use strict';

const program = require('commander');

// A monkey patch of tj/commander.js@28ff02a9e47a91a5e01adaf06ac49e127813759c.
//
// Subcommands of npm-diet may take no arguments, but, at this moment,
// Commander.js supports only commands which take arguments.
// program.parseArgs() are overridden here in order to invokde a function passed
// to program.action().
program.parseArgs = function(args, unknown) {
  this.Command.prototype.parseArgs.call(this, args, unknown);
  if (args.length === 0) {
    if (this._args.filter(a => a.required).length === 0) {
      this.emit('command:*');
    }
  }
  return this;
};

module.exports = program;
