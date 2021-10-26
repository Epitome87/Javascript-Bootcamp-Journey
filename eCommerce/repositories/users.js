const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

// Create a version of the crypto.scrypt function that returns a Promise
const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
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
}

// Export an instance of Usersrepository
module.exports = new UsersRepository('users.json');
