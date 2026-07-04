-- ============================================================
-- CoALevelGuide - PvP Guides Database
-- Strategies, macros, and tips for PvP
-- ============================================================

CoALevelGuide_PvPGuides = {
    battlegrounds = {
        {
            name = "Warsong Gulch (Capture the Flag)",
            strategy = "Focus on EFC (Enemy Flag Carrier) and protecting your FC. Controlling the middle area of the map is key to securing flags.",
            tips = {
                "Speed Boosts: Always pick up speed boosts in the side tunnels to escape or chase.",
                "EFC Stacks: Let the enemy flag carrier stack debuffs (increases damage taken over time) before making a massive burst push.",
                "High Ground: Cast ranged spells and CC from the ramp to stall enemies."
            }
        },
        {
            name = "Arathi Basin (Resource Domination)",
            strategy = "Control 3 bases (Blacksmith, Lumber Mill, and Farm/Stables) to secure a steady 3-cap win. Do not over-extend trying to 5-cap.",
            tips = {
                "Lumber Mill: Grants high-ground visibility over the entire map. Use knockbacks (like Typhoon) to throw enemies off the cliff.",
                "Blacksmith: The central hub. Controlling it allows fast rotations to any other node.",
                "Call Out Incomings: Always state the number of incoming enemies in BG chat (e.g. '3 inc LM')."
            }
        },
        {
            name = "Eye of the Storm (Bases & Flag)",
            strategy = "Hold 2 towers and run the central flag. Do not fight in the middle without base control.",
            tips = {
                "Flag Points: Capturing the flag gives points based on how many towers you hold. Only cap if you hold 2+ towers.",
                "Tower Defense: Tower capture speed depends on player count. Stay near towers to defend."
            }
        }
    },
    macros = {
        {
            name = "Focus Kick / Interrupt",
            desc = "Interrupts your focus target without changing your main target. Essential for arena.",
            body = "#showtooltip\n/cast [@focus,harm,nodead][] Kick"
        },
        {
            name = "All-In-One Burst Macro",
            desc = "Pops your DPS cooldowns, trinkets, and primary attack in a single click.",
            body = "#showtooltip\n/use 13\n/use 14\n/cast Shadow Tonic"
        },
        {
            name = "Mouseover Crowd Control (CC)",
            desc = "Casts CC (like Polymorph, Silence, or Fear) on your mouseover target.",
            body = "#showtooltip\n/cast [@mouseover,harm,nodead][] Polymorph"
        }
    },
    tips = {
        "Resilience Cap: Aim for at least 800+ Resilience for arena. Do not socket PvE gems.",
        "Spell Penetration: Caster classes must reach 130 Spell Penetration via gems/cloaks to bypass player resistances.",
        "Keybindings: Unbind S (backpedaling) and bind it to a cooldown. Backpedaling is a PvP death sentence.",
        "Faction Outposts: Kill enemy faction scouts in Eastern Plaguelands to earn free Honor tokens."
    }
}
