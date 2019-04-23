# PeerPlays Witness Monitor

This is a PeerPlays witness monitoring script with notifications to Telegram.

The script tracks the missed blocks and when the set threshold is reached, pushing the transaction to switch the signing keys to the backup server. 
The keys are selected from 2, the inactive key is currently becoming active (loop).


```
git clone https://github.com/serdrdoor/peerplays-witness-monitor
cd peerplays-witness-monitor
```

## Configuration:
Open /config/config.json.example in text editor and edit with your own settings:

```

{
  "timeout": 20,
  "thresholdMissedBlocks": 3,
  "onlyNotify": false,
  "peerplays": {
    "apiNode": "wss://api.ppy.blckchnd.com/ws",
    "nameNetwork": "MainNet",
    "account": "witness-account",
    "witnessUrl": "https://.......",
    "activeKey": "5.......xxx",
    "sign_keys": {
      "witnessSigningKey": "PPY.......xxx",
      "backupSigningKey": "PPY.......xxx"
    }
  },
  "telegram": {
    "token": "botToken....",
    "my_telegram_id": "1......"
  }
}

``` 

`timeout:`
How often should the script check for new missed blocks in seconds.  
  
`thresholdMissedBlocks`
How many blocks must be missed for auto switch your signing key to backup or main wintess (it choose automatic). 
Recommend to set thresholdMissedBlocks more 2.

`onlyNotify`
if here FALSE - then you will be only notificated about missed blocks, without switch on other witness server.
if TRUE - then notify and switch keys for signing blocks.

##### PeerPlays blockchain options:

`apiNode`
API node for communicate with Blockchain PeerPlays

`nameNetwork`
Only for info. if you use a few scripts for notificate, example MainNet and TestNet

`account`
Witness account name

`witnessUrl`
url for witness proposal or/and description your witness

`activeKey`  
The active key of your witness account used to sign the witness_update operation.

##### block sign_keys:

`witnessSigningKey`  
The public signing key of main witness to be used when switching from backup.

`backupSigningKey`  
The public signing key of your backup witness to be used when switching from main.



##### Telegram options:

`token`  
The telegram access token for your botTelegram. You can get one here: https://telegram.me/BotFather

`my_telegram_id`  
a)Write something to your newly created bot.

b) See my_telegram_id in query: 
https://api.telegram.org/bot{token}/getUpdates

## Running (Docker required):

make run

#### Logs:

make log

#### Stop and Delete:

make delete


