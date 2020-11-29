var areaId = 'AR' + ('000' + $gameVariables.value(13)).slice(-3);
var areaInfo = window.client.master.M_AREA_LIST.find(m => m.areaId === areaId);
var buildInfo = window.client.master.M_BUILDING_LIST.find(m => m.buildId === areaInfo.buildId);
if (buildInfo.canUse) {
 $gameMessage.add('【' + buildInfo.buildMei + '】\n' + buildInfo.memoBuild); this.setWaitMode('message');
 $gameMessage.add('施設「' + buildInfo.buildMei + '」を利用しますか？'); this.setWaitMode('message');
 var buildParam = {id: buildInfo.buildId, efficacy: buildInfo.efficacy, choice: null};
 $gameVariables.setValue(14, buildParam);
} else { $gameMessage.add('この施設は利用することができません。\n行動選択画面へ戻ります。'); this._index = this._list.length; }