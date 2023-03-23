const { Client, TopicCreateTransaction, TopicMessageSubmitTransaction, TopicMessageQuery } = require('@hashgraph/sdk');
require('dotenv').config()

async function main() {
    const account1 = process.env.ACCOUNT_ID_1;
    const account1PrivateKey = process.env.PRIVATE_KEY_1;

    if (!account1 || !account1PrivateKey) {
        throw new Error('Environment variables ACCOUNT_ID_1 and PRIVATE_KEY_1 must be present');
    }

    const client = Client.forTestnet().setOperator(account1, account1PrivateKey);

    let txResponse = await new TopicCreateTransaction().execute(client);
    let topicId = (await txResponse.getReceipt(client)).topicId;

    console.log('Newly created topic ID: ', topicId);

    // Wait 5 seconds between consensus topic creation and subscription creation.
    await new Promise((resolve) => setTimeout(resolve, 5000));

    new TopicMessageQuery()
        .setTopicId(topicId)
        .subscribe(client, (message) => console.log(Buffer.from(message.contents, "utf8").toString()));

    const sendResponse = await new TopicMessageSubmitTransaction({
        topicId,
        message: new Date().toTimeString(),
    }).execute(client);

    const getReceipt = await sendResponse.getReceipt(client);

    console.log('Message receipt:');
    console.log(JSON.stringify(getReceipt));
    console.log('The message transaction status:', getReceipt.status.toString());

    process.exit();
}

main();