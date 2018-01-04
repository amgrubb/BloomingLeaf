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
var source = (function() {
  var sourceData;

  function getData(done) {
    if(sourceData){
      done(sourceData);
    } else {
      $.getJSON("./test/cycle_loop1.json", function(data) {
        sourceData = data;
        done(data);
      });
    }
  }
  return {
    getData: getData
  };
})();
var source2 = (function() {
  var sourceData;

  function getData(done) {
    if(sourceData){
      done(sourceData);
    } else {
      $.getJSON("./test/cycle_loop2.json", function(data) {
        sourceData = data;
        done(data);
      });
    }
  }
  return {
    getData: getData
  };
})();
describe('Cycle Check 1', function() {
  it('Loop 1', function () {
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
});
(function() {
    describe("Cycle check 2", function() {
      it("Should expect no loop", function(done){
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
