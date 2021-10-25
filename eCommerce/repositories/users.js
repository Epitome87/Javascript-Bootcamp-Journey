const { create } = require('domain');
const fs = require('fs');
const { report } = require('process');
const crypto = require('crypto');
const util = require('util');

// Create a version of the crypto.scrypt function that returns a Promise
const scrypt = util.promisify(crypto.scrypt);

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

  // We assume attributes is an object with at least email and password
  async create(attributes) {
    // Give this record a random ID
    attributes.id = this.randomId();

    // Generate a random salt
    const salt = crypto.randomBytes(8).toString('hex');
    const buffer = await scrypt(attributes.password, salt, 64);

    const records = await this.getAll();

    // Push this new record, but change its password to be the hashed version
    const record = {
      ...attributes,
      password: `${buffer.toString('hex')}.${salt}`,
    };
    records.push(record);

    // Write the updated "records" array back to this.filename
    await this.writeAll(records);

    return record;
  }

  async comparePasswords(savedPassword, suppliedPassword) {
    // savedPassw=rd -> password saved in our database: "hashed.salt"
    // suppliedPassword -> password given to us by a user trying to sign in

    const [hashed, salt] = savedPassword.split('.');
    const hashedSuppliedBuffer = await scrypt(suppliedPassword, salt, 64);

    return hashed === hashedSuppliedBuffer.toString('hex');
  }

  async writeAll(records) {
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2)
    );
  }

  async getOne(id) {
    // Retrieve all records
    const records = await this.getAll();

    // Return the first record where its id is the target id.
    return records.find((record) => record.id === id);
  }

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

  async update(id, attributes) {
    // Retrieve all records
    const records = await this.getAll();

    // Return the first record where its id is the target id
    const recordToUpdate = records.find((record) => record.id === id);

    if (!recordToUpdate) {
      throw new Error(`Record with id ${id} was not found`);
    }

    // for (let property in attributes) {
    //   recordToUpdate[property] = attributes[property];
    // }

    // Simpler way to do the above: Takes all the props and key/value pairs in attributes
    // and copies them one by one onto the recordToUpdate object
    Object.assign(recordToUpdate, attributes);

    // Write the records (now with the record with target ID updated) back to file
    await this.writeAll(records);
  }

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

      // If we reach here and "found" is still true, we must have found a match!
      if (found) return record;
    }
  }
}

module.exports = new UsersRepository('users.json');
