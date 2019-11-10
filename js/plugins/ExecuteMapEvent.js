//=============================================================================
// ExecuteMapEvent.js
//=============================================================================

/*:
 * @plugindesc マップイベントを実行するプラグイン.
 * @author hinase
 *
 * @help
 *
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
    MapEvent.prototype.openWindow = function() {};

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
            // イベント発動マスのエリアIDを取得
            var areaId = this.character(0).event().meta.areaId;

            console.log(this.character(0).event().meta);
            $gameMessage.add(areaId);
            // var event = new MapEvent(areaId);

            // event.openWindow();
        }
    }

})()