var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Y = require(path.join(__dirname, '../', 'lib', 'index'));

process.chdir(__dirname);

describe('Files Test Suite', function () {

  // TODO: Fix the code to be more test/user friendly maybe return a promise on delete
  async function waitForFileExists(filePath, currentTime = 0) {
    if (fs.existsSync(filePath)) return true;
    if (currentTime === 1000) return false;
    // wait for 0.02 second
    await new Promise((resolve) => setTimeout(() => resolve(true), 20));
    return waitForFileExists(filePath, currentTime + 20);
  }

  it('test: exits', function (done) {
    fs.writeFileSync('file1.txt', 'Files Test');
    Y.Files.exists('file1.txt', function (exists) {
      fs.unlinkSync('file1.txt');
      assert.ok(exists);
      done();
    });
  });

  it('test: copyDirectory', function (done) {
    fs.mkdirSync('dir1');
    Y.Files.copyDirectory('dir1', 'dir2', true, function (err) {
      fs.rmdirSync('dir1');
      fs.rmdirSync('dir2');
      assert.strictEqual(err, undefined);
      done();
    });
  });

  it('test: copyFile', function () {
    fs.writeFileSync('file1.txt', 'Files Test');
    Y.Files.copyFile('file1.txt', 'file2.txt', true, function (err) {
      fs.unlinkSync('file1.txt');
      assert.strictEqual(err, undefined);
    });
    return waitForFileExists('file2.txt').then((exists) => {
      assert.ok(exists);
      fs.unlinkSync('file2.txt');
    });
  });

  it('test: copyPath for file', function () {
    fs.writeFileSync('file1.txt', 'Files Test');
    Y.Files.copyPath('file1.txt', 'file2.txt', true, function (err) {
      fs.unlinkSync('file1.txt');
      assert.strictEqual(err, undefined);
    });
    return waitForFileExists('file2.txt').then((exists) => {
      assert.ok(exists);
      fs.unlinkSync('file2.txt');
    });
  });

  it('test: copyPath for directory', function (done) {
    fs.mkdirSync('dir1');
    Y.Files.copyPath('dir1', 'dir2', true, function (err) {
      fs.rmdirSync('dir1');
      fs.rmdirSync('dir2');
      assert.strictEqual(err, undefined);
      done();
    });
  });

  it('test: deletePath for file', function (done) {
    fs.writeFileSync('file1.txt', 'Files Test');
    Y.Files.deletePath('file1.txt');
    assert.strictEqual(fs.existsSync('file1.txt'), false);
    done();
  });

  it('test: deletePath for symbolic link', function (done) {
    fs.writeFileSync('file1.txt', 'Files Test');
    fs.symlinkSync('file1.txt', 'file2.txt');
    Y.Files.deletePath('file2.txt');
    assert.strictEqual(fs.existsSync('file2.txt'), false);
    assert.ok(fs.existsSync('file1.txt'));
    done();
  });

  it('test: deletePath for directory', function (done) {
    fs.mkdirSync('dir1');
    Y.Files.deletePath('dir1');
    assert.strictEqual(fs.existsSync('dir1'), false);
    done();
  });

  it('test: isDirectory for directory', function (done) {
    fs.mkdirSync('dir1');
    assert.ok(Y.Files.isDirectory('dir1'));
    fs.rmdirSync('dir1');
    done();
  });

  it('test: isDirectory for symbolic link', function (done) {
    fs.mkdirSync('dir1');
    fs.symlinkSync('dir1', 'dir2');
    assert.ok(Y.Files.isDirectory('dir2'));
    assert.strictEqual(Y.Files.isDirectory('dir2', false), false);
    fs.unlinkSync('dir2');
    fs.rmdirSync('dir1');
    done();
  });

  it('test: isFile for file', function (done) {
    fs.writeFileSync('file1.txt', 'Files Test');
    assert.ok(Y.Files.isFile('file1.txt'));
    fs.unlinkSync('file1.txt');
    done();
  });

  it('test: isFile for symbolic link', function (done) {
    fs.writeFileSync('file1.txt', 'Files Test');
    fs.symlinkSync('file1.txt', 'file2.txt');
    assert.ok(Y.Files.isFile('file2.txt', true));
    assert.strictEqual(Y.Files.isFile('file2.txt'), false);
    fs.unlinkSync('file2.txt');
    fs.unlinkSync('file1.txt');
    done();
  });

  it('test: isSymbolicLink', function (done) {
    fs.writeFileSync('file1.txt', 'Files Test');
    fs.symlinkSync('file1.txt', 'file2.txt');
    assert.ok(Y.Files.isSymbolicLink('file2.txt'));
    fs.unlinkSync('file2.txt');
    fs.unlinkSync('file1.txt');
    done();
  });

  it('test: lstatSync', function (done) {
    fs.writeFileSync('file1.txt', 'Files Test');
    assert.strictEqual(
      Y.Files.lstatSync('file1.txt') instanceof fs.Stats,
      true
    );
    fs.unlinkSync('file1.txt');
    done();
  });

  it('test: statSync', function (done) {
    fs.writeFileSync('file1.txt', 'Files Test');
    assert.strictEqual(
      Y.Files.statSync('file1.txt') instanceof fs.Stats,
      true
    );
    fs.unlinkSync('file1.txt');
    done();
  });

  it('test: copyAssets', function (done) {
    fs.mkdirSync('dir1');
    fs.mkdirSync('dir2');
    fs.writeFileSync('dir1/file1.txt', 'Files Test');
    fs.writeFileSync('dir2/file2.txt', 'Files Test');
    Y.Files.copyAssets(['dir1', 'dir2'], 'dir3', false, function () {
      assert.ok(fs.existsSync('dir3/file1.txt'));
      assert.ok(fs.existsSync('dir3/file2.txt'));
      fs.unlinkSync('dir3/file1.txt');
      fs.unlinkSync('dir3/file2.txt');
      fs.unlinkSync('dir2/file2.txt');
      fs.unlinkSync('dir1/file1.txt');
      fs.rmdirSync('dir1');
      fs.rmdirSync('dir2');
      fs.rmdirSync('dir3');
      done()
    });
  });

  it('test: getJSON', function (done) {
    const data = Y.Files.getJSON('input/folders1/yuidoc.json');
    assert.ok(data instanceof Object);
    assert.strictEqual(data.name, 'yuidoc-root');
    done();
  });

  it('test: writeFile', function (done) {
    Y.Files.writeFile('file1.txt', 'Files Test', function () {
      assert.ok(fs.existsSync('file1.txt'));
      fs.unlinkSync('file1.txt');
      done();
    });
  });

  it('test: readFile', function (done) {
    Y.Files.readFile('input/test/test.js', 'utf8', function (err) {
      assert.strictEqual(err, null);
      done();
    });
  });
});
