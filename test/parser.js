var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Y = require(path.join(__dirname, '../', 'lib', 'index'));

describe('Parser Test Suite', function () {
  function isObject(obj) {
    let type = typeof obj;
    return type === 'function' || (type === 'object' && !!obj);
  }

  function findByName(name, className, items) {
    let ret;

    items.forEach(function (i) {
      if (i.name === name && i.class === className) {
        ret = i;
      }
    });

    return ret;
  }

  async function waitForFileExists(filePath, currentTime = 0) {
    if (fs.existsSync(filePath)) return true;
    if (currentTime === 1000) return false;
    // wait for 0.02 second
    await new Promise((resolve) => setTimeout(() => resolve(true), 20));
    return waitForFileExists(filePath, currentTime + 20);
  }

  before(function () {
    const json = (new Y.YUIDoc({
      quiet: true,
      paths: [
        'input/charts',
        'input/inherit',
        'input/namespace',
        'input/test',
        'input/test2'
      ],
      outdir: './out'
    })).run();

    this.project = json.project;
    this.data = json;

    return waitForFileExists(path.join(__dirname, 'out', 'data.json'));
  });

  describe('Project Data', function () {

    it('test: out directory', function () {
      assert.equal(fs.existsSync(path.join(__dirname, 'out')), true, 'Failed to create out directory');
    });

    it('test: data.json creation', function () {
      assert.equal(fs.existsSync(path.join(__dirname, 'out', 'data.json')), true, 'data.json file was not created');
    });

    it('test: parser', function () {
      let keys = Object.keys(this.data);
      assert.equal(keys.length, 7, 'Failed to populate all fields');
      assert.deepStrictEqual(keys, ['project', 'files', 'modules', 'classes', 'elements', 'classitems', 'warnings'], 'Object keys are wrong');
    });

    it('test: project data', function () {
      assert.strictEqual(path.normalize('input/test/test.js'), this.project.file, 'Project data loaded from wrong file');
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

    it('test: files parsing', function () {
      const files = this.data.files;

      // 1 module, 3 classes
      const one = files[path.normalize('input/test/anim.js')];
      assert.equal(isObject(one), true, 'Failed to parse input/test/anim.js');
      assert.strictEqual(Object.keys(one.modules).length, 1, '1 module should be found');
      assert.strictEqual(Object.keys(one.classes).length, 3, '3 classes should be found');

      // 2 modules, 3 classes
      const two = files[path.normalize('input/test/test.js')];
      assert.ok(isObject(two), 'Failed to parse input/test/test.js');
      assert.strictEqual(Object.keys(two.modules).length, 2, '2 modules should be found');
      assert.strictEqual(Object.keys(two.classes).length, 3, '3 classes should be found');

      //Module -> class association
      const three = files[path.normalize('input/test2/dump/dump.js')];
      assert.ok(isObject(three), 'Failed to parse input/test2/dump/dump.js');
      assert.strictEqual(three.modules.dump, 1, 'dump module not found');
      assert.strictEqual(three.classes['YUI~dump'], 1, 'YUI~dump class not found');

      //Module -> class association
      const four = files[path.normalize('input/test2/oop/oop.js')];
      assert.ok(isObject(four), 'Failed to parse input/test2/oop/oop.js');
      assert.strictEqual(four.modules.oop, 1, 'oop module not found');
      assert.strictEqual(four.classes['YUI~oop'], 1, 'YUI~oop class not found');
    });

    it('test: namespace parsing', function () {
      const item = this.data.files[path.normalize('input/test2/namespace.js')];
      assert.ok(isObject(item), 'Failed to parse input/test2/namespace.js');
      assert.strictEqual(Object.keys(item.classes).length, 3, 'Failed to parse all classes');

      assert.deepStrictEqual(Object.keys(item.namespaces), ['P.storage', 'P'], 'Namespace failed to parse');
      assert.deepStrictEqual(Object.keys(item.classes), ['P.storage.Store', 'P.storage.LocalStore', 'P.storage'], 'Classes failed to parse');
    });

    it('test: module parsing', function () {
      const mods = this.data.modules;

      //anim Module
      assert.ok(isObject(mods.anim), 'Failed to parse Anim module');
      assert.strictEqual(Object.keys(mods.anim.submodules).length, 2, 'Should have 2 submodules');
      assert.strictEqual(Object.keys(mods.anim.classes).length, 3, 'Should have 3 classes');
      assert.strictEqual(mods.anim.description, 'This is the Anim MODULE description', 'Description parse');
      assert.strictEqual(mods.anim.itemtype, 'main', 'Failed to parse @main itemtype');
      assert.strictEqual(mods.anim.tag, 'module', 'Tag parse failed');
    });

    it('test: main module association', function () {
      const mod = this.data.modules.charts;
      let d = 'The Charts widget provides an api for displaying data\ngraphically.';

      assert.ok(isObject(mod), 'Failed to parse charts module');
      assert.strictEqual(mod.description, d, 'Incorrect description for charts module');
      assert.strictEqual(mod.tag, 'main', 'Tagname is not main');
      assert.strictEqual(mod.itemtype, 'main', 'ItemType should be main');
    });

    it('test: submodule parsing', function () {
      const mods = this.data.modules;

      //anim-easing submodule
      let m = mods['anim-easing'];
      assert.ok(isObject(m), 'Failed to parse anim-easing module');
      let desc = 'The easing module provides methods for customizing\nhow an animation behaves during each run.';
      assert.strictEqual(m.description, desc, 'Failed to parse submodule description');
      assert.strictEqual(Object.keys(m.submodules).length, 0, 'Should have 0 submodules');
      assert.strictEqual(Object.keys(m.classes).length, 1, 'Should have 1 class');
      assert.strictEqual(m.is_submodule, 1, 'Submodule association failed');
      assert.strictEqual(m.module, 'anim', 'Failed to associate module');

      //anim-easing-foo submodule
      m = mods['anim-easing-foo'];
      assert.ok(isObject(m), 'Failed to parse anim-easing-foo module');
      desc = 'FOO FOO FOO FOO FOO The easing module provides methods for customizing';
      assert.strictEqual(m.description, desc, 'Failed to parse submodule description');
      assert.strictEqual(Object.keys(m.submodules).length, 0, 'Should have 0 submodules');
      assert.strictEqual(Object.keys(m.classes).length, 1, 'Should have 1 class');
      assert.strictEqual(m.is_submodule, 1, 'Submodule association failed');
      assert.strictEqual(m.module, 'anim', 'Failed to associate module');
    });

    it('test: extra module data parsing', function () {
      const mods = this.data.modules;

      let m = mods.mymodule;
      assert.ok(isObject(m), 'Failed to parse mymodule module');
      assert.strictEqual(Object.keys(m.submodules).length, 1, 'Should have 1 submodules');
      assert.strictEqual(Object.keys(m.classes).length, 3, 'Should have 3 class');
      assert.strictEqual(m.description, 'The module', 'Description parse failed');
      assert.deepStrictEqual(m.category, ['one', 'two', 'three'], 'Category parsing failed');
      assert.deepStrictEqual(m.requires, ['one', 'two'], 'Requires parsing failed');
      assert.deepStrictEqual(m.uses, ['three', 'four'], 'Uses parsing failed');

      m = mods.mysubmodule;
      assert.ok(isObject(m), 'Failed to parse mysubmodule module');
      assert.strictEqual(Object.keys(m.submodules).length, 0, 'Should have 0 submodules');
      assert.strictEqual(Object.keys(m.classes).length, 3, 'Should have 3 class');
      assert.strictEqual(m.is_submodule, 1, 'Submodule association failed');
      assert.deepStrictEqual(m.category, ['three', 'four'], 'Category parsing failed');

      //Testing modules with slashes in them
      m = mods['myapp/views/index'];
      assert.ok(isObject(m), 'Failed to parse myapp/views/index module');
      assert.strictEqual(Object.keys(m.classes).length, 1, 'Should have 1 class');

      m = mods['P.storage'];
      assert.ok(isObject(m), 'Failed to parse P.storage module');
      assert.deepStrictEqual(Object.keys(m.classes), ['P.storage.Store', 'P.storage.LocalStore', 'P.storage'], 'Failed to parse classes');
      assert.deepStrictEqual(Object.keys(m.namespaces), ['P.storage', 'P'], 'Namespace failed to parse');
    });

    it('test: element parsing', function () {
      const els = this.data.elements;
      const foo = els['x-foo'];
      const bar = els['x-bar'];

      assert.ok(isObject(foo), 'Failed to find <x-foo> element');
      assert.strictEqual(foo.name, 'x-foo', 'Failed to set name');
      assert.strictEqual(foo.module, 'anim', 'Failed to set module');

      assert.ok(isObject(bar), 'Failed to find <x-bar> element');
      assert.strictEqual(bar.name, 'x-bar', 'Failed to set name');
      assert.strictEqual(bar.module, 'anim', 'Failed to set module');
    });

    it('test: element details parsing', function () {
      const baz = this.data.elements['x-baz'];

      assert.ok(isObject(baz), 'Failed to find <x-baz> element');
      assert.strictEqual(baz.name, 'x-baz', 'Failed to set name');
      assert.strictEqual(baz.description, 'Element 3', 'Failed to set description');
      assert.strictEqual(baz.parents, '<body>, <x-foo>', 'Failed to set parents');
      assert.strictEqual(baz.contents, '<x-bar>', 'Failed to set contents');
      assert.strictEqual(baz.interface, 'XBazElement', 'Failed to set interface');
    });

    it('test: element attributes parsing', function () {
      const baz = this.data.elements['x-baz'];

      assert.ok(isObject(baz), 'Failed to find <x-baz> element');
      assert.strictEqual(baz.attributes.length, 3, 'Failed to parse all the attributes');

      assert.strictEqual(baz.attributes[0].name, 'first', 'Failed to set first attribute name');
      assert.strictEqual(baz.attributes[0].description, 'first attribute test', 'Failed to set first attribute description');

      assert.strictEqual(baz.attributes[1].name, 'second', 'Failed to set second attribute name');
      assert.strictEqual(baz.attributes[1].description.replace(/\s+/g, ' '), 'second attribute test', 'Failed to set second attribute description');

      assert.strictEqual(baz.attributes[2].name, 'third', 'Failed to set third attribute name');
      assert.strictEqual(baz.attributes[2].description.replace(/\s+/g, ' '), 'third attribute test', 'Failed to set third attribute description');
    });

    it('test: class parsing', function () {
      const cl = this.data.classes;

      const anim = cl.Anim;
      assert.ok(isObject(anim), 'Failed to find Anim class');
      assert.strictEqual(anim.name, 'Anim', 'Failed to set name');
      assert.strictEqual(anim.shortname, 'Anim', 'Failed to set shortname');
      assert.strictEqual(anim.module, 'anim', 'Failed to test module.');

      const easing = cl.Easing;
      assert.ok(isObject(easing), 'Failed to find Easing class');
      assert.strictEqual(easing.name, 'Easing', 'Failed to set name');
      assert.strictEqual(easing.shortname, 'Easing', 'Failed to set shortname');
      assert.strictEqual(easing.module, 'anim', 'Failed to test module.');
      assert.strictEqual(easing.submodule, 'anim-easing', 'Failed to test submodule.');

      const my = cl.myclass;
      assert.ok(isObject(my), 'Failed to find myclass class');
      assert.strictEqual(my.name, 'myclass', 'Failed to set name');
      assert.strictEqual(my.shortname, 'myclass', 'Failed to set shortname');
      assert.strictEqual(my.module, 'mymodule', 'Failed to test module.');
      assert.strictEqual(my.submodule, 'mysubmodule', 'Failed to test submodule.');
      assert.strictEqual(my.is_constructor, 1, 'Failed to register constructor.');

      const other = cl.OtherClass;
      assert.ok(isObject(other), 'Failed to find myclass class');
      assert.strictEqual(other.name, 'OtherClass', 'Failed to set name');
      assert.strictEqual(other.shortname, 'OtherClass', 'Failed to set shortname');
      assert.strictEqual(other.module, 'mymodule', 'Failed to test module.');
      assert.strictEqual(other.submodule, 'mysubmodule', 'Failed to test submodule.');
      assert.strictEqual(Object.keys(other.extension_for).length, 1, 'Failed to assign extension_for');
      assert.strictEqual(other.extension_for[0], 'myclass', 'Failed to assign extension_for');

      const m = cl['P.storage.P.storage'];
      assert.strictEqual(m, undefined, 'Should not have double namespaces');

      assert.notStrictEqual(cl['P.storage'], undefined, 'Should not have double namespaces');
      assert.notStrictEqual(cl['P.storage.Store'], undefined, 'Should not have double namespaces');
      assert.notStrictEqual(cl['P.storage.LocalStore'], undefined, 'Should not have double namespaces');
    });

    it('test: classitems parsing', function () {
      assert.ok(Array.isArray(this.data.classitems), 'Failed to populate classitems array');

      const item = findByName('testoptional', 'myclass', this.data.classitems);
      assert.strictEqual(item.name, 'testoptional', 'Failed to find item: testoptional');
      assert.strictEqual(item.class, 'myclass', 'Failed to find class: testoptional');
      assert.strictEqual(item.module, 'mymodule', 'Failed to find module: testoptional');
      assert.strictEqual(item.submodule, 'mysubmodule', 'Failed to find submodule: testoptional');
      assert.strictEqual(item.itemtype, 'method', 'Should be a method');

      const keys = [
        'file',
        'line',
        'description',
        'itemtype',
        'name',
        'params',
        'evil',
        'injects',
        'return',
        'throws',
        'example',
        'class',
        'module',
        'submodule'
      ];

      assert.deepStrictEqual(Object.keys(item), keys, 'Item missing from output');

      assert.strictEqual(item.evil, '', 'Single tag not found');
      assert.strictEqual(item.injects.type, 'HTML', 'Injection type not found');

      assert.strictEqual(item.return.type, undefined, 'Type should be missing');
      assert.strictEqual(item.throws.type, undefined, 'Type should be missing');
      assert.strictEqual(item.example.length, 2, 'Should have 2 example snippets');

      const item2 = findByName('testobjectparam', 'myclass', this.data.classitems);
      assert.strictEqual(item2.return.type, 'String', 'Type should not be missing');
      assert.strictEqual(item2.throws.type, 'Error', 'Type should not be missing');
    });

    it('test: parameter parsing', function () {
      const item = findByName('testoptional', 'myclass', this.data.classitems);
      assert.ok(Array.isArray(item.params), 'Params should be an array');
      assert.strictEqual(item.params.length, 6, 'Failed to parse all 6 parameters');

      assert.strictEqual(item.params[0].name, 'notype', 'Name missing');
      assert.strictEqual(item.params[0].type, undefined, 'Type should be missing');

      assert.strictEqual(item.params[1].name, 'namesecond', 'Name missing');
      assert.strictEqual(item.params[1].type, 'Int', 'Type should be Int');

      assert.strictEqual(item.params[3].name, 'optionalvar', 'Name missing');
      assert.ok(item.params[3].optional, 'Parameter should be optional');
      assert.strictEqual(item.params[3].optdefault, undefined, 'Optional Default value should be undefined');

      assert.strictEqual(item.params[4].name, 'optionalDefault1', 'Name missing');
      assert.ok(item.params[4].optional, 'Parameter should be optional');
      assert.strictEqual(item.params[4].optdefault, '"defaultVal"', 'Optional Default value is incorrect');

      assert.strictEqual(item.params[5].name, 'optionalDefault2', 'Name missing');
      assert.ok(item.params[5].optional, 'Parameter should be optional');
      assert.strictEqual(item.params[5].optdefault, '"defaultVal1 defaultVal2"', 'Optional Default value is incorrect');

      const item2 = findByName('test0ton', 'myclass', this.data.classitems);
      assert.ok(Array.isArray(item2.params), 'Params should be an array');
      assert.strictEqual(item2.params.length, 1, 'Failed to parse all 5 parameters');
      assert.ok(item2.params[0].optional, 'Optional not set');
      assert.ok(item2.params[0].multiple, 'Multiple not set');
      assert.strictEqual(item2.return.type, undefined, 'Type should be missing');
      assert.strictEqual(item2.throws.type, undefined, 'Type should be missing');

      const item3 = findByName('test1ton', 'myclass', this.data.classitems);
      assert.ok(Array.isArray(item3.params), 'Params should be an array');
      assert.strictEqual(item3.params.length, 1, 'Failed to parse all 5 parameters');
      assert.strictEqual(item3.params[0].optional, undefined, 'Optional should not be set');
      assert.ok(item3.params[0].multiple, 'Multiple not set');
      assert.strictEqual(item3.return.type, undefined, 'Type should be missing');
      assert.strictEqual(item3.throws.type, undefined, 'Type should be missing');

      const item4 = findByName('testrestparam0n', 'myclass', this.data.classitems);
      assert.ok(Array.isArray(item4.params), 'Params should be an array');
      assert.strictEqual(item4.params.length, 1, 'Failed to parse all 5 parameters');
      assert.ok(item4.params[0].optional, 'Optional not set');
      assert.ok(item4.params[0].multiple, 'Multiple not set');
      assert.strictEqual(item4.return.type, undefined, 'Type should be missing');
      assert.strictEqual(item4.throws.type, undefined, 'Type should be missing');

      const item5 = findByName('testrestparam1n', 'myclass', this.data.classitems);
      assert.ok(Array.isArray(item5.params), 'Params should be an array');
      assert.strictEqual(item5.params.length, 1, 'Failed to parse all 5 parameters');
      assert.strictEqual(item5.params[0].optional, undefined, 'Optional should not be set');
      assert.ok(item5.params[0].multiple, 'Multiple not set');
      assert.strictEqual(item5.return.type, undefined, 'Type should be missing');
      assert.strictEqual(item5.throws.type, undefined, 'Type should be missing');

      const item6 = findByName('testNewlineBeforeDescription', 'myclass', this.data.classitems);
      assert.ok(Array.isArray(item6.params), 'Params should be an array.');
      assert.strictEqual(item6.params.length, 2, 'Should parse two params.');
      assert.strictEqual(item6.params[0].name, 'foo', 'Param 0 should have the correct name.');
      assert.strictEqual(item6.params[1].name, 'bar', 'PaRam 1 s have the correct name.');

      assert.strictEqual(
        item6.params[0].description,
        'This parameter is foo.',
        'Param 0 should have the correct description.'
      );

      assert.strictEqual(
        item6.params[1].description,
        'This parameter is bar.\n\n    It does useful things.',
        'Param 1 should have the correct description.'
      );
    });

    it('test: indented description', function () {
      const item = findByName('testNewlineBeforeDescription', 'myclass', this.data.classitems);

      assert.strictEqual(item.return.type, 'Boolean', 'Type should be correct.');
      assert.strictEqual(
        item.return.description,
        'Sometimes true, sometimes false.\nNobody knows!',
        'Description indentation should be normalized to the first line.'
      );
      assert.strictEqual(item.throws.type, 'Error', 'Type should be correct.');
      assert.strictEqual(
        item.throws.description,
        'Throws an error.\nCatch me.',
        'Description indentation should be normalized to the first line.'
      );
    });

    it('test: object parameters', function () {
      const item = findByName('testobjectparam', 'myclass', this.data.classitems);
      assert.strictEqual(item.name, 'testobjectparam', 'Failed to find item: testobjectparam');
      assert.strictEqual(item.class, 'myclass', 'Failed to find class: testobjectparam');
      assert.strictEqual(item.module, 'mymodule', 'Failed to find module: testobjectparam');
      assert.strictEqual(item.submodule, 'mysubmodule', 'Failed to find submodule: testobjectparam');
      assert.strictEqual(item.itemtype, 'method', 'Should be a method');
      assert.strictEqual(item.params.length, 1, 'More than one param found');

      const props = item.params[0].props;
      assert.strictEqual(props.length, 2, 'First param should have props');
      assert.strictEqual(props[0].name, 'prop1', 'Invalid item');
      assert.strictEqual(props[0].description, 'prop1', 'Invalid item');
      assert.strictEqual(props[0].type, 'String', 'Invalid item');

      assert.strictEqual(props[1].name, 'prop2', 'Invalid item');
      assert.strictEqual(props[1].description, 'prop2', 'Invalid item');
      assert.strictEqual(props[1].type, 'Bool', 'Invalid item');
    });

    it('test: tag fixing', function () {
      const item = findByName('testoptional', 'myclass', this.data.classitems);
      assert.ok(isObject(item), 'failed to find item');
      assert.notStrictEqual(item.return, undefined, 'Failed to replace returns with return');

      const item2 = findByName('_positionChangeHandler', 'Axis', this.data.classitems);
      assert.ok(isObject(item2), 'failed to find item');
      assert.strictEqual(item2.params.length, 1, 'Failed to replace parma with param');

      const item3 = findByName('crashTest', 'OtherClass2', this.data.classitems);
      assert.ok(isObject(item3), 'failed to find item');
      assert.strictEqual(item3.params.length, 1, 'Failed to replace params with param');
    });

    it('test: double namespaces', function () {
      const cls = this.data.classes;
      const mod_bad = cls['Foo.Bar.Foo.Bar'];
      const mod_good = cls['Foo.Bar'];

      assert.strictEqual(mod_bad, undefined, 'Found class Foo.Bar.Foo.Bar');
      assert.strictEqual(isObject(mod_good), true, 'Failed to parse Foo.Bar namespace');
    });

    it('test: inherited methods', function () {
      const item = findByName('myMethod', 'mywidget.SubWidget', this.data.classitems);

      assert.strictEqual(isObject(item), true, 'Failed to parse second method');
    });

    it('test: case tags', function () {
      const item = findByName('testMethod', 'OtherClass2', this.data.classitems);

      assert.ok(isObject(item), 'Failed to parse second method');
      assert.strictEqual(item.itemtype, 'method', 'Failed to parse Cased Method tag');
      assert.ok(Array.isArray(item.params), 'Failed to parse Cased Params');
      assert.strictEqual(item.params.length, 1, 'Failed to parse number of cased params');
    });

    it('test: required attribute', function () {
      const item = findByName('requiredAttr', 'OtherClass2', this.data.classitems);

      assert.ok(isObject(item), 'Failed to parse attribute');
      assert.strictEqual(item.itemtype, 'attribute', 'Failed to parse itemtype');
      assert.strictEqual(item.required, 1, 'Failed to find required short tag');
    });

    it('test: optional attribute', function () {
      const item = findByName('optionalAttr', 'OtherClass2', this.data.classitems);

      assert.ok(isObject(item), 'Failed to parse attribute');
      assert.strictEqual(item.itemtype, 'attribute', 'Failed to parse itemtype');
      assert.strictEqual(item.optional, 1, 'Failed to find optional short tag');
    });

    it('test: module with example meta', function () {
      const item = this.data.modules.ExampleModule;

      assert.ok(isObject(item), 'Failed to parse module');
      assert.ok(Array.isArray(item.example), 'Failed to parse module example data');
    });

    it('test: class with example meta', function () {
      const item = this.data.classes['mywidget.SuperWidget'];

      assert.ok(isObject(item), 'Failed to parse class');
      assert.ok(Array.isArray(item.example), 'Failed to parse class example data');
    });

    it('test: event with optional items', function () {
      const item = findByName('changeWithOptional', 'OtherClass2', this.data.classitems);

      assert.ok(isObject(item), 'Failed to locate event object');

      assert.ok(Array.isArray(item.params));

      assert.strictEqual(item.params[0].name, 'ev');
      assert.strictEqual(item.params[0].type, 'EventFacade');

      assert.ok(Array.isArray(item.params[0].props));
      assert.strictEqual(item.params[0].props[0].name, 'name');
      assert.ok(item.params[0].props[0].optional);
    });

    it('test: markdown example', function () {
      const item = findByName('foo2', 'myclass', this.data.classitems);

      assert.strictEqual(item.example[0], '\n    @media screen and (max-width: 767px) {\n    }');
    });
  });
});
