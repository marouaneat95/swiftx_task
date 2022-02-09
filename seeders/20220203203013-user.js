const bcrypt = require('bcrypt');
 
 // User Controllers
  const encryptPassword = async (password) => {
   
    const salt = await bcrypt.genSalt(10)
    let returnValue = await bcrypt.hash(password, salt) 
    return returnValue
};
  

module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'users',
    [
      {
        username: 'Jane Doe',
        password: await encryptPassword("123456789"),
        role:"regular",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'Jon Doe',
        password: await encryptPassword("123456789"),
        role:"manager",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'Jack Doe',
        password: await encryptPassword("123456789"),
        role:"admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('users', null, {}),
};

// database/seeds/xxxx-User.js
