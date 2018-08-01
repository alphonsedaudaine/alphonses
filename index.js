const Discord = require('discord.js');

const bot = new Discord.Client();
const prefix = "k-";

bot.on("ready", () => {
    console.log(`${bot.user.username} démarre...`);
    console.log(`${bot.users.size} users m'utilisent`); 

    bot.user.setStatus("online"); 
    bot.user.setActivity(prefix + "help");
});

bot.on("message", message => {

    const help = require ("./commands/help");
    help(message, bot, prefix);
    const botinfo = require ("./commands/botinfo");
    botinfo(message, bot, prefix);
    const userinfo = require ("./commands/userinfo");
    userinfo(message, bot, prefix);

});

bot.on("message", message => {
    if(!message.author.id == "203438864730161153") return;
if (message.content.startsWith(prefix + "reaction-roles")) {

  (async function () {

    var embed1 = new Discord.RichEmbed()
      .setAuthor("Choisis ton rôle ^^")
      .setColor("#f7f7f7")
      .setDescription("Visiteur ● \:bust_in_silhouette:");
    const mainMessage = await message.channel.send(embed1);

    await mainMessage.react("👤");

    const panier = mainMessage.createReactionCollector((reaction, user) => user.id === message.author.id);

    panier.on('collect', async (reaction) => {
      if (reaction.emoji.name === "👤") {
        var role = message.guild.roles.find("id", "472023693917159424");
        message.member.addRole(role)
      }

      await reaction.remove(message.author.id);

    });
  }());
}
});

const Util = require('discord.js');
const { GOOGLE_API_KEY } = (`${process.env.GGAPIKEY}`);
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

const youtube = new YouTube(GOOGLE_API_KEY);

const queue = new Map();

bot.on('message', async msg => {
	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(prefix)) return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(prefix.length)

	if (command === 'play') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('Vous devez être dans un salon vocal !');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send('Je ne peux pas me connecter, êtes vous sûr que j\'ai les permissions nécessaires ?');
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send('Je ne peux pas parler, faites en sorte que je puisse !');
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id);
				await handleVideo(video2, msg, voiceChannel, true);
			}
			return msg.channel.send(`✅ Playlist: **${playlist.title}** a été ajoutée à la queue!`);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					msg.channel.send(`
__**Selection de la Musique:**__
${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}
Choisissez votre musique en mettant le numéro qui y correspond, allant de 1-10.
					`);

					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('Aucune musique choisie, arrêt de la selection.');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send('🆘 Je n\'ai pas pu avoir de résultat pour cette recherche.');
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}
	} else if (command === 'skip') {
		if (!msg.member.voiceChannel) return msg.channel.send('Tu n\'es pas dans un salon vocal!');
		if (!serverQueue) return msg.channel.send('Il n\'y a rien à skip.');
		serverQueue.connection.dispatcher.end('Skip command has been used!');
		return undefined;
	} else if (command === 'stop') {
		if (!msg.member.voiceChannel) return msg.channel.send('Tu n\'es pas dans un salon vocal!');
		if (!serverQueue) return msg.channel.send('Il n\'y a rien à stoper par ici.');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Stop command has been used!');
		return undefined;
	} else if (command === 'volume') {
		if (!msg.member.voiceChannel) return msg.channel.send('Tu n\'es pas dans un salon vocal!');
		if (!serverQueue) return msg.channel.send('Aucune musique en cour.');
        if (!args[1]) return msg.channel.send(`Le volume est à : **${serverQueue.volume}**`);
        if (args[1] > 10) return msg.channel.send('Le volume doit être entre 1 et 10.')
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
		return msg.channel.send(`J'ai mit le volume à : **${args[1]}**`);
	} else if (command === 'np') {
		if (!serverQueue) return msg.channel.send('Aucune musique en cour.');
		return msg.channel.send(`🎶 Musique en cour : **${serverQueue.songs[0].title}**`);
	} else if (command === 'queue') {
		if (!serverQueue) return msg.channel.send('Aucune musique en cour.');
		return msg.channel.send(`
__**La file d'attente:**__
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
**Musique en cour :** ${serverQueue.songs[0].title}
		`);
	} else if (command === 'pause') {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('⏸ J\'ai mis en pause la musique pour vous!');
		}
		return msg.channel.send('Aucune musique en cour.');
	} else if (command === 'resume') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.send('▶ J\'ai résumé la musique pour vous!');
		}
		return msg.channel.send('Aucune musique en cour.');
	}

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`Je n'ai pas pu rejoindre le salon : ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`✅ **${song.title}** a été ajouté à la queue!`);
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`🎶 Musique en cour : **${song.title}**`);
}


bot.on("warn", console.warn);

bot.on("error", console.error);

bot.on("disconnect", () => console.log("I just disconnected, making sure you know, I will reconnect now..."));

bot.on("reconnecting", () => console.log("I am reconnecting now!"));

process.on("unhandledRejection", err => { console.error("Uncaught Promise Error: \n" + err.stack); });


bot.login(process.env.TOKEN); 
