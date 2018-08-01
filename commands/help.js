const Discord = require('discord.js');

function help(message, bot, prefix) {
    if (message.content === prefix + "help"){
        var embed = new Discord.RichEmbed()
          .setAuthor("Help")
          .setColor("#f7f7f7")
          .addField("🎵 Musique", "play, skip, stop, volume, np, queue, pause, resume")
          .addField("🔗 Utilitaire", "bot, help, userinfo")
          .addField("Owner", "reaction-roles")
          .setFooter("Kayzo'Bot by StormFall", bot.user.avatarURL);
        message.channel.send(embed);
    }
    
}

module.exports = help;