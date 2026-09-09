(function(){'use strict';DKRegister.value("stats",{
        vitality: { name: 'VITALITY', icon: '+', rarity: 'common', price: 24, desc: '+3 max HP and heal 3.', apply: function (p) { p.maxHp += 3; p.hp = Math.min(p.maxHp, p.hp + 3); } },
        muscle: { name: 'RAW POWER', icon: '▲', rarity: 'common', price: 26, desc: '+15% all damage.', apply: function (p) { p.stats.damage += .15; } },
        reflex: { name: 'QUICK HANDS', icon: '»', rarity: 'common', price: 25, desc: '+14% attack speed.', apply: function (p) { p.stats.attackSpeed += .14; } },
        boots: { name: 'DUNGEON BOOTS', icon: '›', rarity: 'common', price: 22, desc: '+10% move speed.', apply: function (p) { p.stats.speed += .10; } },
        focus: { name: 'FOCUS LENS', icon: '◎', rarity: 'uncommon', price: 34, desc: '+10% critical chance.', apply: function (p) { p.stats.crit += .10; } },
        armor: { name: 'IRON SKIN', icon: '◆', rarity: 'uncommon', price: 36, desc: '+1.5 resistance. Each point softens incoming damage.', apply: function (p) { p.stats.armor += 1.5; } },
        luck: { name: 'GILDED DICE', icon: '⚄', rarity: 'uncommon', price: 38, desc: '+18 luck, improving future Armory rarity.', apply: function (p) { p.stats.luck += 18; } },
        magnet: { name: 'COIN MAGNET', icon: '∪', rarity: 'common', price: 24, desc: '+110 pickup range.', apply: function (p) { p.stats.pickup += 110; } },
        manaWell: { name: 'MANA WELL', icon: '≈', rarity: 'uncommon', price: 36, desc: '+35 max mana and restore 35.', apply: function (p) { p.maxMana += 35; p.mana = Math.min(p.maxMana, p.mana + 35); } },
        channeling: { name: 'CHANNELING', icon: '∿', rarity: 'rare', price: 50, desc: '+35% mana restored by pickups.', apply: function (p) { p.stats.manaRegen += .35; } },
        vampirism: { name: 'VAMPIRISM', icon: '♥', rarity: 'rare', price: 58, desc: '+2.5% life steal from direct damage.', apply: function (p) { p.stats.lifesteal += .025; } },
        evasion: { name: 'SHADOW STEP', icon: '○', rarity: 'rare', price: 54, desc: '+9% dodge chance.', apply: function (p) { p.stats.dodge += .09; } }
    },"skills/stats");}());
