module.exports = function(sequelize) {
	const path = "../Models/";

	require(path + "Language.js")(sequelize);
	require(path + "User.js")(sequelize);
	require(path + "LanguageReputation.js")(sequelize);
	require(path + "ReputationMessage.js")(sequelize);
}