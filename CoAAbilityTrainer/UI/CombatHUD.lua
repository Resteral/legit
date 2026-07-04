-- ============================================================
-- CoAAbilityTrainer - Combat HUD (Modular & Customizable Overhaul)
-- A completely transparent WeakAuras-style master container
-- ============================================================

CoAAT_CombatHUD = {}

local HUD_W = 400
local _hud = nil

-- ─────────────────────────────────────────────
-- Build the HUD container
-- ─────────────────────────────────────────────
function CoAAT_CombatHUD.Build()
    local hud = CreateFrame("Frame", "CoAATCombatHUD", UIParent)
    hud:SetSize(HUD_W, 340)
    hud:SetFrameStrata("MEDIUM")
    hud:SetToplevel(true)
    hud:SetMovable(true)
    hud:EnableMouse(true)
    hud:RegisterForDrag("LeftButton")
    
    hud:SetScript("OnDragStart", function(self) self:StartMoving() end)
    hud:SetScript("OnDragStop", function(self)
        self:StopMovingOrSizing()
        local pt, _, _, x, y = self:GetPoint()
        if CoAAT_DB then CoAAT_DB.hudPos = { point=pt, x=x, y=y } end
    end)

    -- Restore saved position or default to Lower-Center
    if CoAAT_DB and CoAAT_DB.hudPos then
        local p = CoAAT_DB.hudPos
        hud:SetPoint(p.point or "CENTER", UIParent, p.point or "CENTER", p.x or 0, p.y or 0)
    else
        hud:SetPoint("CENTER", UIParent, "CENTER", 0, -150)
    end

    -- Transparent backdrop (Only visible when out of combat for dragging)
    local dragBG = hud:CreateTexture(nil, "BACKGROUND")
    dragBG:SetAllPoints()
    dragBG:SetTexture(0, 0, 0, 0.4)
    dragBG:SetAlpha(1)
    hud._dragBG = dragBG

    -- Outer border glow
    local borderTex = hud:CreateTexture(nil, "ARTWORK")
    borderTex:SetSize(HUD_W + 4, 344)
    borderTex:SetPoint("CENTER", hud, "CENTER", 0, 0)
    borderTex:SetTexture(0.0, 0.5, 0.9, 0.25)
    hud._border = borderTex

    -- Drag instructions (hidden in combat)
    local dragHint = hud:CreateFontString(nil, "OVERLAY", "GameFontNormal")
    dragHint:SetPoint("TOP", hud, "TOP", 0, -5)
    dragHint:SetFont("Fonts\\FRIZQT__.TTF", 10, "OUTLINE")
    dragHint:SetText("|cff00ccffCoA Ability Trainer|r\n|cffaaaaaaDrag to move. Disappears in combat.|r")
    hud._dragHint = dragHint

    -- ── Section containers ──

    -- 1. Rotation Helper (Top suggested floating icon, 50px)
    local rotSection = CreateFrame("Frame", nil, hud)
    rotSection:SetSize(HUD_W, 50)
    hud._rotSection = rotSection

    -- 2. Aura grid (Main horizontal row, 34px)
    local auraSection = CreateFrame("Frame", nil, hud)
    auraSection:SetSize(HUD_W, 34)
    hud._auraSection = auraSection

    -- 3. Resource bar (Below Auras, 14px)
    local resSection = CreateFrame("Frame", nil, hud)
    resSection:SetSize(HUD_W, 14)
    hud._resSection = resSection

    -- 4. Casting Bar (Below Resource, 20px)
    local castSection = CreateFrame("Frame", nil, hud)
    castSection:SetSize(HUD_W, 20)
    hud._castSection = castSection

    -- 5. Cooldown strip (Bottom, 44px)
    local cdSection = CreateFrame("Frame", nil, hud)
    cdSection:SetSize(HUD_W, 44)
    hud._cdSection = cdSection

    -- Build sub-panels inside their sections
    CoAAT_RotationHelper.Build(rotSection)
    CoAAT_AuraDisplay.Build(auraSection)
    CoAAT_ResourceBar.Build(resSection, 0, -6)
    CoAAT_CastingBar.Build(castSection)
    CoAAT_CooldownTracker.Build(cdSection)
    CoAAT_ProcAlert.Build()  -- builds floating overlay

    hud:SetScript("OnUpdate", function(self, dt)
        CoAAT_Engine.OnUpdate(dt)
        
        -- Hide drag backgrounds during combat
        if CoAAT_Engine.IsInCombat() then
            self._dragBG:SetAlpha(0)
            self._dragHint:SetAlpha(0)
            self._border:SetTexture(0.0, 0.6, 1.0, 0.0) -- No border in combat
        else
            self._dragBG:SetAlpha(1)
            self._dragHint:SetAlpha(1)
            self._border:SetTexture(0.0, 0.5, 0.9, 0.25)
        end
    end)

    _hud = hud
    CoAAT_CombatHUD._hud = hud

    -- Apply customization layouts
    CoAAT_CombatHUD.RefreshLayout()

    return hud
end

-- ─────────────────────────────────────────────
-- Dynamically show/hide sections, resize HUD, apply scale/alpha
-- ─────────────────────────────────────────────
function CoAAT_CombatHUD.RefreshLayout()
    local hud = _hud
    if not hud then return end

    local db = CoAAT_DB or {
        hudScale = 1.0,
        hudAlpha = 1.0,
        showAuras = true,
        showRotHelper = true,
        showResourceBar = true,
        showCooldowns = true
    }

    -- Apply Scale and Alpha
    hud:SetScale(db.hudScale or 1.0)
    hud:SetAlpha(db.hudAlpha or 1.0)

    -- Determine layout Y offsets dynamically (preventing blank gaps)
    local yOffset = -30

    -- 1. Rotation Helper (Floating Suggested Action)
    if db.showRotHelper and hud._rotSection then
        hud._rotSection:Show()
        hud._rotSection:SetPoint("TOP", hud, "TOP", 0, yOffset)
        yOffset = yOffset - 50 - 4
    else
        if hud._rotSection then hud._rotSection:Hide() end
    end

    -- 2. Aura Display (Main Row)
    if db.showAuras and hud._auraSection then
        hud._auraSection:Show()
        hud._auraSection:SetPoint("TOP", hud, "TOP", 0, yOffset)
        yOffset = yOffset - 34 - 2
    else
        if hud._auraSection then hud._auraSection:Hide() end
    end

    -- 3. Resource Bar (Segmented)
    if db.showResourceBar and hud._resSection then
        hud._resSection:Show()
        hud._resSection:SetPoint("TOP", hud, "TOP", 0, yOffset)
        yOffset = yOffset - 14 - 4
    else
        if hud._resSection then hud._resSection:Hide() end
    end

    -- 4. Casting Bar (Cast/GCD tracker)
    if hud._castSection then
        hud._castSection:Show()
        hud._castSection:SetPoint("TOP", hud, "TOP", 0, yOffset)
        yOffset = yOffset - 20 - 4
    end

    -- 5. Cooldowns (Bottom Row)
    if db.showCooldowns and hud._cdSection then
        hud._cdSection:Show()
        hud._cdSection:SetPoint("TOP", hud, "TOP", 0, yOffset)
        yOffset = yOffset - 44 - 4
    else
        if hud._cdSection then hud._cdSection:Hide() end
    end

    -- Set dynamic overall HUD container height
    local finalHeight = math.abs(yOffset)
    hud:SetHeight(finalHeight)
    if hud._border then
        hud._border:SetSize(HUD_W + 4, finalHeight + 4)
    end
end

-- ─────────────────────────────────────────────
-- Relay class change to all sub-panels
-- ─────────────────────────────────────────────
function CoAAT_CombatHUD.OnClassChanged(classId, specId)
    local hud = _hud
    if not hud then return end

    CoAAT_AuraDisplay.OnClassChanged(classId, specId)
    CoAAT_CooldownTracker.OnClassChanged(classId, specId)
    CoAAT_ResourceBar.OnClassChanged(classId, specId)
    CoAAT_RotationHelper.OnClassChanged(classId, specId)
end

function CoAAT_CombatHUD.OnCombatChange(inCombat)
    -- Relay combat changes if modules need it
end

function CoAAT_CombatHUD.Show()
    if _hud then _hud:Show() end
end

function CoAAT_CombatHUD.Hide()
    if _hud then _hud:Hide() end
end

function CoAAT_CombatHUD.Toggle()
    if _hud then
        if _hud:IsShown() then _hud:Hide() else _hud:Show() end
    end
end
