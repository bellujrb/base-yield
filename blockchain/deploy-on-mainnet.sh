source .env

forge script script/Deploy.s.sol:DeployScript \
    --private-key $MAINNET_PRIVATE_KEY \
    --rpc-url $MAINNET_RPC_URL \
    --broadcast \
    --verify
