# JoinJS

JoinJS packages up CommonJS modules for the browser.

### Usage

First install the package via npm:

    npm install -g git+https://github.com/olegp/joinjs.git
    
Then compile with:

    joinjs ./dir/index.js output.js
   
This will package up all the modules in `./dir/`, use the module in the file 
`index.js` as the entry point and write out the result to `output.js`.

### Features

  * ability to require non `.js` files (e.g. `require('template.html'`)
  * use via the command line with the likes of `supervisor`
  * embed in your own Node.js or [RingoJS](http://ringojs.org) app
  * exposes [Stick](https://github.com/hns/stick) middleware for use with RingoJS and [Common Node](https://github.com/olegp/common-node)

### Acknowledgements

  * Mariusz Nowak for inspiration, advice and [modules-webmake](https://github.com/medikoo/modules-webmake)

### License

(The MIT License)

Copyright (c) 2011+ Oleg Podsechin

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
