
const assert = require('assert');
const exec = require('child_process').exec;
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const request = require('supertest');
const rimraf = require('rimraf');
const spawn = require('child_process').spawn;
const validateNpmName = require('validate-npm-package-name')

const binPath = path.resolve(__dirname, '../bin/koa2');
// const TEMP_DIR = path.resolve(__dirname, '..', 'temp', String(process.pid + Math.random()))
const TEMP_DIR = path.resolve(__dirname, '..', 'temp')

describe('koa2', function () {
  before(function (done) {
    this.timeout(30000);
    cleanup(done);
  });

  after(function (done) {
    this.timeout(30000);
    cleanup(done);
  });

  describe('(no args)', function () {
    console.log(this.fullTitle())
    const ctx = setupTestEnvironment(this.fullTitle())

    it('should create basic app', function (done) {
      runRaw(ctx.dir, [], function (err, code, stdout, stderr) {
        if (err) return done(err);
        ctx.files = parseCreatedFiles(stdout, ctx.dir)
        ctx.stderr = stderr
        ctx.stdout = stdout
        assert.equal(ctx.files.length, 24)
        done();
      });
    });

    it('should provide debug instructions', function () {
      assert.ok(/DEBUG=koa2\-\(no-args\):\* (?:\& )?npm start/.test(ctx.stdout))
    });

    it('should have basic files', function () {
      assert.notEqual(ctx.files.indexOf('app.js'), -1)
      assert.notEqual(ctx.files.indexOf('package.json'), -1)
      assert.notEqual(ctx.files.indexOf('routes/index.js'), -1)
    });

    it('should have nunjucks templates', function () {
      assert.notEqual(ctx.files.indexOf('views/error.njk'), -1)
      assert.notEqual(ctx.files.indexOf('views/index.njk'), -1)
      assert.notEqual(ctx.files.indexOf('views/layout.njk'), -1)
    });

    it('should have a package.json file', function () {
      const file = path.resolve(ctx.dir, 'package.json');
      const contents = fs.readFileSync(file, 'utf8');
      assert.equal(contents, '{\n'
        + '  "name": "koa2-(no-args)",\n'
        + '  "version": "0.1.0",\n'
        + '  "private": true,\n'
        + '  "scripts": {\n'
        + '    "start": "node app.js"\n'
        + '  },\n'
        + '  "dependencies": {\n'
        + '    "debug": "~2.6.3",\n'
        + '    "koa": "^2.2.0",\n'
        + '    "koa-bodyparser": "^4.1.0",\n'
        + '    "koa-convert": "^1.2.0",\n'
        + '    "koa-json": "^2.0.2",\n'
        + '    "koa-logger": "^2.0.1",\n'
        + '    "koa-onerror": "^3.1.0",\n'
        + '    "koa-router": "^7.0.0",\n'
        + '    "koa-static": "^3.0.0",\n'
        + '    "koa-views": "^6.0.1",\n'
        + '    "nunjucks": "~3.0.0"\n'
        + '  },\n'
        + '  "devDependencies": {\n'
        + '    "babel-eslint": "7.1.1",\n'
        + '    "eslint": "3.18.0"\n'
        + '  }\n'
        + '}\n');
    });

    it('should have installable dependencies', function (done) {
      this.timeout(50000);
      npmInstall(ctx.dir, done);
    });

    it('should export an koa2 app from app.js', function () {
      const file = path.resolve(ctx.dir, 'app.js');
      const app = require(file);
      assert.equal(typeof app, 'object');
    });

    it('should respond to HTTP request', function (done) {
      const file = path.resolve(ctx.dir, 'app.js');
      const app = require(file);

      request(app)
      .get('/')
      .expect(200, /<title>Koa2<\/title>/, done);
    });

    it('should generate a 404', function (done) {
      var file = path.resolve(ctx.dir, 'app.js');
      var app = require(file);

      request(app)
      .get('/does_not_exist')
      .expect(404, /Not\ Found/, done);
    });

    describe('when directory contains spaces', function () {
      var ctx = setupTestEnvironment('foo bar (BAZ!)')

      it('should create basic app', function (done) {
        run(ctx.dir, [], function (err, output) {
          if (err) return done(err)
          assert.equal(parseCreatedFiles(output, ctx.dir).length, 24)
          done()
        })
      })

      it('should have a valid npm package name', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var name = JSON.parse(contents).name
        // assert.ok(validateNpmName(name).validForNewPackages)
        assert.equal(name, 'foo-bar-(baz!)')
      })
    })

    describe('when directory is not a valid name', function () {
      var ctx = setupTestEnvironment('_')

      it('should create basic app', function (done) {
        run(ctx.dir, [], function (err, output) {
          if (err) return done(err)
          assert.equal(parseCreatedFiles(output, ctx.dir).length, 24)
          done()
        })
      })

      it('should default to name "hello-world"', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var name = JSON.parse(contents).name
        assert.ok(validateNpmName(name).validForNewPackages)
        assert.equal(name, 'hello-world')
      })
    })
  });

});

function cleanup(dir, callback) {
  if (typeof dir === 'function') {
    callback = dir;
    dir = TEMP_DIR;
  }

  rimraf(dir, function (err) {
    callback(err);
  });
}

function npmInstall(dir, callback) {
  var env = Object.create(null)

  // copy the environment except for "undefined" strings
  for (var key in process.env) {
    if (process.env[key] !== 'undefined') {
      env[key] = process.env[key]
    }
  }
  exec('yarn install', {cwd: dir, env: env}, function (err, stderr) {
    if (err) {
      err.message += stderr;
      callback(err);
      return;
    }

    callback();
  });
}

function parseCreatedFiles(output, dir) {
  var files = [];
  var lines = output.split(/[\r\n]+/);
  var match;

  for (var i = 0; i < lines.length; i++) {
    if ((match = /create.*?: (.*)$/.exec(lines[i]))) {
      var file = match[1];

      if (dir) {
        file = path.resolve(dir, file);
        file = path.relative(dir, file);
      }

      file = file.replace(/\\/g, '/');
      files.push(file);
    }
  }

  return files;
}

function run(dir, args, callback) {
  runRaw(dir, args, function (err, code, stdout, stderr) {
    if (err) {
      return callback(err);
    }

    process.stderr.write(stripWarnings(stderr))

    try {
      assert.equal(stripWarnings(stderr), '')
      assert.strictEqual(code, 0);
    } catch (e) {
      return callback(e);
    }

    callback(null, stripColors(stdout))
  });
}

function runRaw(dir, args, callback) {
  var argv = [binPath].concat(args);
  var exec = process.argv[0];
  var stderr = '';
  var stdout = '';

  var child = spawn(exec, argv, {
    cwd: dir
  });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function ondata(str) {
    stdout += str;
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function ondata(str) {
    stderr += str;
  });

  child.on('close', onclose);
  child.on('error', callback);

  function onclose(code) {
    callback(null, code, stdout, stderr);
  }
}

function setupTestEnvironment (name) {
  var ctx = {}

  before('create environment', function (done) {
    ctx.dir = path.join(TEMP_DIR, name.replace(/[<>]/g, ''))
    mkdirp(ctx.dir, done)
  })

  /*after('cleanup environment', function (done) {
    this.timeout(30000)
    cleanup(ctx.dir, done)
  })*/

  return ctx
}

function stripColors (str) {
  return str.replace(/\x1b\[(\d+)m/g, '_color_$1_')
}

function stripWarnings (str) {
  return str.replace(/\n(?:  warning: [^\n]+\n)+\n/g, '')
}
