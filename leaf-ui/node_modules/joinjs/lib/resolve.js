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

var tests = [
  [['a', 'b'], 'b'],
  [['a/b', './c'], 'a/c'],
  [['a/b', '../c'], 'c'],
  [['a', '.'], ''],
  [['a', '..'], '..'],
  [['a/', '..'], '']
];

tests.forEach(function(args) {
  exports['test ' + JSON.stringify(args[0])] = function() {
    var result = resolve.apply(null, args[0].map(localize));
    assert.strictEqual(localize(args[1]), result);
  };
});

var separator = '/', roots = ['/'];

function localize(path) {
  return path.replace(/^\//, roots[0]).replace(/\//g, separator);
}

var assert = require('assert');

require("test").run(exports);