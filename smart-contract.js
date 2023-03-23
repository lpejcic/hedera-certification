
const {
    Client,
    Hbar,
    ContractCreateFlow,
    ContractExecuteTransaction,
    ContractFunctionParameters,
  } = require("@hashgraph/sdk");
require('dotenv').config();
const contractJson = require("./CertificationC1.json");
  
async function deployContract(client) {
    const contractTx = await new ContractCreateFlow()
        .setBytecode(contractJson.bytecode)
        .setGas(100_000)
        .execute(client);

    const contractId = (await contractTx.getReceipt(client)).contractId;
    return contractId;
}
  
async function callFunction1(contractId, client) {
    const tx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction("function1", new ContractFunctionParameters().addUint16(4).addUint16(3))
        .execute(client);

    let record = await tx.getRecord(client);

    return Buffer.from((record).contractFunctionResult.bytes).toJSON().data.at(-1);
}
  
async function callFunction2(contractId, input, client) {
    const tx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction("function2", new ContractFunctionParameters().addUint16(input))
        .execute(client);

    return Buffer.from((await tx.getRecord(client)).contractFunctionResult.bytes).toJSON().data.at(-1);
}
  
async function main() {
    const account1 = process.env.PRIVATE_KEY_1;
    const account1Id = process.env.ACCOUNT_ID_1;

    const client = Client.forTestnet().setOperator(account1Id, account1).setDefaultMaxTransactionFee(new Hbar(100));
    
    const contractId = await deployContract(client);
    const function1Response = await callFunction1(contractId, client);
    const function2Response = await callFunction2(contractId, function1Response, client);
    
    console.log('Contract ID:', contractId);
    console.log('Function 1 response:', function1Response);
    console.log('Function 2 response:', function2Response);

    process.exit();
}
  
main();