# แผนเสียง Dungeon Knight — 2026-09-09

สถานะ: วางแผนเท่านั้น ไม่แก้ runtime / ไม่คัดลอกเสียง
ตรวจชื่อไฟล์และจุดทำงานในโค้ดแล้ว; ยังไม่ได้ฟังเสียง จึงเป็น candidate mapping ไม่ใช่ final mix

## 1. แหล่งเสียงจริง

| Alias | โฟลเดอร์ |
|---|---|
| G | `C:\Users\admin\Videos\Edit\01_Audio\SFX\Game` |
| U | `C:\Users\admin\Downloads\JDSherbert - Ultimate UI SFX Pack (FREE)\JDSherbert - Ultimate UI SFX Pack (FREE)\Mono\mp3` |
| K | `C:\Users\admin\Downloads\kenney_impact-sounds\Audio` |

Path 1/3 ที่แจ้งไม่พบ; พบโฟลเดอร์ด้านบนแทน ไม่มีโฟลเดอร์ชื่อ Gamefeel
U ด้านล่างละ prefix `JDSherbert - Ultimate UI SFX Pack - `; ทุกไฟล์ U เป็น `.mp3`
K `000–004` หมายถึงสุ่ม 5 variants `.ogg`; G เป็น `.mp3`

## 2. สภาพโค้ด

- `src/game.js`: combat / loot / shop / progression ไม่มีระบบเสียงกลาง
- `src/editor.js:386–389`: editorAudio ใช้ oscillator; มี click/thump/crack/chime/hiss และ none
- Editor hook `attack`, `prepareVolley`, `afterProjectileHit` และ graph `playSound` เล่นเสียงอยู่แล้ว → ต้องรวมกับระบบกลาง ป้องกันเล่นซ้ำ
- `Player.useActive` เรียก `DKEditorCore.executeSkill` → ติดเสียงหลัง graph สำเร็จ ไม่ใช่ตอนกด E
- Multiplayer มี host simulation, guest prediction และ snapshot → ติดเสียงแค่ simulation ไม่ครอบคลุม guest
- `build.mjs` ทำ standalone HTML → ต้องวางแผนบรรจุเสียงให้ offline ใช้ได้ด้วย

## 3. Mapping: เมนู / UI

| Event | จุดเชื่อม | Candidate |
|---|---|---|
| ui.focus | ui.js focus/hover ของปุ่มที่เปลี่ยนจริง | U Cursor - 1 |
| ui.confirm | ui.js `press`; ปุ่ม lobby/game ที่ bind แยก | U Select - 1 |
| ui.back | กลับเมนู / ยกเลิก dialog | U Cancel - 1 |
| ui.open / close | `openInventory/closeInventory`, `openCraftingUI/closeCraftingUI`, `togglePause`, editor dialog | U Popup Open - 1 / Popup Close - 1 |
| ui.tab | `show`, `setSettingsCategory`, `showPauseView`; recipe/category tab | U Swipe - 1 |
| ui.change | settings toggle/select/keybind หลังค่าเปลี่ยน | U Cursor - 2 |
| ui.error | action ถูกปฏิเสธ, save/import/graph validation ล้มเหลว | U Error - 1 |
| ui.class | lobby.js `chooseClass`, `rollStarter` เมื่อผู้ใช้เลือก | U Select - 2 |
| net.join / leave | lobby.js `room`, diff `roster` | U Popup Open - 1 / Cancel - 2 |
| net.error | `error`, `host-left`, connection เปลี่ยนเป็นขาดจริง | U Error - 1 |
| editor.success | save/export/import/apply สำเร็จ | U Select - 2 |

กฎ: 1 action มีเสียงหลักเดียว; ปุ่มเรียก `.click()` ต่อ เช่น play-menu → local-mode ห้ามดังสองครั้ง
focus throttle 70ms; slider 100ms; error 500ms; ไม่เล่นจาก render/refresh/ping/initial settings hydrate

## 4. Mapping: ผู้เล่น / อาวุธ / การปะทะ

ทุกจุดในตารางนี้อยู่ `src/game.js` เว้นระบุอื่น

| Event | ฟังก์ชัน / เงื่อนไข | Candidate |
|---|---|---|
| player.step | `Player.update` หลังเคลื่อนจริง; ใช้ระยะเดินสะสม | K footstep_concrete_000–004; wood/grass/snow ตามพื้น |
| player.dash | `Player.startDash:1392` | G dash_1 |
| player.blink | `phaseStep` เมื่อเคลื่อนสำเร็จและ action ไม่ได้เล่น dash แล้ว | G dash_2 |
| weapon.equip | `switchWeapon:1188`, เลือกใน inventory | G switch |
| weapon.gun | `fireWeapon:1353` ต่อ volley ที่เกิดจริง | G shot |
| weapon.shotgun | fireWeapon; family shotgun | G shot + K impactPunch_heavy_000–004 เบา ๆ |
| weapon.launcher | family bazooka; ตอนปล่อย ไม่ใช่ตอนกระแทก | G shot เสียงต่ำ; รอฟังความเหมาะสม |
| weapon.melee | `performMelee:1383`; custom attack ที่ไม่ผ่านจุดนี้ใช้ action hook | G dash_2 ชั่วคราว; ขาด sword whoosh เฉพาะ |
| weapon.bow.charge | `processWeaponFiring:1256` เริ่ม charge / ถึงเต็ม ครั้งเดียว | G charge_shot (ต้องฟังว่าเหมาะเป็น charge หรือ release) |
| weapon.bow.release | `releaseBow:1347` / volley; เลือกเจ้าของ event เดียว | G lazer_short ชั่วคราว; ขาด bow release |
| weapon.magic | MAGIC fallback; family / weapon override | G lazer_short |
| weapon.beam | family behavior start/stop ยิงต่อเนื่อง | G lazer_long; ตรวจ loop ก่อนใช้ |
| weapon.special | `runWeaponAction/runWeaponHooks`, unique-weapons และ families | เลือก override ตาม projectile/ธาตุ; fallback ตาม category |
| hit.flesh | `damageEnemy:2029` หลัง block/cancel และมี damage จริง | K impactPunch_medium_000–004 |
| hit.heavy / crit | damageEnemy; crit แทน base หรือเติม accent เดียว | K impactPunch_heavy_000–004 |
| hit.block | `Enemy.blocks` และ branch ยืนยัน blocked ใน caller | K impactMetal_light_000–004 |
| hit.wall / bounce | `Bullet.update`, `handleCollisions` ณ collision จริง | K impactWood_light / impactMetal_light_000–004 ตามวัสดุ |
| explosion.small/medium/large | `explode:1044` ต่อ explosion | G explosion_1_small / explosion_1_medium / explosion_1_large_1–2 |
| lightning | `chainLightning:2008` ต่อ chain ไม่ต่อ target | G thunder_1–4 |
| player.hurt | `Player.hit:1416` มี hpLoss > 0 | K impactSoft_heavy_000–004 |
| armor.hit / break | Player.hit; armorLoss > 0 / armor >0 → 0 | K impactPlate_light / impactMetal_heavy_000–004 |
| player.dodge / shield | Player.hit branch dodge/manaShield/emergencyPlating | G dash_2 / K impactGlass_light_000–004 |
| player.lowHp | Player.hit ข้าม threshold 25%; reset เมื่อ >35% | U Error - 1 เบา ครั้งเดียว; warning เฉพาะยังขาด |
| armor.restore | `updateArmorRegen`; เลือกเต็มเกราะครั้งเดียว ไม่ทุก tick | K impactGlass_light_000–004 |
| enemy.death | `onEnemyKilled:2056` | G enemy_damage_1–2 (ต้องฟังว่าใช้ death ได้ไหม) |
| player.downed / revive | Player.hit / `updatePartyRevives:2744`; Phoenix branch แยก | G fall_1 / heart_get; Phoenix เติม explosion เล็ก |
| player.noMana | `spendMana:1330`, useActive failure | U Error - 1; ใช้ throttle เดิม 700ms |

ปืน burst → ต่อ burst shot; shotgun → 1 เสียงต่อ volley ไม่ต่อ pellet
SMG/AR rate สูง → voice limit; ไม่ใช้ cooldown ยาวจน cadence ขาด
DOT, halo, ward, chain, AoE → รวม hit accent สูงสุดหนึ่งครั้งต่อกลุ่ม/ช่วง 70–120ms
`opts.silent` เดิมต้องอ่าน semantics ก่อนนำมาใช้กับเสียง; อย่าสรุปว่าเป็น audio flag โดยอัตโนมัติ
ห้ามผูกกับ `addParticles`, `addWeaponFlash`, `addImpactFlash`, `draw*`, `updateHUD` เพราะ cosmetic culling/refresh ทำเสียงหายหรือซ้ำ

## 5. Mapping: สกิล / สถานะ

จุดหลัก `Player.useActive:1398` หลัง executeSkill สำเร็จ; ถ้า graph มี playSound ให้เลือก graph หรือ default อย่างใดอย่างหนึ่ง

| Skill ID | Candidate ตอนใช้ |
|---|---|
| aegisPulse | K impactGlass_medium_000–004 |
| frostNova | K impactGlass_heavy_000–004 |
| thunderTotem | K impactWood_heavy_000–004; chain tick ใช้ lightning limiter |
| riftStep | G dash_2 |
| bladeHalo | K impactMetal_medium_000–004 |
| phaseClock | G wobble |
| crimsonSurge | G squelch |
| overclock | G charge_shot |
| echoSeal | G lazer_short |
| singularity | G wobble + explosion_1_small เมื่อจบ ถ้า behavior มี collapse |

- สกิลพร้อมใช้: cooldown >0 → 0 ใน Player.update; U Cursor - 3 เบา เฉพาะ local
- หมด buff/ยกเลิก/ตาย/ออกฉาก: หยุด loop ของ skill นั้น; end cue U Cancel - 2 เบา เฉพาะ buff สำคัญ
- `applyStatus:2016`: burn → explosion_1_small ชั่วคราว; freeze → impactGlass_light; shock → thunder_1 เบา; rift → lazer_short; curse → wobble; poison → squelch
- เล่นเมื่อเริ่มสถานะใหม่; refresh/DOT tick ไม่ดังซ้ำ; ธาตุที่มี hit accent แล้วไม่ซ้อน status อีก
- Passive/core/memory proc: `releasePrimedMemory`, `gainBiomeResonance`, `completeBiomeMemory`, `advanceDungeonMemory`; G charge_shot / jingle_success_2 ตามระดับ สำเร็จครั้งเดียว

## 6. Mapping: โลก / ศัตรู / ความคืบหน้า

| Event | จุดเชื่อม | Candidate |
|---|---|---|
| loot.coin / resource / mana / heal | `grantPickup:591` หลังได้รับจริง | U Cursor - 4 / K impactMining_000–004 / U Cursor - 3 / G heart_get |
| prop.interact / break | `triggerBiomeProp:767`, `hitBiomeProp:788` | K impactWood/Glass/Mining ตามชนิด; break ใช้ heavy |
| hazard.activate | `Hazard.update`, `TimedField.update` ตอนเริ่ม/เตือน | G percolate / thunder / explosion ตาม hazard; ห้ามทุก frame |
| enemy.windup | `beginSignatureAttack:1603`, `beginBiomeVariant:1662` | U Swipe - 2 เบา ชั่วคราว |
| enemy.attack | `executeSignatureAttack`, `executeBiomeVariant`, `enemyShot`, `enemyNova` | G shot / lazer_short; ลดระดับจากผู้เล่น |
| boss.spawn | `spawnBiomeBoss:1994` | K impactBell_heavy_000–004 |
| boss.telegraph / dash / attack | `BiomeBoss.executeCombo`, `beginDash`; content/world/bosses/* | G charge_shot / dash_2 / explosion ตาม pattern |
| boss.phase | `BiomeBoss.update` และ custom boss เปลี่ยน enraged/apex | G explosion_1_large_2 + bell accent |
| palace.cutscene | `startPalaceBossCutscene`, `updatePalaceBossCutscene` ตาม milestone | K impactBell_heavy; G door_open ตามภาพจริง |
| boss.defeat | `onEnemyKilled` isBoss | G jingle_success_3; ไม่ซ้อน enemy death และ wave jingle |
| run.start / wave.start | `startGame:2861`, `startWave:2231`, `spawnWavePhase` | G door_open / U Select - 2; เลือก cue หลักเดียวตอนเริ่ม run |
| wave.clear / next room | `checkWaveClear:2241`, `updateTransition:2252` | G jingle_success_1 / door_close → door_open |
| shop.enter / leave | `openShop:2416`, `leaveShop:2448` | U Popup Open - 1 / G door_open |
| shop.buy | `buyOffer:2425` หลัง transaction สำเร็จ | U Select - 2 |
| shop.reroll | `rerollShop:2434` หลังหักเงิน | U Swipe - 2 |
| forge.success | `forgeEquippedWeapon:2348` | K impactMetal_heavy_000–004 + U Select - 2 |
| craft.success | `craftCurrentRecipe:2384` | K impactMining_000–004 + G jingle_success_2 |
| buy/craft/forge.fail | insufficient / blocked branch เมื่อผู้ใช้พยายาม | U Error - 1; ไม่ดังจาก render eligibility |
| run.end | `endGame:2866` | G jingle_failure_1 เมื่อแพ้; RUN ENDED จากออกเองใช้ U Cancel - 1 |

เสียง boss เฉพาะตัว: override ต่อ boss ID ใน manifest; fallback ตาม windup/projectile/impact เพื่อครอบคลุมบอสทุกตัวโดยไม่สร้าง asset คนละชุด
ศัตรูเดินจำนวนมาก: ปิด footsteps ทั่วไป; เปิดเฉพาะ heavy/boss ใกล้ผู้เล่น

## 7. รูปแบบระบบที่จะทำภายหลัง

- เสนอ `src/audio.js` และ sound manifest; API play(eventId, {eventId, sourceId, x, y, variant, intensity}), stopOwner, setBusVolume
- Manifest: event key → variants, bus, gain, pitchRange, maxVoices, cooldownMs, priority, loop, fallback
- Weapon resolution: explicit graph/weapon override → family → category → generic; none เป็น explicit mute
- คง compatibility editor click/thump/crack/chime/hiss; synth fallback เมื่อไฟล์เสีย/ยังไม่โหลด
- Buses: Master / UI / Combat / World / Music; settings เมนูและ pause ใช้ค่าเดียวกัน เก็บ localStorage
- ค่าเริ่มต้นเสนอ: Master 80%, UI 45%, Combat 70%, World 40%, Music 30%; ต้องจูนหลังฟัง
- หนึ่ง AudioContext; unlock ด้วย pointer/keyboard gesture; decode/cache ครั้งเดียว; preload UI + starter, lazy-load biome/boss
- Initial limit 24 voices, 4 ต่อ event; priority player hurt/boss warning > own attack > nearby enemy > footsteps
- Pitch variation impact ±5%, footstep ±3%; UI/jingle คง pitch; ลด enemy SFX ตามระยะและ pan ซ้ายขวา
- Tab hidden/pause/ออก editor test/leaveToMenu/endGame → stop loops; local pause หยุดโลกแต่ UI ยังดัง; co-op ไม่เปลี่ยนสถานะเกมทั้งห้อง
- Missing file/decode fail → fallback หรือเงียบ พร้อม log ครั้งเดียว; ห้ามทำ action เกมล้มเหลว
- Web build ใช้ asset URL; standalone build ต้อง embed ชุดจำเป็นหรือแจก asset folder แบบเปิดใช้ได้จริง; ห้ามอ้าง absolute path เครื่องผู้พัฒนา

## 8. Co-op: กันซ้ำ / กันหลุด

- World sound จาก host ส่ง event ID + sequence + source + position + variant + timestamp; ไม่ส่ง raw audio
- Local UI/equip/shop settings เล่น local; local predicted attack/dash เล่นทันทีถ้ามี action เกิดจริง
- Host echo กลับมาใช้ action ID เดิม dedupe; remote clients เล่นครั้งเดียว
- `applyNetworkSnapshot:2786` / guestVisualStep ห้าม replay เสียงจากรายการ entity ทั้งก้อน
- ถ้าใช้ snapshot transport ให้แนบ recent event buffer + sequence cursor; dedupe ข้าม snapshot, discard event เก่าเมื่อ reconnect/เข้าเกมกลางทาง
- เหตุการณ์สำคัญ boss/down/revive ใช้ delivery ที่เชื่อถือได้; event ถี่เช่น hit ยอม drop ได้
- Variant randomness แยกจาก gameplay RNG; เสียงปิดต้องไม่เปลี่ยนผล combat

## 9. ช่องว่าง + ลำดับงาน

P0: ฟัง shortlist, trim silence/peak match, ยืนยัน license จาก `_licensing_info.png` และ pack license ก่อนนำไปแจก; ไม่เลือก pokemon/pikachu samples เป็น default
P1: ระบบกลาง + UI + ยิง/ฟัน/hit/dash/เจ็บ/ตาย + volume/mute + build offline
P2: loot/shop/craft/forge + skills/status + waves/boss + co-op event/dedupe
P3: footsteps/material variation + boss identity + final mix

ยังขาด asset เฉพาะ: sword whoosh, bow release, gun family หลายแบบ, burn loop, shield break, boss warning, ambience ราย biome, BGM menu/combat/boss
ใช้ candidate ชั่วคราวที่ระบุได้ แต่ ambience/BGM เว้นเงียบจนเลือกชุดเพิ่ม; ไม่หยิบ Music ข้างเคียงเอง

ตรวจรับตอน implement:
- action ล้มเหลวไม่ดัง success; shotgun 1 cue/volley; melee miss มี swing แต่ไม่มี hit
- ยิงต่อเนื่อง/ฝูงศัตรู/AoE ไม่แตกพร่า; warning ผู้เล่น/บอสยังได้ยิน
- ทุก weapon ID resolve ได้ผ่าน override/family/category; graph playSound ไม่ซ้อน default
- สกิล 10 ตัวครบ; DOT ไม่รัว; cooldown ready ครั้งเดียว; pickups เก็บกองรวม cue
- mouse/keyboard/touch ไม่ซ้ำ; mute ทุก bus และ persist; browser unlock/reload/decode fail
- host + guest 2–4 คน: own/remote shots, down/revive, join mid-run, reconnect ไม่ replay
- pause/resume/เปลี่ยนฉาก/ทดสอบ editor ไม่มี loop ค้าง; web และ standalone ได้ยินเหมือนกัน
