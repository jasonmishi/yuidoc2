var assert = require('assert');
var path = require('path');
var Y = require(path.join(__dirname, '../', 'lib', 'index'));

process.chdir(__dirname);

describe('Utils Test Suite', function () {
  describe('getProjectData Folder Priority', function () {
    it('test: Nearest Folder Priority', function () {
      const d = Y.getProjectData('input/folders1');
      assert.strictEqual('yuidoc-root', d.name, 'must use nearest yuidoc.json first');
    });

    it('test: Finds package.json', function () {
      const d = Y.getProjectData('input/folders2');
      assert.strictEqual('yuidoc-two', d.name, 'used deep yuidoc.json');
      assert.strictEqual('package-root', d.description, 'used shallow package.json');
    });

    it('test: Finds package.json in same folder as yuidoc.json', function () {
      const d = Y.getProjectData('input/folders3');
      assert.strictEqual('yuidoc-root', d.name, 'used deep yuidoc.json');
      assert.strictEqual('package-root', d.description, 'used deep package.json');
    });

    it('test: Ignores package.json in deeper folder than yuidoc.json', function () {
      const d = Y.getProjectData('input/folders4');
      assert.strictEqual('yuidoc-one', d.name, 'used deep yuidoc.json');
      assert.strictEqual(undefined, d.description, 'used deep package.json');
    });

    it('test: Must be breadth-first', function () {
      const d = Y.getProjectData('input/folders5');
      assert.strictEqual('yuidoc-two', d.name, 'used wrong yuidoc.json');
      assert.strictEqual('package-two', d.description, 'used wrong package.json');
    });
  });
  
  describe('validatePaths', function () {
    it('test: path globs', function () {
      let options;

      process.chdir(path.join(__dirname, 'input/globbing'));

      // Simulate a path provided by a configuration...
      // first with a String path
      options = {
          paths: '**/yui/src/*'
      };
      options = Y.Project.init(options);

      assert.strictEqual(Array.isArray(options.paths), true, 'Failed to set path');
      assert.strictEqual(options.paths.length, 3, 'Failed to retrieve all path options');

      // then with an Array of path
      options = {
          paths: [
              '**/yui/src/*'
          ]
      };
      options = Y.Project.init(options);

      assert.strictEqual(Array.isArray(options.paths), true, 'Failed to set path');
      assert.strictEqual(options.paths.length, 3, 'Failed to retrieve all path options');


      // Test with a path as passed to Y.Options
      options = Y.Options([
          '**/yui/src/*'
      ]);
      options = Y.Project.init(options);

      assert.strictEqual(Array.isArray(options.paths), true, 'Failed to set path');
      assert.strictEqual(options.paths.length, 3, 'Failed to retrieve all path options');
    });

    it('test: ignore paths', function () {
      let options;

      process.chdir(path.join(__dirname, 'input/with-symlink'));

      // Simulate a path provided by a configuration
      options = {
          paths: 'a',
          ignorePaths: [
            'a/d',
            'c'
          ]
      };
      options = Y.Project.init(options);

      assert.strictEqual(Array.isArray(options.paths), true, 'paths are present');
      assert.strictEqual(options.paths.length, 1, 'one path present');
      assert.strictEqual(options.paths[0], 'a', 'path a is in paths');
    });
  });

  describe('produce valid web urls', function () {
    it('test: Add paths onto end in sequence', function () {
      const url = Y.webpath('foo', 'bar', 'baz');
      assert.strictEqual(url, 'foo/bar/baz', 'parts should be added in sequence');
    });

    it('test: normalises windows paths into web happy urls', function (){
      const url = Y.webpath('foo\\bar', 'baz');
      assert.strictEqual(url, 'foo/bar/baz', '\\ should be normalised to /');
    });

    it('test: joins relative paths', function (){
      const url = Y.webpath('./foo/bar', './baz');
      assert.strictEqual(url, 'foo/bar/baz', 'should join relative paths');
    });
  });

  describe('getDirs', function () {
    it('test: gets paths as array', function() {
        const pathPrefix = __dirname + '/input/folders1';
        const dirs = Y.getDirs(pathPrefix, []);
        assert.strictEqual(Array.isArray(dirs), true);
        assert.strictEqual(dirs.length, 2);
        assert.notEqual(dirs.indexOf(pathPrefix + '/one'), -1, 'contains path /one');
        assert.notEqual(dirs.indexOf(pathPrefix + '/one/two'), -1, 'contains path /one/two');
    });

    it('test: gets paths from . as array', function() {
      const pathPrefix = __dirname + '/input/folders1';
      process.chdir(pathPrefix);
      const dirs = Y.getDirs('.', []);
      assert.strictEqual(Array.isArray(dirs), true);
      assert.strictEqual(dirs.length, 2);
      assert.notEqual(dirs.indexOf('one'), -1, 'contains path /one');
      assert.notEqual(dirs.indexOf('one/two'), -1, 'contains path /one/two');
    });

    it('test: ignores paths', function() {
        process.chdir(__dirname);
        const pathPrefix = __dirname + '/input/with-symlink';
        const dirs = Y.getDirs(pathPrefix, ['c']);
        assert.strictEqual(Array.isArray(dirs), true);
        assert.strictEqual(dirs.length, 2);
        assert.strictEqual(dirs.indexOf(pathPrefix + '.gitignore'), -1, 'does not contain file some-file');
        assert.strictEqual(dirs.indexOf(pathPrefix + '/a/b'), -1, 'does not contain symlink /a/b');
        assert.strictEqual(dirs.indexOf(pathPrefix + '/c'), -1, 'does not contain path /c');
        assert.notEqual(dirs.indexOf(pathPrefix + '/a'), -1, 'contains path /a');
        assert.notEqual(dirs.indexOf(pathPrefix + '/a/d'), -1, 'contains path /a/d');
    });
  });
});