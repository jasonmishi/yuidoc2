var assert = require('assert');
var path = require('path');
var Y = require(path.join(__dirname, '../', 'lib', 'index'));

describe('CoffeeScript Parser Test Suite', function () {

  describe('CoffeeScript Parser Test 1', function () {
    before(function () {
      const json = (new Y.YUIDoc({
        quiet: true,
        paths: ['input/coffee1'],
        outdir: './out',
        extension: '.coffee',
        syntaxtype: 'coffee'
      })).run();

      this.project = json.project;
    });

    it('test: CoffeeScript Project Data 1', function () {
      assert.strictEqual(this.project.file, path.normalize('input/coffee1/test.coffee'), 'Project data loaded from wrong file');
      assert.strictEqual(this.project.line, 2, 'Line number is off');
      assert.strictEqual(this.project.description, 'The test project', 'Description not set properly');
      assert.strictEqual(this.project.title, 'The Tester', 'Title not set');
      assert.strictEqual(this.project.author, 'admo', 'Author not set');
      assert.strictEqual(this.project.contributor, 'entropy', 'Contributor not set');
      assert.strictEqual(this.project.icon[0], 'http://a.img', 'Icon not set');
      assert.strictEqual(this.project.icon.length, 1, 'Found wring number of icons');
      assert.strictEqual(this.project.url.length, 2, 'Found wrong number of urls');
      assert.strictEqual(this.project.url[0], 'http://one.url', 'URL #1 is wrong');
      assert.strictEqual(this.project.url[1], 'http://two.url', 'URL #2 is wrong');
    });
  });

  describe('CoffeeScript Parser Test 2', function () {
    before(function () {
      const json = (new Y.YUIDoc({
        quiet: true,
        paths: ['input/coffee2'],
        outdir: './out',
        extension: '.coffee',
        syntaxtype: 'coffee'
      })).run();

      this.project = json.project;
    });

    it('test: CoffeeScript Project Data 2', function () {
      assert.strictEqual(this.project.file, path.normalize('input/coffee2/test.coffee'), 'Project data loaded from wrong file');
      assert.strictEqual(this.project.line, 2, 'Line number is off');
      assert.strictEqual(this.project.description, 'The test project', 'Description not set properly');
      assert.strictEqual(this.project.title, 'The Tester', 'Title not set');
      assert.strictEqual(this.project.author, 'admo', 'Author not set');
      assert.strictEqual(this.project.contributor, 'entropy', 'Contributor not set');
      assert.strictEqual(this.project.icon[0], 'http://a.img', 'Icon not set');
      assert.strictEqual(this.project.icon.length, 1, 'Found wring number of icons');
      assert.strictEqual(this.project.url.length, 2, 'Found wrong number of urls');
      assert.strictEqual(this.project.url[0], 'http://one.url', 'URL #1 is wrong');
      assert.strictEqual(this.project.url[1], 'http://two.url', 'URL #2 is wrong');
    });
  });
});