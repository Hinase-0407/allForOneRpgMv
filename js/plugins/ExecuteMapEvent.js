//=============================================================================
// ExecuteMapEvent.js
//=============================================================================

/*:
 * @plugindesc マップイベントを実行するプラグイン.
 * @author hinase
 * @varsion 1.0.0
 *
 * @help
 * すごろくのマス目にあたるイベントに次のプラグイン呼び出しコマンドを設定していきます.
 * 呼び出すイベントのメモ欄に"areaId"というメタデータが必要です.
 * 
 * selectCommandBeforeMove
 * 移動を開始するか,アイテムを使用するか選択するウィンドウを表示します.
 * 
 * startMove
 * プレイヤーがフィールド上のマス目を移動できようになります.
 * 
 * endMove
 * 移動を終了して,職業の給与と物件収入を獲得したあと,
 * マス目にある物件に応じたイベントの準備を行います.
 * 
 * executeAreaEvent
 * endMove直後に自動で発生する戦闘イベントに仕込むことで,
 * マス目にある物件に応じたイベントが発生します.
 * 
 * selectCommandAfterEvent
 * 転職をするか,アイテムを使用するか選択するウィンドウを表示します.
 * 
 * 【更新履歴】
 * Ver. 1.0.0   新規作成.(author by.hinase)
 */

(function() {

    /**
     * マップイベントクラス.
     */
    var MapEvent = function() {};

    /**
     * 職業の給与と物件収入をプレイヤーが獲得.
     * @param {Object} player プレイヤー情報
     */
    MapEvent.prototype.getIncome = function(player) {
        // 職業に応じたアイテムを獲得
        // 職業の給与を算出
        // 物件収入を算出
        // 給与と収入を合計してプレイヤーの所持金に加算
    };

    /**
     * イベント用のウィンドウを表示.
     * @param {String} areaId エリアID
     */
    MapEvent.prototype.settingAreaEvent = function(areaId) {
        // 背景表示用変数の定義.
        var pictDown = "";
        var pictUp = "";

        // 施設がある場合は、施設IDを参照に描画.
        // 更地の場合は、エリアIDを参照に描画.
        switch (areaId) {
            case "AR000":
            case "AR001":
            case "AR002": {
                pictDown = "Snowfield";
                pictUp = "Snowfield";
                break;
            }
            case "AR005":
            case "AR006":
            case "AR007": {
                pictDown = "Meadow";
                pictUp = "Forest";
                break;
            }
            default: {
                pictDown = "Grassland";
                pictUp = "Grassland";
                break;
            }
        }
        // 背景を設定
        $gameMap.changeBattleback(pictDown, pictUp);

        // エリアIDを記録
        $gameVariables.setValue(13, parseInt(areaId.replace('AR','')));

        // マップイベントを戦闘イベントとして起動
        $gameSwitches.setValue(4, true);
        BattleManager.setup(1,false,false);
//        BattleManager.setEventCallback(function(n) {this._branch[this._indent] = n;}.bind(this));
    $gamePlayer.makeEncounterCount();
    SceneManager.push(Scene_Battle);
    };

    /**
     * エリアイベントを実施.
     * @param {String} areaId エリアID
     * @param {Object} player プレイヤー情報
     */
    MapEvent.prototype.executeAreaEvent = function(areaId, player) {
        // オブジェクトのリスト（複数）で取得
        // jobList = window.client.master.M_JOB_LIST.filter(m => m.name.indexOf('') >= 0);

        // オブジェクト（単一）で取得
        var areaInfo = window.client.master.M_AREA_LIST.find(m => m.areaId === areaId);
        var buildInfo = window.client.master.M_BUILDING_LIST.find(m => m.buildId === areaInfo.buildId);

        if (areaInfo === null || buildInfo === null) {
            $gameMessage.add('エラーが発生しました。');
            return false;
        }

        var message =
            '現在地：' + areaInfo.areaMei + '\n'
            + '建築物：' + (buildInfo.buildId === 'BL000') ? 'なし' : buildInfo.buildMei + '\n'
            + '現在の所持金：' + player.money + '円';
        $gameMessage.add(message);
    };

    // プラグインコマンドの登録
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand

    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        // マップ移動前のコマンド選択
        if (command === 'selectCommandBeforeMove') {
            // 移動とアイテム使用コマンドを表示
        }

        // マップ移動処理
        else if (command === 'startMove') {
            // プレイヤーの状態に応じて移動エリア数上限を設定
            // プレイヤーのエリア移動数を0に初期化
        }

        // エリアイベント処理
        else if (command === 'endMove') {
            // メタ情報が登録されていない場合、後続の処理を実行しない.
            if (!this.character(0).event().meta) {
                $gameMessage.add("このイベントのメモ欄に情報がありません。\nメモ欄に「areaId」を記入するか、\n「ExecuteMap」の呼び出し処理を削除してください。\n");
                return;
            }

            // イベント発動マスのエリアIDを取得
            var areaId = this.character(0).event().meta.areaId;

            // マップイベント処理を実施
            var event = new MapEvent();
            // event.getIncome(player);
            event.settingAreaEvent(areaId);
        }

        // エリアイベント処理
        else if (command === 'executeAreaEvent') {
            // イベント発動マスのエリアIDを取得
            var areaId = "AR" + ('000' + $gameVariables.value(13)).slice(-3);
            // イベント実行中のプレイヤー情報を取得
            var player = window.client.playerMap[window.client.playerId];

            // マップイベント処理を実施
            var event = new MapEvent(areaId);
            event.executeAreaEvent(areaId, player);

            // イベント終了
            this.setWaitMode('message');
            $gameSwitches.setValue(4, false);
            BattleManager.abort();
        }

        // エリアイベント処理後のコマンド選択
        else if (command === 'selectCommandAfterEvent') {
            // 転職とアイテム使用コマンドを表示
        }
    }
})()