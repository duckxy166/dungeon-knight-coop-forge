(function () {
  'use strict';

  DKRegister.value("classes", {
    melee: {
      name: 'MELEE',
      maxHp: 11,
      maxArmor: 8,
      maxMana: 200,
      manaRegen: 1,
      armorDelay: 540,
      armorTick: 180,
      starter: ['MELEE'],
      shop: {
        MELEE: 2.35,
        GUN: .85,
        ARCHER: .8,
        MAGIC: .8
      },
      trait: 'BASTION TEMPO',
      traitDesc: '+18% melee damage. Swinging reduces damage by 25%; close kills cut armor recovery.',
      desc: 'Faster armor recovery and a close-combat arsenal bias.'
    },
    gunner: {
      name: 'GUNNER / ARCHER',
      maxHp: 7,
      maxArmor: 5,
      maxMana: 200,
      manaRegen: 1,
      armorDelay: 720,
      armorTick: 240,
      starter: ['GUN', 'ARCHER'],
      shop: {
        MELEE: .8,
        GUN: 2.05,
        ARCHER: 2.05,
        MAGIC: .8
      },
      trait: 'DEADEYE RHYTHM',
      traitDesc: '+12% ranged damage and +10% attack speed. Every seventh projectile is a piercing tracer.',
      desc: 'Firearm and bow families surface more often.'
    },
    magic: {
      name: 'MAGIC',
      maxHp: 8,
      maxArmor: 6,
      maxMana: 300,
      manaRegen: 1.72,
      manaTickAmount: 2,
      manaTickFrames: 120,
      manaDropBonus: .07,
      armorDelay: 690,
      armorTick: 225,
      starter: ['MAGIC'],
      shop: {
        MELEE: .78,
        GUN: .82,
        ARCHER: .82,
        MAGIC: 2.4
      },
      trait: 'ARCANE OVERFLOW',
      traitDesc: '+18% magic and status damage. Restore 2 mana every 2 seconds; spending 40 mana releases a free 55% spell echo.',
      desc: 'A 300-mana reserve, a slow personal mana pulse, and a slightly better chance to find mana from defeated enemies.'
    },
    independent: {
      name: 'INDEPENDENT',
      maxHp: 9,
      maxArmor: 7,
      maxMana: 250,
      manaRegen: 1.14,
      armorDelay: 660,
      armorTick: 220,
      starter: ['MELEE', 'GUN', 'ARCHER', 'MAGIC'],
      shop: {
        MELEE: 1.12,
        GUN: 1.12,
        ARCHER: 1.12,
        MAGIC: 1.12
      },
      trait: 'ARSENAL SAVANT',
      traitDesc: '+8% all damage. Changing weapon discipline grants +15% damage and speed for six seconds.',
      desc: 'Balanced odds across every discipline.'
    }
  }, "classes");
})();
