const Sequelize = require("sequelize");

module.exports = function(sequelize) {
	const User = sequelize.define("User", {
		id: {
			type: Sequelize.STRING,
			primaryKey: true,
			unique: true,
		},
		name: Sequelize.STRING,
	});
}