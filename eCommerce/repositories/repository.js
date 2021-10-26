const fs = require('fs');
const crypto = require('crypto');

module.exports = class Repository {
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

  async create(attributes) {
    attributes.id = this.randomId();

    const records = await this.getAll();
    records.push(attributes);
    await this.writeAll(records);

    return attributes;
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
};
