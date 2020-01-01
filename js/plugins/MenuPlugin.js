(function () {
    Window_Base.prototype.drawActorNameForMenu = function(player, x, y, width) {
        width = width || 168;
        this.changeTextColor(this.normalColor());
        this.drawText(player.playerName, x, y, width);
    };

    Window_Base.prototype.drawActorMoney = function(player, x, y) {
        this.changeTextColor(this.systemColor());
        this.drawText("所持金", x, y, 60);
        this.resetTextColor();
        this.drawText(player.money, x + 64, y, 100, 'right');
    };

    Window_Base.prototype.drawLabelValue = function(label, value, x, y, align="right") {
        this.changeTextColor(this.systemColor());
        this.drawText(label, x, y, 60);
        this.resetTextColor();
        this.drawText(value, x + 64, y, 120, align);
    };

    Window_Base.prototype.drawActorIconsForMenu = function(player, x, y, width) {
        width = width || 144;
        this.drawCharacter(player.characterName, player.characterIndex, x, y + 2);
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
        this.drawActorMoney(player, x, y + lineHeight * 1);
        this.drawActorIconsForMenu(player, x - 80, y + lineHeight * 2);
        this.drawActorClassForMenu(player, x2, y);
        this.drawActorHpForMenu(player, x2, y + lineHeight * 1, width2);
        // this.drawActorMp(actor, x2, y + lineHeight * 2, width2);
    };

    Window_MenuStatus.prototype.maxItems = function() {
        if (!window.client) return 0;
        return Object.keys(window.client.playerMap).length;
    };

    Window_MenuStatus.prototype.drawItemStatus = function(index) {
        const playerId = Object.keys(window.client.playerMap)[index];
        const player = window.client.playerMap[playerId];
        var rect = this.itemRect(index);
        var x = rect.x + 162;
        var y = rect.y + rect.height / 2 - this.lineHeight() * 1.5;
        var width = rect.width - x - this.textPadding();
        this.drawActorSimpleStatus(player, x, y, width);
    };
    
    Window_MenuStatus.prototype.drawItem = function(index) {
        this.drawItemBackground(index);
        // this.drawItemImage(index);
        this.drawItemStatus(index);
    };
    
    Window_Selectable.prototype.drawAllItems = function() {
        var topIndex = this.topIndex();
        for (var i = 0; i < this.maxPageItems(); i++) {
            var index = topIndex + i;
            if (index < this.maxItems()) {
                this.drawItem(index);
            }
        }
    };
    
    // ----------------------------------------------------------------------
    // ステータス詳細    
    // ----------------------------------------------------------------------
    Scene_MenuBase.prototype.updateActor = function() {
        this._actor = $gameParty.menuActor();
    };

    Scene_MenuBase.prototype.nextActor = function() {
        // $gameParty.makeMenuActorNext();
        window.client.menuPlayerIndex += 1;
        const playerCount = Object.keys(window.client.playerMap).length;
        if (window.client.menuPlayerIndex >= playerCount) {
            window.client.menuPlayerIndex = playerCount-1;
        }
        this.updateActor();
        this.onActorChange();
    };
    
    Scene_MenuBase.prototype.previousActor = function() {
        // $gameParty.makeMenuActorPrevious();
        window.client.menuPlayerIndex -= 1;
        if (window.client.menuPlayerIndex < 0) {
            window.client.menuPlayerIndex = 0;
        }
        this.updateActor();
        this.onActorChange();
    };
    
    Scene_Status.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this._statusWindow = new Window_Status();
        this._statusWindow.setHandler('cancel',   (this.popScene.bind(this)));
        this._statusWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._statusWindow.setHandler('pageup',   this.previousActor.bind(this));
        this.addWindow(this._statusWindow);
        this.refreshActor();
    };

    Window_Status.prototype.refresh = function() {
        this.contents.clear();
        for (let key in window.client.playerMap) {
            const player = window.client.playerMap[key];
            console.log("[refresh]", player, window.client)
            if (player.playerIndex !== window.client.menuPlayerIndex) continue;

            var lineHeight = this.lineHeight();
            var x1 = 80;
            var x2 = x1 + 220;
            this.drawActorNameForMenu(player, 6, lineHeight * 0);
            this.drawActorClassForMenu(player, x2, lineHeight * 0);
            this.drawHorzLine(lineHeight * 1);

            this.drawActorIconsForMenu(player, 30, lineHeight * 3);
            this.drawActorMoney(player, x1, lineHeight * 2);
            this.drawActorHpForMenu(player, x2, lineHeight * 2, 200);
            this.drawHorzLine(lineHeight * 3);

            this.drawLabelValue("体力", player.params.hp, x1, lineHeight * 4);
            this.drawLabelValue("筋力", player.params.power, x1, lineHeight * 5);
            this.drawLabelValue("知力", player.params.intellect, x1, lineHeight * 6);
            this.drawLabelValue("センス", player.params.sense, x1, lineHeight * 7);
            this.drawLabelValue("魅力", player.params.charm, x1, lineHeight * 8);
            this.drawLabelValue("モラル", player.params.moral, x1, lineHeight * 9);
            this.drawLabelValue("消費率", player.params.consumptionRate, x1, lineHeight * 10);
            this.drawLabelValue("割引率", player.params.discountRate, x1, lineHeight * 11);
            this.drawLabelValue("値引き数値", player.params.discountValue, x1, lineHeight * 12);
            break;
        }
    };
    
    Window_MenuStatus.prototype.processOk = function() {
        window.client.menuPlayerIndex = this.index();
        console.log("[processOk]", window.client)
        Window_Selectable.prototype.processOk.call(this);
    };

})();