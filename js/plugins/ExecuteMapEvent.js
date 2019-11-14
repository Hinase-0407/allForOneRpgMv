//=============================================================================
// ExecuteMapEvent.js
//=============================================================================

/*:
 * @plugindesc マップイベントを実行するプラグイン.
 * @author hinase
 * @varsion 1.0.0
 *
 * @help プラグインコマンドにこのプラグイン名を記入することで発動します。呼び出すイベントのメモ欄に"areaId"というメタデータを記入が必要です。
 * @memo 1.0.0 マップイベントクラス作成. 呼び出し処理追加. ウィンドウ開閉処理追加.(author by.hinase)
 */

(function() {

    /**
     * マップイベントクラス.
     * @param {String} areaId イベントが発生するエリアID
     */
    var MapEvent = function(areaId) {
        this.areaId = areaId;
    };

    /**
     * イベント用のウィンドウを表示.
     */
    MapEvent.prototype.openAreaWindow = function() {
        var areaId = this.areaId;
    
        // マップの背景表示用変数の定義.
        var pictDown = "";
        var pictUp = "";

        // 施設がある場合は、施設IDを参照に描画.
        // 更地の場合は、エリアIDを参照に描画.
        switch (areaId) {
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

        // マップの背景表示.
        // ImageManager.loadBattleback1(pictDown);
        // ImageManager.loadBattleback2(pictUp);
        $gameMap.changeBattleback(pictDown, pictUp);
    };

    /**
     * マップイベントを実施.
     * @param {Object} player イベントを発生させたプレイヤー情報
     */
    MapEvent.prototype.executeAreaEvent = function(player) {
        var areaId = this.areaId;
    };

    /**
     * イベント用のウィンドウを閉じる.
     */
    MapEvent.prototype.closeAreaWindow = function() {
        ImageManager.clear();
    };

    // プラグインコマンドの登録
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand

    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args)

        // マップ移動前のコマンド選択
        if (command === 'MoveMap') {}

        // マップ移動処理
        else if (command === 'MoveMap') {
            // 状態に応じて移動エリア数上限を設定
            // プレイヤーのエリア移動数を0に初期化
        }

        // 移動完了＆収入処理
        else if (command === 'GetIncome') {
            // マップ移動処理開始
            // 状態に応じて移動エリア数上限を設定
            // プレイヤーのエリア移動数を0に初期化
        }

        // エリア処理
        else if (command === 'ExecuteMapEvent') {
            // メタ情報が登録されていない場合、後続の処理を実行しない.
            if (!this.character(0).event().meta) {
                $gameMessage.add("このイベントのメモ欄に情報がありません。\nメモ欄に「areaId」を記入するか、\n「ExecuteMap」の呼び出し処理を削除してください。\n");
                return;
            }

            // イベント発動マスのエリアIDを取得
            var areaId = this.character(0).event().meta.areaId;
            // イベント実行中のプレイヤー情報を取得

            // マップイベント処理を実施
            var event = new MapEvent(areaId);
            event.openAreaWindow();
            $gameMessage.add(areaId);   // テスト用としてテキストを表示
            // event.executeAreaEvent(player);
            event.closeAreaWindow();
        }
    }

})()