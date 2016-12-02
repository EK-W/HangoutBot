const Sequelize = require("sequelize");

module.exports = function(sequelize) {
	const LanguageReputation = sequelize.define("LanguageReputation", {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			unique: true,
		},
		
		value: Sequelize.INTEGER,
	});

	const Language = sequelize.models.Language;
	const User = sequelize.models.User;

	Language.belongsToMany(User, {
		through: LanguageReputation,
		foreignKey: "languageId",
	});

	User.belongsToMany(Language, {
		through: LanguageReputation,
		foreignKey: "userId",
	});
}