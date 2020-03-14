var { ApiPromise, WsProvider } = require('@polkadot/api');

// Main function which needs to run at start
async function main() {
	// Substrate node we are connected to and listening to remarks
	//const provider = new WsProvider('ws://localhost:9944');
	const provider = new WsProvider('wss://kusama-rpc.polkadot.io/');

	const api = await ApiPromise.create({ provider });

	// Get general information about the node we are connected to
	const [chain, nodeName, nodeVersion] = await Promise.all([
		api.rpc.system.chain(),
		api.rpc.system.name(),
		api.rpc.system.version()
	]);
	console.log(
		`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
	);

	let output = [];

	for (module in api.query) {
		if (module == "substrate") { continue; }

		for (storage in api.query[module]) {
			let query = api.query[module][storage];
			let type = query.meta.type;

			try {
				console.log(module, storage, query.key());

			} catch {
				console.log(module, storage, query.keyPrefix())
				output.push({
					"module": module,
					"storage": storage,
					"type": type,
					"prefix": query.keyPrefix(),
					"generate": 1
				})
			}

			// if (type.type == "DoubleMap") {
			// 	let key1 = type.raw.key1.valueOf();
			// 	let hasher = type.raw.hasher.type;
			// 	let key2 = type.raw.key2.valueOf();
			// 	let key2Hasher = type.raw.key2Hasher.type;

			// 	console.log(module, storage, type.type, key1, hasher, key2, key2Hasher, query.keyPrefix())
			// } else if (type.type == "Map") {
			// 	let key = type.raw.key.valueOf();
			// 	let hasher = type.raw.hasher.type;

			// 	console.log(module, storage, type.type, key, hasher, query.keyPrefix())

			// } else if (type.type == "Plain") {
			// 	console.log(module, storage, type.type, query.key())
			// } else {
			// 	console.log("Unhandled type: ", module, storage, type);
			// }
		}
	}

	const fs = require('fs')
	fs.writeFileSync('./output/storage_metadata.json', JSON.stringify(output))
}

main().catch(console.error);
