/*global describe, beforeEach, it*/
'use strict';

var path    = require('path');
var helpers = require('yeoman-generator').test;


describe('gulpify-webapp generator', function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }

      this.app = helpers.createGenerator('gulpify-webapp:app', [
        '../../app'
      ]);
      done();
    }.bind(this));
  });

  it('creates expected files', function (done) {
    var expected = [
      // add files you expect to exist here.
      '.jshintrc',
      'package.json',
      'bower.json',
      'testem.json',
      '.travis.yml',
      'public/index.html',
      'test/sample_spec.js',
      'src/app.js'
    ];

    helpers.mockPrompt(this.app, {
      'coffee': false
    });
    this.app.options['skip-install'] = true;
    this.app.run({}, function () {
      helpers.assertFiles(expected);
      done();
    });
  });

  it('adds CoffeeScript support', function (done) {
    helpers.mockPrompt(this.app, {
      'coffee': true
    });
    this.app.options['skip-install'] = true;
    this.app.run({}, function () {
      helpers.assertFiles(['src/app.coffee', 'test/sample_spec.coffee']);
      helpers.assertFile('package.json', /coffeeify/);
      done();
    });
  });
});
