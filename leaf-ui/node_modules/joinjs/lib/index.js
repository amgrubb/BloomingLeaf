var fs = require('fs-base');
var optimizeJS, optimizeCSS, optimizeHTML, resolve;
if (module.resolve) {
  optimizeJS = optimizeCSS = optimizeHTML = function(content) {
    return content;
  };
  resolve = function(m, name) {
    return m.resolve(name);
  };
} else {
  optimizeJS = (function() {
    var minify = require("uglify-js").minify;
    return function(content) {
      return minify(content, {
        fromString:true
      }).code.replace(/'use strict';/g, '').replace(/"use strict";/g, '');
    };
  })();
  optimizeCSS = (function() {
    var process = require("clean-css").process;
    return function(content) {
      return process(content, {keepSpecialComments:0});
    };
  })();
  optimizeHTML = (function() {
    var minify = require("html-minifier").minify;
    return function(content) {
      return minify(content, {
        html5:true,
        useShortDoctype:true,
        collapseWhitespace:false,
        removeEmptyElements:false,
        removeOptionalTags:true,
        removeCommentsFromCDATA:true,
        removeCDATASectionsFromCDATA:true,
        removeComments:true,
        removeIgnored:true,
        removeRedundantAttributes:false,
        removeScriptTypeAttributes:true,
        removeStyleLinkTypeAttributes:true,
        removeAttributeQuotes:true,
        removeEmptyAttributes:true,
        collapseBooleanAttributes:true
      }).replace(/>\s+/mg, '> ').replace(/\s+</mg, ' <');
    };
  })();
  resolve = function(m, name) {
    return fs.normal(fs.join(fs.directory(m.filename), name));
  };
}

function removeExtension(filename) {
  return filename.substr(0, filename.length - fs.extension(filename).length);
}

var joinjs = exports.joinjs = function(filename, main, optimize) {
  var i = filename.lastIndexOf('/');
  var base = filename.substr(0, i), main = main || filename.substr(i + 1);
  return modularize(base, [filename], main, optimize);
};

function modularizeFile(file, base, optimize) {
  var r = [];
  var name = fs.relative(base || fs.directory(file), file).replace(/\\/g, '/');
  var extension = fs.extension(file);
  if (extension === ".js") {
    var module = name.substr(0, name.length - extension.length);
    r.push('modules["' + module + '"] = function(require, exports, module) {');
    fs.read(file).split('\n').forEach(function(line) {
      r.push(line && '  ' + line);
    });
    r.push('};\n');
  } else {
    var contents = fs.read(file);
    if (optimize && extension === '.html') {
      contents = optimizeHTML(contents);
    }
    r.push('modules["' + name + '"] = function(require, exports, module) {');
    r.push('  module.exports = ' + JSON.stringify(contents) + ';');
    r.push('};\n');
  }
  return r.join('\n');
}

function modularizeDirectory(directory, base, optimize) {
  var r = [];
  base = base || directory;
  fs.listTree(directory).forEach(function(file) {
    var name = './' + fs.normal(fs.join(directory, file));
    if (fs.isFile(name)) {
      r.push(modularizeFile(name, base, optimize));
    }
  });
  return r.join('\n');
}

var modularize = exports.modularize = function(base, paths, main, optimize) {
  var r = [];
  r.push('modules = window.modules || {};');
  if (main) {
    r.push(fs.read(resolve(module, './require.js')));
  }
  paths.forEach(function(path) {
    if (fs.isFile(path)) {
      r.push(modularizeFile(path, base, optimize));
    } else if (fs.isDirectory(path)) {
      r.push(modularizeDirectory(path, base, optimize));
    }
  });
  if (main) {
    r.push('require("' + removeExtension(main) + '");');
  }
  var result = r.join('\n');
  if (optimize) {
    result = optimizeJS(result);
  }
  return result;
};

var concat = exports.concat = function(files, optimize, css) {
  var r = [];
  files.forEach(function(file) {
    r.push(fs.read(file));
  });
  var result = r.join('\n');
  if (optimize) {
    if (css) {
      result = optimizeCSS(result);
    } else {
      result = optimizeJS(result);
    }
  }
  return result;
};

var middleware = exports.middleware = function(next, app) {
  app.joinjs = [
    {
      main:"./js/index.js",
      uri:"/js/index.js"
    }
  ];
  return function(request) {
    for (var i = 0; i < app.joinjs.length; i++) {
      var e = app.joinjs[i];
      if (request.pathInfo === e.uri) {
        var css = fs.extension(e.uri) === '.css';
        if (!e.content) {
          if (e.paths) {
            e.content = modularize(e.base, e.paths, e.main, e.optimize);
          } else {
            e.content = concat(e.files, e.optimize, css);
          }
        }
        return {
          status:200,
          headers:{
            "Content-Type":css ? "text/css" : "application/javascript"
          },
          body:[e.content]
        };
      }
    }
    return next(request);
  };
};