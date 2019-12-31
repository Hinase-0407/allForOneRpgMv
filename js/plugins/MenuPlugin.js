(function () {
    Window_Base.prototype.drawActorNameForMenu = function(player, x, y, width) {
        width = width || 168;
        this.changeTextColor(this.normalColor());
        this.drawText(player.playerName, x, y, width);
    };

    Window_Base.prototype.drawActorLevelForMenu = function(player, x, y) {
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.levelA, x, y, 48);
        this.resetTextColor();
        this.drawText("{レベル}", x + 84, y, 36, 'right');
    };

    Window_Base.prototype.drawActorIconsForMenu = function(player, x, y, width) {
        width = width || 144;
        this.drawCharacter(player.characterName, player.characterIndex, x - 80, y + 2);
    };

    Window_Base.prototype.drawActorClassForMenu = function(player, x, y, width) {
        width = width || 168;
        this.resetTextColor();
        this.drawText(player.jobName, x, y, width);
    };

    Window_Base.prototype.drawActorHpForMenu = function(player, x, y, width) {
        if (!player) return;
        width = width || 186;
        var color1 = this.hpGaugeColor1();
        var color2 = this.hpGaugeColor2();
        const hpRate = player.params.hp / player.params.maxHp;
        this.drawGauge(x, y, width, hpRate, color1, color2);
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.hpA, x, y, 44);
        this.drawCurrentAndMax(player.params.hp, player.params.maxHp, x, y, width,
            this.normalColor(), this.normalColor());
    };
    
    Window_Base.prototype.drawActorSimpleStatus = function(player, x, y, width) {
        var lineHeight = this.lineHeight();
        var x2 = x + 180;
        var width2 = Math.min(200, width - 180 - this.textPadding());
        this.drawActorNameForMenu(player, x, y);
        this.drawActorLevelForMenu(player, x, y + lineHeight * 1);
        this.drawActorIconsForMenu(player, x, y + lineHeight * 2);
        this.drawActorClassForMenu(player, x2, y);
        this.drawActorHpForMenu(player, x2, y + lineHeight * 1, width2);
        // this.drawActorMp(actor, x2, y + lineHeight * 2, width2);
    };

    Window_MenuStatus.prototype.maxItems = function() {
        if (!window.client) return 0;
        return Object.keys(window.client.playerMap).length;
    };

    Window_MenuStatus.prototype.drawItemStatus = function(index) {
        var actor = $gameParty.members()[index];
        const playerId = Object.keys(window.client.playerMap)[index];
        const player = window.client.playerMap[playerId];
        var rect = this.itemRect(index);
        var x = rect.x + 162;
        var y = rect.y + rect.height / 2 - this.lineHeight() * 1.5;
        var width = rect.width - x - this.textPadding();
        this.drawActorSimpleStatus(player, x, y, width);
    };
    
    Window_MenuStatus.prototype.drawItem = function(index) {
        console.log("[drawItem]", index)
        this.drawItemBackground(index);
        // this.drawItemImage(index);
        this.drawItemStatus(index);
    };
    
    Window_Selectable.prototype.drawAllItems = function() {
        console.log("[dataMap]", $dataMap)
        console.log("[gameMap]", $gameMap)
        var topIndex = this.topIndex();
        for (var i = 0; i < this.maxPageItems(); i++) {
            var index = topIndex + i;
            if (index < this.maxItems()) {
                this.drawItem(index);
            }
        }
    };
    
})();