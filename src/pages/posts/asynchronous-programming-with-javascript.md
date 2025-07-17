---
title: "Asynchronous Programming with JavaScript"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - development
date: "2021-11-01"
description: "Learn what asynchronous programming means for JavaScript and how you can get started writing asynchronous JavaScript code."
---
## What Does Asynchronous Mean?

JavaScript is an asynchronous programming language. This means that your code is not executed from the top of your code file to the bottom of the code file. Unlike Python, PHP, Java, and other synchronous programming languages, JavaScript by default does not wait for code to finish executing before it starts executing the next line of code. This can lead to some difficult-to-troubleshoot bugs where later code does not have the data or information it needs from code executed earlier in the program. For example, the following code will not execute as expected:

    const result = fetchFromUrl(‘https://www.google.com’); //not a real function
    console.log(result);

The `console.log(result);` line will execute immediately after the first line, and it will likely return `undefined` or `Promise()`, neither of which are the result you would expect to have - the web page for Google.\
\
When making any kind of request that does not finish immediately, JavaScript continues executing the script after the request, instead of waiting for the request to finish like in Python, PHP, Java, and synchronous programming. That is no problem for JavaScript, though! JavaScript has three main ways to properly structure code to make sure that everything in your JavaScript program happens at the right time - callbacks, promises, and async/await syntax.

## Callbacks

Callbacks are the original way to do asynchronous programming in JavaScript. They eventually were replaced by promises and, then, by async/await syntax. A callback essentially is a piece of code that gets called when another piece of code finishes running. It looks something like:

    function doSomething(argument1, callback):
        //do some function stuff
        //finish doing stuff
        callback(result, error);
    doSomething(someArgument, someOtherFunction);

In the example, the function `doSomething` will do its work and then call `someOtherFunction` with the result and error from `doSomething` as arguments. The first example retrieving Google would look like this with callbacks:

    fetchFromUrl(‘https://www.google.com/’, console.log);

The exact way you pass a callback to a function can vary some depending on the requirements of the function or how the function is written. This is usually documented by developers.

### Callback Hell

The problem with callbacks is that you can easily find yourself in callback hell if your code does more than a few things. Here is an example of callback hell:

    //taken from callbackhell.com
    fs.readdir(source, function (err, files) {
        if (err) {
            console.log('Error finding files: ' + err)
        } else {
            files.forEach(function (filename, fileIndex) {
            console.log(filename)
            gm(source + filename).size(function (err, values) {
                if (err) {
                console.log('Error identifying file size: ' + err)
                } else {
                console.log(filename + ' : ' + values)
                aspect = (values.width / values.height)
                widths.forEach(function (width, widthIndex) {
                    height = Math.round(width / aspect)
                    console.log('resizing ' + filename + 'to ' + height + 'x' + height)
                    this.resize(width, height).write(dest + 'w' + width + '_' + filename, function(err) {
                    if (err) console.log('Error writing file: ' + err)
                    })
                }.bind(this))
                }
            })
            })
        }
    })

There are ways you can fix or avoid callback hell as described at callbackhell.com, but it is better nowadays to use promises or async/await syntax instead.

## Promises

Promises are the replacement for callbacks. They provide a simpler syntax for chaining together code so that later code only executes when earlier code has finished processing. Most modern libraries use promises and return promises when their functions are called. Promises are very useful things to learn how to use, especially because async/await syntax only works with functions that return promises. For learning JavaScript, it should be enough to learn how to use promises that are returned by libraries and imported modules. You can write your own functions that return promises, but that is a little more advanced than this information covers. The example for fetching Google’s web page from above would look like this with promises:

    fetchFromUrl(‘https://google.com’)
        .then((result) => {
            console.log(result);
        })
        .catch((error) => {
            console.error(error);
        });

In this example, the HTTP request is made and the result of the request is put in a promise that is then returned. If the request completed successfully or without an error, the then function takes the returned promise, unpacks the return value that the last called function put inside of the promise, and then passes the return value of the promise into the function that is passed as the argument to then. Promises do not have to have return values if there is nothing to return to the calling function. An empty promise still lets the calling function know that work has been completed and that it is time to move on to the next piece of code.\
\
If the request completed unsuccessfully, the catch function takes the promise, which now holds the error recorded from the HTTP request step, and passes the error to the function passed as an argument to catch. In case of an error, JavaScript will skip any then statements and go right to the catch statement, where you can have your code handle the error.\
\
In addition to handling promises, then also returns a promise when it completes its work. Multiple then statements can be chained together to carry out complex asynchronous operations, like multiple HTTP requests, database operations, or file operations. An example of this chain would look like this:

    fetchFromUrl(‘https://google.com’)
        .then((result) => {
            return saveResultToDb(result); //assume saveResultToDb returns a promise
        })
        .then((dbResult) => {
            logDbResult(db_result);
            makeHttpRequest(‘https://log-endpoint.com’, dbResult);
        })
        .then(() => {
            //do other stuff here
            return result;
        })
        .then((result) => {
            //do more stuff
        })
        .catch((error) => {
            //handle error
        
        });

Promises were a great improvement over callbacks; however, promises can have their own version of callback hell like so:

    fetchFromUrl(‘https://google.com’)
        .then((args) => {//do some stuff)})
            .then((args) => {//do some more stuff})
                .then((args) => {//do some more other stuff})
                    .then((args) => {//do some more different other stuff})
    //and so on

This is where async/await syntax comes in.

## Async/Await

More recent versions of JavaScript added the async and await keywords and a new syntax for writing asynchronous code that reads like synchronous code. Async/await is a new way of writing code that uses promises that lets developers avoid promise hell.\
\
In order to receive any benefit from async/await, you must be calling functions that return promises; async/await does not magically make synchronous code into asynchronous code.\
\
Here is the first example code rewritten using async/await:

    (async () => {
        const result = await fetchFromUrl(‘https://google.com’) //assume this returns a promise
        console.log(result);
    })();

The await keyword can only be called from within functions that are marked by the async keyword. In this case we had to use an immediately invoked function expression (IIFE, pronounced ‘iffy’) to provide a wrapper function we can mark with async. Don’t worry about the IIFE. That’s something for a future post. The await keyword processes the promise that is returned by a function and allows us to simply assign the return value inside of the promise to a variable like we would any other value. Again, though, the function called with await must return a promise for the async/await to work properly. Async/await syntax simplifies the code considerably over code using promises. Error handling code also becomes much simpler:

    (async () => {
        try{
            const result = await fetchFromUrl(‘https://google.com’) //assume this returns a promise
            console.log(result);
        }catch(error){
            console.error(error);
        }
    })();

When using async/await syntax, you can use try/catch, which normally only works on synchronous code. If the promise from the function called with await returns an error, async/await syntax will properly skip the rest of the try block and pass the error to the catch block.\
\
Async/await syntax makes JavaScript look much more like synchronous code while still being asynchronous. It also helps developers easily avoid callback or promise hell. The other promise hell example would look something like this:

    async function doSomething(arg1){
        try{
            const result = await someOtherThing(arg1);
            const result2 = await somethingElse(result);
            const result3 = await doWork();
            await reportResults(result, result2, result3); 
            //continue doing things below
        }catch(error){
            //handle errors
        }
    };

## Event-driven vs. Asynchronous Programming

If you have heard of event-driven programming, you might be asking yourself what is the difference between asynchronous and event-driven programming. There really is not much of a difference. You could probably consider event-driven programming as a type of asynchronous programming or asynchronous programming as a type of event-driven programming. In both types of programming, your code waits for something to happen before it continues processing.

## Sum it all up

Asynchronous programming can be one of the more difficult aspects of JavaScript to master, especially if you are coming from a synchronous programming language like Python, PHP, Java, C++, etc. New JavaScript users should probably try to learn how promises work and then move onto learning async/await syntax. Using async/await syntax can be much simpler if you understand how it works under the hood.\
\
For more reading, Mozilla Developer Network has a [set of more in-depth articles on Asynchronous Programming with JavaScript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous).