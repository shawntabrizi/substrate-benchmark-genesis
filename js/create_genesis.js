var { xxhashAsHex, deriveHard, blake2AsHex, encodeAddress } = require('@polkadot/util-crypto');
var { u8aToHex } = require('@polkadot/util');


// Main function which needs to run at start
function main() {
	var args = process.argv;

	const fs = require('fs');
	// This gets the filename from commandline
	const filename = args[2];
	const content = require('../input/' + filename + '.json');
	const storageMetadata = require('../output/storage_metadata.json');

	if (content.genesis.raw.top) {
		for (storage of storageMetadata) {
			for (let i = 0; i < storage.generate; i++) {
				let key = storage.prefix;
				console.log("Prefix   : ", key)
				let [suffix, value] = simple_fake_suffix_and_value(i);
				key += suffix.substr(2);
				console.log("Final Key: ", key)
				content.genesis.raw.top[key] = value;
			}
		}
	}


	fs.writeFileSync('./output/' + filename + '-final.json', JSON.stringify(content));
}

function simple_fake_suffix_and_value(index) {
	let suffix = xxhashAsHex(index.toString(), 128);
	let value = suffix;
	return [suffix, value]
}

function real_account_suffix_and_value(index) {
	let suffix = "0x"
	let addressBytes = deriveHard(index.toString())
	//console.log("Address Bytes: ", addressBytes)
	let addressString = encodeAddress(addressBytes)
	//console.log("Address String: ", addressString)
	let addressHex = u8aToHex(addressBytes);
	//console.log("Address Hex: ", addressHex)
	let addressHash = blake2AsHex(addressBytes, 128);
	//console.log("Address Hash: ", addressHash)
	suffix += addressHash.substr(2);
	suffix += addressHex.substr(2);

	let value = "0x0000000000000064a7b3b6e00d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"

	return [suffix, value]
}

main();
