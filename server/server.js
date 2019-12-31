const PORT = 8009
var WebSocketServer = require('ws').Server
	, http = require('http')
	, express = require('express')
	, app = express();

app.use(express.static(__dirname + '/'));
var server = http.createServer(app);
var wss = new WebSocketServer({server:server});

var Util = require('./js/util.js');
var CONST_M_JOB_LIST = require('./js/constants/m_job_list.js');
var CONST_M_ITEM_LIST = require('./js/constants/m_item_list.js');
var CONST_M_BUILDING_LIST = require('./js/constants/m_building_list.js');
var CONST_M_AREA_LIST = require('./js/constants/m_area_list.js');
var M_JOB_LIST = [...CONST_M_JOB_LIST];
var M_ITEM_LIST = [...CONST_M_ITEM_LIST];
var M_BUILDING_LIST = [...CONST_M_BUILDING_LIST];
var M_AREA_LIST = [...CONST_M_AREA_LIST];

var CONST_INIT_INFO = [
	{x: 12, y: 21, characterName: "Actor1", characterIndex: 0},
	{x: 13, y: 21, characterName: "Actor1", characterIndex: 4},
	{x: 14, y: 21, characterName: "Actor3", characterIndex: 7},
	{x: 15, y: 21, characterName: "Actor3", characterIndex: 6}
];

var CONST_INIT_JOB = M_JOB_LIST.find(e => e.rankId === "JR000"); // TODO: 初期職業

var CONST_INIT_STATUS = {
    playerName: "",
    status: 0, // 0:初期状態, 1:行動可能, 2:ターン終了
    money: 100, // TODO: 初期資金
    map: "AR014", // TODO: 初期位置
    job: CONST_INIT_JOB.rankId,
    jobName: CONST_INIT_JOB.rankMei,
    team: null,
    itemList: [],
    params: {
        hp: 80,
        maxHp: 100,
        power: 0,
        intellect: 0,
        sense: 0,
        charm: 0,
        moral: 0
    }
};

var gameInfo = {
    turn: 1,
    endTurn: 30,
    playerCount: 8
};

var playerMap = {};
var hostConnection = null;
var connectionList = [];

// ----------------------------------------------------------------------
// 全プレイヤーがターン終了したかどうか.
// ----------------------------------------------------------------------
function checkTurnEnd() {
    if (Object.keys(playerMap).length === 0) return false;
    for (let playerId in playerMap) {
        const player = playerMap[playerId];
        if (player.status !== 2) return false;
    }
    return true;
}
// ----------------------------------------------------------------------
// サーバー側の逐次処理.
// ----------------------------------------------------------------------
setInterval(function() {
    sendAll("setPlayerMap", {playerMap: playerMap});
}, 166);
setInterval(() => {
    if (checkTurnEnd()) turnProgress();
}, 1000);

wss.on('connection', function(connection) {
	console.log('connected!');
	if (!hostConnection) hostConnection = connection;
	connectionList.push(connection);
	send(connection, "connected", {playerId: newUuid()});
	connection.on('message', function(message) {
		// console.log(message.toString());
		const d = JSON.parse(message.toString());
		const eventName = d.eventName;
		switch(eventName) {
			case "addGame" :
				const playerId = d.playerId;
				if (!playerMap[playerId]) {
					const playerIndex = Object.keys(playerMap).length;
					if (CONST_INIT_INFO.length <= playerIndex) break;
					const init = CONST_INIT_INFO[playerIndex];
                    playerMap[playerId] = Object.assign({},
                        init,
                        CONST_INIT_STATUS,
                        {
                            playerId: playerId,
                            playerIndex: playerIndex,
                            direction: 5
                        });
				}
				send(connection, "initialize", {
                    player: playerMap[playerId],
                    playerMap: playerMap,
                    gameInfo: gameInfo,
                    master: {
                        M_JOB_LIST: M_JOB_LIST,
                        M_ITEM_LIST: M_ITEM_LIST,
                        M_BUILDING_LIST: M_BUILDING_LIST,
                        M_AREA_LIST: M_AREA_LIST
                   }
                });
				break;
			case "move" :
				const player = playerMap[d.playerId] || {};
				player.x = d.x;
				player.y = d.y;
				player.direction = d.direction;
                break;
            case "setupGameInfo":
                setupGameInfo(d);
                break;
            case "setupCharacterInfo":
                console.log("[setupCharacterInfo]", d)
                setupCharacterInfo(d);
                break;
            case "turnEnd":
                turnEnd(d);
                break;
            case "turnProgress":
                turnProgress();
                break;
            case "moveArea":
                moveArea(d);
                break;
            case "changeJob":
                changeJob(d);
                break;
            case "buyItem":
                buyItem(d);
                break;
            case "useItem":
                useItem(d);
                break;
            case "buyBuild":
                buyBuild(d);
                break;
            case "restHotel":
                restHotel(d);
                break;
            case "getServerData":
                getServerData(d);
                break;
            case "reset":
                reset(d);
                break;
            }
	});
	connection.on('close', function() {
		console.log('disconnected...');
		removeConnection(connection);
	});
});

server.listen(PORT);

/**
 * サーバの情報をゲーム端末へ送信.
 * @param {Object} data 
 */
function getServerData(data) {
    (key)
}
// ----------------------------------------------------------------------
// プレイヤーリストを取得.
// ----------------------------------------------------------------------
function getPlayerList() {
	var obj = {};
	obj.playerList = [];
	var keys = Object.keys(playerInfoMap);
	for (var i = 0; i < keys.length; i++) {
		var playerId = keys[i];
		obj.playerList.push(playerInfoMap[playerId]);
	}
	return obj;
}
// ----------------------------------------------------------------------
// コネクションを除去する処理.
// ----------------------------------------------------------------------
function removeConnection(connection) {
	for (var i = connectionList.length - 1; i >= 0; i--) {
		if (connectionList[i] === connection) {
			connectionList.splice(i, 1);
		}

		// ホスト破棄
		if (hostConnection === connection) {
			hostConnection = null;
		}
	}
}
// ----------------------------------------------------------------------
// 接続中のすべてのクライアントに送信.
// ----------------------------------------------------------------------
function sendAll(eventName, sendData) {
	for (var i = connectionList.length - 1; i >= 0; i--) {
		var connection = connectionList[i];
		send(connection, eventName, sendData);
	}
}
// ----------------------------------------------------------------------
// 特定のクライアント以外に送信.
// ----------------------------------------------------------------------
function sendWithoutSelf(connection, eventName, sendData) {
	for (var i = connectionList.length - 1; i >= 0; i--) {
		if (connectionList[i] !== connection) {
			send(connectionList[i], eventName, sendData);
		}
	}
}
// ----------------------------------------------------------------------
// 特定のクライアントに送信.
// ----------------------------------------------------------------------
function send(connection, eventName, sendData) {
	if (!connection) return;
	sendData.eventName = eventName;
	try {
		var json = JSON.stringify(sendData);
		//console.log(json);
		connection.send(json);
	} catch (e) {
		removeConnection(connection);
	}
}
// ----------------------------------------------------------------------
// ホストに送信.
// ----------------------------------------------------------------------
function sendHost(sendData) {
	if (!hostConnection) return;
	try {
		sendData.eventName = "hostUpdate";
		var json = JSON.stringify(sendData);
		//console.log(json);
		hostConnection.send(json);
	} catch (e) {
		removeConnection(hostConnection);
	}
}
// ----------------------------------------------------------------------
// UUID生成.
// ----------------------------------------------------------------------
function newUuid() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
		.split("")
		.map(d =>
			d === "x" ? Math.floor(Math.random() * 16).toString(16) :
			d === "y" ? (Math.floor(Math.random() * 4) + 8).toString(16) : d)
		.join("");
}
// ----------------------------------------------------------------------
// ゲーム開始時の設定.
// ----------------------------------------------------------------------
function reset() {
    M_JOB_LIST = [...CONST_M_JOB_LIST];
    M_ITEM_LIST = [...CONST_M_ITEM_LIST];
    M_BUILDING_LIST = [...CONST_M_BUILDING_LIST];
    M_AREA_LIST = [...CONST_M_AREA_LIST];
    playerMap = {};
}
// ----------------------------------------------------------------------
// ゲーム開始時の設定.
// ----------------------------------------------------------------------
function setupGameInfo(d) {
    Object.assign(gameInfo, d.gameInfo);
}
// ----------------------------------------------------------------------
// ゲーム開始時のプレイヤー設定.
// ----------------------------------------------------------------------
function setupCharacterInfo(d) {
    Object.assign(playerMap[d.playerId], d.characterInfo);
}
/**
 * ターン終了.
 */
function turnEnd(d) {
    playerMap[d.playerId].status = 2; // ターン終了
}
/**
 * ターン経過.
 * 各プレイヤ : money +物件収入 & hp +2
 * ターン数: +1
 */
function turnProgress() {
    console.log("[turnProgress] next turn.");
    
    // 各プレイヤーに収益処理・体力回復
    for (let playerId in playerMap) {
        var player = playerMap[playerId];
        // 物件収入
        var incomeByBuilds = sumIncomeByBuilds(player);
        player.money = fluctuationParamByInteger(player.money, incomeByBuilds, "money");
        // 給与
        incomeByJob(player);
        // 体力回復処理
        player.params.hp = fluctuationParamByInteger(player.params.hp, 2, "hp");
        player.status = 1; // 行動可能
    }
    // ターン数増加
    gameInfo.turn ++;

    if (gameInfo.turn === gameInfo.endTurn) {
        sendAll("gameover", {
            gameInfo: gameInfo,
            playerMap: playerMap
        });
    } else {
        sendAll("turnProgress", {gameInfo: gameInfo});
    }
}
/**
 * マップ移動.
 * @param {*} data
 */
function moveArea(data) {
    console.log("move area.");
    console.log(data);
    var player = playerMap[data.playerId];
    
    // 移動処理
    var mapObject = getObjectByList(M_AREA_LIST, "areaId", data.areaId);
    player.map = mapObject.areaId;
    player.params.hp = fluctuationParamByInteger(player.params.hp, -1, "hp");
}
/**
 * 転職.
 * @param {*} data
 */
function changeJob(data) {
    console.log("change Job.");
    console.log(data);
    var player = playerMap[data.playerId];

    // 転職処理
    var jobObject = getObjectByList(M_JOB_LIST, "rankId", data.rankId);
    player.job = jobObject.rankId;
}
/**
 * アイテム購入.
 * @param {*} data
 */
function buyItem(data) {
    console.log("buyItem");
    console.log(data);
    var player = playerMap[data.playerId];
    var item = getObjectByList(M_ITEM_LIST, "itemId", data.itemId);
    var area = getObjectByList(M_AREA_LIST, "areaId", player.map);
    
    // 支払い処理
    var areaBonus = (player.map === area.playerId) ? 2 : 1;
    var price = (item.price / areaBonus) * data.count;
    player.money = fluctuationParamByInteger(player.money, price, "money");
    
    // 所持数変更処理
    var isExist = fluctuationItem(player.itemList, data.itemId, data.count);
}
/**
 * アイテム売却.
 * @param {*} data
 */
function saleItem(data) {
    console.log("sellItem");
    console.log(data);
    var player = playerMap[data.playerId];
    var item = getObjectByList(M_ITEM_LIST, "itemId", data.itemId);
    var area = getObjectByList(M_AREA_LIST, "areaId", player.map);
    
    // 収入処理
    var areaBonus = (player.map === area.playerId) ? 2 : 1;
    var price = ((item.price / 2) * areaBonus) * data.count;
    player.money = fluctuationParamByInteger(player.money, price, "money");
    
    // 所持数変更処理
    fluctuationItem(player.itemList, data.itemId, data.count);
}
/**
 * アイテム使用.
 * @param {*} data
 */
function useItem(data) {
    console.log("useItem");
    console.log(data);
    var player = playerMap[data.playerId];

    // 所持数変更処理
    var isExist = fluctuationItem(player.itemList, data.itemId, -1);
    // アイテムの効果発動
    if (isExist) {
        var itemMaster = getObjectByList(M_ITEM_LIST, "itemId", data.itemId);
        var efficacyKeys = Object.keys(itemMaster.efficacy);
        for (var i = 0; i < efficacyKeys.length; i++) {
            var key = efficacyKeys[i];
            player.params[key] += itemMaster.efficacy[key];
        }
    }
}
/**
 * 物件購入.
 * @param {*} data
 */
function buyBuild(data) {
    console.log("buyBuild.");
    var player = playerMap[data.playerId];
    var area = getObjectByList(M_AREA_LIST, "areaId", player.map);
    var build = getObjectByList(M_BUILDING_LIST, "buildId", data.buildId);
    
    // 購入・買収チェック
    var buyCost = (!area.playerId || area.playerId === data.playerId) ? 1 : 3;
    // 金額チェック
    var canBuy = build.cost * buyCost <= player.money;
    // 建設条件チェック
    var canBuild = (build.population <= area.population) && (build.security <= area.security);
    
    // 全てのチェックがOKだったら購入
    if (canBuy && canBuild) {
        player.money = fluctuationParamByInteger(player.money, (build.cost * buyCost), "money");
        area.playerId = data.playerId;
        area.buildId = data.buildId;
    } else {
        if (!canBuy) console.log("購入費用が不足しています。");
        if (!canBuild) console.log("施設設置条件を満たしていません。");
    }
}
/**
 * 宿泊施設利用処理.
 * @param {*} data
 */
function restHotel(data) {
    console.log("restHotel.");
    var player = playerMap[data.playerId];
    var area = getObjectByList(M_AREA_LIST, "areaId", player.map);
    var build = getObjectByList(M_BUILDING_LIST, "buildId", data.buildId);
    // 回復処理
    player.params.hp = fluctuationParamByInteger(player.params.hp, 20, "hp");
}
/**
 * 物件収入合計値計算.
 * @param {Object} player 対象のプレイヤーオブジェクト
 * @returns 収入合計数値
 */
function sumIncomeByBuilds(player) {
    var haveArea = getObjectsByList(M_AREA_LIST, "playerId", player.playerId);
    
    // 所有する物件の収入を合計
    var income = 0;
    for (var i in haveArea) {
        var area = haveArea[i];
        income += (area.buildId * area.level);
    }
    return income;
}
/**
 * 給与（お金＋アイテム取得）.
 * @param {Object} player 対象のプレイヤーオブジェクト
 */
function incomeByJob(player) {
    console.log(player.job);
    var jobInfo = getObjectByList(M_JOB_LIST, "rankId", player.job);
    
    // 所持金加算
    console.log(jobInfo);
    player.money = fluctuationParamByInteger(player.money, jobInfo.money, "money");
    
    // アイテム取得
    var jobItemList = getObjectsByList(M_ITEM_LIST, "classId", jobInfo.classId);
    if (0 < jobItemList.length) {
        var randomNum1 = Math.floor(Math.random() * jobItemList.length);
        fluctuationItem(player.itemList, jobItemList[randomNum1].itemId, 1);
        if (player.classId === "JB040") {
            var randomNum2 = NaN;
            do {
                randomNum2 = Math.floor(Math.random() * jobItemList.length);
            } while (randomNum1 === randomNum2);
            fluctuationItem(player.itemList, jobItemList[randomNum2].itemId, 1);
        }
    }
}
// ----------------------------------------------------------------------
// 共通処理.
// ----------------------------------------------------------------------
/**
 * リスト内のオブジェクトを取得.
 * @param {Array} list 検索対象リスト
 * @param {String} className 検索対象リストのクラス名
 * @param {String} key 検索する値
 * @returns {Object} 検索結果
 */
function getObjectByList(list, className, key) {
    for (var i = 0; i < list.length; i++) {
        var tmp = list[i];
        if (tmp[className] === key) {
            return tmp;
        }
    }
    return null;
}
/**
 * リスト内のオブジェクトをリストで取得.
 * @param {Array} list 検索対象リスト
 * @param {String} className 検索対象リストのクラス名
 * @param {String} key 検索する値
 * @returns {Array} 検索結果
 */
function getObjectsByList(list, className, key) {
    var resultList = [];
    for (var i = 0; i < list.length; i++) {
        var tmp = list[i];
        if (tmp[className] === key) {
            resultList.push(tmp);
        }
    }
    return resultList;
}
/**
 * 対象の数値を増減させる.
 * @param {Number} target 数値を増減させる対象
 * @param {Number} int 増減値
 * @param {String} type 対象の内容（param, item, level, build, hp）
 * @return {Number} target + int の結果
 */
function fluctuationParamByInteger(target, int, type) {
    // 基準値設定（多用される type === "param" を使用）
    var max = NaN;
    var min = NaN;
    if (type === "param") max = 999, min = 0;
    else if (type === "item") max = 10, min = 0;
    else if (type === "level") max = 5, min = 1;
    else if (type === "build") max = 99999;
    else if (type === "hp") max = 100;
    
    // 増減処理
    var result = Number(target) + Number(int);
    if (max < result) result = max;
    else if (result < min) result = min;
    
    console.log("type: " + type + ", before: " + Number(target) + ", after: " + result + ", integer: " + Number(int));
    return result;
}
/**
 * 所持アイテム増減処理.
 * @param {Array} itemList 対象プレイヤーのアイテムリスト
 * @param {String} itemId 増減対象のアイテムID
 * @param {Number} int 増減個数
 * @returns {Boolean} 増減処理の実施可否
 */
function fluctuationItem (itemList, itemId, int) {
    if (int === 0) return false;
    var targetItem = getObjectByList(itemList, "itemId", itemId);
    
    // すでに所有済みのアイテムを増減させる
    if (targetItem) {
        console.log("change itemCount By player's itemList.");
        // 増加処理の場合、所持数を上回る数の増加は受け付けない
        if (0 < int && 10 < targetItem.count + int) return false;
        // 減少処理の場合、所持数未満の減少を受け付けない
        else if (int < 0 && targetItem.count + int < 0) return false;
        
        targetItem.count += int;
        
        // アイテム数が0になった場合、アイテムリストから対象を削除
        if (targetItem.count === 0) {
            console.log("delete item By player's itemList.");
            for (var i in itemList) {
                if (itemList[i].itemId === targetItem.itemId) itemList.splice(i, 1);
            }
        }
        return true;
    }
    
    // 持っていないアイテムの増加処理の場合、新規追加
    else if (!targetItem && 0 < int) {
        console.log("add item By player's itemList.");
        console.log(itemId);
        var item = {
        itemId: itemId,
        count: int
        };
        itemList.push(item);
        return true;
    }
    return false;
}
/**
 * 2人のプレイヤーが同じチームかどうか真偽値を返す.
 * @param {Object} player1 比較対象のプレイヤー1
 * @param {Object} player2 比較対象のプレイヤー2
 */
function isSameTeam(player1, player2) {
    return true;
}
/**
 * 対象のリストに登録されたクラスの数値を合計して返す.
 * @param {Array} list 対象のリスト
 * @param {String} sumClass 合計対象のリストの名称
 */
function sumListClassValue(list, sumClass) {
    var sumVal = 0;
    for (var i = 0, len = list.length; i < len; i++) {
        var tmp = list[i];
        sumVal += Number(tmp[sumClass]);
    }
    return sumVal;
}
/*
 土地購入・所有者表示
 土地収益処理
 増資処理
 施設レベルアップ
 */
