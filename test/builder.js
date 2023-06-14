var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Y = require(path.join(__dirname, '../', 'lib', 'index'));

describe('Builder Test Suite', function () {
  function isObject(obj) {
    const type = typeof obj;
    return type === 'function' || (type === 'object' && !!obj);
  }

  before(async function () {
    const options = {
      quiet: true,
      paths: [
        'input/inherit',
        'input/json',
        'input/test'
      ],
      outdir: './out',
      helpers: [
        path.join(__dirname, 'lib/davglass.js')
      ],
      markdown: {
        langPrefix: 'language-'
      }
    };
    process.chdir(__dirname);
    const json = (new Y.YUIDoc(options)).run();

    this.project = json.project;
    this.data = json;

    const builder = new Y.DocBuilder(options, json);
    let setupComplete = false;
    builder.compile(function () {
      setupComplete = true;
    });
    this.builder = builder;

    // wait for setup to complete
    while (!setupComplete) {
      await new Promise((resolve) => setTimeout(() => resolve(true), 20));
    }
  });

  const exists = fs.existsSync || path.existsSync;

  describe('Builder setup', function () {
    it('test: Directories', function () {
      const dirs = ['assets', 'classes', 'files', 'modules', 'elements'];
      dirs.forEach(function (d) {
        const p = path.join(__dirname, 'out', d);
        assert.ok(exists(p), 'Failed to find: ' + p);
      });
    });

    it('test: Assets Directories', function () {
      const dirs = ['css', 'js', 'img', 'vendor', 'index.html'];
      dirs.forEach(function (d) {
        const p = path.join(__dirname, 'out', 'assets', d);
        assert.ok(exists(p), 'Failed to find: ' + p);
      });
    });

    it('test: index.html', function () {
      const p = path.join(__dirname, 'out', 'index.html');
      assert.ok(exists(p), 'Failed to find: ' + p);
    });

    it('test: data.json', function () {
      const p = path.join(__dirname, 'out', 'data.json');
      assert.ok(exists(p), 'Failed to find: ' + p);
    });

    it('test: api.js', function () {
      const p = path.join(__dirname, 'out', 'api.js');
      assert.ok(exists(p), 'Failed to find: ' + p);
    });

    it('test: classes/JSON.html', function () {
      const p = path.join(__dirname, 'out', 'classes', 'JSON.html');
      assert.ok(exists(p), 'Failed to find: ' + p);
    });

    it('test: files name filter', function () {
      const dir = path.join(__dirname, 'out', 'files');
      fs.readdirSync(dir).forEach(function (file) {
        assert.ok(((file.indexOf('input_') === 0) || file.indexOf('index.html') === 0), 'Filed to parse: ' + file);
      });
    });

    it('test: module files', function () {
      const mods = this.data.modules;
      Object.keys(mods).forEach(function (name) {
        const m = mods[name];
        const p = path.join(__dirname, 'out', 'modules', m.name + '.html');
        assert.ok(exists(p), 'Failed to render: ' + m.name + '.html');
      });
    });

    it('test: class files', function () {
      const mods = this.data.classes;
      Object.keys(mods).forEach(function (name) {
        const m = mods[name];
        const p = path.join(__dirname, 'out', 'classes', m.name + '.html');
        assert.ok(exists(p), 'Failed to render: ' + m.name + '.html');
      });
    });

    it('test: element files', function () {
      const mods = this.data.elements;
      Object.keys(mods).forEach(function (name) {
        const m = mods[name];
        const p = path.join(__dirname, 'out', 'elements', m.name + '.html');
        assert.ok(exists(p), 'Failed to render: ' + m.name + '.html');
      });
    });
  });

  describe('Builder Augmentation Tests', function () {
    it('test: inherited methods', function () {
      const item = this.data.classes['mywidget.SubWidget'];
      assert.ok(isObject(item), 'Failed to parse class');
      this.builder.renderClass(function (html, view, opts) {
        let method;
        opts.meta.methods.forEach(function (i) {
          if (i.name === 'myMethod' && i.class === 'mywidget.SubWidget') {
            method = i;
          }
        });

        assert.ok(isObject(method), 'Failed to find inherited method');
        assert.ok(isObject(method.overwritten_from), 'Failed to find overwritten data');
      }, item);
    });

    it('test: extension_for', function () {
      const item = this.data.classes['mywidget.SubWidget'];
      assert.ok(isObject(item), 'Failed to parse class');
      this.builder.renderClass(function (html, view, opts) {
        const extension_for = opts.meta.extension_for;
        assert.ok(isObject(extension_for), 'Failed to assign extension_for');
        assert.strictEqual(extension_for.length, 1, 'Failed to assign extension_for');
      }, item);
    });

    it('test: helper methods', function () {
      const item = this.data.classes['mywidget.SuperWidget'];
      assert.ok(isObject(item), 'Failed to parse class');
      this.builder.renderClass(function (html, view, opts) {
        let method;
        opts.meta.methods.forEach(function (i) {
          if (i.name === 'getTargets2' && i.class === 'mywidget.SuperWidget') {
            method = i;
          }
        });

        assert.ok(isObject(method), 'Failed to find inherited method');
        assert.ok((method.description.indexOf('DAVGLASS_WAS_HERE::Foo') > 0), 'Helper failed to parse');
      }, item);
    });

    it('test: markdown options', function () {
      const item = this.data.classes['mywidget.SuperWidget'];
      assert.ok(isObject(item), 'Failed to parse class');
      this.builder.renderClass(function (html, view, opts) {
        let method;
        opts.meta.methods.forEach(function (i) {
          if (i.name === 'getTargets3' && i.class === 'mywidget.SuperWidget') {
            method = i;
          }
        });

        assert.ok((method.description.indexOf('language-javascript') > 0), 'Markdown options were not applied');
      }, item);
    });
  })
})