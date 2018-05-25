const expect = chai.expect;
var graph;

// This runs before every test case
beforeEach(function() {
    graph = new joint.dia.Graph();
});

/*
 * Returns true iff graph has a syntax error
 */
function syntaxCheckResult() {
    var result = false;
    var inputLinks = getLinks();
    var jointLinks = graph.getLinks();
    let destSourceMapper = initializeDestSourceMapper(jointLinks, inputLinks);
    for(var destId in destSourceMapper){
        result = syntaxCheck(destSourceMapper, destId) ? true : result;
    }
    return result;
}

describe('Detect cycle', function() {

    it('Detect cycle with a single graph', function(done) {
        $.getJSON('./blooming_test/cycle_loop1.json', function(data) {
            graph.fromJSON(data);
            var testLink = getLinks();
            var testNodes = getElementList();
            var isCycle = cycleCheck(testLink,testNodes);
            expect(isCycle).to.be.true;
            done();
        });
    });

    it('Detect cycle with multiple graphs', function(done) {
        $.getJSON('./blooming_test/cycle_loop4.json', function(data) {
            graph.fromJSON(data);
            var testLink = getLinks();
            var testNodes = getElementList();
            var isCycle = cycleCheck(testLink,testNodes);
            expect(isCycle).to.be.true;
            done();
        });
    });

    it('Detect cycle with same number of nodes as links', function (done) {
        $.getJSON('./blooming_test/cycle_loop5.json', function(data) {
            graph.fromJSON(data);
            var testLink = getLinks();
            var testNodes = getElementList();
            var isCycle = cycleCheck(testLink,testNodes);
            expect(isCycle).to.be.true;
            done();
        });
    });
});

describe('Detect no cycle', function() {

    it('Detect no cycle with a single graph', function(done){
        $.getJSON('./blooming_test/cycle_loop2.json', function(data) {
            graph.fromJSON(data);
            var testLink = getLinks();
            var testNodes = getElementList();
            var isCycle = cycleCheck(testLink,testNodes);
            expect(isCycle).to.be.false;
            done();
        });
    });

    it("Detect no cycle with multiple graphs", function(done){
        $.getJSON('./blooming_test/cycle_loop3.json', function(data) {
            graph.fromJSON(data);
            var testLink = getLinks();
            var testNodes = getElementList();
            var isCycle = cycleCheck(testLink,testNodes);
            expect(isCycle).to.be.false;
            done();
        });
    });

    it("Detect no cycle with same number of nodes as links", function(done){
        $.getJSON('./blooming_test/cycle_loop6.json', function(data){
            graph.fromJSON(data);
            var testLink = getLinks();
            var testNodes = getElementList();
            var isCycle = cycleCheck(testLink,testNodes);
            expect(isCycle).to.be.false;
            done();
        });
    });
});

describe('Syntax check for valid combinations', function() {

    it('Syntax check with all AND constraint links', function(done) {
        $.getJSON('./blooming_test/syntaxCheck1.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.false;
            done();
       });
   });

    it('Syntax check with all OR constraint links', function(done) {
        $.getJSON('./blooming_test/syntaxCheck3.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.false;
            done();
        });
    });

    it('Syntax check with all ++ constraint links', function(done) {
        $.getJSON('./blooming_test/syntaxCheck5.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.false;
            done();
       });
    });

    it('Syntax check with all -- constraint links', function(done) {
        $.getJSON('./blooming_test/syntaxCheck7.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.false;
            done();
        });
    });

    it('Syntax check with a single AND link added first, and then a single ++ link added second',
    function(done) {
        $.getJSON('./blooming_test/syntaxCheck9.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.false;
            done();
        });
    });

    it('Syntax check with a single ++ link added first, and then a single AND link added second',
    function(done) {
        $.getJSON('./blooming_test/syntaxCheck10.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.false;
            done();
        });
    });

    it('Syntax check with two ++ constraint links and a single AND link', function(done) {
        $.getJSON('./blooming_test/syntaxCheck6a.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.false;
            done();
        });
    });

    it('Syntax check with two ++ constraint links and a single OR link', function(done) {
        $.getJSON('./blooming_test/syntaxCheck6b.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.false;
            done();
        });
    });

    it('Syntax check with two -- constraint links and a single AND link', function(done) {
        $.getJSON('./blooming_test/syntaxCheck8a.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.false;
            done();
        });
    });

    it('Syntax check with two -- constraint links and a single OR link', function(done) {
        $.getJSON('./blooming_test/syntaxCheck8b.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.false;
            done();
        });
    });
});

describe('Syntax check for invalid combinations', function() {

    it('Syntax check with two AND constraint links and a single OR link', function(done) {
            $.getJSON('./blooming_test/syntaxCheck2.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.true;
            done();
        });
    });

    it('Syntax check with two OR constraint links and a single AND link', function(done) {
        $.getJSON('./blooming_test/syntaxCheck4.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.true;
            done();
        });
    });
	
	it('Syntax check with one OR constraint links and a single NO RELATIONSHIP link', function(done) {
        $.getJSON('./blooming_test/syntaxCheck11.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.true;
            done();
        });
    });
	
	it('Syntax check with one AND constraint links and a single NO RELATIONSHIP link', function(done) {
        $.getJSON('./blooming_test/syntaxCheck12.json', function(data) {
            graph.fromJSON(data);
            var result = syntaxCheckResult();
            expect(result).to.be.true;
            done();
        });
    });


});
