const { Client, PrivateKey, TransferTransaction, Hbar, ScheduleCreateTransaction, Transaction } = require('@hashgraph/sdk');
require('dotenv').config();


async function main() {
    const accountId1 = process.env.ACCOUNT_ID_1;
    const privateKey1 = PrivateKey.fromString(process.env.PRIVATE_KEY_1);

    const accountId2 = process.env.ACCOUNT_ID_2;

    const client = Client.forTestnet().setOperator(accountId1, privateKey1);

    const tx = new TransferTransaction()
        .addHbarTransfer(accountId1, new Hbar(-10))
        .addHbarTransfer(accountId2, new Hbar(10));

    const scheduledTransaction = new ScheduleCreateTransaction()
        .setScheduledTransaction(tx)
        .setScheduleMemo('This is a memo!')
        .setAdminKey(privateKey1)
        .freezeWith(client);
    
    const serializedTx = Buffer.from(scheduledTransaction.toBytes()).toString('base64');

    console.log('Serialized transaction:', serializedTx);

    const deserializedTx = Transaction.fromBytes(Buffer.from(serializedTx, 'base64'));

    deserializedTx.sign(privateKey1);

    const result = await deserializedTx.execute(client);
    const receipt = await result.getReceipt(client);
    console.log('\n Transaction ID:', deserializedTx.transactionId);
    console.log('Successfully created and executed scheduled transaction with status:', receipt.status.toString());
}

main();