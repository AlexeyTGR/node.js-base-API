'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'email',{
      type: Sequelize.STRING,
      unique: true
    });
    await queryInterface.changeColumn('Users', 'dateOfBirth',{
      type: Sequelize.DATE,
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users')
  }
};
