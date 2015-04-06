/*global Buffer */
var path = require('path');

var Metalsmith = require('metalsmith');
var templates = require('metalsmith-templates');
var marked = require('marked');
var pkg = require('../package.json');

var markupRegEx = /([^\/^\.]*)\.html$/;
var cleanupJSRegEx = /.*(goog\.require(.*);|.*renderer: exampleNS\..*,?)[\n]*/g;
var isCssRegEx = /\.css$/;
var isJsRegEx = /\.js$/;

var srcDir = path.join(__dirname, '..', 'examples_src');
var destDir = path.join(__dirname, '..', 'examples');
var templatesDir = path.join(__dirname, '..', 'config', 'examples');

/**
 * A Metalsmith plugin that adds metadata to the example HTML files.  For each
 * example HTML file, this adds metadata for related js and css resources. When
 * these files are run through the example template, the extra metadata is used
 * to show the complete example source in the textarea and submit the parts to
 * jsFiddle.
 *
 * @param {Object} files The file lookup provided by Metalsmith.  Property names
 *     are file paths relative to the source directory.  The file objects
 *     include any existing metadata (e.g. from YAML front-matter), the file
 *     contents, and stats.
 * @param {Object} metalsmith The metalsmith instance the plugin is being used
 *     with.
 * @param {function(Error)} done Called when done (with any error).
 */
function augmentExamples(files, metalsmith, done) {
  for (var filename in files) {
    var file = files[filename];
    var match = filename.match(markupRegEx);
    if (match && filename !== 'index.html') {
      if (!file.template) {
        done(new Error('Missing template in YAML front-matter:' + filename));
        return;
      }
      var id = match[1];
      if (file.docs) {
        file.docs = marked(file.docs);
      }
      if (file.contents) {
        file.contents = new Buffer(marked(file.contents.toString()));
      }

      // add js tag and source
      var jsFilename = id + '.js';
      if (!(jsFilename in files)) {
        done(new Error('No .js file found for ' + filename));
        return;
      }
      file.js = {
        tag: '<script src="loader.js?id=' + id + '"></script>',
        source: files[jsFilename].contents.toString().replace(
            cleanupJSRegEx, '')
      };

      // add css tag and source
      var cssFilename = id + '.css';
      if (cssFilename in files) {
        file.css = {
          tag: '<link rel="stylesheet" href="' + cssFilename + '">',
          source: files[cssFilename].contents.toString()
        };
      }

      // add additional resources
      if (file.resources) {
        var resources = file.resources.split(',');
        var resource;
        for (var i = resources.length - 1; i >= 0; --i) {
          resource = resources[i];
          if (isJsRegEx.test(resource)) {
            resources[i] = '<script src="' + resource + '"></script>';
          } else if (isCssRegEx.test(resource)) {
            resources[i] = '<link rel="stylesheet" href="' + resource +
                '">';
          } else {
            done(new Error('Invalid value for "resource": ' +
                resource + 'is not .js or .css: ' + filename));
            return;
          }
          file.resources = resources.join('\n');
        }
      }
    }
  }
  done();
}

function main(callback) {
  new Metalsmith('.')
      .source(srcDir)
      .destination(destDir)
      .metadata({
        'ol_version': pkg.version
      })
      .use(augmentExamples)
      .use(templates({
        engine: 'handlebars',
        directory: templatesDir
      }))
      .build(function(err) {
        callback(err);
      });
}

if (require.main === module) {
  main(function(err) {
    if (err) {
      process.stderr.write(err.message + '\n');
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}

module.exports = main;
