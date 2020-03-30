// Main function which needs to run at start
async function main() {
	var args = process.argv;

	const fs = require('fs');
	// This gets the filename from commandline
	const filename = args[2];
	const content = require('../sort/' + filename + '.json');

	let unordered = content.genesis.raw.top;

	const ordered = {};
	Object.keys(unordered).sort().forEach(function(key) {
		ordered[key] = unordered[key];
	});

	content.genesis.raw.top = ordered;

	fs.writeFileSync('./sort/' + filename + '-sorted.json', JSON.stringify(content));
}

main();
