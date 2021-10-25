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

```
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

The request was handed off to our OS, in charge of accessing some network devices, and sending the reqeust out over the open internet.
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

```
res.send(<p>Hello!</p>)
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

```
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

```
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

app.post('/', bodyParser, (req, res) => {
});
```

### Globally Applying Middleware

Our ipplementation of body parsing isn't ideal: It only handles POST requests so far, while many other request types contain body elements. We can replace it with an outside library: `npm install body-parser` to install, and then use it like:

```
app.post('/', bodyParser.urlencoded({ extended: true }), (req, res) => {
```

However, we still have to write out the middleware call every place we want it (as an argument of a route). There's a better solution! We can use the Middeleware globally:

`app.use(bodyParser.urlencoded({extended: true}));`

Now every route will have its body parsed automatically. The body-parser library automatically detects what type of request we are working with and not apply it with a "GET" request.

#### `Originally Completed: 10/23/2021`

## Section 27: Design a Custom Database

#### `Originally Started: 10/23/2021`

### Data Storage

We need some persistent data store in order to preserve customer account information. By persistent, we need a solution that retains the data no matter how many times are server restarts! So we cannot simply store it inside of our computer's memory during program execution. Our express server needs to interface with a data store, which stores a list of users and products. The data store itself is going to store all of its data to our hard drive, in the form of json (products.json and users.json). Note, this will not be suitable for production use -- it is not an ideal solution! It's good for learning purposes, but not something you should use for real software.

The downsides of our solution are:

- Will error if we try to open/write to the same file twice at the same time
- Won't work if we have multiple servers running on differnet machines
- We have to write to the File System every time we want to udpate some data => Bad performance!

Why waste our time with this then? Good Javascript experience, practice with code re-use using classes and inheritance.

### Different Data Modeling Approaches

We will have a "Users Repository" and "Products Repository" to store our data. Here is a list of methods we may want to have for the Users Respository:

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

```
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

We can shortern our `getAll()` method to:

```
  return JSON.parse(
    await fs.promises.readFile(this.filename, {
      encoding: 'utf8',
    })
  );
```

### Saving Records

```
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

```
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

```
// Using JSon.stringify(records);
[ { "email": "test@test.com", "password": "password" },{"email": "test1@test.com","password": "password"} ]
```

```
// Using JSON.stringify(records, null, 2);
[
  {
    "email": "test@test.com",
    "password": "password"
  },
  {
    "email": "test1@test.com",
    "password": "password"
  }
]
```

### Random ID Generation

We need to assign unique IDs to each of our users, as to differentiate them. This is especially important in other types of records (like products), where it is entirely possible that two products have the same "name" property. We need a way to know which is which. This is where our `randomId()` function comes in!

We will make use of Node's "Crypto" (Crytography) module. This module has tons of functions related for handling and ciphering and encrypting and decrypting data. We can make use of the `crypto.randomBytes()` method.

```
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

```
async getOne(id) {
  // Retrieve all records
  const records = await this.getAll();

  // Return the first record where its id is the target id.
  return records.find((record) => record.id === id);
}
```

### Deleting Records

```
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

```
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

```
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

```
module.exports = UsersRepository;

// In another file...
const UsersRepository = require("./users");
const repo = new UsersRepository("users.json");
repo.getAll();
```

But this doesn't seem very ideal. What if another file also requires UsersRepository, much like in the above code? And what if they typo the filename to "user.json" instead of "users.json". We now have two separate JSON files, and thus we are accidentally working with two data sets. This could be a challenging bug to track down.

Instead, let's export an _instance_ of the class:

```
module.exports = new UsersRepository('users.json');

// Another file...
const repo = require(".users");
repo.getAll();
```

However, note that this only works in our situation since we only ever really ever need one copy of UsersRepository. Since we hard-code the json filename in the file before exporting, this is not very flexible for re-use.

### Signup Validation Logic

Our signup logic (we move to next step if no error):

1. Did another user already sign up with this email? -> Yes -> Show an error
2. Are the password and password confirmation different? -> Yes -> Show an error
3. Create an account for this user

With this in mind, our new "POST" request looks like:

```
app.post('/', async (req, res) => {
  const { email, password, passwordConfirmation } = req.body;

  const existingUser = await usersRepo.getOneBy({ email });
  if (existingUser)
    return res.send('Email already in use');

  if (password !== passwordConfirmation)
    return res.send('Passwords do not match');

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

```
app.use(
  cookieSession({
    keys: ['euab74n39bnopqldkew83blaejyvctq7adjlke3'],
  })
);
```

Note the keys property: It is used to encrypt all the information that is stored in the Cookie. This will help prevent the user from modifying the cookie to pretend they are somewhere they are not.

The cookie-session library adds exactly one property to our Express app, on the request object: `req.session`. It is a plain Javascript object, and we can add as many properties as we wish to the session object. Any information we throw in there will automatically be mantained by cookie-session for us.

Now we can do:

```
// Store the id of that user inside the user's cookie req.session.userId = user.id;
```

### Signing Out a User

To sign out, we simply indicate we wish to forget our current Session object.

```
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

```
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

We need to use a hashing algorithm. The goal of a hash algorithm is to take a string and spit out a seemingly-random series of numbers and letters. Hash algorithms have a very important property: The same input string always provides the same output. SHA256 is the name of one popular hashing algorithm. Hashing algorithms do not work in reverse. Changing even just one input character changes the hash output significantally.

What we store in our database is the hashed version of the user's password. When he signs up and signs in, we run their input password through our hashing algorithm. We check to see if the hash version matches the hash that was previously saved to the database (as the user's hashed password).

However, there's still one security hole with this method...

### Salting Passwords

The security hole with hash algorithms has to do with taking advantage of known common passwords. This leads to a "Rainbow Table Attack".
A malicious user can find a list of common passwords and build up a look-up table of their corresponding hash values. For example, they'll know common password "monkey" has a SHA256 hash of "000c285457fc9". Now, if a malicious user gains access to our users.json file, they'll see all the hash values, and compare them to their tables. If they find "000c285457fc9" in our data store, they know that non-hashed password is "monkey"! They can now sign into their account. This type of attack is not as succesful if your password is truly complex and unique.

To prevent this, we add an additional random string of characters to every password we hash, called a "Salt". This "Salt" is different for every user. The "Salt" is appended to the un-hashed password, and that combined input is ran through the hashing algorithm.

To achieve this, we store the following in our Users database, in place of their direct password: "<HashedPassword+RandomSalt.RandomSalt>"
Later, when the user signs in using their password, we retrieve the "RandomSalt" portion of their stored password, append that to the password they just input, run it through the hashing algorithm, and see if it matches the "HashedPassword+RandomSalt" portion of the stored password.

### Salting + Hashing Passwords

The Node.JS standard library's "Crypto" module will help us achieve our salting and hashing.

`crypto.randomBytes()` to generate our random Salt

`crypto.scrypt(password, salt, keylength[,options],callback)` (named after a specific password hashing algorithm) to hash our password.

```
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

```
 async comparePasswords(savedPassword, suppliedPassword) {
// savedPassw=rd -> password saved in our database: "hashed.salt"
// suppliedPassword -> password given to us by a user trying to sign in
const [hashed, salt] = savedPassword.split('.');
const hashedSupplied = await scrypt(suppliedPassword, salt, 64);
return hashed === hashedSupplied;
  }
```

### Testing the Full Flow

In our "GET" route for the "signin" route, we update our password check with the following:

```
/*No Longer Use This!*/ // if (user.password !== password) {
const isValidPassword = await usersRepo.comparePasswords(
  user.password,
  password
);
if (!isValidPassword) return res.send('Invalid password');
```

And that's basic user authentication, using basically only cookie-session!

In the next section, we will refactor the code and better structure the project. We will then have a good solid starting point for any app in the future we want to create that requires authentication.

#### `Originally Started: 10/24/2021`
