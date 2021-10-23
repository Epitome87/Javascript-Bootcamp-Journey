# The Modern Javascript Bootcamp Course (2021)

## Section 24: Create Node JS Command Line Tools

#### `Originally Started: 10/22/2021`

### Javascript with Node vs the Browser

| JS in the Browser                                  | JS with Node:                                       |
| -------------------------------------------------- | --------------------------------------------------- |
| Executed by adding script tags                     | Executed by running the Node CLI from your terminal |
| Access to the DOM and related objects (Window)     | No DOM exists!                                      |
| Code can reference variables in other files freely | Each file is its own separate world                 |
| Include libraries by adding script tags            | Include libraries using NPM                         |

### Executing JavaScript in Node

`node index.js` in command window to run a JavaScript file (named index, in this example)

Can also run just: `node` to enter the Node REPL. Now you can enter 1-off JavaScript statements.

To stop Node at any time, press Ctrl + C

We can also use `nodemon index.js` to have automatic restarting of our Node apps!

### Working with Modules

No automatic sharing between files like within the Browser! Must use the module system.

To make a variable, object, function, or any piece of code available in another file, we can do the following:

```
(In index.js)

// Note the use of a relative path to the file.
const message = require("./myscript.js");
console.log(message);

(In myscript.js)

module.exports = "I'm available to other files now!";
```

### Invisible Node Functions

When we run `node index.js`, Node is finding all the content inside that file and wrapping it inside of a function. The function looks like:

```
function(exports, require, modeule, __filename, __dirname) {
    const message = require("./myscript.js");
    console.log(message);
}
```

This function is then automatically invoked by Node.

There are 5 arguments that are automatically provided. This process is essentially invisible.

| Argument     | Description                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `exports`    | Equivalent to 'module.exports'. We can technically export code using this, but easier to use 'module.exports' bc of a little corner case |
| `require`    | Function to get access to the exports from another file                                                                                  |
| `module`     | Object that defines some properties + information about the current file                                                                 |
| `__filename` | Full path + file name of this file                                                                                                       |
| `__dirname`  | Full path of this file                                                                                                                   |

Can reference all the arguments that are passed to a function with the `arguments` variable. This works outside of Node, too!

We can see that Node is wrapping our JavaScript files in a function by `console.log(arguments);` and noting how it prints a huge object with keys that represent the exports object, require function, module, filename an directory!

We can log (and reference) these without having to access `arguments` first, such as: `console.log(require); console.log(module);`

For the most part, whenever we are running some Node code, the arguments we are usually interested in are the `require` and `module`.

### The Require Cache

When we require in a file and run that file and get some exports from it, we simulatenously update the require cache. We can view it by observing the `require.cache` variable.

The require cache is an object that stores the result of requiring in a file. It has some number of keys and values. The keys are the names of the different files we require in ("myscript.js" for example). The value is whatever we exported from that file (the string "I'm available to other files now!" in our examples).

If we ever try to require in the same script a second time, the second require statement does not cause the script to be executed again!
Instead, Node takes a look at the require cache, sees we already required in that script, takes a shortcut and takes a look at whatever was previously exported by that script, and give us that value directly. We only ever execute every file **one single time**!

Inside the require cache, we get an object full of files. The shape of the object includes:

```
// Console logging require.cache:
{
    "./index.js":
        Module {
            exports: {},
            filename: "/myFiles/index.js"
            // etc
        }
    "./myscript.js":
        Module {
            exports: "I'm available to other files now!",
            filename: "/myFiles/myscript.js"
        }
}

```

### Files Get Required Once!

Why is this important to know? If you're exporting more complex, ever-changing code (like an object that increments a counter), it's important to realize that the object is only initialized once. If you `require` that object's code a second time, it will not start at its default, fresh state. Rather, it keeps that state of whatever it was when you were working with it via the original `require` statement. Example:

```
// In myscript.js
let counter = 0;

module.exporst = {
    incrementCounter() {
        counter = counter + 1;
    }
    getCounter() {
        return counter;
    }
}

// In index.js
const counterObject = require("./myscript.js");
counterObject.getCounter(); // Value is 0
counterObject.incrementCounter(); // Value is now 1

const newCounterObject = require("./myscript.js")   // References the **same** object as above, in current state
newCounterObject.getCounter(); // Value is still 1 -- it did not go back to the script's original state
```

### Debugging With Node

There are multiple ways to Debug with Node, rather than relying on hundreds of console.log statements!

- `node inspect index.js`
  - Start up a debugger CLI and pause execution whenever a "debugger" statement is hit
- `node --inspect index.js`
  - Start up a debugger instance and pause exeuction whenever a "debugger" statement is hit. Access the deubger at "chrome://inspect"
- `node --inspect-brk index.js`
  - Start up a debugger instance and _wait_ to _execute_ until a debugger is connected. Access the debugger at "chrome://inspect"

Using the first method, when execution of the program stops in a debugger, you can enter in a prompt to achieve different results:

| CLI Debugger Command | Description                                                             |
| -------------------- | ----------------------------------------------------------------------- |
| c                    | **Continue** execution until program ends or next debugger statement    |
| n                    | Run the **next** line of code                                           |
| s                    | **Step** in to a function                                               |
| o                    | Step **out** of the current function                                    |
| repl                 | Start up execution environment where we can reference program variables |
| Ctrl + C (in repl)   | Step out of the repl                                                    |

Running the debugging through the Chrome inspector is a lot more user-friendly! However, can be annoying to visit Chrome each time and make the necessary refreshes.

### App Overview

The project for this course section using Node is relatively simple and straightforward. Using Node, we will recreate the `ls` command functionality, where it prints out files and folders in the current directory (if no additional arguments are provided), or prints out files and folders in relative or aboslute path (if a path argument is provided). It will run directly at our terminal inside any project or directory on our machine.

With Node, we can read out files and folders inside a directory using a Node Standard Library module called File System. Note that we **cannot** access the user's file system in just the Browser!

We can reference all the libraries provided by Node in its very helpful documentation over at: https://nodejs.org/dist/latest-v17.x/docs/api/

### Accessing Standard Library Modules

We will be using the File System method called `readdir()`, which returns an array of the names of the files in the directory excluding "." and "...".

We can use the File System module in our scripts like so: `const fs = require("fs");

### The Callback Pattern In Node

The File System's read directory function can be used like: `fs.readdir(path[, options], callback)`:
This callback runs with two different arguments: `err` and `files`. If no error, the `err` will be null.

Note that this callback pattern is **extremely** common in Node! They usually take in an error and some data. We observe what error returned and work with the data accordingly.

### The Process.cwd Function

We often don't use the "." path shortcut that often. We use a built-in function of Node that belongs to another Standard Library module: `process.cwd()` provided by the Process library. Note that cwd stantds for "Current Working Directory." Although it means the same thing as the "." syntax, it's a lot more reliable and cross-platform friendly.

Note: The Process module is provided automatically into the global scope of every project -- does not need to be reuqired! This is one of the few modules that behaves in this way.

### Running a Node Program as an Executable

We use `npm init -y` to create a package.json file. It records information about your project, such as name, version, description, keywords, author. The two most important pieces of information are a "script" object and a list of dependencies. We can also set up a configuration section, allows us to run some command and trigger some code inside our project. We can define it as a "bin" key in the package.json file, such as: `"bin": { "nls": index.js" }` This will essentially allow us to enter `bin` and have it run our `index.js` script as if it were an executable.

### Linking a Project

The process for our app:

- Create package.json file with "bin" section.
- Change index.js file permissions.
- Add comment to index.js file to allow it to be treated like an executable.
- Link our project.

In Linux systems, we have to do the following to alter its permissions and allow index.js to be ran as an executable:
Run `chmod +x index.js` in a terminal.

We then add this comment to the top of the index.js file: `#!/usr/bin/env node`

- This is essentially telling our PC that we want to use Node to execute this file, rather than execute it directly.

Lastly, we run: `npm link`

- This essentially takes our current project and make it available to every directory on our machine -- globally available everywhere else!

Now we can run `nls` and have it read out the files in the current working directory!

### Is it a File or a Folder?

In our app, we want to color-code the output to indicate if it is a file or a folder. But `readdir()` simply returns an array of string; we have no knowledge of what that string represents! And we can't just use the existence of a ".fileExtension" in the filename, because that can be misleading; sometimes files do not have an extension.

So how we can we solve this? `fs.lstat()` is a function that provides information about the file or folder that we provide as a "path" argument. It does so by returning an instance of `fs.Stats` object.

The `fs.Stats` object contains a bunch of somewhat cryptic properties. But it provides us easy-to-use methods to access things such as `isDirectory()`, `isFile()` -- just what we need!

### A Buggy Initial Implementation

```
fs.readdir(process.cwd(), (err, filenames) => {
  // err === an error object, meaning something went wrong
  // err === null, which means everything is OK! :)
  if (err) {
    // Error-handling code here
    console.log(err);
  }

  console.log(filenames);

  //   BAD CODE HERE! Sloppy first implementation
  filenames.forEach((filename) => {
    fs.lstat(filename, (err, stats) => {
      if (err) {
        console.log(err);
      }

      console.log(filename, stats.isFile());
    });
  });
  //   BAD CODE COMPLETE
});
```

The above code isn't ideal, as the different invocation times of the lstat callback functions make the order that the filenames are logged to the console inconsistent. We want to get all the output at the same time, so we can do some sorting or at least print out the outputs in the same order each time.

### Optional Solution #1

We have three diffrent options for refactoring our code to perform more ideally.

1. Maintain an array of the results from each lstat. As each callback is invoked, add the stats object to this array. When array is full, log everything in it.
2. Wrap the lstat call with a promise, use async/await syntax to process lstat call one at a time.
3. **Ideal**: Wrap lstat call with a promise, use async/await + the Promise.all helper method to process lstat calls all at once.

### A Callback-Based Solution

Let's implement Option #1 above. Refer to the index.js file for the implementation.

**TIP:** We can quickly create an array of null elements with: `const allStats = Array(filenames.length).fill(null);`

### Callback-Based Solution - Using Promises!

In Solution #2, we use a Promise version of callbacks. We can wrap our call to `fs.lstat` in a function that returns a Promise, as follows:

```
// Option #2A: Promise-Based callback solution
const lstat = (filename) => {
  return new Promise((resolve, reject) => {
    fs.lstat(filename, (err, stats) => {
      if (err) {
        // Reject Promise
        reject(err);
      }
      // Resolve Promise
      resolve(stats);
    });
  });
};
```

We can also make use of Node's "Util" library to "Promisify" our function for us! We do so with `util.promisify(<function>)`. This method takes a function following the common error-first callback style (i.e taking an (err, value) => ... callback as the last argument) and returns a version that returns Promises.

We can _also_ implement our Promise-based approach in a 3rd way! Simply use the Promise-based implementation of the `lstat` method that Node's File System module provides for us! `const lstat = fs.promises.lstat`

**Recap**
Whenever working with all the different NodeJS functions that take callbacks, we can turn them into Promise-based implementations by either:

1. Manually turning our functions into ones that use Promises
2. Using the built-in `promisify()` function
3. Seeing if there is a Promise-based implementation provided directly by Node

### Issues with Sequential Reads

Solution 2C (Promise-based, using Node's Promise-based implementation of lstat):

```
const lstat = fs.promises.lstat;

fs.readdir(process.cwd(), async (err, filenames) => {
  if (err) {
    // Error-handling code here
    console.log(err);
  }

  for (let filename of filenames) {
    try {
      const stats = await lstat(filename);
      console.log(filename, stats.isFile());
    } catch (err) {
      console.log(err);
    }
  }
```

Very simple! But there is an issue...

- We are only running one lstat operation at a time! If we had thousands of files, even the speediest of sequential processes would really add up.

This leads us to the ideal solution, #3. This is similiar to option 2, but we use the Promise.all helper method to process lstat calls all at once!

### Promise.all-Based Solution

We call Promise.all with an array of Promise objects. Promise.all waits for every Promise in the array to be resolved, takes data from each of them, throw it in an array, and give us the big array with all the data! They run in parallel. We only make use of the `await` keyword on Promise.all instead of each individual Promise-based call (in our case, the call of `lstat)

```
// Solution 3: Optimal Solution!
const statPromises = filenames.map((filename) => {
  return lstat(filename);
});

const allStats = await Promise.all(statPromises);

for (let stats of allStats) {
  const index = allStats.indexOf(stats);
  console.log(filenames[index], stats.isFile());
}
```

### Console Logs with Colors

For an easy way to color and style our terminal output, we can make use of the `chalk` library on NPM! It provides easy functionality for text color, background color, bolding, italics, underline, etc! We install chalk by running `npm install chalk`, and in our script `const chalk = require("chalk")`. Finally, we can use it for text color as follows:

`console.log(chalk.bgWhite.black("Text here"));`

### Accepting Command Line Arguments

Our version of the `ls` command is still missing a feature: We can't type in an optional argument to view the files in that directory. We can only view the _current_ directory we are in.

We can make use of arguments passed to our program by calling using the `process.argv` variable we have access to. It is an array of arguments our program was called with. It has 2 used for us by default, so the one we specify after our custom `nls` command will be placed as the third element in the array. Therefore we can access it via: `process.argv[2]`. We can then do:

```
// Set the directory we want to examine as the 3rd argument in the process variable, if it exists.
// Otherwise, just use the current working directory.
const targetDirectory = process.argv[2] || process.cwd();

fs.readdir(targetDirectory, async (err, filenames) => { // etc...
```

### Joining Paths

However, the above is not enough to work! When calling `lstat` we are passing it a filename, which it is looking for in our current working directory. We should be passing a relative or absolute path, rather than just the filename. We need to pass in a relative path to our target file.

We need to make use of Node's built-in `Path` module: `const path = require("path");` It helps us with path functionality, and provides cross-platform compatibility.

We specifically need to make use of `path.join()`. In our case, we make the following change:

```
  const statPromises = filenames.map((filename) => {
    // return lstat(filename);
    return lstat(path.join(targetDirectory, filename));
  });
```

### App Wrapup

In this project, we:

- Created a package.json file
  - Added a "bin" section that allowed us to define a command that we wanted to run on our local machine in order to access the code inside our index.js file. Not normally required for a Node project -- specifically for running our program from command line running a special command.
  - Used to configure a project. Script and dependencies part are most important. Chalk appears under dependencies, for example.
- Used some Standard Library modules like fs, util, and path.
  - Vast majority follow same format: Pass in some number of arguments, and the last argument is a callback function -- which is normally called with the same order of arguments (an error object, and the actual data we are looking for).
- We can take the functions that rely on Callbacks and manually turn them into Promises, use promisify, or make use of a sub-module to access a Promise-based version of our function.

#### `Originally Completed: 10/23/2021`

## Section 25: Create Your Own Project Runner

#### `Originally Started: 10/23/2021`

## Section 26: Project Start - E-Commerce App

#### `Originally Started: 10/23/2021`
