# Brief Style Guide
##### This is a very brief BloomingLeaf Javascript style guide.

### General guidelines
##### Add semicolons to the end of each line
```javascript
// do this
console.log('Hello'); 

// not this
console.log('Hello')  
```

##### Add spaces between tokens
```javascript
// do this
for (var i = 0; i < 5; i++) {
    console.log('Hello');
}

// not this
for(var i=0;i<5;i++){
    console.log('Hello');
}

// do this
var i = 0;

// not this
var i=0;
```

##### Variable and function names should be camel case
```javascript
// do this
var myNum = 18;

// not this
var my_num = 18;
```

### Declaring Variables
##### Currently, the source code consists of ```var``` declarations rather than the more modern counterparts, ```let``` and ```const```. 
```javascript
var a = 15;
let b = 15;
const c = 15;
```

### If statements
##### Add opening and closing curly braces even though the if-block would only be one line long.
```javascript
// do this
if (1 === 5) {
    console.log('Hello');
}

// not this
if (1 === 5) console.log('Hello');

// not this either
if (1 === 5)
    console.log('Hello');
```

##### The ```else``` and ```else if``` keywords should be on the same line as the closing curly brace from the previous ```if``` or ```else if``` block.
```javascript
    // do this
    if (1 === 5) {
        console.log('Hello');
    } else {
        console.log('Goodbye');
    }
    
    // not this
    if (1 === 5) {
        console.log('Hello');
    }
    else {
        console.log('Goodbye');
    }
```

### For loops
##### Curly braces are required even if the for loop body is only one line long.
```javascript
    // do this
    for (var i = 0; i < 4; i++) {
        console.log('Hello');
    }
    
    // not this
    for (var i = 0; i < 4; i++) console.log('Hello');
    
    // not this either
    for (var i = 0; i < 4; i++)
        console.log('Hello');
```
