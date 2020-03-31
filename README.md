# substrate-benchmark-genesis

This is a tool to generate keys and values for a Substrate Chain Spec file, intended for
benchmarking the runtime given a "full chain".

It uses a two step process to generate the final chain specification:

1. Query the chain metadata and populate a list of available Storage Maps / Double Maps.
    * This file has a spot for users to note how many of that item we want to generate.
2. Generate a final chain spec using a basic chain spec and the metadata file.

More details about these two steps below.

To install the npm packages needed to run this tool, simply type `yarn`:

```bash
$ yarn

➜  substrate-benchmark-genesis git:(master) ✗ yarn
yarn install v1.22.4
[1/4] 🔍  Resolving packages...
success Already up-to-date.
✨  Done in 0.15s.
```

## Get Metadata

Each Substrate chain is unique, and as such, will need to generate different data and amounts of
data to accurately benchmark the runtime logic. To do this, we use Polkadot JS API to query the
node's metadata to retrieve all storage items and their respective prefix.

To generate the `storage_metadata` file, run a local node (using port `9944` which is default), and
then run:

```bash
yarn run metadata <option>
```

> `<option>` is an optional parameter which currently supports `polkadot` (generating a chainspec
> given the estimated fullness of the Polkadot mainnet) or `accounts` (generating only 10_000
> accounts).
>
> By default, when you omit this parameter, all storage items will be set to generate zero items,
> which is a good template for adding your own values.

It should generate a new `storage_metadata` file in the `output` folder with the storage contents of
your chain.

The output for a single storage item will look like this:

```json
{
  "module": "system",
  "storage": "account",
  "type": {
    "Map": {
      "hasher": "Blake2_128Concat",
      "key": "AccountId",
      "value": "AccountInfo",
      "linked": false
    }
  },
  "prefix": "0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9",
  "generate": 100000
},
```

Here you will see we have the `module` and `storage` name, along with the kind of storage item it is
(with additional metadata), the final prefix of the key, and the number of keys we want to generate
for this runtime storage item.

You should generate this metadata once your runtime is finalized, and then populate the `generate`
field for your custom needs.

From there, you can reuse this storage metadata file to generate "full" chain specs of your runtime
if you make changes that would not affect the metadata file, i.e. performance improvements.

Once you have a populated `storage_metadata` file, it is now time to generate a "full" chain spec.

## Generate a Chain Spec

To generate a "full" chain spec file, you need to provide a basic chain spec on top of which we will
populate the additional storage items.

You can generate a simple default chain specification by building your Substrate with
`runtime-benchmarks` enabled:

```bash
cargo build --release --features runtime-benchmarks
```

> **NOTE:** Having this feature flag enabled is critically important. For benchmarking, we will
> directly use the Wasm provided in your chain specification, and if you do not have the
> benchmarking feature enabled, you wont be able to run benchmarks using the chain spec you
> generate.
>
> As you change and modify your runtime, you will need to also update this Wasm by creating a new
> "base" chain specification. However, it should be easy to generate new "full" chain specifications
> due to the two step process in this tool.

Then generate a chain spec with:

```bash
./target/release/my_node build-spec --chain dev --raw > my_node_spec.json
```

This will create a basic chain specification that contains anything a regular dev chain will:

* Maybe a few funded accounts (Alice, Bob, Charlie...).
* Alice as the single permanent validator.
* The Runtime Wasm stored in the `:CODE` storage key.
* etc...

Take this chain chain spec and your `storage_metadata` file, and run the following:

```bash
yarn run generate <path-to-chain-spec> <path-to-storage-metadata>
```

We will then generate the keys you have specified and populate them into a new chain spec ending
with `-final.json`. You can now use this chain specification for running benchmarks like so:

```bash
./target/release/my_node benchmark
    --chain my_node_spec-final.json \
    --execution=wasm --wasm-execution=compiled \
    --pallet balances \
    --extrinsic transfer \
    --steps 20 \
    --repeat 20 \
> balance-transfer.txt
```

## Assumptions

This tool makes some critical (maybe not 100% proven) assumptions about generating the chain
specification.

The critical assumption here is that the actual keys and values that it generates are **not** real,
i.e. they may not properly encode or decode to the format expected by the runtime.

Instead, we assume that simulating a "full" trie simply means inducing multiple storage hops to
access a storage item. And to do this, we simply need random keys populated under the main storage
prefix of these storage items.

For example, when we generate a bunch of system accounts, we know from the `storage_metadata` that
all the account storage items are stored under shared prefix:

```bash
0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9
```

So we simply want to create additional storage items with this prefix, and some random suffix:

```bash
0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da900
0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da901
0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da902
...
0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9ff
```

Building these 256 storage items means that accessing any _real_ account should take an additional
two storage hops because we have created these extra nodes. We populate these keys with the same 64
bit randomness appended to the end of the prefix, but this can be modified in the source.

Because we never actually use or decode these extra storage items, their key and value need not be
accurate. Do note though, if you expect these nodes to be particularly heavy, 64 bits may not be
large enough to simulate real world behavior.

We only populate Storage Maps and Double Maps with this tool. This means that if your runtime has
some Vecs, those are currently not populated, but this might change in the future.
