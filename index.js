const BROOCHES = [291060, 291061, 291062, 291063, 291064, 291065, 291066, 291067]
const BROOCH_COOLDOWN = 3 * 60;
const BROOCH_CD_DEBUFF = 301807;
const BROOCH_INV_SLOT = 20;
const BROOCH_SKILL_ID = 98150023;

module.exports = function BroochFix(mod) {

    mod.game.initialize("me");
    mod.game.initialize("inventory");

    function isNewBrooch(id)
    {
        return (BROOCHES.indexOf(id) > -1);
    }

    function equipedBrooch()
    {
        return mod.game.inventory.equipment.slots['20'].id;
    }

    function setBroochCooldown(cooldown)
    {
        if (isNewBrooch(equipedBrooch()))
        {
            mod.send("S_START_COOLTIME_ITEM", 1, {
                item: equipedBrooch(),
                cooldown
            })
        }
    }

    function setSkillCooldown(cooldown)
    {
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
        if (event.id == BROOCH_CD_DEBUFF && mod.game.me.is(event.target))
        {
            setSkillCooldown(0);
            setBroochCooldown(0);
        }
    })

    mod.hook("S_ABNORMALITY_BEGIN", 4, event => {
        if (event.id == BROOCH_CD_DEBUFF && mod.game.me.is(event.target))
        {
            setSkillCooldown(parseInt(event.duration));
            let remainder = event.duration % BigInt(1000);
            setTimeout(() => {
                setBroochCooldown(parseInt((event.duration - remainder) / BigInt(1000)));
            }, parseInt(remainder));
        }
    })

    mod.hook("S_START_COOLTIME_SKILL", 3, event => {
        if (event.skill.id == BROOCH_SKILL_ID)
        {
            return false;
        }
    })

    this.destructor = () => {
    }
}