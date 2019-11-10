//=============================================================================
// CatGreetingPlugin.js
//=============================================================================

/*:
 * @plugindesc 猫が挨拶してくれるプラグイン
 * @author betto
 *
 * @help
 *
 * プラグインコマンド:
 *   CatGreet id # id番目の猫が挨拶する(idは1オリジン)
 */

(function() {
    //-----------------------------------------------------------------------------
    // Catクラス定義

    var Cat = function(name, message) {
        this.name = name
        this.message = message || 'にゃー'
    }

    // 挨拶用の文字列を返す
    Cat.prototype.greet = function() {
        client.send("addGame", {a: 123});
        return this.name + ": " + this.message;
    }

    //-----------------------------------------------------------------------------
    // プラグイン本体

    // 猫のリスト
    var cats = [
        new Cat('たま'),
        new Cat('シロ', 'みゃ～'),
        new Cat('クロ', '……')
    ]

    // プラグインコマンドの登録
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'CatGreet') {
            console.log(args);
            $gameMessage.add(cats[args - 1].greet())
        }
    }
})()