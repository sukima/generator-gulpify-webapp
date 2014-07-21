'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var GulpifyWebappGenerator = module.exports = function GulpifyWebappGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(GulpifyWebappGenerator, yeoman.generators.Base);

GulpifyWebappGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);

  var prompts = [{
    type: 'confirm',
    name: 'coffee',
    message: 'Would you like to include CoffeeScript support?',
    default: true
  }];

  this.prompt(prompts, function (props) {
    this.coffee = props.coffee;

    cb();
  }.bind(this));
};

GulpifyWebappGenerator.prototype.app = function app() {
  var copyCoffeeOrJs = (function (srcPrefix, destPrefix) {
    var ext = this.coffee ? '.coffee' : '.js';
    this.copy(srcPrefix + ext, destPrefix + ext);
  }).bind(this);

  this.mkdir('lib');
  this.mkdir('public');
  this.mkdir('src');
  this.mkdir('test');

  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');

  this.write('lib/.gitkeep', '');
  this.write('test/.gitkeep', '');

  this.copy('preamble.txt', 'preamble.txt');
  this.copy('public/index.html', 'public/index.html');
  this.copy('test/sample_spec.js', 'test/sample_spec.js');

  copyCoffeeOrJs('src/app', 'src/app');
  copyCoffeeOrJs('test/sample_spec', 'test/sample_spec');
};

GulpifyWebappGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('jshintrc', '.jshintrc');
  this.copy('editorconfig', '.editorconfig');
  this.copy('gitignore', '.gitignore');
  this.copy('gulpfile.js', 'gulpfile.js');
  this.copy('testem.json', 'testem.json');
  this.copy('travis.yml', '.travis.yml');
};
