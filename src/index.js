const Discord = require('discord.js');
const fs = require('fs');

const data = require('./data');

let client = new Discord.Client();

// hardcoded for now, sorry
const channelWhitelist = [
	'674721447968636978'
];

let messagesData = data.loadData();
let queueAppend = {};

function looseMatch(str, str2) {
	str = str.split('.').join('');
	str = str.split(',').join('');
	str = str.split('!').join('');
	str = str.split('?').join('');
	str = str.split(';').join('');
	str = str.split(':').join('');

	str2 = str2.split('.').join('');
	str2 = str2.split(',').join('');
	str2 = str2.split('!').join('');
	str2 = str2.split('?').join('');
	str2 = str2.split(';').join('');
	str2 = str2.split(':').join('');

	return str.toLowerCase() === str2.toLowerCase();
}

function predictWords(word) {
	let predictions = [];

	messagesData.split('\n')
		.forEach(contents => {
			contents.split(' ')
				.forEach((v, i, a) => {
					if (looseMatch(v, word)) {
						let prediction = '';
						
						for (let wordIndex = 1; wordIndex < 5; wordIndex++) {
							if (a[i + wordIndex]) {
								prediction += ' ' + a[i + wordIndex];
							} else {
								break;
							}
						}

						if (prediction !== '') predictions.push(prediction);
					}
				});
		});
	
	return predictions.sort((a, b) => b.length - a.length);
}

client.on('message', msg => {
	if (msg.author.id === client.user.id) return;

	let content = msg.cleanContent;
	let messageWords = content.split(' ');

	// save the content
	if (content !== '' && content.split(' ').length > 1) {
		if (!queueAppend[msg.channel.id]) queueAppend[msg.channel.id] = '';
		queueAppend[msg.channel.id] += '\n' + content;
		messagesData += '\n' + content;
	}

	if (!channelWhitelist.includes(msg.channel.id)) return;

	// start composing the message
	let finalMessage = '';

	// predict the first few possible words after the message
	let startList = predictWords(messageWords[messageWords.length - 1]);
	// if it cant predict them, then dont try
	if (startList.length === 0) return;

	// the first words to use in the message, randomly selected
	finalMessage += startList[Math.floor(Math.random() * startList.length)];

	// then keep chaining predictions for up to 25 times
	for (let i = 0; i < (5 + Math.ceil(Math.random() * 20)); i++) {
		let predictions = predictWords(finalMessage.split(' ')[finalMessage.split(' ').length - 1]);

		if (predictions.length > 0) {
			finalMessage += predictions[Math.floor(Math.random() * predictions.length)];	
		}
	}

	// and send the message back, as long as the channel in the whitelist
	if (finalMessage !== '')
		msg.channel.send(finalMessage);
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);

	client.setInterval(() => {
		data.saveData(queueAppend);
		queueAppend = {};
		console.log('saved!');
	}, 15000);
});

client.login(fs.readFileSync('token.txt', {encoding: 'utf8'}));