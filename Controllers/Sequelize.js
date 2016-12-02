module.exports = function() {
	const Sequelize = require("sequelize");

	var sequelize = new Sequelize("database", "username", "password", {
		host: "localhost",
		dialect: "sqlite",
		storage: "database.db",
		pool: {
			max: 5,
			min: 0,
			idle: 10000
		},
		define: {
			timestamps: false
		},
		logging: false,
	});

	require("./Model.js")(sequelize);

	sequelize.sync().then(function() {
		sequelize.authenticate().then(function() {
			console.log("Database running.");
		}).catch(function(error) {
			console.log("Error connecting to database:");
			console.log(err);
		});
	});

	return sequelize;
}