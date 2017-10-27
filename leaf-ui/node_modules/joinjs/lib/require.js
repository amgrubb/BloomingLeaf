var require = (function() {
  var cache = {};
  function resolve(a, b) {
    a = a.split('/').slice(0, -1);
    b = b.split('/');
    for (var i = 0; i < b.length; i++) {
      var e = b[i];
      if (e === '..') {
        a.pop();
      } else if (e !== '.') {
        a.push(e);
      }
    }
    return a.join('/');
  }
  var require = function(name, context) {
    name = resolve(context || '', name);
    if (cache.hasOwnProperty(name)) {
      return cache[name].exports;
    }
    if (!modules.hasOwnProperty(name)) {
      throw new Error("Cannot find module '" + name + "'");
    }
    var module = cache[name] = {
      exports:{}
    };
    modules[name](function(n) {
      return require(n, name);
    }, module.exports, module);
    return module.exports;
  };
  return require;
})();