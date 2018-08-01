const Discord = require ("discord.js");

function userinfo (message, bot, prefix) {
    if (message.content.startsWith(prefix + "userinfo")) {

              var user = message.mentions.users.first() ? message.mentions.users.first() : message.author;
              var member = message.guild.member(user);
              var mentionned = message.mentions.users.first();
              var getvalueof;

              var userCreateDate = user.createdAt.toString().split(" ");
              var userJoinDate = member.joinedAt.toString().split(" ");

              var game = !!user.presence && user.presence !== null && user.presence.game !== null && user.presence.game.name !== null ? user.presence.game.name : "Nothing";
              
              if (mentionned) {
                var getvalueof = mentionned;
              } else {
                var getvalueof = message.author;
              }
              if (getvalueof.presence.status == 'online') {
                var stat = `En ligne`;
              } else if (getvalueof.presence.status == "offline") {
                var stat = `Hors-Ligne`;
              } else if (getvalueof.presence.status == "idle") {
                var stat = `Inactif`;
              } else if (getvalueof.presence.status == "dnd") {
                var stat = `Ne pas déranger`;
              }

              var embed = new Discord.RichEmbed()
                .setAuthor(user.username + user.discriminator + " | " + user.id, user.avatarURL)
                .setThumbnail(user.avatarURL)
                .addField(` Statut`, stat, true)
                .addField(` Joue à`, "``" + game + "``", true)
                .addField(` Account created on`, "``" + userCreateDate[1] + " " + userCreateDate[2] + ", " + userCreateDate[3] + "``", true)
                .addField(` You join on`, "``" + userJoinDate[1] + " " + userJoinDate[2] + ", " + userJoinDate[3] + "``", true)
                .addField(` Roles`, message.guild.members
                    .get(getvalueof.id)
                    .roles.array()
                    .map(g => "" + g.name + "")
                    .join(" ❱ "))
                .setTimestamp()
                .setColor("#f7f7f7")
                .setFooter("© StormFall", bot.user.avatarURL);
              message.channel.send(embed);
}
}
module.exports = userinfo;