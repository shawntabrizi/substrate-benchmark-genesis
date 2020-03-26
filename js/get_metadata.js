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
				let generate = getGenerate(module, storage)
				output.push({
					"module": module,
					"storage": storage,
					"type": type,
					"prefix": query.keyPrefix(),
					"generate": 1
				})
			}
		}
	}

	const fs = require('fs')
	fs.writeFileSync('./output/storage_metadata.json', JSON.stringify(output))
}

// From Gav PR
// modelled on either a reasonable number of
// * sale buyers(4,000)
// * active users(5,000)
// * accounts(100,000)
// * stakers(20,000)
// * validators(1,000),
// * voters(50, 000)
fn getGenerate(module, storage) {
	let sale_buyers = 4000;
	let active_users = 5000;
	let accounts = 100000;
	let stakers = 20000;
	let validators = 1000;
	let voters = 50000;
	let treasury = 1000;
	let society = 150;

	if (module == "system" && storage == "account") {
		return accounts
	}

	if (module == "system" && storage == "blockHash") {
		return 256
	}

	if (module == "indices" && storage == "accounts") {
		return active_users
	}

	if (module == "balances" && storage == "account") {
		return accounts
	}

	if (module == "balances" && storage == "locks") {
		return (accounts / 10)
	}

	if (module == "staking" && storage == "bonded") {
		return stakers
	}

	if (module == "staking" && storage == "ledger") {
		return stakers
	}

	if (module == "staking" && storage == "payee") {
		return stakers
	}

	if (module == "staking" && storage == "validators") {
		return validators
	}

	if (module == "staking" && storage == "nominators") {
		return stakers
	}

	if (module == "staking" && storage == "validators") {
		return validators
	}

	if (module == "staking" && storage == "unappliedSlashes") {
		return (stakers / 1000)
	}

	if (module == "session" && storage == "nextKeys") {
		return stakers
	}

	if (module == "staking" && storage == "keyOwner") {
		return accounts
	}

	if (module == "democracy" && storage == "depositOf") {
		return (voters / 50);
	}

	if (module == "democracy" && storage == "referendumInfoOf") {
		return 4;
	}

	if (module == "democracy" && storage == "votingOf") {
		return voters;
	}

	if (module == "democracy" && storage == "proxy") {
		return (voters / 25);
	}

	if (module == "democracy" && storage == "delegations") {
		return (voters / 50);
	}

	if (module == "democracy" && storage == "locks") {
		return voters;
	}

	if (module == "electionsPhragmen" && storage == "voting") {
		return voters;
	}

	if (module == "treasury" && storage == "proposals") {
		return treasury;
	}

	if (module == "treasury" && storage == "proposals") {
		return treasury;
	}

	if (module == "treasury" && storage == "reasons") {
		return treasury;
	}

	if (module == "claims" && storage == "claims") {
		return sale_buyers;
	}

	if (module == "claims" && storage == "vesting") {
		return sale_buyers;
	}

	if (module == "utility" && storage == "multisigs") {
		return active_users;
	}

	if (module == "identity" && storage == "identityOf") {
		return active_users;
	}

	if (module == "identity" && storage == "superOf") {
		return active_users;
	}

	if (module == "identity" && storage == "identityOf") {
		return (active_users * 4);
	}

	if (module == "identity" && storage == "subsOf") {
		return active_users;
	}

	if (module == "society" && storage == "vouching") {
		return (society / 15);
	}

	if (module == "society" && storage == "payouts") {
		return society;
	}

	if (module == "society" && storage == "strikes") {
		return ((society * 2) / 3)
	}

	if (module == "society" && storage == "votes") {
		return society;
	}

	if (module == "society" && storage == "defenderVotes") {
		return society;
	}

	if (module == "recovery" && storage == "recoverable") {
		return active_users;
	}

	if (module == "recovery" && storage == "activeRecoveries") {
		return active_users / 50;
	}

	if (module == "recovery" && storage == "proxy") {
		return active_users / 50;
	}

	if (module == "vesting" && storage == "vesting") {
		return sale_buyers;
	}

	return 0
}

main().catch(console.error);
