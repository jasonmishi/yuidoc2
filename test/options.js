var assert = require('assert');
var path = require('path');
var Y = require(path.join(__dirname, '../', 'lib', 'index'));

describe('Options Test Suite', function () {
  describe('Server Options', function () {
    it('test: server', function () {
      const options = Y.Options([
        '--server'
      ]);

      assert.ok(options.server, 'Failed to set server option');
      assert.strictEqual(options.port, 3000, 'Failed to set default port');
    });

    it('test: server with port', function () {
      const options = Y.Options([
        '--server',
        '5000'
      ]);

      assert.ok(options.server, 'Failed to set server option');
      assert.strictEqual(options.port, 5000, 'Failed to set port');
    });

    it('test: server with default port and following argument', function () {
      const options = Y.Options([
        '--server',
        './foo'
      ]);

      assert.ok(options.server, 'Failed to set server option');
      assert.strictEqual(options.port, 3000, 'Failed to set default port');
      assert.ok(Array.isArray(options.paths), 'Failed to set path');
      assert.strictEqual(options.paths[0], './foo', 'Failed to set path after empty --server');
    });

    it('test: tab-to-space', function () {
      let options, value;

      // Test that --tab-to-space gives the correct number.
      // It uses parseInt so check numbers which look like octals too.

      value = 12;
      options = Y.Options([
        '--tab-to-space',
        '0' + value
      ]);
      assert.strictEqual(options.tabtospace, value);
      assert.strictEqual(options.tabspace.length, value);

      options = Y.Options([
        '--tab-to-space',
        '' + value
      ]);
      assert.strictEqual(options.tabtospace, value);
      assert.strictEqual(options.tabspace.length, value);

      options = Y.Options([
        '--tab-to-space',
        value
      ]);
      assert.strictEqual(options.tabtospace, value);
      assert.strictEqual(options.tabspace.length, value);

      value = 10;
      options = Y.Options([
        '--tab-to-space',
        '0' + value
      ]);
      assert.strictEqual(options.tabtospace, value);
      assert.strictEqual(options.tabspace.length, value);

      options = Y.Options([
        '--tab-to-space',
        '' + value
      ]);
      assert.strictEqual(options.tabtospace, value);
      assert.strictEqual(options.tabspace.length, value);

      options = Y.Options([
        '--tab-to-space',
        value
      ]);
      assert.strictEqual(options.tabtospace, value);
      assert.strictEqual(options.tabspace.length, value);
    });
  });

  describe('Various Options', function () {
    it('test: long quiet option', function () {
      const options = Y.Options([
        '--quiet'
      ]);
      assert.ok(options.quiet, 'Failed to set long quiet');
    });

    it('test: short quiet option', function () {
      const options = Y.Options([
        '-q'
      ]);
      assert.ok(options.quiet, 'Failed to set short quiet');
    });

    it('test: short config', function () {
      const options = Y.Options([
        '-c',
        './foo.json'
      ]);
      assert.strictEqual(options.configfile, './foo.json', 'Failed to set config');
    });

    it('test: --config', function () {
      const options = Y.Options([
        '--config',
        './foo.json'
      ]);
      assert.strictEqual(options.configfile, './foo.json', 'Failed to set config');
    });

    it('test: --configfile', function () {
      const options = Y.Options([
        '--configfile',
        './foo.json'
      ]);
      assert.strictEqual(options.configfile, './foo.json', 'Failed to set config');
    });

    it('test: -e', function () {
      const options = Y.Options([
        '-e',
        '.foo'
      ]);
      assert.strictEqual(options.extension, '.foo', 'Failed to set extension');
    });

    it('test: --extension', function () {
      const options = Y.Options([
        '--extension',
        '.foo'
      ]);
      assert.strictEqual(options.extension, '.foo', 'Failed to set extension');
    });

    it('test: -x', function () {
      const options = Y.Options([
        '-x',
        'foo,bar,baz'
      ]);
      assert.strictEqual(options.exclude, 'foo,bar,baz', 'Failed to set exclude');
    });

    it('test: --exclude', function () {
      const options = Y.Options([
        '--exclude',
        'foo,bar,baz'
      ]);
      assert.strictEqual(options.exclude, 'foo,bar,baz', 'Failed to set exclude');
    });

    it('test: --project-version', function () {
      const options = Y.Options([
        '--project-version',
        '6.6.6'
      ]);
      assert.strictEqual(options.version, '6.6.6', 'Failed to set version');
    });

    it('test: --no-color', function () {
      const options = Y.Options([
        '--no-color'
      ]);
      assert.ok(options.nocolor, 'Failed to set nocolor');
      assert.strictEqual(Y.config.useColor, false, 'Failed to set Y.config.useColor');
    });

    it('test: -N', function () {
      const options = Y.Options([
        '-N'
      ]);
      assert.ok(options.nocolor, 'Failed to set nocolor');
      assert.strictEqual(Y.config.useColor, false, 'Failed to set Y.config.useColor');
    });

    it('test: --no-code', function () {
      const options = Y.Options([
        '--no-code'
      ]);
      assert.ok(options.nocode, 'Failed to set nocode');
    });

    it('test: -C', function () {
      const options = Y.Options([
        '-C'
      ]);
      assert.ok(options.nocode, 'Failed to set nocode');
    });

    it('test: --norecurse', function () {
      const options = Y.Options([
        '--norecurse'
      ]);
      assert.ok(options.norecurse, 'Failed to set norecurse');
    });

    it('test: -n', function () {
      const options = Y.Options([
        '-n'
      ]);
      assert.ok(options.norecurse, 'Failed to set norecurse');
    });

    it('test: --no-sort', function () {
      const options = Y.Options([
        '--no-sort'
      ]);
      assert.ok(options.dontsortfields, 'Failed to set dontsortfields');
    });

    it('test: --selleck', function () {
      const options = Y.Options([
        '--selleck'
      ]);
      assert.ok(options.selleck, 'Failed to set selleck');
    });

    it('test: -S', function () {
      const options = Y.Options([
        '-S'
      ]);
      assert.ok(options.selleck, 'Failed to set selleck');
    });

    it('test: -T simple', function () {
      const options = Y.Options([
        '-T',
        'simple'
      ]);
      assert.strictEqual(options.themedir, path.join(__dirname, '../themes/simple'));
    });

    it('test: --theme simple', function () {
      const options = Y.Options([
        '--theme',
        'simple'
      ]);
      assert.strictEqual(options.themedir, path.join(__dirname, '../themes/simple'));
    });

    it('test: --theme foobar', function () {
      const options = Y.Options([
        '--theme',
        'foobar'
      ]);
      assert.strictEqual(options.themedir, path.join(__dirname, '../themes/foobar'));
    });

    it('test: -t ./foobar', function () {
      const options = Y.Options([
        '-t',
        './foobar'
      ]);
      assert.strictEqual(options.themedir, './foobar');
    });

    it('test: --themedir ./foobar', function () {
      const options = Y.Options([
        '--themedir',
        './foobar'
      ]);
      assert.strictEqual(options.themedir, './foobar');
    });

    it('test: --syntaxtype coffee', function () {
      const options = Y.Options([
        '--syntaxtype',
        'coffee'
      ]);
      assert.strictEqual(options.syntaxtype, 'coffee');
    });

    it('test: --view', function () {
      const options = Y.Options([
        '--view'
      ]);
      assert.ok(options.dumpview);
    });

    it('test: -V', function () {
      const options = Y.Options([
        '-V'
      ]);
      assert.ok(options.dumpview);
    });

    it('test: -p', function () {
      const options = Y.Options([
        '-p'
      ]);
      assert.ok(options.parseOnly);
    });

    it('test: --parse-only', function () {
      const options = Y.Options([
        '--parse-only'
      ]);
      assert.ok(options.parseOnly);
    });

    it('test: -o <path>', function () {
      const options = Y.Options([
        '-o',
        '/foo/bar'
      ]);
      assert.strictEqual(options.outdir, '/foo/bar');
    });

    it('test: --outdir <path>', function () {
      const options = Y.Options([
        '--outdir',
        '/foo/bar'
      ]);
      assert.strictEqual(options.outdir, '/foo/bar');
    });

    it('test: -D', function () {
      const options = Y.Options([
        '-D'
      ]);
      assert.ok(options.nodeleteout);
    });

    it('test: --no-delete-out', function () {
      const options = Y.Options([
        '--no-delete-out'
      ]);
      assert.ok(options.nodeleteout);
    });

    it('test: --lint', function () {
      const options = Y.Options([
        '--lint'
      ]);
      assert.ok(options.lint);
      assert.ok(options.parseOnly);
      assert.ok(options.quiet);
      assert.strictEqual(options.writeJSON, false);
    });

    it('test --debug', function () {
      assert.strictEqual(Y.config.debug, false);
      Y.Options([
        '--debug'
      ]);
      assert.ok(Y.config.debug);
      assert.strictEqual(Y.config.filter, 'debug');
      Y.applyConfig({
        debug: false
      });
    });

    it('test: --charset', function () {
      Y.Options([
        '--charset'
      ]);
      assert.strictEqual(Y.charset, 'utf8');
    });

    it('test: --charset foo', function () {
      Y.Options([
        '--charset',
        'foo'
      ]);
      assert.strictEqual(Y.charset, 'foo');
      Y.charset = 'utf8';
    });

    it('test: --tab-to-space 8', function () {
      const options = Y.Options([
        '--tab-to-space',
        '8'
      ]);
      assert.strictEqual(options.tabtospace, 8);
      assert.strictEqual(options.tabspace, '        ');
    });
  })
});