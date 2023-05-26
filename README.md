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

```js
// (In index.js)

// Note the use of a relative path to the file.
const message = require("./myscript.js");
console.log(message);

(In myscript.js)

module.exports = "I'm available to other files now!";
```

### Invisible Node Functions

When we run `node index.js`, Node is finding all the content inside that file and wrapping it inside of a function. The function looks like:

```js
function(exports, require, module, __filename, __dirname) {
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

When we require in a file and run that file and get some exports from it, we simultaneously update the require cache. We can view it by observing the `require.cache` variable.

The require cache is an object that stores the result of requiring in a file. It has some number of keys and values. The keys are the names of the different files we require in ("myscript.js" for example). The value is whatever we exported from that file (the string "I'm available to other files now!" in our examples).

If we ever try to require in the same script a second time, the second require statement does not cause the script to be executed again!
Instead, Node takes a look at the require cache, sees we already required in that script, takes a shortcut and takes a look at whatever was previously exported by that script, and give us that value directly. We only ever execute every file **one single time**!

Inside the require cache, we get an object full of files. The shape of the object includes:

```js
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

```js
// In myscript.js
let counter = 0;

module.exports = {
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
  - Start up a debugger instance and pause execution whenever a "debugger" statement is hit. Access the debugger at "chrome://inspect"
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

The project for this course section using Node is relatively simple and straightforward. Using Node, we will recreate the `ls` command functionality, where it prints out files and folders in the current directory (if no additional arguments are provided), or prints out files and folders in relative or absolute path (if a path argument is provided). It will run directly at our terminal inside any project or directory on our machine.

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

We often don't use the "." path shortcut that often. We use a built-in function of Node that belongs to another Standard Library module: `process.cwd()` provided by the Process library. Note that cwd stands for "Current Working Directory." Although it means the same thing as the "." syntax, it's a lot more reliable and cross-platform friendly.

Note: The Process module is provided automatically into the global scope of every project -- does not need to be required! This is one of the few modules that behaves in this way.

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

```js
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

We have three different options for refactoring our code to perform more ideally.

1. Maintain an array of the results from each lstat. As each callback is invoked, add the stats object to this array. When array is full, log everything in it.
2. Wrap the lstat call with a promise, use async/await syntax to process lstat call one at a time.
3. **Ideal**: Wrap lstat call with a promise, use async/await + the Promise.all helper method to process lstat calls all at once.

### A Callback-Based Solution

Let's implement Option #1 above. Refer to the index.js file for the implementation.

**TIP:** We can quickly create an array of null elements with: `const allStats = Array(filenames.length).fill(null);`

### Callback-Based Solution - Using Promises!

In Solution #2, we use a Promise version of callbacks. We can wrap our call to `fs.lstat` in a function that returns a Promise, as follows:

```js
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

```js
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

This leads us to the ideal solution, #3. This is similar to option 2, but we use the Promise.all helper method to process lstat calls all at once!

### Promise.all-Based Solution

We call Promise.all with an array of Promise objects. Promise.all waits for every Promise in the array to be resolved, takes data from each of them, throw it in an array, and give us the big array with all the data! They run in parallel. We only make use of the `await` keyword on Promise.all instead of each individual Promise-based call (in our case, the call of `lstat)

```js
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

```js
// Set the directory we want to examine as the 3rd argument in the process variable, if it exists.
// Otherwise, just use the current working directory.
const targetDirectory = process.argv[2] || process.cwd();

fs.readdir(targetDirectory, async (err, filenames) => { // etc...
```

### Joining Paths

However, the above is not enough to work! When calling `lstat` we are passing it a filename, which it is looking for in our current working directory. We should be passing a relative or absolute path, rather than just the filename. We need to pass in a relative path to our target file.

We need to make use of Node's built-in `Path` module: `const path = require("path");` It helps us with path functionality, and provides cross-platform compatibility.

We specifically need to make use of `path.join()`. In our case, we make the following change:

```js
const statPromises = filenames.map((filename) => {
  // return lstat(filename);
  return lstat(path.join(targetDirectory, filename));
});
```

### App Wrap-up

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

(Skipping this section for now)

## Section 26: Project Start - E-Commerce App

#### `Originally Started: 10/23/2021`

### App Overview

In this section, we're going to start building a simple E-Commerce application! It will be a pretty standard fare: You can browse items, add them to a Cart, and look at the contents of the Cart (there won't be the ability to actually "Checkout"). For Admins of the store, there will be an "Admin Panel" that will let them edit existing products and create new ones.

### App Architecture

We will be creating a Node JS Server that processes incoming user requests from their web browser, and determines which snippets of HTML should be formed together and sent back to the user. We need to store the product information, different Admin users, etc, so we will create our own file-based data store (rather than an online database). The file-based store is merely for learning purposes; we typically want to make use of more typical databases.

Project Setup (common for many projects)

- Create a new project directory
- Generate a package.json file
- Install a few dependencies to help us write our project
- Create a "start" script to run our project

### Package.json Scripts

In this project, we will need to install `express` and `nodemon`. I have `nodemon` installed globally, so I do not need to install it. I should probably install express globally, too!

In the package.json file, we create a "dev" key for the "scripts" portion of our object. Inside the "dev" key, we set it a value of: `nodemon index.js`. We can now type `npm run dev` in our terminal to start our project. We create this "dev" shortcut script so other / future engineers can quickly get an idea of how to manipulate the project. The goal is to communicate to others how to easily start up our project! Ideally we only need to run `npm run dev` once every time we wish to work on our project for the day. Hit Ctrl + C to stop the nodemon process.

### Create a Web Server

The built-in web server included with the Node standard library is a little short on features. We're going to have to end up writing a lot of code ourselves to handle basic operations. So instead, we will make use of the express library! It tremendously helps make and respond to network requests.

To get a web server up and running with express, we simply require it in the code, and then listen to a port, and handle routes.

```js
const express = require('express');
const app = express();

// Route Handlers
app.get('/', (request, response) => {
  response.send('Received "get" request for home route!');
});

// Start listening to incoming network requests
app.listen(3000, () => {
  console.log('Listening on Port 3000');
});
```

We then view the page by visiting localhost:3000 in the browser (or whatever port you are listening on).

### Behind the Scenes of a Request

When we visited localhost:3000/, our browser _formulated_ an HTTP request. But the browser itself is not responsible for issuing that request -- it hands it off to our operating system and its network devices.

The HTTP Request has a couple of pieces of information:

- Host: Domain we are trying to access (localhost in our case, or google.com)
- Port: 3000 (We manually provided 3000, which is convention, but HTTP by default is 80 and HTTPS by default is 443)
- Path: "/"
- Method: "GET" (The default method) This indicates the _intent_ of the request. Get? Delete? Update?

The request was handed off to our OS, in charge of accessing some network devices, and sending the request out over the open internet.
When making a request other than to localhost, our OS is going to reach out to a DNS Server. It is an outside server on the internet which has a mapping between host names and IP Addresses. The DNS Server sends back the IP Address. Our OS then makes a second request to the IP Address and gets a response back.

For localhost, our OS does not reach out to a DNS Server. "I'm going to handle this request on my own!" It looks at the Port specified in the request (65,000 ports for our computer to access). It sees the Port 3000 and takes the request and sends it to whatever piece of software is running on Port 3000. In our case, we told our express server to be listening in on Port 3000! Express receives whatever request was sent. At this point, it does not care about the host or port, only the path and method. Express then runs the request through its Router, looking at the path and method and calling the appropriate callback function that we registered with the router.

Express:

- HTTP Request: Path: "/", Method: "GET"
- Router:

1. If someone makes a "GET" request with a path of "/", run this function -> Callback function we write
2. If someone makes a "POST" request with a path of "/products", run this function -> Callback function we write
3. If someone makes a "GET" request with a path of "/products", run this function -> Callback function we write

Callback function then takes the incoming request and outgoing response, formulate some sort of response, and sends it back to whoever made the original response (in this case, our browser). This Express process happens in a real production environment too, not just our local server.

### Displaying Simple HTML

How do we show HTML? In our express `res.send()` method, instead of just sending a string, we can send HTML! For example:

```js
res.send(<p>Hello!</p>);
```

### Understanding Form Submissions

By default, whenever we click any button inside of a form, or select an input and hit Enter, the browser is going to do something called an _automatic submission_. It looks at the form element, looks at its input elements, and attempt to collect all the information from each of the inputs that have a "name" property assigned to them. It forms all of this information into a "query string", and appends it to the URL. For example, if we had a name and email input (with their "name" properties supplied thusly), we'd get: `localhost:3000/?name=typedName&email=typedEmail`. By default, the browser makes a "GET" request to the same URL it is currently looking at (before the query string portion).

A "POST" request is commonly associated with creating a record of some time (blog post, comment, new image upload, user account, etc).

Note how when we submitted the form with a "GET" request, all the form data was appended as a query string to the URL. But with a "POST", that information is appended to the request body instead. The "POST" request has a body property which can contain information. How can we access this information that was appended to the request body from the form?

### Parsing Form Data

Typical process when submitting form with POST request:

1. Browser sends HTTP header to the server
2. Server sees request with path and method
3. Server runs appropriate callback method.
4. **Then** the browser starts transmitting info from body of request
5. Browser sends a little chunk of info, waits for confirmation
   - 5b. Browser sends a little chunk of info, waits for confirmation.
   - 5c. Browser sends a little chunk of info, waits for confirmation. Etc
6. All chunks sent! Request complete!

We have to figure out how to take all these little chunks of info and assemble them bit by it.

To do a very primitive parsing of the body content ourselves, we can use `req.on()`, convert its Buffer representation of our data into a readable String format, and then do some logic on that String to grab our individual key-value pairs:

```js
app.post('/', (req, res) => {
  req.on('data', (data) => {
    const parsed = data.toString('utf8').split('&');
    const formData = {};
    for (let pair of parsed) {
      const [key, value] = pair.split('=');
      formData[key] = value;
    }
  });
});
```

### Middlewares In Express

**Middleware** in Express is a function that does some pre-processing on the "req" and "res" objects. It is the primary means of code reuse in an Express app.
After a request is made, it goes through the Middleware, before then being sent off to the route handler.

Our form-parsing logic is a perfect candidate to be made a Middleware.

```js
// Middleware for parsing the request body
function bodyParser(req, res, next) {
  // We only want to run this Middleware on POST requests
  if (req.method === 'POST') {
    req.on('data', (data) => {
      const parsed = data.toString('utf8').split('&');
      const formData = {};

      for (let pair of parsed) {
        const [key, value] = pair.split('=');
        formData[key] = value;
      }

      req.body = formData;
      next();
    });
  }
  // Signal that we are done, and Express can continue
  else next();
}

app.post('/', bodyParser, (req, res) => {});
```

### Globally Applying Middleware

Our implementation of body parsing isn't ideal: It only handles POST requests so far, while many other request types contain body elements. We can replace it with an outside library: `npm install body-parser` to install, and then use it like:

```js
app.post('/', bodyParser.urlencoded({ extended: true }), (req, res) => {
```

However, we still have to write out the middleware call every place we want it (as an argument of a route). There's a better solution! We can use the Middleware globally:

```js
app.use(bodyParser.urlencoded({extended: true}));`
```

Now every route will have its body parsed automatically. The body-parser library automatically detects what type of request we are working with and not apply it with a "GET" request.

#### `Originally Completed: 10/23/2021`

## Section 27: Design a Custom Database

#### `Originally Started: 10/23/2021`

### Data Storage

We need some persistent data store in order to preserve customer account information. By persistent, we need a solution that retains the data no matter how many times are server restarts! So we cannot simply store it inside of our computer's memory during program execution. Our express server needs to interface with a data store, which stores a list of users and products. The data store itself is going to store all of its data to our hard drive, in the form of json (products.json and users.json). Note, this will not be suitable for production use -- it is not an ideal solution! It's good for learning purposes, but not something you should use for real software.

The downsides of our solution are:

- Will error if we try to open/write to the same file twice at the same time
- Won't work if we have multiple servers running on different machines
- We have to write to the File System every time we want to update some data => Bad performance!

Why waste our time with this then? Good Javascript experience, practice with code re-use using classes and inheritance.

### Different Data Modeling Approaches

We will have a "Users Repository" and "Products Repository" to store our data. Here is a list of methods we may want to have for the Users Repository:

| Method   | Input Arguments | Return Value | Description                                                   |
| -------- | --------------- | ------------ | ------------------------------------------------------------- |
| getAll   | -               | [user]       | Gets a list of all users                                      |
| getOne   | id              | user         | Finds the user with the given id                              |
| getOneBy | filters         | user         | Finds one user with the given filters                         |
| create   | attributes      | null         | Creates a user with the given attributes                      |
| update   | id, attributes  | null         | Updates the user with the given id using the given attributes |
| delete   | id              | null         | Delete teh user with the given id                             |
| randomId | -               | id           | Generates a random Id                                         |
| writeAll | -               | null         | Writes all users to a users.json file                         |

In the world of Javascript and server design / data management in general, there's 2 popular approaches to managing data:

1. Repository Approach

- A single class (repository) is responsible for data access. All records are stored and users as plain Javascript objects

2. Active Record Approach (not official name, named after Ruby on Rails)

- Every record is an instance of a "model" class that has methods to save, update, delete this record.

We will be taking the first approach.

### Implementing the Users Repository

Even though we should never do it in production software, we are going to do a sync version of the file system function that checks if a file exists. This is okay in our scenario, but we should avoid it usually! We also do this because we want the function to run in our class constructor, which cannot be async.

We can do the following to check if a file exists / create a new file if it does not:

```js
  // Check to see if this file exists
  try {
    fs.accessSync(this.filename);
  } catch (err) {
    // File doesn't exist; let's create it!
    fs.writeFileSync(filename, '[]');
  }
}
```

### Opening the Repository Data File

#### `Originally Started: 10/24/2021`

We will open / read our file with the following code: ` const contents = await fs.promises.readFile(this.filename, { encoding: 'utf8', });`

It returns the contents of the file as a string, just like that!

### Small Refactor

We can shorten our `getAll()` method to:

```js
return JSON.parse(
  await fs.promises.readFile(this.filename, {
    encoding: 'utf8',
  })
);
```

### Saving Records

```js
async create(attributes) {
  // Open / read our current contents of users data file.
  const records = await this.getAll();

  // Push this newly-created record into the file data
  records.push(attributes);

  // Write the updated "records" array back to this.filename.
  await fs.promises.writeFile(this.filename, JSON.stringify(records));
}
```

### Better JSON Formatting

We can refactor the code above to wrap the last line in its own method, as we will be re-using it a lot:

```js
async writeAll(records) {
  await fs.promises.writeFile(
    this.filename,
    JSON.stringify(records, null, 2)
  );
}
```

Also note that we pass two additional arguments to JSON.stringify(). The second argument is a "replacer" -- a function that alters the behavior of the stringification process, or an array of String and Number that serve as an allowlist for selecting/filtering the properties of the value object to be included in the JSON string.

The third argument is a "space" -- a String or Number object that's used to insert white space into the output JSON string for readability purposes. When we use a Number here, it indicates the number of space characters to use as white space for indenting purposes. So in our case, we will use two white spaces each indentation level.

Now our JSON is much more readable!

```js
// Using JSon.stringify(records);
[
  { email: 'test@test.com', password: 'password' },
  { email: 'test1@test.com', password: 'password' },
];
```

```js
// Using JSON.stringify(records, null, 2);
[
  {
    email: 'test@test.com',
    password: 'password',
  },
  {
    email: 'test1@test.com',
    password: 'password',
  },
];
```

### Random ID Generation

We need to assign unique IDs to each of our users, as to differentiate them. This is especially important in other types of records (like products), where it is entirely possible that two products have the same "name" property. We need a way to know which is which. This is where our `randomId()` function comes in!

We will make use of Node's "Crypto" (Cryptography) module. This module has tons of functions related for handling and ciphering and encrypting and decrypting data. We can make use of the `crypto.randomBytes()` method.

```js
const crypto = require("crypto");

// Make use of Node's Crypto module to generate a random ID (and string it to a hex value)
randomId() {
  return crypto.randomBytes(4).toString('hex');
}

// When assigning ID to a record:
record.id = this.randomId();
records.push(record);
```

### Finding By Id

Now that we have Ids, we can create our User Repository methods that require an ID: getOne(id), delete(id), and update(id, attributes). We will create the `getOne(id)` method in this lecture.

```js
async getOne(id) {
  // Retrieve all records
  const records = await this.getAll();

  // Return the first record where its id is the target id.
  return records.find((record) => record.id === id);
}
```

### Deleting Records

```js
async delete(id) {
  // Retrieve all records
  const records = await this.getAll();

  // Only maintain records where the ID is not the target ID
  const filteredRecords = records.filter((record) => record.id !== id);

  // We now have an array with  only records that we DON'T want to delete
  // We write only these back to the file -- essentially deleting the record with target id
  await this.writeAll(filteredRecords);
}

// Make use of Node's Crypto module to generate a random ID (and string it to a hex value)
randomId() {
  return crypto.randomBytes(4).toString('hex');
}
```

### Updating Records

```js
async update(id, attributes) {
  // Retrieve all records
  const records = await this.getAll();

  // Return the first record where its id is the target id
  const recordToUpdate = records.find((record) => record.id === id);

  if (!recordToUpdate) {
    throw new Error(`Record with id ${id} was not found`);
  }

  // Simpler way to do the above: Takes all the props and key/value pairs in attributes
  // and copies them one by one onto the recordToUpdate object
  Object.assign(recordToUpdate, attributes);

  // Write the records (now with the record with target ID updated) back to file
  await this.writeAll(records);
}
```

### Adding Filtering Logic

Our `getOneBy()` method is the most complex -- so we saved it for last! The goal of this method is to call it with some filters object, and return the first user that matches those filters.

```js
async getOneBy(filters) {
  // Return if no filters provided
  if (!filters) return;

  // Retrieve all records
  const records = await this.getAll();

  // Iterate through each record in records array
  for (let record of records) {
    let found = true;

    // Iterate through each key in filters object
    for (let key in filters) {
      if (record[key] !== filters[key]) {
        found = false;
        break; // No point looking through rest of filters -- move onto next record
      }
    }

    if (found) return record;
  }
}
```

Our Users Repository is now done! We now have a useful set of methods that allow us to work with and manipulate a set of users.

### Exporting an Instance

We need to use our now-finished UsersRepository class in another file. What is the best way to export it?

One approach would be:

```js
module.exports = UsersRepository;

// In another file...
const UsersRepository = require('./users');
const repo = new UsersRepository('users.json');
repo.getAll();
```

But this doesn't seem very ideal. What if another file also requires UsersRepository, much like in the above code? And what if they typo the filename to "user.json" instead of "users.json". We now have two separate JSON files, and thus we are accidentally working with two data sets. This could be a challenging bug to track down.

Instead, let's export an _instance_ of the class:

```js
module.exports = new UsersRepository('users.json');

// Another file...
const repo = require('.users');
repo.getAll();
```

However, note that this only works in our situation since we only ever really ever need one copy of UsersRepository. Since we hard-code the json filename in the file before exporting, this is not very flexible for re-use.

### Signup Validation Logic

Our signup logic (we move to next step if no error):

1. Did another user already sign up with this email? -> Yes -> Show an error
2. Are the password and password confirmation different? -> Yes -> Show an error
3. Create an account for this user

With this in mind, our new "POST" request looks like:

```js
app.post('/', async (req, res) => {
  const { email, password, passwordConfirmation } = req.body;

  const existingUser = await usersRepo.getOneBy({ email });
  if (existingUser) return res.send('Email already in use');

  if (password !== passwordConfirmation) return res.send('Passwords do not match');

  usersRepo.create({ email, password });

  res.send('Post request received on home');
});
```

#### `Originally Completed: 10/24/2021`

## Section 28: Production-Grade Authentication

#### `Originally Started: 10/22/2021`

This section consists of 10 lectures, totally 78 minutes in length. In it, we will learn how to implement production-grade authentication in our e-commerce app!

### Cookie-Based Authentication

We will look at the vastly most popular way to handle authentication. To do so, we have to learn about request cookies.

A cookie is a very small string of characters that the server wants the browser to store. It can serve them back in a response. It's as if the server is saying to the browser: "Here is a cookie! It's a small string of characters. Please include this with every followup request you make to me." The browser then automatically includes said cookies with the request that is being issued to the server. The cookie is the core of the vast majority of authentication, in order to identify users who are coming to our application to make requests.

The cookie contains some form of identification in an encrypted format. The cookies are always unique for each domain; Google's will be different than one from Walmart, for example.

### Creating User Records

How can we interact with the user's cookie? We can figure out how to manipulate the user cookie ourselves using Express and the different APIs it offers us. Or we can use a third party package to manage Cookies for us. We will do the latter! Managing cookies is notoriously tricky, and easy to open us up for vulnerabilities. It's best left to utilize what trusted parties have created. So we will use the `cookie-session` library: `npm install cookie-session`

### Fetching a Session

The cookie-session library is a middleware function, just like body-parser. We have to write it up to our express app, via app.use().

```js
app.use(
  cookieSession({
    keys: ['euab74n39bnopqldkew83blaejyvctq7adjlke3'],
  })
);
```

Note the keys property: It is used to encrypt all the information that is stored in the Cookie. This will help prevent the user from modifying the cookie to pretend they are somewhere they are not.

The cookie-session library adds exactly one property to our Express app, on the request object: `req.session`. It is a plain Javascript object, and we can add as many properties as we wish to the session object. Any information we throw in there will automatically be maintained by cookie-session for us.

Now we can do:

```js
// Store the id of that user inside the user's cookie
req.session.userId = user.id;
```

### Signing Out a User

To sign out, we simply indicate we wish to forget our current Session object.

```js
app.get('/signout', (req, res) => {
  // Forget the current session object. Cookie-Session will handle the rest!
  req.session = null;

  res.redirect('/');
});
```

### Signing In

Flow-chart for signing a user in:

1. Did another user already sign up with this email? -> No -> Show an error
2. Does the existing user record have the same password as the one supplied? -> No -> Show an error
3. Sign this user in!

```js
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepo.getOneBy({ email });

  // Does a user with this email even exist?
  if (!user) {
    return res.send('Email not found');
  }

  // Does the password provided match that of the user's?
  if (user.password !== password) {
    return res.send('Invalid password');
  }

  // At this point, user is valid: Sign in!
  req.session.userId = user.id;

  res.send('You are signed in!');
});
```

### Hashing Passwords

There's a very big security issue with our current solution: Our data store (users.json) are storing the actual user passwords -- in plain text! If a malicious user ever got access to this file, they'd know every user's email and password. Even if our web app provides a malicious user with no direct benefit of knowing other users' login information (he can't sign into their account and actually buy anything with their money, for example) it poses an indirect risk: Many people re-use their passwords for multiple things! So if someone finds your password in one location, they may take advantage of it on a website that permits it -- even a banking site!

**Never store passwords in plain text!**

We need to use a hashing algorithm. The goal of a hash algorithm is to take a string and spit out a seemingly-random series of numbers and letters. Hash algorithms have a very important property: The same input string always provides the same output. SHA256 is the name of one popular hashing algorithm. Hashing algorithms do not work in reverse. Changing even just one input character changes the hash output significantly.

What we store in our database is the hashed version of the user's password. When he signs up and signs in, we run their input password through our hashing algorithm. We check to see if the hash version matches the hash that was previously saved to the database (as the user's hashed password).

However, there's still one security hole with this method...

### Salting Passwords

The security hole with hash algorithms has to do with taking advantage of known common passwords. This leads to a "Rainbow Table Attack".
A malicious user can find a list of common passwords and build up a look-up table of their corresponding hash values. For example, they'll know common password "monkey" has a SHA256 hash of "000c285457fc9". Now, if a malicious user gains access to our users.json file, they'll see all the hash values, and compare them to their tables. If they find "000c285457fc9" in our data store, they know that non-hashed password is "monkey"! They can now sign into their account. This type of attack is not as successful if your password is truly complex and unique.

To prevent this, we add an additional random string of characters to every password we hash, called a "Salt". This "Salt" is different for every user. The "Salt" is appended to the un-hashed password, and that combined input is ran through the hashing algorithm.

To achieve this, we store the following in our Users database, in place of their direct password: "<HashedPassword+RandomSalt.RandomSalt>"
Later, when the user signs in using their password, we retrieve the "RandomSalt" portion of their stored password, append that to the password they just input, run it through the hashing algorithm, and see if it matches the "HashedPassword+RandomSalt" portion of the stored password.

### Salting + Hashing Passwords

The Node.JS standard library's "Crypto" module will help us achieve our salting and hashing.

`crypto.randomBytes()` to generate our random Salt

`crypto.scrypt(password, salt, keylength[,options],callback)` (named after a specific password hashing algorithm) to hash our password.

```js
// Inside our user repository create() method:
// Generate a random salt
const salt = crypto.randomBytes(8).toString('hex');
const buffer = await scrypt(attributes.password, salt, 64);
// Push this new record, but change its password to be the hashed version
const record = {
  ...attributes,
  password: `${buffer.toString('hex')}.${salt}`,
};
records.push(record);
```

### Comparing Hashed Passwords

```js
 async comparePasswords(savedPassword, suppliedPassword) {
// savedPassword -> password saved in our database: "hashed.salt"
// suppliedPassword -> password given to us by a user trying to sign in
const [hashed, salt] = savedPassword.split('.');
const hashedSupplied = await scrypt(suppliedPassword, salt, 64);
return hashed === hashedSupplied;
  }
```

### Testing the Full Flow

In our "GET" route for the "signin" route, we update our password check with the following:

```js
/*No Longer Use This!*/ // if (user.password !== password) {
const isValidPassword = await usersRepo.comparePasswords(user.password, password);
if (!isValidPassword) return res.send('Invalid password');
```

And that's basic user authentication, using basically only cookie-session!

In the next section, we will refactor the code and better structure the project. We will then have a good solid starting point for any app in the future we want to create that requires authentication.

#### `Originally Completed: 10/24/2021`

## Section 29: Structuring Javascript Projects

#### `Originally Started: 10/25/2021`

We'll have 3 primary directories in our project:

- Routes
  - admin/auth.js
  - admin/products.js
  - products.js
  - cart.js
- Repositories
  - users.js
  - products.js
- Views
  - Various

### Structure Refactor

We can move all our routes related to authentication into its own auth.js file. To define routes here, we require express, and then: `const router = express.Router();` as well as calling our `app.get()` and `app.post()` methods with `router.get()` and `router.post()` instead. We then `module.exports = router;` and inside our index.js file we have:

```
const authRouter = require('./routes/admin/auth');
const app = express();

// ...After other Middlewares
app.use(authRouter);
```

This is essentially a convention to create "Sub" routers in other files, and hook them up as middlware to our express app.

### HTML Templating Functions

We also should clean up our HTML-related code, putting it into appropriate files in a "Views" directory. Each file is responsible for returning one snippet of HTML.

In Express, there are many ways to generate HTML, using HTML Templating Libraries:

- pug/jade
- haml
- mustache
- EJS

Rather than learn the syntax of a templating library, we are going to export a function that returns a string representation of the HTML.

Although I know EJS from other projects, I think I will follow this course's approach, as it might be a useful option to learn!

Example of this strategy:

```js
// views/admin/auth/signup.js
module.exports = ({ request }) => {
  return `
    <div>
        ${request.session.userId}
        <form method="POST">
            <input name="email" placeholder="email" />
            <input name="password" placeholder="password" />
            <input name="passwordConfirmation" placeholder="password confirmation" />
            <button>Sign Up</button>
        </form>
    </div>
    `;
};

// auth.js
const signupTemplate = require('../../views/admin/auth/signup');

router.get('/signup', (request, response) => {
  response.send(signupTemplate({ request }));
});
```

### HTML Reuse with Layouts

Things we could improve so far:

The response we send to our browser from our server right now is just a single div element with all the HTML form data we need to show to the user. Yet the browser somehow manages to wrap that up in the appropriate HTML, head, body, etc tags. How is this? Well, it recognizes we are sending a _partial_ HTML document. The browser will automatically create these elements for us, and stick our content in the body. While this sounds good, we should not rely on the browser to do this for us! So we should send down an entire valid HTML document. But doing so in each file would be tedious, not be DRY, and would be hard to expand upon any time we want to introduce a change that might effect every page.

To solve this, we can create a _layout_ file. It will contain all the standard HTML elements we expect to have inside our document. We display the layout, and stick the contents of our different view templates inside the body of the layout file.

### Building a Layout File

```js
// views/admin/layout.js
module.exports = ({ content }) => {
  return `
        <!DOCTYPE html>
        <html>
            <head>
            </head>
            <body>
                ${content}
            </body>
        </html>
    `;
};

// views/admin/auth/signin.js
const layout = require('../layout');
module.exports = () => {
  const content = `
    <div>
        <form method='POST'>
            <input name='email' placeholder='email' />
            <input name='password' placeholder='password' />
            <button>Sign In</button>
        </form>
    </div>
    `;

  return layout({ content });
};
```

### Adding Better Form Validation

We will use a library called `express-validator` to help us validate our forms.

### Validation vs Sanitization

Validation makes sure the incoming form values meet some criteria.
Sanitization has to goal of massaging the incoming form values. For example, trimming white space from an incoming value.  
We can also standardize an incoming email via sanitization.

### Receiving Validation Output

We can use the `express-validator` library as follows:

```js
router.post(
  '/signup',
  [
    check('email').trim().normalizeEmail().isEmail(),
    check('password').trim().isLength({ min: 5, max: 20 }),
    check('passwordConfirmation').trim().isLength({ min: 5, max: 20 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
  // ... etc
```

### Adding Custom Validators

Right now, we are validating user input in two different spots -- once in the `express-validator` middleware, and then once again shortly after when we do our own check that ensures the email is not already in use by another user, or when the password and confirmation password fields are not the same value. This is not good practice! We want to merge / centralize our validation logic into one check. We need a custom validator to add to the `express-validator` validation chain.

```js
[
  check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .custom(async (email) => {
      const existingUser = await usersRepo.getOneBy({ email });
      if (existingUser) throw new Error('Email already in use');
    }),
  check('password').trim().isLength({ min: 5, max: 20 }).withMessage('Password must be between 5 and 20 characters'),
  check('passwordConfirmation')
    .trim()
    .isLength({ min: 5, max: 20 }).withMessage('Password must be between 5 and 20 characters')
    .custom(async(passwordConfirmation, { req }) => {
      if (req.body.password !== passwordConfirmation)
        throw new Error('Passwords do not match');
    }),
],
```

### Extracting Validation Chains

We need to pull out all the validation logic out of our auth.js file.
We also need to figure out how to show the form validation errors on the original form, so the user knows what they did wrong without being taken to a separate page that tells them so.

We can create a `routes/admin/validators.js` file and do the following:

```js
module.exports = {
  requireEmail: check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .custom(async (email) => {
      const existingUser = await usersRepo.getOneBy({ email });
      if (existingUser) throw new Error('Email already in use');
    }), // etc for the other 2 validators
```

And now in our auth.js file:

```js
router.post(
  '/signup',
  [requireEmail, requirePassword, requirePasswordConfirmation],
  async (req, res) => {
    const errors = validationResult(req);
```

Much cleaner!

### Displaying Error Messages

Now we actually need to handle user's entering invalid form data, not just detect it!

First, we create a helper function that will return the error messages:

```js
function getError(errors, property) {
  try {
    return errors.mapped()[property].msg;
  } catch (err) return '';
```

Now in our HTML for the signup page, we can do:

```js
<form method='POST'>
  <input name='email' placeholder='email' />${getError(errors, 'email')}
  <input name='password' placeholder='password' />${getError(errors, 'password')}
  <input name='passwordConfirmation' placeholder='password confirmation' />${getError(errors, 'passwordConfirmation')}
  <button>Sign Up</button>
</form>
```

### Validation Around Sign In

Validating Sign-In is very similar to that of Sign-Up

### Password Validation

Again, creating our validators for Sign-In is similar to that above.

### Template Helper Functions

We'll put our `getError()` function into its own file, and require it in the signup and signin templates. Nothing really to write about!

### Adding Some Styling

We will use Bulma and style the pages a little better (or at least Stephen will for us!)

But now we have a problem: We want to use a stylesheet for additional styling. But how can we get access to it in Express? We can't simply place it where are index.js file is and have it work...

### Exposing Public Directories

Much like we're doing with our signin and signup, where our browser makes a request for a route on our Express server and our route handler processes it and returns some HTML back, we need to do the same with our CSS file(s). We need to setup a very different type of route handler, where we want Express to try to find a file (called main.css) and send that file back to the browser. We want Express to serve up some file, in order to make it available for our application in the browser.

To do so, we make a "public" directory: We're going to expose this directory to the outside world, so a browser can freely access it. We place any CSS files, any fonts, any images, any Javascript code (that we want to make available to browser). Never place secret/important files in there! Always hide server code from browser.

But there's still another step: We need to tell Expess explicitly that we want to make this directory available to the outside world.
`app.use(express.static('public'));`

The line above changes how Express handles every single request we get. Now Express first looks at the incoming request and looks to see if there's a file in the "public" directory that the request is looking for. If there is, it sends that file back. If not, it continues on and runs all the other Middleware and route handlers that we've set up.

### Next Steps

We're now essentially done with authentication! We can now get back on-track to the e-commerce functionality. Most of what we need to know has been learned -- now we can focus on just typing!

Next up is finishing the Admin Panel.

### Product Routes

Much like we did when we refactored our routes from index.js to auth.js, we need to create a Router object, define some of its routes, and then export that to our index.js. We then use it as a middleware. Not much new from before. We will define these routes in "products.js" and export them in "index.js"

```js
// index.js
const productsRouter = require('./routes/admin/products');
...
app.use(productsRouter);
```

### The Products Repository

Like with Users, we need a Products Repository. It will have extremely similar functionality and methods. Only the "create" method will be different, in fact! Rather than simply copy and paste the UsersRepository code, we will create a parent class called "repository", and have them extended to a "users" and "products" version! This will let us define a "Create" method in the parent, and then have each of the children define how it functions, since they will be unique to each one.

### Code Reuse with Classes

We create a class "Repository" and basically copy and paste what is in our "users.js" (UsersRepository) class. We then have the now-trimmed UsersRepository class "extend" the base Repository class.

### Creating the Products Repository

Now we create the ProductsRepository class. It "extends" the base Repository class, and adds literally nothing new (yet). We then export it to our "products.js" file, so those routes can have access to the Products Repository!

### Building the Product Creation Form

Another simple lecture.

```js
// newProduct.js
const layout = require('../layout');
const { getError } = require('../../helpers');

module.exports = ({ errors }) => {
  const content = `
  <form method="POST">
      <input placeholder="Title" name="title" />
      <input placeholder="Price" name="price" />
      <input type="file" name="image" />
      <button>Submit</button>
  </form>
`;

  return layout({ content });
};
```

### Some Quick Validation

We must note that when we submit a form, no matter what we type in, our server is always going to receive that value as a string. Therefore, when validating our product price input, we want to chain on `.toFloat()` to our validation chain on the price.

```js
// validators.js
requireProductTitle: check('title')
  .trim()
  .isLength({ min: 5, max: 40 })
  .withMessage('Product title must be between 5 and 40 characters'),

requireProductPrice: check('price')
  .trim()
  .toFloat()
  .isFloat({ min: 1 })
  .withMessage('Please enter a valid price'),
```

#### `Originally Completed: 10/25/2021`

## Section 30: Image and File Upload

This section continues right off from the last lecture, where we are working on finishing our Admin Panel's ability to add new products.

#### `Originally Started: 10/28/2021`

### Exploring Image Upload

When we submit our product form with the title, price, and uploaded image, we can see in the `req.body` that the only information we have about our attached file is the image name. This is not very useful! How can we take a file that's been submitted via a form and actually receive it on our backend server?

### Understanding Multi-Part Forms

When we leave a form to its default behavior, its `method` attribute is automatically set to "GET" behind-the-scenes. With a method of "GET", the browser is going to take all of the information in the form, add it into the URL of the request, and make a request to the backend server with that URL.

When we specify a method of "POST", the browser is going to take all of the information of the form, stick it into the body of a POST request, and make that request to the backend server.

There is another option we can provide to a form element: `enctype= `

- This stands for encoding type
- Method describes **how** to transmit information
- enctype describes **how to take** information out of the form and get it ready to be transmitted. How to encode/bundle the information to make it safe and transport in some style.
- By default this is `enctype="application/x-www-form-urlencoded"` if we do not provide it
  - This type of encoding (urlencoded) is saying: "Take all the info out of the form (inputs) take a look at their "name" properties, take a look at the values of each, and put them all together in a query string type format. Take this information, make it safe to be transmitted inside of a URL.

Core issue around using the defaults with file input types

- Files might have some data inside of it which can not be safely or efficiently transmitted into a URL-safe format
- Form has no idea how to turn that file into a URL-safe string, so just transmits the name of the file

We need another encoding type to resolve this; `enctype="multipart/form-data"`

- This means take all the different pieces of info out of our form, and for each separate input, send each little part to the backend in a different little part.

### Accessing the Uploaded File

The body-parse middleware we're using right now is not sufficient to reach into the request and pull out the image we are uploading -- it only works with urlencoded requests.

Instead, we will use the `multer` npm library to do multipart/form-data parsing!

```js
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// In our POST route for new products
router.post('/admin/products/new', [requireProductTitle, requireProductPrice], upload.single('image'), (req, res) => {
  const errors = validationResult(req);

  console.log(req.file);

  res.send('Submitted');
});
```

### [Optional] Different Methods of Image Storage

Skipping for now

### Saving the Image

We are going to handle image saving in a way that is **NOT** the best or most optimal way -- but it works for teaching purposes. This way is not recommended for a production-level application.

We are going to take the file that is uploaded and turn it into a string that can be safely stored inside the products.json file. We then take that string and create a new record out of it using our products repo, which in turn will save it into products.json.

```js
const image = req.file.buffer.toString('base64');
const { title, price } = req.body;

const newProduct = await productsRepository.create({ image, title, price });
```

Looks like it works! But there's one small bug...

### A Subtle Middleware Bug

(Should revisit this video for better explanation)

Although it looks like a new product is being created and saved to our json file based off the correct user input in the new product form fields, that is not the case. Not especially how our "price" is saved as a string, whereas it should be a number.

Basically, since the body-parser middleware is not handling the new products form, it is no longer running for our incoming request. It no longer parses the contents of the post request and throwing it into `req.body`. Yet we still can receive our title and price and image in `req.body` -- how? Because multer! It's parsing "title" and "price" for us. The problem is the order in which our validators and multer middleware are running! When we were having our body parsed with body-parser, we were "using" that middleware before our validators were called (via `app.use(bodyParser())`) -- this makes it called before every individual route middleware we specify in the route itself. As far as our validators are concerned, no "price" or "title" were provided, so the validation fails.

The fix is simple: Swap validators and multer!

```js
router.post(
  '/admin/products/new',
  upload.single('image'), // Put this first!
  [requireProductTitle, requireProductPrice],
  async (req, res) => {
```

### Better Styling

In this lecture, we just add some styling (by copying and pasted updated "new.js" file) to make our new product form page look better.

### Reusable Error Handling Middleware

Let's create our own middleware function for error handling of our validators! We create a middlewares.js file in our routes/admin directory:

```js
const { validationResult } = require('express-validator');

module.exports = {
  handleErrors(templateFunction) {
    return (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.send(templateFunction({ errors }));
      }

      next();
    };
  },
};

// Use where necessary, like in auth.js signin route:
router.post(
  '/signin',
  [requireEmailExists, requireValidPasswordForUser],
  handleErrors(signinTemplate),
  async (req, res) => {
```

### Products Listing

To display our products, we listen for a "GET" request on the "admin/products" route, we retrieve all the products from the products database,

```js
// views/admin/products/index.js
const layout = require('../layout');

module.exports = ({ products }) => {
  const renderedProducts = products
    .map((product) => {
      return `
            <div>${product.title}</div>
        `;
    })
    .join('');

  const content = `
    <h1 class="title">Products<h1>
    ${renderedProducts}
  `;

  return layout({ content });
};

// products.js
router.get('/admin/products', async (req, res) => {
  const products = await productsRepository.getAll();
  res.send(productsIndexTemplate({ products }));
});
```

### Redirect on Success Actions

Whenever an admin user Signs up, Signs in, creates a product, or edits a product, we want to redirect them to the Product Index page. In an Express app, we do this with a `res.redirect("/admin/products)` call!

### Requiring Authentication

We need to make sure we add some code in our admin routes to make sure a user is signed into our application before they can see the content of the pages!

We need to check if the `req.session.userId` property is defined before we allow admin access to these routes!

```js
if (!req.session.userId) {
  return res.redirect('/signin');
}
```

This introduces duplicate code, so we can wrap this inside a function into our middlewares.js file!

```js
// middlewares.js
requireAuthentication(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/signin');
  }

  next();
},

// products.js
router.get('/admin/products/new', requireAuthentication, (req, res) => {
  res.send(productsNewTemplate({}));
});
```

### Template Update

In this lecture, we do some styling (provided for us) to the admin/products page. It now includes buttons for Edit / Delete of a product, and a button to create a New Product.

So how can we click the Edit / Delete button by a product and do the required logic on that particular product?

### Ids in URLs

The best way to handle Edit functionality is to somehow encode into our button the Id of the product we wish to edit (href):

```html
<a href="/admin/products/${product.id}/edit">
  <button class="button is-link">Edit</button>
</a>
```

Now we need to put together a route handler that can receive these requests!

### Receiving URL Params

We can have a "Wildcard" in the URL by putting ":" , as in: `router.get("/admin/products/:id/edit", (req, res))`

```js
router.get('/admin/products/:id/edit', async (req, res) => {
  const productId = req.params.id;
  const productToEdit = await productsRepository.getOne(productId);

  if (!productToEdit) {
    return res.send('Product with that ID not found');
  }

  res.send(productsEditTemplate({ product: productToEdit }));
});
```

### Displaying an Edit Form

```js
const layout = require('../layout');

module.exports = ({ product }) => {
  const content = `
    <form method="POST">
        <input name="title" value="${product.title}" />
        <input name="price" value="${product.price}" />
        <input name="image" type="file" />
        <button>Submit</button>
    </form>
  `;

  return layout({ content });
};
```

As there's no easy way (with our implementation of file attachments) to pre-populate the edit form with the image that's already associated with the product being edited, we will just assume that if the user does not attach a new file, they want to keep the old image.

## Section 31: Building a Shopping Cart

#### `Originally Started: 10/28/2021`

This section contains 20 lectures, spanning 1 hour and 53 minutes of content.
In this section we will finish the Admin Panel and work on the User's Shopping Cart!

### Editing a Product

```js
router.post(
  '/admin/products/:id/edit',
  requireAuthentication,
  upload.single('image'),
  [requireProductTitle, requireProductPrice],
  handleErrors(productsEditTemplate),
  async (req, res) => {
    const productEdits = req.body;

    if (req.file) productEdits.image = req.file.buffer.toString('base64');

    try {
      await productsRepository.update(req.params.id, productEdits);
    } catch (error) {
      return res.send('Could not find item');
    }

    res.redirect('/admin/products');
  }
);
```

However, error handling does not work properly! Our middleware for handleErrors is not passing the product we care about.

### Fixing the HandleErrors Middleware

Problem: Our HandleErrors middleware is calling the product edit template with just an errors object, but our product edit wants a "product" object. So whenever we have an error, we call the template with no product argument -- so the product is undefined, and thus all the references in our product edit page are not defined.

### Edit Form Template

### Edit Form Template

Simply added styling to our product edit page.

### Deleting Products

To delete a product, we can wrap our Delete button in a form element. Why not wrap it in an anchor tag like with our Edit button? Because an anchor tag will send a "GET" request -- but we want a "POST" request! A form only allows "GET" and "POST" request, although technically using a "DELETE" request here would be more appropriate. But getting a "DELETE" request in a form involves a bit of trickery, so we avoid that in this project.

So, we wrap the Delete button in a form, give it a `method="POST"` and an `action="/admin/products/${product.id}/delete"` as the URL its making the POST request to. By default the action property is the current URL (/admin/products in our case).

```js
// In /views/admin/products/index.js
<form method='POST' action='/admin/products/${product.id}/delete'>
  <button class='button is-danger'>Delete</button>
</form>
```

### Starting with Seed Data

We are all done with our Admin Panel! Now we need the ability to show the user a list of products, which they can click and add to their cart. They should also be able to view the content of their cart.

Because we need a good list of options for products for the user, we need to fill our database with products. Stephen provides us with a new products.json file with a handful of products with reasonable titles, prices, and images.

### User-Facing Products

#### `Originally Continued: 10/29/2021`

In this lecture, we create a "routes/products.js" file to handle user product routes. We set up the home ("/") route to simply send a welcome message. Finally, we use the router we create in the products.js file via `app.use(productsRouter);` in the index.js file. Nothing new, really!

### Products Index

```js
// In views/products/index.js
module.exports = ({ products }) => {
  const renderedProducts = products
    .map((product) => {
      return `
            <li>${product.title} - $${product.price}</li>
        `;
    })
    .join('');

  return `
        <ul>${renderedProducts}</ul>
    `;
};
```

```js
// routes/products.js
const express = require('express');
const productsRepository = require('../repositories/products');
const productsIndexTemplate = require('../views/products/index');

const router = express.Router();

router.get('/', async (req, res) => {
  const products = await productsRepository.getAll();

  res.send(productsIndexTemplate({ products }));
});

module.exports = router;
```

### Merging More Styling

Simply copy and pasted some styling changes to our user product index page. It's now resembling an actual online store!

### Understanding a Shopping Cart

Like Amazon does, we want a user to be able to put items in their Shopping Cart without ever having to actually sign in. But this leads us to two big problems:

1. How do we tie a Cart to a person who will never be logged in?
2. Even if we can identify who is trying to add an item to a cart, how do we tie a product to a Cart?

### Solving Problem #1

So how do we tie a Cart to a person when they will never be logged in?

When the user adds a product to the Cart, the Express server will respond by essentially saying: "Product with <productId> added to Cart. By the way, please store Cart ID #<randomIdNumber> in your Cookie, so I know which Cart is yours!"

Every follow-up request will allow us to know which Cart ID is attached to that person.

### Solving Problem #2

Now how do we represent a Cart? Here we observe 3 different approaches (with the first 2 being _bad_!)

1. We could add a "carts" key in our Products Repository, which is an array that stores the Cart ID of every Cart that item is associated with.

- Downside: Any time we want to ask about what products being to what users, we have to iterate through our entire list of products (in order to see if their Cart ID is found in the "Carts" key).
- We are also mixing functionality: A Product shouldn't know about Carts.
- The "Carts" array might grow without bound, as many users add that Product to their Cart and never remove it. (Though we could figure out when to remove it automatically after some time)

2. We could have a separate repository, called the Carts Repository. Inside of here, we can store an array of objects, where each object represents one user's Cart. It could store the ID of the Cart, and a Products array (where each item contains that product's ID, title, price, image, etc).

- Downside: We're making a copy of the entire Product definition and storing it inside the Cart definition. If we ever update information of a Product (say price), the Product price in the Cart Repository now contains out-of-date information. To update, every time we made a change to a product, we'd have to look through all the Carts we have, all the different products that they store, and update the appropriate properties on each one. Very expensive operation!

3. Much like possibility #2, we have a Products Repo and Carts Repo. Every time the user attempts to add a product to a cart, if they don't have a cart already we generate one for them (create new record in Carts repo for them, with random cart Id and a products array). This time, instead of storing entire product in products array, we only store the ID of the product, and the quantity! If we ever wanted to figure out the different products the user has in their cart, we'd simply take the product IDs and look it up in the Products Repo!

- Good: Easily make updates to original Products Repo (title, price, image) without having to go through the Carts
- Downside: More complex code.

We will go with solution #3!

### Shopping Cart Boilerplate

We create a new file for our carts repo (carts.js) in repositories directory:

```js
const Repository = require('./repository');
class CartsRepository extends Repository {}
module.exports = new CartsRepository('carts.json');
```

We will create a router for the Cart in routes/carts.js

```js
const express = require('express');
const router = express.Router();

// We'll define routes later

module.exports = router;
```

And in our index.js file, we `const cartsRouter = require('./routes/carts');` and `app.use(cartsRouter);`

3 different routes we need for shopping cart:

1. Button (Add to Cart) that triggers a POST form request. Attempt to add that item to a Cart.
2. A route that displays the actual Shopping Cart content (list of items in it, their price, quantity, etc).
3. A route that handles pressing the "X" (Delete) buttons by each product on the page mentioned above. This is done via a form submission.
4. (Technically a route for when the "Buy" / "Checkout" button is clicked, but we don't implement purchasing)

### Submission Options

How can we signal which product we are adding to the cart?

1. One approach is how we did earlier: We have the form wrapping the button send a POST request, with an "action" of "/cart/products/${product.id}"

2. The other way is to add an input element in the form itself, but have it hidden so it is not visible to the user. We could set the "value" of this element to `value="${product.id}"`. Now when a user submits the form, we can read in `req.body` from our POST request handler and get the information stored inside that input!

For variety sake, we will try approach #2:

```js
// views/products/index.js
<form action='/cart/products/' method='POST'>
  <input hidden value='${product.id}' name='productId' />
  <button class='button has-icon is-inverted'>
    <i class='fa fa-shopping-cart'></i> Add to cart
  </button>
</form>
```

And in our routes/carts.js:

```js
// Receive a POST request to add an item to a cart
router.post('/cart/products', async (req, res) => {
  const { productId } = req.body;
  // Cart-related logic to come...
  res.send(`Adding ${productId} to your cart`);
});
```

### Creating a Cart, One Way or Another

To create our Cart functionality, we unfortunately have several corner cases to consider.

1. A user comes to our app for the first time and clicks on Add Product. In this case, there is no Cart in our Carts Repo that corresponds to that of this user. So we'll need to ensure we create that Cart.
2. A user has come to our app and added a product before, we assign them a cart ID and store it inside a cookie. We have to go through the Carts Repo and find the appropriate cart for them.
3. After we find the cart of either of the 2 previous user scenarios, we then have to decide whether or not there's already a product in that cart's product array that already contains that product ID.
4. There are no items yet, we have to take the product ID and add it in fresh to the product array.

```js
// Receive a POST request to add an item to a cart
router.post('/cart/products', async (req, res) => {
  const { productId } = req.body;

  // Figure out the Cart! (Make one? Retrieve one?)
  let cart = undefined;

  if (!req.session.cartId) {
    // We don't have a Cart; need to create one!
    // And store the Cart ID on the req.session.cartId property
    cart = await cartsRepository.create({ items: [] });

    // Assign our Cart session with this newly-created Cart's id.
    req.session.cartId = cart.id;
  } else {
    // We have a Cart; let's get it from the Carts Repo!
    cart = await cartsRepository.getOne(req.session.cartId);
  }

  // Either increment quantity for existing product
  // OR add new Product to the product array
  let isItemUnique = true;

  cart.items.forEach((item) => {
    if (item.id === productId) {
      console.log('Item already in cart; incrementing quantity!');
      isItemUnique = false;
      item.quantity++;
    }
  });

  if (isItemUnique) {
    // Item wasn't already found in cart
    console.log('Item not in cart; adding!');
    cart.items.push({ id: productId, quantity: 1 });
  }

  // Update the Carts repository with its new items state
  cartsRepository.update(cart.id, { items: cart.items });

  console.log(cart);
  res.send(`Adding ${productId} to your cart`);
});
```

### Adding Items to a Cart

```js
// Slightly cleaner way rather than using isItemUnique flag
const existingItem = cart.items.find((item) => {
  return item.id === productId;
});

if (existingItem) {
  existingItem.quantity++;
} else {
  cart.items.push({ id: productId, quantity: 1 });
}
```

### Displaying Cart Items

```js
// In views/carts/show.js
const layout = require('../layout');

module.exports = ({ items }) => {
  const renderedItems = items
    .map((item) => {
      return `
            <div>
                ${item.product.title} - $${item.product.price}
            </div>

        `;
    })
    .join('');

  const content = `
    <h1>Cart</h1>
    ${renderedItems}
  `;

  return layout({ content });
};
```

```js
// In routes/cart.js
const cartShowTemplate = require('../views/carts/show');

// Receive a GET request to show all items in cart
router.get('/cart', async (req, res) => {
  // Redirect if user does not have a Cart
  if (!req.session.cartId) {
    return res.redirect('/');
  }

  const cart = await cartsRepository.getOne(req.session.cartId);
  for (let item of cart.items) {
    const product = await productsRepository.getOne(item.id);
    // Just attach a new key onto our cart item (we won't be saving it back to the database)
    item.product = product;
  }

  console.log('cart.items', cart.items);

  res.send(cartShowTemplate({ items: cart.items }));
});
```

### Rendering the List

(This lecture seems to be an accidental repeat of part of last lecture) This lecture also comes with a style sheet to copy and paste, to make the Cart page look better!

### Totaling Cart Items

To total the items in the cart, we can do two options:

```js
let totalPrice = 0;
for (let item of items) { totalPrice += item.quantity * item.product.price;
```

Or using the array.reduce() function:

```js
const totalPrice = items.reduce((prev, item) => {
  return prev + item.quantity * item.product.price;
}, 0);
```

### Removing Cart Items

We will wrap our Delete button in a form, and give it a hidden input with appropriate value and name to tell our server which product to remove:

```html
<form method="POST" action="/cart/products/delete">
  <input hidden value="${item.id}" name="itemId" />
  <button class="button is-danger">
    <span class="icon is-small">
      <i class="fas fa-times"></i>
    </span>
  </button>
</form>
```

### Redirect on Remove

We can handle our deletion request as follows:

```js
// Receive a POST request to delete an item from a cart
router.post('/cart/products/delete', async (req, res) => {
  const { itemId } = req.body;
  const cart = await cartsRepository.getOne(req.session.cartId);

  // Only keep items that DO NOT equal the ID of what we want to remove
  const items = cart.items.filter((item) => itemId !== item.id);

  await cartsRepository.update(req.session.cartId, { items });

  res.redirect('/cart');
});
```

#### `Originally Completed: 10/29/2021`

## Section 33: Building a Testing Framework From Scratch

#### `Originally Started: 5/25/2023`

### Test Framework Requirements

This section will be a culmination of a lot of JavaScript / Node concepts. In it, we will be creating our own testing framework!

Testing Framework Requirements:

- Must be a Node-based CLI framework
- Must be able to test browser-based JS apps(!!!)
- Must require very, very little setup
- Must be able to test a _whole_ application, not just one little widget
- CLI must have a 'watch mode' so we don't have to keep restarting it over and over
- CLI must automatically find and run all files in our project that have a name of '\*.test.js'

### Project Setup

Let's create a new directory to house our testing framework. Create a new folder called _tme_ (Test Me -- the name of our framework). CD into the directory, and generate a new package.json file via npm init -y.

Let's prioritize some features to start with! We know we want a Node-based CLI framework. So that means we need to be able to run our project from the command line from _any_ directory. To implement this, we'll need to introduce code to our entry point file (index.js), as well as our package.json file.

Inside index.js, add:

```js
#!/usr/bin/env node

console.log('Running test...');
```

Inside our package.json file, add:

```
"bin": {
  "tme": "./index.js"
}
```

Finally, inside of our project directory, run `npm link`. Now, from _any_ directory in the command line, we can run `tme`, which will execute the console command we have in our entry point file.

### Implementation Steps

There are four major steps to focus on for our testing framework:

1. File collection
   - Find all files ending in '\*.test.js' _recursively_ through a target folder, as well as any nested folders
   - Store a reference to each file we find
   - After getting a full list of the test files, execute them one by one
2. Test environment setup
3. Test file execution
   - Actually execute each test file, one by one
   - Watch for any errors that occur
4. Report results
   - Tabulate all the test results and report them to the user

Let's begin by creating a new file in our project directory, called runner.js. This file will be responsible for file collection code, some environment setup, and running the test files. Begin with some skeleton code for a class called Runner:

```js
class Runner {
  constructor() {
    this.files = [];
  }

  collectFiles() {}
}

module.exports = Runner;
```

### Walking a Directory Structure

We can view a directory structure as the data structure called a _tree_. Therefore, it is important to know how to iterate through a tree data structure. We can use the breadth-first search, or the depth-first search. Here, we will utilize a breadth-first algorithm.

**Breadth First Search**

In this search, we visit each node in the tree, starting from the root node. We then look at each file/folder inside of the root node, and add it onto an array. We then visit each of those array elements one by one, asking if that element has children of its own (if it's a folder). If it does, we push those children onto the array as well. We continue until we reach the end of the array.

Four our testing framework, we can then look at each of the elements that were pushed into the array and look for ones that end with '\*.test.js'. For this, we will make use of the `fs` Node module.

### Implementing Breadth First Search

We will modify the typical breadth first search algorithm to match our project's needs. Namely, rather than pushing every single child into the array and then determining if it has its own children, we will only push elements that are folders _or_ if the file ends with '\*.test.js'. After all, files will never have children, so pushing them into the array is unnecessary (unless they are a test file!).

Let's add some code to `collectFiles`:

```js
class Runner {
  constructor() {
    this.testFiles = [];
  }

  async collectFiles(targetPath) {
    const files = await fs.promises.readdir(targetPath);
  }
}
```

And also to index.js:

```js
const Runner = require('./runner');
const runner = new Runner();
const run = async () => {
  const results = await runner.collectFiles(process.cwd());
  console.log(results);
};
run();
```

Note we use `process.cwd()` to retrieve our current working directory (where we ran the tme command from). At this point, we have retrieved our initial children files/folders, and print them out to the console.

### Collecting Test Files

We will add logic to iterate over files/folders in our target directory, noting if they are a file or a folder, and pushing the ones with `\*.test.js` into our `testFiles` array.

```js
async collectFiles(targetPath) {
    const files = await fs.promises.readdir(targetPath);

    for (let file of files) {
      const filePath = path.join(targetPath, file);
      const stats = await fs.promises.lstat(filePath);

      if (stats.isFile() && file.includes('.test.js')) {
        this.testFiles.push({ name: filePath });
      } else if (stats.isDirectory()) {
        const childFiles = await fs.promises.readdir(filePath);
        files.push(...childFiles.map((f) => path.join(file, f)));
      }
    }
  }
```

Note: Stephen over-complicates this logic! Rather than implementing the logic for a breadth first search ourselves, we can add several useful options to `fs.promises.readdir()`:

```js
async collectFiles(targetPath) {
  const files = await fs.promises.readdir(targetPath, {
    withFileTypes: true,
    recursive: true,
  });

  this.testFiles =  [...files.filter((file) => file.isFile() && file.name.endsWith('test.js'))];
}
```

### Running Test Files

Now we have to think about how we are actually going to execute each of the test files we found in our search. For now, we will introduce the following method in our `Runner` class:

```js
  async runTests() {
    for (let file of this.testFiles) {
      require(file.name);
    }
  }
```

By calling `require(file.name)`, Node is going to find the file, load up all the code inside of it, and execute all the code inside.

We now successfully find test files and execute them; but we need to implement actual test framework logic!

### A Quick Test Harness

We will quickly create a sample project that will serve as a test case for our testing framework! Let's create a folder inside our tme directory called 'sampleproject'. In it, create an index.js file with the following:

```js
module.exports = {
  forEach(arr, fn) {
    for (let element of arr) {
      fn(element);
    }
  },
};
```

And a 'test' folder with a 'forEach.test.js' file with the following:

```js
const assert = require('assert');
const { forEach } = require('../index');

it('Should sum an array', () => {
  const numbers = [1, 2, 3];
  let total = 0;
  forEach(numbers, () => (value) => (total += value));

  assert.strictEqual(total, 6);
});
```

### Implementing 'beforeEach' and 'it'

(Rather confusing section!)

How can we let our test files aware that `it()` and `beforeEach()` exist? We can attach them to the `global` object, which all files will have access to. Add the following inside runner.js:

```js
  async runTests() {
    for (let file of this.testFiles) {
      // Stephen puts the logic for global.beforeEach and global.it here, but I believe it can be set up outside of the loop?
      const beforeEaches = [];
      global.beforeEach = (fn) => {
        beforeEaches.push(fn);
      };
      global.it = (description, fn) => {
        console.log(description);
        beforeEaches.forEach((func) => func());
        fn();
      };
      require(file.name);
    }
  }
```

And also update forEach.test.js with the following:

```js
const assert = require('assert');
const { forEach } = require('../index');

let numbers;

// Define one (of possibly many) beforeEach function
beforeEach(() => {
  numbers = [1, 2, 3];
});

it('Should sum an array', () => {
  let total = 0;
  numbers = [1, 2, 3];
  forEach(numbers, (value) => (total += value));

  assert.strictEqual(total, 6);
  numbers.push(4, 5, 6);
});

// If our beforeEach function is working properly, this test should pass. If not, the elements we pushed to the numbers array in the above test persisted, so this test will fail.
it('beforeEach is ran each time', () => {
  assert.strictEqual(numbers.length, 3);
});
```

### Adding Basic Reporting

As it stands, any time any function passed into `it()` fails, our entire test program fails entirely, and stops executing. We need to ensure we handle any individual errors that occur when our tests are run (which will be happening frequently!). We need to wrap our function call in a `try-catch`:

```js
global.it = (description, fn) => {
  beforeEaches.forEach((func) => func());
  try {
    fn();
    console.log(`OK - ${description}`);
  } catch (err) {
    console.log(`X - ${description}`);
    console.log('\t', err.message);
  }
};
```

There may also be an error in one of the files we are requiring, so we wrap that in a `try-catch` as well:

```js
try {
  require(file.name);
} catch (err) {
  console.log('X - Error Loading File', file.name);
  console.log(err);
}
```

With that, we now have rudimentary reporting for our tests. Next, we will make it more presentable!

### Adding Colors

To make our console.log outputs easier to read and interpret, we can add some better formatting and color coding.

Let's use the `chalk` library (again).

```
npm install chalk
```

In our `console.log` calls, we can now wrap our input with calls to various `chalk` methods. Specifically, we want the ones that introduce color to the output, such as `chalk.green(str)` and `chalk.red(str)`.

### Better Formatting

In this section, we introduce some simple formatting to our report output. Namely, we give some tabs every time we report the status of a test. We also make use of a regular expression to replace every newline with a newline followed by two tabs.

Along with the coloring via the chalk library, our reports done through console.log in the `runTests` method in the `runner` class now looks as follows:

```js
async runTests() {
    for (let file of this.testFiles) {
      console.log(chalk.gray(`---- ${file.displayName}`));
      const beforeEaches = [];
      global.beforeEach = (fn) => {
        beforeEaches.push(fn);
      };
      global.it = (description, fn) => {
        beforeEaches.forEach((func) => func());
        try {
          fn();
          console.log(chalk.green(`\tOK - ${description}`));
        } catch (err) {
          const message = err.message.replace(/\n/g, '\n\t\t');
          console.log(chalk.red(`\tX - ${description}`));
          console.log(chalk.red('\t', message));
        }
      };

      try {
        require(file.name);
      } catch (err) {
        console.log('X - Error Loading File', file.name);
        console.log(err);
      }
    }
  }
```

### Ignoring Directories

As it stands, our testing framework has a big issue when loading files: It looks at files in the `node_modules` directory! In many cases, files ending with '.test.js' will be found, and we attempt to run them. These files were not made with our testing library in mind, and will clearly cause errors. And, in general, we tend not to watch to run the tests of our dependencies -- that is up to the node modules themselves to do.

We need to ignore this directory in our algorithm!
