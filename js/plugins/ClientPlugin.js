(function () {
    const PORT = 8009;
    const DEBUG = true;
    const HOST = DEBUG ? "127.0.0.1" : "shironekodan.dip.jp";
    // ----------------------------------------------------------------------
    // クライアントの処理を扱うクラス.
    // ----------------------------------------------------------------------
    function Client() {
        const self = this;
        self.ws = new WebSocket(`ws://${HOST}:${PORT}/`);
        self.ws.onmessage = function(event) {
            const d = JSON.parse(event.data);
            const eventName = d.eventName;
            //console.log(eventName)
            switch(eventName) {
                case "connected" :
                    self.playerId = localStorage.getItem("playerId");
                    console.log("connected:", self.playerId);
                    if (!self.playerId) {
                        self.playerId = d.playerId;
                        localStorage.setItem("playerId", d.playerId);
                    }
                    break;
                case "initialize" :
                    console.log($gamePlayer, d)
                    console.log("initialize", d.playerMap.characterName, d.playerMap.characterIndex);
                    $gamePlayer.locate(d.playerMap.x, d.playerMap.y);
                    $gamePlayer.setImage(d.playerMap.characterName, d.playerMap.characterIndex);
                    console.log($gamePlayer)
                    self.setupMaster(d);
                    break;
                case "setPlayerMap" :
                    self.playerMap = d.playerMap;
                    if (!$gameVariables) break;
                    Object.keys(d.playerMap).forEach(function(id) {
                        const player = d.playerMap[id];
                        $gameVariables.setValue(player.playerIndex+1, {x: player.x, y: player.y});
                    });
                    break;
            }
        };
    }

    // ----------------------------------------------------------------------
    // マスター設定.
    // ----------------------------------------------------------------------
    Client.prototype.setupMaster = function(d) {
        this.master = d.master;
    }
    // ----------------------------------------------------------------------
    // 送信.
    // ----------------------------------------------------------------------
    Client.prototype.send = function (eventName, sendData) {
        if (!this.ws) return;
        sendData.playerId = this.playerId;
        sendData.eventName = eventName;
        // console.log(eventName, sendData);
        const message = JSON.stringify(sendData);
        this.ws.send(message);
    };
    this.client = new Client();
    // ----------------------------------------------------------------------
    // 移動.
    // ----------------------------------------------------------------------
    const _Game_Player_executeMove = Game_Player.prototype.executeMove;
    Game_Player.prototype.executeMove = function(direction) {
        _Game_Player_executeMove.call(this, direction);
        client.send("move", {
            x: $gamePlayer._x,
            y: $gamePlayer._y,
            direction: $gamePlayer._direction
        });
    };
    // ----------------------------------------------------------------------
    // フレーム処理.
    // ----------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args)
        if (command === "Update") {
            if (!window.client.initialized) {
                window.client.initialized = true;
                window.client.send("addGame", {});
            }
            // const playerMap = window.client.playerMap;
            // if (!playerMap) return;
            // $gameMap.events().forEach(function(e, i) {
            //     const eventName = e.event().name; // 前提：イベント名に接続Indexを設定しておくこと。
            //     const player = Object.keys(playerMap)
            //         .map(function(id) {
            //             const e = playerMap[id];
            //             return e.playerIndex == eventName ? e : null;
            //         })
            //         .filter(function(e) {
            //             return e !== null;
            //         })[0];
            //     if (!player) return;
            //     console.log(player)
            //     e.moveTowardCharacter({
            //         x: player.x,
            //         y: player.y
            //     });
            // });
        } else if (command === "WaitJoinPlayers") {
            var settingJoinPlayers = $gameVariables.value(9); // ホストが設定したプレイヤー人数
            var watingPlayers = Object.keys(window.client.playerMap).length; // 接続中のプレイヤー人数
            if (settingJoinPlayers === watingPlayers) {
                // プレイヤー人数が揃ったとき
                $gameVariables.setValue(11, 4);
            } else {
                // プレイヤー人数が揃っていないとき
                var message = "参加するプレイヤーが集まるのを待っています。\n"
                            + "現在のプレイヤー人数：" + watingPlayers + " / " + settingJoinPlayers + "\n";
                $gameMessage.add(message);
            }
        }
    }
})();