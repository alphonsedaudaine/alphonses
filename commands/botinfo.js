const Discord = require('discord.js');

function botinfo(message, bot, prefix) {
    if (message.content === prefix + "bot"){
        var embed = new Discord.RichEmbed()
            .setAuthor("Kayzo", bot.user.avatarURL)
            .setThumbnail(bot.user.avatarURL)
            .setColor("#f7f7f7")
            .setTimestamp()
            .setFooter("© StormFall", bot.user.avatarURL)
            .addField(`Créateur`, "``StormFall ♡ ×#7114``", true)
            .addField(`Users`, "J'aide ``" + bot.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString() + "`` utilisateurs", true)
            .addField(`Channels`, "Je surveille ``" + bot.channels.size.toLocaleString() + "``\nchannels", true)
            .addField(`Emojis`, "J'utilise ``" + bot.emojis.size.toLocaleString() + "`` émojis", true)
            .addField(` Version`, "``0.0.1``", true)
            .addField(`Developped in`, "``JavaScript``", true)
            .addField(`Discord.js version`, "11.3.2", true)
            .addField(`Node.js Version`, "``" + process.version + "``", true)
            .addField(`Ping`, "``" + `${bot.ping} ms` + "``", true)
            .addField(`Uptime`, "``" + Math.round(bot.uptime / (1000 * 60 * 60)) + " heures, " + (Math.round(bot.uptime / (1000 * 60)) % 60) + " minutes, et " + (Math.round(bot.uptime / 1000) % 60) + " secondes" + "``", true);
        message.channel.send(embed);
    }
    
}

module.exports = botinfo;