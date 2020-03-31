// Main function which needs to run at start
async function main() {
	var args = process.argv;

	const fs = require('fs');
	const path = require('path');

	// This gets the filename from commandline
	let chainSpecPath = path.join(__dirname, "..", args[2]);
	const filename = path.basename(chainSpecPath, '.json');
	const content = require(chainSpecPath);

	let unordered = content.genesis.raw.top;

	const ordered = {};
	Object.keys(unordered).sort().forEach(function(key) {
		ordered[key] = unordered[key];
	});

	content.genesis.raw.top = ordered;

	fs.writeFileSync('./output/' + filename + '-sorted.json', JSON.stringify(content, null, '  '));
}

main();
