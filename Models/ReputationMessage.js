const Sequelize = require("sequelize");

module.exports = function(sequelize) {
	const ReputationMessage = sequelize.define("ReputationMessage", {
		id: {
			type: Sequelize.STRING,
			primaryKey: true,
			unique: true,
		},
	});

	const LanguageReputation = sequelize.models.LanguageReputation;

	ReputationMessage.belongsTo(LanguageReputation, {
		foreignKey: "languageReputationId",
	});

	//LanguageReputation.hasMany(ReputationMessage);
}