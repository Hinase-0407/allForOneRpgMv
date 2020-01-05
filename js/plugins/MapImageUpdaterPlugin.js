(function() {
    const updateBuilding = (event, buildId) => {
        console.log("[UpdateBuilding]", event, event._tileId);

        const building = window.client.master.M_BUILDING_LIST.find(e => e.buildId === buildId) || {};
        const tileIds = building.tileId;
        if (!tileIds) return;

        const areaId = event.event().name;
        const targets = $gameMap.events().filter(e => e.event().name.indexOf(areaId) >= 0);
        let baseEvent = null;
        targets.forEach((e, i) => {
            if (i === 0) {
                baseEvent = e;
            } else {
                e.erase();
            }
        });

        for (let i = tileIds.length - 1; i >= 0; i--) {
            const line = tileIds[i];
            line.forEach((tileId, iInner) => {
                if (i === tileIds.length - 1 && iInner === 0) {
                    baseEvent.setTileImage(tileId);
                } else {
                    const addIndex = $gameMap.events().length;
                    const newEvent = new Game_Event($gameMap._mapId, addIndex);
                    newEvent.setTileImage(tileId);
                    newEvent.setPosition(baseEvent.x + iInner + 1, baseEvent.y - i);
                    newEvent.refreshBushDepth();
                    $gameMap.events()[addIndex] = newEvent;
                    newEvent.refresh();
                    newEvent.start();
                }
            });
        }
    };

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args)
        if (command === "UpdateBuilding") {
            updateBuilding(args[0], args[1]);
        }
    };
})();