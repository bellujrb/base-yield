source .env

forge script script/Deploy.s.sol:DeployScript \
    --private-key $TESTNET_PRIVATE_KEY \
    --rpc-url $TESTNET_RPC_URL \
    --broadcast \
    --verify
