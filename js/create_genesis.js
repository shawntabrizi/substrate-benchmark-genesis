var { xxhashAsHex, deriveHard, blake2AsHex, encodeAddress } = require('@polkadot/util-crypto');
var { u8aToHex } = require('@polkadot/util');


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
				console.log("Prefix: ", key)
				let addressBytes = deriveHard(i.toString())
				console.log("Address Bytes: ", addressBytes)
				let addressString = encodeAddress(addressBytes)
				console.log("Address String: ", addressString)
				let addressHex = u8aToHex(addressBytes);
				console.log("Address Hex: ", addressHex)
				let addressHash = blake2AsHex(addressBytes, 128);
				console.log("Address Hash: ", addressHash)
				key += addressHash.substr(2);
				key += addressHex.substr(2);
				console.log("Final Key: ", key)
				content.genesis.raw.top[key] = "0x0000000000000064a7b3b6e00d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
			}
		}
	}


	fs.writeFileSync('./output/' + filename, JSON.stringify(content));
}

main();
