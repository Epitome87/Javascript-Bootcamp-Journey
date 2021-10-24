const fs = require('fs');
const { report } = require('process');

class UsersRepository {
  constructor(filename) {
    if (!filename) {
      throw new Error('Creating a repository requires a filename');
    }

    // Save the filename to an instance variable
    this.filename = filename;

    // Check to see if this file exists
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      // File doesn't exist; let's create it!
      fs.writeFileSync(filename, '[]');
    }
  }

  async getAll() {
    // // Open the file called this.filename
    // const contents = await fs.promises.readFile(this.filename, {
    //   encoding: 'utf8',
    // });

    // // Read its contents
    // console.log(contents);

    // // Parse the contents from JSON into a Javascript object (an array of objects in our case)
    // const data = JSON.parse(contents);

    // // Return the parsed data
    // return data;

    // Refactoring of the above code: Much shorter!
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: 'utf8',
      })
    );
  }
}

async function test() {
  const userRepo = new UsersRepository('users.json');
  const users = await userRepo.getAll();
  console.log(users);
}

test();
