var { xxhashAsHex } = require('@polkadot/util-crypto');

// Main function which needs to run at start
function main() {
	const fs = require('fs');
	const filename = 'polkadot-benchmark.json';
	const content = require('../' + filename);
	const storageMetadata = require('../output/storage_metadata.json');

	if (content.genesis.raw.top) {
		for (storage of storageMetadata) {
			for (let i = 0; i < storage.generate; i++) {
				let key = storage.prefix;
				console.log(key)
				key += xxhashAsHex(storage.module + storage.storage + i).substr(2);
				console.log(key)
				content.genesis.raw.top[key] = key;
			}
		}
	}


	fs.writeFileSync('./output/' + filename, JSON.stringify(content));
}

main();
