var { xxhashAsHex, deriveHard, blake2AsHex, encodeAddress, mnemonicGenerate } = require('@polkadot/util-crypto');
var { u8aToHex } = require('@polkadot/util');
var { Keyring } = require('@polkadot/keyring');
var { cryptoWaitReady } = require('@polkadot/util-crypto');

const keyring = new Keyring({ type: 'sr25519' });

// Main function which needs to run at start
async function main() {
	var args = process.argv;

	await cryptoWaitReady();

	const fs = require('fs');
	const path = require('path');

	// This gets the file path from commandline
	const chainSpecPath = path.join(__dirname, "..", args[2]);
	const content = require(chainSpecPath);
	const filename = path.basename(chainSpecPath, '.json');
	let storageMetadataPath = path.join(__dirname, "..", args[3]);
	let storageMetadata;
	if (storageMetadataPath) {
		storageMetadata = require(storageMetadataPath);
	} else {
		storageMetadata = require('../output/storage_metadata.json');
	}

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


	fs.writeFileSync('./output/' + filename + '-final.json', JSON.stringify(content, null, '  '));
}

function simple_fake_suffix_and_value(index) {
	let suffix = xxhashAsHex(index.toString(), 128);
	let value = suffix;
	return [suffix, value]
}

function real_account_suffix_and_value(index) {
	let suffix = "0x"
	let dev_phrase = "bottom drive obey lake curtain smoke basket hold race lonely fit walk"

	let user = keyring.addFromUri(dev_phrase + "//" + index.toString());

	let addressBytes = user.publicKey;
	console.log("Address Bytes: ", addressBytes)
	let addressString = user.address;
	console.log("Address String: ", addressString)
	let addressHex = u8aToHex(addressBytes);
	console.log("Address Hex: ", addressHex)
	let addressHash = blake2AsHex(addressBytes, 128);
	console.log("Address Hash: ", addressHash)
	suffix += addressHash.substr(2);
	suffix += addressHex.substr(2);

	// Polkadot
	let polkadot_value  = "0x0000000000000064a7b3b6e00d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
	let substrate_value = "0x00000000000000a0dec5adc9353600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
	return [suffix, substrate_value]
}

main();
