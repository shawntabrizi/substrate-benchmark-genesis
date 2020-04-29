var { ApiPromise, WsProvider } = require('@polkadot/api');

// Main function which needs to run at start
async function main() {
    // Substrate node we are connected to and listening to remarks
    const provider = new WsProvider('ws://localhost:9944', false);
    //const provider = new WsProvider('wss://kusama-rpc.polkadot.io/');
    provider.connect();

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

    var args = process.argv;
    let option = args[2];
    let generateWith;
    switch (option) {
        case "polkadot":
            generateWith = generatePolkadot;
            break;
        case "accounts":
            generateWith = generateAccounts;
            break;
        default:
            generateWith = generateZero;
    }

    let output = [];

    let count = 0;

    for (module in api.query) {
        if (module == "substrate") { continue; }

        for (storage in api.query[module]) {
            let query = api.query[module][storage];
            let type = query.meta.type;

            try {
                console.log(module, storage, query.key());

            } catch {
                console.log(module, storage, query.keyPrefix())
                let generate = generateWith(module, storage);
                output.push({
                    "module": module,
                    "storage": storage,
                    "type": type,
                    "prefix": query.keyPrefix(),
                    "generate": generate
                })

                count += generate;
            }
        }
    }

    console.log("Final Count: ", count)
    const fs = require('fs')
    fs.writeFileSync(
        ('./output/storage-metadata-' + nodeName + '-' + chain + '-' + option + '.json').toLowerCase().replace(/\s/g, '-'),
        JSON.stringify(output, null, '  ')
    )

    provider.disconnect()
}

function generateZero(module, storage) {
    return 0;
}

function generateAccounts(module, storage) {
    let accounts = 10000;

    if (module == "system" && storage == "account") {
        return accounts
    }

    return 0;
}

// From Gav PR
// modelled on either a reasonable number of
// * sale buyers(4,000)
// * active users(5,000)
// * accounts(100,000)
// * stakers(20,000)
// * validators(1,000),
// * voters(50, 000)
function generatePolkadot(module, storage) {
    let sale_buyers = 4000;
    let active_users = 5000;
    let accounts = 100000;
    let stakers = 20000;
    let staking_history_depth = 84;
    let staking_bonding_duration = 28;
    let validators = 1000;
    let voters = 50000;
    let treasury = 1000;
    let society = 150;
    let parachains = 100;
    let parathreads = 1000;

    if (module == "system" && storage == "account") {
        return accounts
    }

    if (module == "system" && storage == "blockHash") {
        return 256
    }

    if (module == "babe" && storage == "underConstruction") {
        return 2000
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

    if (module == "staking" && storage == "erasStakers") {
        return staking_history_depth
    }

    if (module == "staking" && storage == "erasStartSessionIndex") {
        return staking_history_depth
    }

    if (module == "staking" && storage == "erasStakersClipped") {
        return staking_history_depth
    }

    if (module == "staking" && storage == "erasValidatorPrefs") {
        return staking_history_depth
    }

    if (module == "staking" && storage == "erasValidatorReward") {
        return staking_history_depth
    }

    if (module == "staking" && storage == "erasRewardPoints") {
        return staking_history_depth
    }

    if (module == "staking" && storage == "erasTotalStake") {
        return staking_history_depth
    }

    if (module == "staking" && storage == "validators") {
        return validators
    }

    if (module == "staking" && storage == "unappliedSlashes") {
        return (stakers / 1000)
    }

    if (module == "staking" && storage == "validatorSlashInEra") {
        return staking_bonding_duration
    }

    if (module == "staking" && storage == "nominatorSlashInEra") {
        return staking_bonding_duration
    }

    if (module == "offences" && storage == "reports") {
        return 50
    }

    if (module == "session" && storage == "nextKeys") {
        return stakers
    }

    if (module == "session" && storage == "keyOwner") {
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

    if (module == "democracy" && storage == "preimages") {
        return 10;
    }

    if (module == "democracy" && storage == "blacklist") {
        return 100;
    }

    if (module == "democracy" && storage == "cancellations") {
        return 100;
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

    if (module == "electionsPhragmen" && storage == "votesOf") {
        return voters;
    }

    if (module == "electionsPhragmen" && storage == "voting") {
        return voters;
    }

    if (module == "electionsPhragmen" && storage == "stakeOf") {
        return voters;
    }

    if (module == "treasury" && storage == "proposals") {
        return treasury;
    }

    if (module == "treasury" && storage == "tips") {
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

    if (module == "parachains" && storage == "code") {
        return parachains;
    }

    if (module == "parachains" && storage == "heads") {
        return parachains;
    }

    if (module == "parachains" && storage == "relayDispatchQueue") {
        return parachains;
    }

    if (module == "parachains" && storage == "relayDispatchQueueSize") {
        return parachains;
    }

    if (module == "slots" && storage == "deposits") {
        return parachains;
    }

    if (module == "slots" && storage == "winning") {
        return parachains;
    }

    if (module == "slots" && storage == "reservedAmounts") {
        return parachains * 10;
    }

    if (module == "slots" && storage == "onboarding") {
        return parachains;
    }

    if (module == "slots" && storage == "offboarding") {
        return parachains;
    }

    if (module == "slots" && storage == "onboardQueue") {
        return parachains;
    }

    if (module == "registrar" && storage == "pendingSwap") {
        return parachains / 10;
    }

    if (module == "registrar" && storage == "paras") {
        return parachains + parathreads;
    }

    if (module == "registrar" && storage == "debtors") {
        return parathreads;
    }

    if (module == "utility" && storage == "multisigs") {
        return active_users;
    }

    if (module == "identity" && storage == "identityOf") {
        return active_users;
    }

    if (module == "identity" && storage == "superOf") {
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

    if (module == "council" && storage == "proposalOf") {
        return 10;
    }

    if (module == "council" && storage == "voting") {
        return 30;
    }

    if (module == "technicalCommittee" && storage == "proposalOf") {
        return 10;
    }

    if (module == "technicalCommittee" && storage == "voting") {
        return 30;
    }

    console.log("No match for: ")
    return 0
}

main().catch(console.error);
