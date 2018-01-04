var path = require( 'path' );
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var joinJS = require("jointjs");
var lodash = require("lodash");
var jquery = require("jquery");
var rewire = require("rewire");
var fs = require("fs");


/*
console.log("Fail 1");
glob.sync( './../rappid/*.js' ).forEach( function( file ) {
  require( path.resolve( file ) );
});

console.log("Fail 2");
glob.sync( './../rappid/lib/backbone/backbone-min.js' ).forEach( function( file ) {
  require( path.resolve( file ) );
});

console.log("Fail 3");
glob.sync( './../rappid-extensions/lib/backbone/*.js' ).forEach( function( file ) {
  require( path.resolve( file ) );
});

console.log("Fail 4");
glob.sync( './../rappid-extensions/lib/loadsh/*.js' ).forEach( function( file ) {
  require( path.resolve( file ) );
});

console.log("Fail 5");
glob.sync( './../rappid-extensions/lib/jquery/*.js' ).forEach( function( file ) {
  require( path.resolve( file ) );
});
/*8
glob.sync( './../rappid-extensions/*.js' ).forEach( function( file ) {
  require( path.resolve( file ) );
});

console.log("Fail 6");

glob.sync( './../scripts/*.js' ).forEach( function( file ) {
    console.log(file);
    require( path.resolve( file ) );
});


console.log("Fail 6");

glob.sync( './../js/object/*.js' ).forEach( function( file ) {
    console.log(file);
    require( path.resolve( file ) );
});
console.log("success");*/

/*glob.sync( './../rappid/*.js' ).forEach( function( file ) {
  require( path.resolve( file ) );
});
glob.sync( './../rappid-extensions/*.js' ).forEach( function( file ) {
  require( path.resolve( file ) );
});
glob.sync( './../scripts/*.js' ).forEach( function( file ) {
    console.log(file);
    require( path.resolve( file ) );
});*/
  //const sayHello = require('../scripts/main.js').sayHello;
  /*glob.sync( './../js/*.js' ).forEach( function( file ) {
      require( path.resolve( file ) );
  });

  glob.sync( './../js/*.js' ).forEach( function( file ) {
    require( path.resolve( file ) );
  });

  glob.sync( './../plugins/*.js' ).forEach( function( file ) {
    require( path.resolve( file ) );
  });

  glob.sync( './../rappid/*.js' ).forEach( function( file ) {
    require( path.resolve( file ) );
  });

  glob.sync( './../rappid-extensions/*.js' ).forEach( function( file ) {
    require( path.resolve( file ) );
  });*/

  describe('1 should equal 1', function() {
    it('returns 1=1', function() {
      expect(1).to.equal(1);		// Invoke done when the test is complete.
     });
  });
  describe('2 should be greater than 1', function() {
    it('returns 2 >= 1', function() {
  		var val = 2;
      console.log("value of val  :  "  + val);
  		assert.isAbove(val, 1, '2 is strictly greater than 1');
     });
  });
  describe('1 should equal 1', function() {
    it('returns 1=1', function() {
      expect(1).to.equal(1);		// Invoke done when the test is complete.
     });
  });
  describe('reading file name', function(){
    it('reading json file text',function(){
      fs.readFile('./testRead.json', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        console.log(data);
      });
    })
  })
