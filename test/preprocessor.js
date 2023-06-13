var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Y = require(path.join(__dirname, '../', 'lib', 'index'));

process.chdir(__dirname);

describe('Preprocessor Test Suite', function () {
  function isObject(obj) {
    const type = typeof obj;
    return type === 'function' || (type === 'object' && !!obj);
  }

  it('test: single preprocessor', function () {
    global.testPreprocessorCallCount = 0;

    const json = (new Y.YUIDoc({
      quiet: true,
      paths: ['input/preprocessor'],
      outdir: './out',
      preprocessor: 'lib/testpreprocessor.js'
    })).run();

    assert.equal(isObject(json), true);
    assert.equal(global.testPreprocessorCallCount, 1, 'the preprocessor was not called');
  });

  it('test: single preprocessor with absolute path', function () {
    global.testPreprocessorCallCount = 0;

    const json = (new Y.YUIDoc({
      quiet: true,
      paths: ['input/preprocessor'],
      outdir: './out',
      preprocessor: path.join(process.cwd(), '/lib/testpreprocessor.js')
    })).run();

    assert.equal(isObject(json), true);
    assert.equal(global.testPreprocessorCallCount, 1, 'the preprocessor was not called when an absolute path was used');
  });

  it('test: several preprocessors', function () {
    global.testPreprocessorCallCount = 0;

    const json = (new Y.YUIDoc({
      quiet: true,
      paths: ['input/preprocessor'],
      outdir: './out',
      preprocessor: ['lib/testpreprocessor.js', './lib/testpreprocessor']
    })).run();

    assert.equal(isObject(json), true);
    assert.equal(global.testPreprocessorCallCount, 2, 'the preprocessor was not called twice');
  });

  it('test: the test preprocessor does its job', function () {
    const json = (new Y.YUIDoc({
      quiet: true,
      paths: ['input/preprocessor'],
      outdir: './out',
      preprocessor: 'lib/testpreprocessor.js',
      star: '#'
    })).run();

    assert.equal(isObject(json), true);
    assert.equal(json.classes.TestPreprocessor.customtagPlusStar, 'hello#', 'the preprocessor did not modify the data');
  });

  it('test: load preprocessor as a npm module', function () {
    // We are testing if it works to load the preprocessor from node_modules,
    // so first we need to copy it in place.
    if (!fs.existsSync('../node_modules/testpreprocessormodule')) {
      fs.mkdirSync('../node_modules/testpreprocessormodule');
    }

    fs.writeFileSync('../node_modules/testpreprocessormodule/package.json',
      fs.readFileSync('lib/testpreprocessormodule/package.json')
    );

    fs.writeFileSync('../node_modules/testpreprocessormodule/testpreprocessormodule.js',
      fs.readFileSync('lib/testpreprocessormodule/testpreprocessormodule.js')
    );

    var json = (new Y.YUIDoc({
      quiet: true,
      paths: ['input/preprocessor'],
      outdir: './out',
      preprocessor: 'testpreprocessormodule'
    })).run();

    assert.equal(isObject(json), true);
    assert.equal(json.testModuleWasHere, true, 'the preprocesor module was not run')

    // Clean up things when we are done.
    fs.unlinkSync('../node_modules/testpreprocessormodule/package.json');
    fs.unlinkSync('../node_modules/testpreprocessormodule/testpreprocessormodule.js');
    fs.rmdirSync('../node_modules/testpreprocessormodule');
  });

  //TODO: Fix this to be be unnecessary
  /**
   * This is necessary because files are written to asynchronously.
   * not waiting for the file to exist can cause the test to fail.
  */
  async function waitForFileExists(filePath, currentTime = 0) {
    if (fs.existsSync(filePath)) return true;
    if (currentTime === 1000) return false;

    await new Promise((resolve) => setTimeout(() => resolve(true), 20));

    return waitForFileExists(filePath, currentTime + 20);
  }

  afterEach(async function () {
    return waitForFileExists(path.join('./out', 'data.json')).then(function (exists) {
      if (exists) {
        fs.rmSync('./out', { recursive: true });
      }
    });
  });
})