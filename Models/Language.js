const Sequelize = require("sequelize");

module.exports = function(sequelize) {
	const Language = sequelize.define("Language", {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			unique: true,
		},
		name: {
			type: Sequelize.STRING,
			unique: true,
		},
	});
}