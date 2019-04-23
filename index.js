"use strict";

let {Apis} = require("peerplaysjs-lib");
let {PrivateKey, TransactionBuilder} = require("peerplaysjs-lib");
let TelegramBotModule = require('node-telegram-bot-api');

let config = require("./config/config.json");

let telegram_config = config.telegram;
let token = config.telegram.token;
let telegramBot = new TelegramBotModule(token);

telegramBot.onText(/\/echo (.+)/, function (msg, match) {
    let fromId = msg.chat.id;
    let resp = match[1];
    this.sendMessage(fromId, resp);
});

let BotStorage = {
    "timeout": config.timeout,
    "first_launch": true,
    "total_missed_start": 0
};

async function get_witness_info(apiNode, account_name, nameNetwork) {

    let dateNow = new Date();
    console.log(dateNow.toTimeString() + ":");

    try {

        let connect = await Apis.instance(config.peerplays.apiNode, true).init_promise;

        account_name = await Apis.instance().db_api().exec("get_account_by_name", [account_name]);
        let witness_info = await Apis.instance().db_api().exec("get_witness_by_account", [account_name.id]);
        let total_missed = witness_info.total_missed;
        let current_signing_key = witness_info.signing_key;
        let newSigningKey;

        if (current_signing_key == config.peerplays.sign_keys.witnessSigningKey)
            newSigningKey = config.peerplays.sign_keys.backupSigningKey;
        else
            newSigningKey = config.peerplays.sign_keys.witnessSigningKey;

        if (BotStorage.first_launch == true) {
            BotStorage.total_missed_start = total_missed;
            BotStorage.first_launch = false;

            console.log(`First launch ${nameNetwork} , missed: ${total_missed} blocks.`);
            telegramBot.sendMessage(telegram_config.my_telegram_id,
                `First launch ${nameNetwork} , total missed: ${total_missed} blocks start monitoring.`);

        }
        else if ((total_missed - BotStorage.total_missed_start) >= config.thresholdMissedBlocks) {

            console.log(`PeerPlays-${nameNetwork}: You are missing blocks. Your current misses count: ${total_missed}, which was ${total_missed - BotStorage.total_missed_start}`);
            telegramBot.sendMessage(telegram_config.my_telegram_id,
                `PeerPlays-${nameNetwork}: You are missing blocks. Your current misses count: ${total_missed}, which was ${total_missed - BotStorage.total_missed_start}`);

            BotStorage.total_missed_start = total_missed;

            if (!config.onlyNotify) {

                let activeKey = PrivateKey.fromWif(config.peerplays.activeKey);

                // Build transaction
                let tr = new TransactionBuilder();
                tr.add_type_operation("witness_update", {
                    fee: {
                        amount: 0,
                        asset_id: "1.3.0"
                    },
                    witness: witness_info.id,
                    witness_account: account_name.id,
                    new_url: config.peerplays.witnessUrl,
                    new_signing_key: newSigningKey
                });


                let fees = await tr.set_required_fees("1.3.0");
                let sign = await tr.add_signer(activeKey, activeKey.toPublicKey().toPublicKeyString());

                console.log("\n\rserialized transaction:", tr.serialize());

                let resTrxBroadcast = await tr.broadcast();

                if (resTrxBroadcast[0].id) {

                    console.log('-->broadCast complete...\n');
                    console.log("broadcastTRX:" + resTrxBroadcast[0].id);

                    console.log(`Witness switched to another key: ${newSigningKey}, trxID:${resTrxBroadcast[0].id}`);
                    telegramBot.sendMessage(telegram_config.my_telegram_id, `Witness switched to another key: ${newSigningKey}, trxID:${resTrxBroadcast[0].id}`);

                }

            }

        }

        Apis.close();
        console.log(`Checking ${nameNetwork} done, total missed: ${total_missed} blocks.`);
        console.log("........................................");
        setTimeout(get_witness_info, BotStorage.timeout * 1000, config.peerplays.apiNode, config.peerplays.account, config.peerplays.nameNetwork);


    } catch (e) {

        Apis.close();
        console.log("Error: " + nameNetwork + " - " + e.message);

        telegramBot.sendMessage(telegram_config.my_telegram_id,
            "Error: " + nameNetwork + " - " + e.message);

        console.log("........................................");
        setTimeout(get_witness_info, BotStorage.timeout * 1000, config.peerplays.apiNode, config.peerplays.account, config.peerplays.nameNetwork);

    }

}

setTimeout(get_witness_info, BotStorage.timeout * 1000, config.peerplays.apiNode, config.peerplays.account, config.peerplays.nameNetwork);