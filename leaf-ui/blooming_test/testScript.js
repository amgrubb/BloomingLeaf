var assert = chai.assert;
var expect = chai.expect;

var loader;
var reader = new FileReader();
var graph = new joint.dia.Graph();
graph.links = [];
graph.intensionConstraints = [];
graph.linksNum;
graph.constraintsNum;
graph.allElements = [];
graph.elementsBeforeAnalysis = [];
var graphList = [];

// Load cycle_loop1.json file
var source = (function() {
  var sourceData;

  function getData(done) {
    if(sourceData){
      done(sourceData);
    } else {
      $.getJSON("./blooming_test/cycle_loop1.json", function(data) {
        sourceData = data;
        done(data);
      });
    }
  }
  return {
    getData: getData
  };
})();

// Load cycle_loop2.json file
var source2 = (function() {
  var sourceData;

  function getData(done) {
    if(sourceData){
      done(sourceData);
    } else {
      $.getJSON("./blooming_test/cycle_loop2.json", function(data) {
        sourceData = data;
        done(data);
      });
    }
  }
  return {
    getData: getData
  };
})();

// Load cycle_loop3.json file
var source3 = (function() {
  var sourceData;
  var sourceData2;
  function getData(done) {
    if(sourceData){
      done(sourceData);
    } else {
      $.getJSON("./blooming_test/cycle_loop3.json", function(data) {
        sourceData = data;
        done(data);
      });
    }
  }
  function getData_2(done) {
    if(sourceData2){
      done(sourceData2);
    } else {
      $.getJSON("./blooming_test/cycle_loop6.json", function(data) {
        sourceData2 = data;
        done(data);
      });
    }
  }
  return {
    getData: getData,
    getData_2 : getData_2
  };
})();
// Load cycle_loop4.json file
var source4 = (function() {
  var sourceData;
  var sourceData2;
  function getData(done) {
    if(sourceData){
      done(sourceData);
    } else {
      $.getJSON("./blooming_test/cycle_loop4.json", function(data) {
        sourceData = data;
        done(data);
      });
    }
  }
  function getData_2(done) {
    if(sourceData2){
      done(sourceData2);
    } else {
      $.getJSON("./blooming_test/cycle_loop5.json", function(data) {
        sourceData2 = data;
        done(data);
      });
    }
  }
  return {
    getData: getData,
    getData_2: getData_2
  };
})();


describe('Cycle Check 1', function() {
  it('Loop 1 with single graph', function () {
     source.getData(function(sourceData){
       var analysis = new InputAnalysis();
     	 var links = new InputLink();
     	 var js_object = {};
     	 var js_links = getLinks();
     	 js_object.analysis = getElementList(analysis);
       graph.fromJSON(sourceData);
       this.graphList = graph.getElements();
       this.links = graph.getLinks();
       console.log(getElementList());
       console.log(getLinks());
       var testLink = getLinks();
       var testNodes = getElementList();
       var isCycle = cycleCheck(testLink,testNodes);
       expect(isCycle).to.equal(true);
     })
  })
  it('Loop 2 with multiple graphs', function () {
     source4.getData(function(sourceData){
       var analysis = new InputAnalysis();
     	 var links = new InputLink();
     	 var js_object = {};
     	 var js_links = getLinks();
     	 js_object.analysis = getElementList(analysis);
       graph.fromJSON(sourceData);
       this.graphList = graph.getElements();
       this.links = graph.getLinks();
       console.log(getElementList());
       console.log(getLinks());
       var testLink = getLinks();
       var testNodes = getElementList();
       var isCycle = cycleCheck(testLink,testNodes);
       expect(isCycle).to.equal(true);
     })
  })
  it('Loop 3 with same number of nodes as links', function () {
     source4.getData_2(function(sourceData){
       var analysis = new InputAnalysis();
     	 var links = new InputLink();
     	 var js_object = {};
     	 var js_links = getLinks();
     	 js_object.analysis = getElementList(analysis);
       graph.fromJSON(sourceData);
       this.graphList = graph.getElements();
       this.links = graph.getLinks();
       console.log(getElementList());
       console.log(getLinks());
       var testLink = getLinks();
       var testNodes = getElementList();
       var isCycle = cycleCheck(testLink,testNodes);
       expect(isCycle).to.equal(true);
     })
  })
});
(function() {
    describe("Cycle check 2", function() {
      it("No loop 1", function(done){
        source2.getData(function(sourceData){
          var analysis = new InputAnalysis();
          var links = new InputLink();
          var js_object = {};
          var js_links = getLinks();
          js_object.analysis = getElementList(analysis);
          graph.fromJSON(sourceData);
          this.graphList = graph.getElements();
          this.links = graph.getLinks();
          console.log(getElementList());
          console.log(getLinks());
          var testLink = getLinks();
          var testNodes = getElementList();
          var isCycle = cycleCheck(testLink,testNodes);
          console.log(isCycle);
          expect(isCycle).to.equal(false);
          done();
        });
      });
      it("No loop 2", function(done){
        source3.getData(function(sourceData){
          var analysis = new InputAnalysis();
          var links = new InputLink();
          var js_object = {};
          var js_links = getLinks();
          js_object.analysis = getElementList(analysis);
          graph.fromJSON(sourceData);
          this.graphList = graph.getElements();
          this.links = graph.getLinks();
          console.log(getElementList());
          console.log(getLinks());
          var testLink = getLinks();
          var testNodes = getElementList();
          var isCycle = cycleCheck(testLink,testNodes);
          console.log(isCycle);
          expect(isCycle).to.equal(false);
          done();
        });
      });
      it("No loop with number of nodes same as number of links", function(done){
        source3.getData_2(function(sourceData){
          var analysis = new InputAnalysis();
          var links = new InputLink();
          var js_object = {};
          var js_links = getLinks();
          js_object.analysis = getElementList(analysis);
          graph.fromJSON(sourceData);
          this.graphList = graph.getElements();
          this.links = graph.getLinks();
          console.log(getElementList());
          console.log(getLinks());
          var testLink = getLinks();
          var testNodes = getElementList();
          var isCycle = cycleCheck(testLink,testNodes);
          console.log(isCycle);
          expect(isCycle).to.equal(false);
          done();
        });
      });
    });
})();


/*
describe('Read file', function() {

  describe('Cycle check', function() {
    console.log(graph.getElements());
  })
  it('should start empty', function() {
    //var testJson = new File(");

  });
  after(function() {});


});*/
