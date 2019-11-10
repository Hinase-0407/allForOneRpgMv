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
     * マップイベントクラスを定義.
     * @param {String} areaId イベントが発生するエリアID
     */
    var MapEvent = function(areaId) {
        this.areaId = areaId;
    };

    /**
     * イベント用のウィンドウを表示.
     */
    MapEvent.prototype.openWindow = function() {
        var areaId = this.areaId;

        // マップの背景表示.
        // 更地の場合は、エリアIDを参照に描画.
        // 施設がある場合は、施設IDを参照に描画.
    };

    /**
     * マップイベントを実施.
     * @param {Object} player イベントを発生させたプレイヤー情報
     */
    MapEvent.prototype.execute = function(player) {};

    /**
     * イベント用のウィンドウを閉じる.
     */
    MapEvent.prototype.closeWindow = function() {};

    // プラグインコマンドの登録
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand

    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args)

        // ここからマップイベント発生のための処理を記入
        if (command === 'ExecuteMapEvent') {
            // メタ情報が登録されていない場合、後続の処理を実行しない.
            if (!this.character(0).event().meta) {
                $gameMessage.add("このイベントのメモ欄に情報がありません。\nメモ欄に「areaId」を記入するか、\n「ExecuteMap」の呼び出し処理を削除してください。\n");
                return;
            }

            // イベント発動マスのエリアIDを取得
            var areaId = this.character(0).event().meta.areaId;

            if (!areaId) $gameMessage.add("エリアIDが設定されていません。\n\n\n");
            $gameMessage.add(areaId);
            // var event = new MapEvent(areaId);

            // event.openWindow();
        }
    }

})()