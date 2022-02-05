module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'Users',
    [
      {
        name: 'Jane Doe',
        password: '123456789',
        role:"regular",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Jon Doe',
        password: '123456789',
        role:"manager",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Jack Doe',
        password: '123456789',
        role:"admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {}),
};

// database/seeds/xxxx-User.js
