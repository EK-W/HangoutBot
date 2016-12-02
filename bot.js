const discordio = require("discord.io");
const bot = new discordio.Client({
	token: "MjU0MDQ0MDAwODc5NjQwNTc2.CyJUbw.0aEsP28q2km1Lk2DfwvH__VmT80",
	autorun: true,
});

const sequelize = require("./Controllers/Sequelize.js")();

var core = {
	bot,
	sequelize,
}

const prefix = "+";

var commands = {}

bot.on("ready", function() {
	console.log("ready!");
});

bot.on("message", function(username, userID, channelID, messageText, event) {
	const message = event.d;
	const user = bot.users[userID];
	const channel = bot.channels[channelID];
	const server = bot.channels[channel.guild_id];

	if(message.content.charAt(0) !== prefix) return;
	if(user.bot) return;

	var args = message.content.substring(1).split(" ");
	const commandName = args[0];
	const command = commands[commandName.toLowerCase()];

	args.splice(0, 1);

	if(!command) return; // No error message, as per https://github.com/meew0/discord-bot-best-practices

	command(message, args, user, channel, server);
});

bot.on("any", function(event) {
	switch(event.t) {
		case "MESSAGE_REACTION_ADD":
			onReactionAdd(event);
			break;
	}
});

commands.goodanswer = function(message, args, user, channel, server) {
	const User = sequelize.models.User;
	const Language = sequelize.models.Language;
	const LanguageReputation = sequelize.models.LanguageReputation;
	const ReputationMessage = sequelize.models.ReputationMessage;

	const target = message.mentions[0];

	if(!target) {
		bot.sendMessage({
			to: channel.id,
			message: "Format: `+rep @user <language>`",
		});
	}

	const language = args[1];

	if(language.startsWith("<")) {
		bot.sendMessage({
			to: channel.id,
			message: "Language name may not be a mention or otherwise start with `<`",
		});
	}

	sequelize.transaction(function(transaction) {
		return User.findOrCreate({
			where: {
				id: target.id,
			},
			defaults: {
				name: target.username,
			},
			transaction,
			attributes: ["id"],
		}).spread(function(userInstance, userCreated) {
			return Language.findOrCreate({
				where: {
					name: language.toLowerCase(),
				},
				transaction,
				attributes: [ "id", "name" ],
			}).spread(function(languageInstance, languageCreated) {
				return LanguageReputation.findOrCreate({
					where: {
						userId: userInstance.id,
						languageId: languageInstance.id,
					},
					defaults: {
						value: 1,
					},
					attributes: [
						"id",
						"value"
					],
					transaction,
				}).spread(function(reputationInstance, reputationCreated) {
					if(!reputationCreated) {
						reputationInstance.increment("value");
					}

					const value = reputationInstance.get("value");
					const lang = languageInstance.get("name");

					bot.sendMessage({
						to: channel.id,
						message: `Good answer, <@${target.id}> ! your reputation with ${lang} is now \`${value}\`\n`
							+ `to upvote ${target.username}'s answer, click the check mark below!`,
					}, function(error, repMessage) {
						bot.addReaction({
							channelID: channel.id,
							messageID: repMessage.id,
							reaction: "✅"
						}, function(error) {
							ReputationMessage.create({
								id: repMessage.id,
								languageReputationId: reputationInstance.id,
							});
						});
					});
				});
			});
		});
	});
}

function onReactionAdd(event) {
	const user = bot.users[event.d.user_id];

	if(user.id === bot.id) return;

	const messageID = event.d.message_id;
	const channelID = event.d.channel_id;

	const ReputationMessage = sequelize.models.ReputationMessage;
	const LanguageReputation = sequelize.models.LanguageReputation;

	ReputationMessage.findById(messageID).then(function(messageInstance) {
		if(messageInstance) {
			bot.getMessage({
				channelID,
				messageID,
			}, function(error, message) {
				LanguageReputation.findById(messageInstance.languageReputationId).then(function(reputationInstance) {
					reputationInstance.increment("value");

					const newMessage = message.content.replace(/`([0-9]+)`/, function(match, p1) {
						return `\`${reputationInstance.get("value")}\``;
					});

					bot.editMessage({
						channelID,
						messageID,
						message: newMessage,
					});
				});
			});
		}
	});
}

commands.rep = function(message, args, _user, channel, server) {
	bot.deleteMessage({
		channelID: channel.id,
		messageID: message.id,
	}, function(error) {
		console.log(error);
	});

	const User = sequelize.models.User;
	const Language = sequelize.models.Language;
	const LanguageReputation = sequelize.models.LanguageReputation;

	LanguageReputation.findById(args[0]).then(function(reputation) {
		if(!reputation) {
			bot.sendMessage({
				to: channel.id,
				message: `\`${args[0]}\` is an invalid reputation ID`,
			});

			return;
		}

		reputation.increment("value");

		User.findById(reputation.get("userId")).then(function(user) {
			Language.findById(reputation.get("languageId")).then(function(language) {
				const name = user.get("name");
				const langName = language.get("name");
				const repValue = reputation.get("value");

				bot.sendMessage({
					to: channel.id,
					message: `${name}'s reputation in ${langName} is now \`${repValue}\``,
				});
			});
		});
	});
}