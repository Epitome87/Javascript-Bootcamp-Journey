#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk'); // Npm module for terminal styling

// Option #2B: Promise-Based callback solution
// const util = require('util'); // For Option #2B. Part of Node Standard Library
// const lstat = util.promisify(fs.lstat);

// Option 3C: Use the Promise-based version of lstat
const lstat = fs.promises.lstat;

// Set the directory we want to examine as the 3rd argument in the process variable, if it exists.
// Otherwise, just use the current working directory.
const targetDirectory = process.argv[2] || process.cwd();

// A "." means look at the files in the current working directory. This is the directory where Node was called from -- not necessarily
// just the directory this script is in. (Seems that "./" is producing same reuslts???)
fs.readdir(targetDirectory, async (err, filenames) => {
  // err === an error object, meaning something went wrong
  // err === null, which means everything is OK! :)
  if (err) {
    // Error-handling code here
    console.log(err);
  }

  // console.log(filenames);

  // Solution 3: Optimal Solution!
  const statPromises = filenames.map((filename) => {
    return lstat(path.join(targetDirectory, filename));
  });

  const allStats = await Promise.all(statPromises);

  for (let stats of allStats) {
    const index = allStats.indexOf(stats);
    if (stats.isFile()) {
      console.log(chalk.green(filenames[index]));
    } else {
      console.log(chalk.blue.bold(filenames[index]));
    }
  }

  // Option 3C
  // for (let filename of filenames) {
  //   try {
  //     const stats = await lstat(filename);
  //     console.log(filename, stats.isFile());
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  //   BAD CODE HERE! Sloppy first implementation
  //   filenames.forEach((filename) => {
  //     fs.lstat(filename, (err, stats) => {
  //       if (err) {
  //         console.log(err);
  //       }

  //       console.log(filename, stats.isFile());
  //     });
  // });
  //   BAD CODE COMPLETE

  // Option #1: Callback-Based solution
  // const allStats = Array(filenames.length).fill(null);

  // filenames.forEach((filename, index) => {
  //   fs.lstat(filename, (err, stats) => {
  //     if (err) {
  //       console.log(err);
  //     }

  //     allStats[index] = stats;

  //     //  If stats is ever still null, allStats.every returns false
  //     const ready = allStats.every((stats) => {
  //       return stats;
  //     });

  //     if (ready) {
  //       allStats.forEach((stats, index) => {
  //         console.log(filenames[index], stats.isFile());
  //       });
  //     }
  //   });
});

// Option #2A: Promise-Based callback solution
// const lstat = (filename) => {
//   return new Promise((resolve, reject) => {
//     fs.lstat(filename, (err, stats) => {
//       if (err) {
//         // Reject Promise
//         reject(err);
//       }
//       // Resolve Promise
//       resolve(stats);
//     });
//   });
// };
