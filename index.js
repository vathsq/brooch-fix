const BROOCHES = [291060, 291061, 291062, 291063, 291064, 291065, 291066, 291067, 293007]
const BROOCH_COOLDOWN = 3 * 60;
const BROOCH_CD_DEBUFF = 301807;
const BROOCH_INV_SLOT = '20';
const BROOCH_SKILL_ID = 98150023;
const RESET_BUFFS = [303401008, 45000116] // bomb, velik's
module.exports = function BroochFix(mod) {

    mod.game.initialize("me");
    mod.game.initialize("inventory");

    let timer_abn_begin = null;
    function isNewBrooch(id) {
        return (BROOCHES.indexOf(id) > -1);
    }

    function equipedBrooch() {
        return mod.game.inventory.equipment.slots[BROOCH_INV_SLOT] ? mod.game.inventory.equipment.slots[BROOCH_INV_SLOT].id : -1;
    }

    function setBroochCooldown(cooldown) {
        if (isNewBrooch(equipedBrooch())) {
            mod.send("S_START_COOLTIME_ITEM", 1, {
                item: equipedBrooch(),
                cooldown
            })
        }
    }

    function setSkillCooldown(cooldown) {
        mod.send("S_START_COOLTIME_SKILL", 3, {
            skill: {
                type: 1,
                id: BROOCH_SKILL_ID
            },
            cooldown
        })
    }

    mod.hook("S_START_COOLTIME_ITEM", 1, event => {
        if (isNewBrooch(event.item)) {
            setSkillCooldown(BROOCH_COOLDOWN * 1000);
            event.cooldown = BROOCH_COOLDOWN;
            return true;
        }
    });

    mod.hook("S_ABNORMALITY_END", 1, event => {
        if (event.id == BROOCH_CD_DEBUFF && mod.game.me.is(event.target)) {
            mod.clearTimeout(timer_abn_begin);
            setSkillCooldown(0);
            setBroochCooldown(0);
        }
    })

    mod.hook("S_ABNORMALITY_BEGIN", 4, event => {
        if (event.id == BROOCH_CD_DEBUFF && mod.game.me.is(event.target)) {
            setSkillCooldown(parseInt(event.duration));
            let remainder = event.duration % BigInt(1000);
            timer_abn_begin = mod.setTimeout(() => {
                setBroochCooldown(parseInt((event.duration - remainder) / BigInt(1000)));
            }, parseInt(remainder));
        }

        if (mod.game.me.is(event.target) && RESET_BUFFS.indexOf(event.id) != -1) {
            if (timer_abn_begin != null) {
                mod.clearTimeout(timer_abn_begin);
            }
            setSkillCooldown(0);
            setBroochCooldown(0);
        }
    })

    mod.hook("S_START_COOLTIME_SKILL", 3, event => {
        if (event.skill.id == BROOCH_SKILL_ID) {
            if (event.cooldown > 156000) {
                event.cooldown = BROOCH_COOLDOWN * 1000;
                return true;
            }
            if (event.cooldown == 0) {
                setBroochCooldown(0)
                return;
            }
            return false;
        }
    })

    // stun fix by ?
    const { player } = mod.require.library;

    mod.hook('C_NOTIMELINE_SKILL', 3, event => {
        if (event.skill.id == BROOCH_SKILL_ID) {
            useBrooch();
            return false
        }
    })

    function useBrooch() {
        if (isNewBrooch(equipedBrooch())) {
            mod.send('C_USE_ITEM', 3, {
                gameId: mod.game.me.gameId,
                id: equipedBrooch(),
                amount: 1,
                loc: player.loc,
                w: player.loc.w,
                unk4: true
            })
        }
    }

    this.destructor = () => {
    }
}