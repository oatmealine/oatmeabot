const path = require('path');
const fs = require('fs');

module.exports.loadData = function loadData() {
	data = '';

	let err, files = fs.readdirSync(path.resolve(__dirname, 'data'));
	if (err) return console.error(err);
	if (!files) return;

	files.forEach(file => {
		let err, content = fs.readFileSync(path.resolve(__dirname, 'data', file), { encoding: 'utf8' });
		
		if (err) return console.error(err);
		data += content;
	});

	return data;
}

module.exports.saveData = function saveData(queueAppend) {
	Object.keys(queueAppend).forEach((id) => {
		let content = queueAppend[id];

		fs.appendFile(path.resolve(__dirname, 'data', id + '.txt'), content, (err) => {
			if (err) return console.error(err);
		});
	});
}