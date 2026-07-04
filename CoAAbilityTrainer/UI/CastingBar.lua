-- ============================================================
-- CoAAbilityTrainer - Casting Bar
-- Sleek cast and channel bar that matches the WeakAuras design
-- ============================================================

CoAAT_CastingBar = {}

local BAR_W = 264
local BAR_H = 18
local _frame = nil

local castSpellName = nil
local castStartTime = 0
local castEndTime = 0
local castDuration = 0
local isChanneling = false
local isCasting = false

function CoAAT_CastingBar.Build(parent)
    local f = CreateFrame("Frame", "CoAATCastingBar", parent)
    f:SetSize(BAR_W, BAR_H)
    f:SetPoint("CENTER", parent, "CENTER", 0, 0)
    
    -- Background
    local bg = f:CreateTexture(nil, "BACKGROUND")
    bg:SetAllPoints()
    bg:SetTexture(0.02, 0.02, 0.05, 0.95)
    f._bg = bg

    -- Border
    local border = f:CreateTexture(nil, "OVERLAY")
    border:SetTexture("Interface\\ChatFrame\\ChatFrameBackground")
    border:SetVertexColor(0, 0, 0, 1)
    
    local function setBorder()
        local bS = 1.5
        local bTop = f:CreateTexture(nil, "OVERLAY"); bTop:SetSize(BAR_W, bS); bTop:SetPoint("TOPLEFT", f, "TOPLEFT", 0, 0); bTop:SetTexture(0,0,0,1)
        local bBottom = f:CreateTexture(nil, "OVERLAY"); bBottom:SetSize(BAR_W, bS); bBottom:SetPoint("BOTTOMLEFT", f, "BOTTOMLEFT", 0, 0); bBottom:SetTexture(0,0,0,1)
        local bLeft = f:CreateTexture(nil, "OVERLAY"); bLeft:SetSize(bS, BAR_H); bLeft:SetPoint("TOPLEFT", f, "TOPLEFT", 0, 0); bLeft:SetTexture(0,0,0,1)
        local bRight = f:CreateTexture(nil, "OVERLAY"); bRight:SetSize(bS, BAR_H); bRight:SetPoint("TOPRIGHT", f, "TOPRIGHT", 0, 0); bRight:SetTexture(0,0,0,1)
    end
    setBorder()

    -- Fill
    local fill = f:CreateTexture(nil, "ARTWORK")
    fill:SetPoint("LEFT", f, "LEFT", 1, 0)
    fill:SetPoint("TOP", f, "TOP", 0, -1)
    fill:SetPoint("BOTTOM", f, "BOTTOM", 0, 1)
    fill:SetTexture(1.0, 0.35, 0.0, 0.85) -- orange for cast
    f._fill = fill

    -- Spell Name Left
    local nameText = f:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall")
    nameText:SetPoint("LEFT", f, "LEFT", 8, 0)
    nameText:SetFont("Fonts\\FRIZQT__.TTF", 10, "OUTLINE")
    nameText:SetText("")
    f._nameText = nameText

    -- Time text Right
    local timeText = f:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall")
    timeText:SetPoint("RIGHT", f, "RIGHT", -8, 0)
    timeText:SetFont("Fonts\\FRIZQT__.TTF", 10, "OUTLINE")
    timeText:SetText("")
    f._timeText = timeText

    f:Hide()
    _frame = f

    -- Hook events
    f:RegisterEvent("UNIT_SPELLCAST_START")
    f:RegisterEvent("UNIT_SPELLCAST_DELAYED")
    f:RegisterEvent("UNIT_SPELLCAST_STOP")
    f:RegisterEvent("UNIT_SPELLCAST_FAILED")
    f:RegisterEvent("UNIT_SPELLCAST_INTERRUPTED")
    f:RegisterEvent("UNIT_SPELLCAST_CHANNEL_START")
    f:RegisterEvent("UNIT_SPELLCAST_CHANNEL_UPDATE")
    f:RegisterEvent("UNIT_SPELLCAST_CHANNEL_STOP")

    f:SetScript("OnEvent", function(self, event, unit, ...)
        if unit ~= "player" then return end
        
        if event == "UNIT_SPELLCAST_START" then
            local name, _, _, _, startTime, endTime = UnitCastingInfo("player")
            if name then
                castSpellName = name
                castStartTime = startTime / 1000
                castEndTime = endTime / 1000
                castDuration = castEndTime - castStartTime
                isCasting = true
                isChanneling = false
                f._fill:SetTexture(1.0, 0.45, 0.0, 0.9) -- Orange
                f._nameText:SetText(name)
                f:Show()
            end
        elseif event == "UNIT_SPELLCAST_DELAYED" then
            local name, _, _, _, startTime, endTime = UnitCastingInfo("player")
            if name then
                castStartTime = startTime / 1000
                castEndTime = endTime / 1000
                castDuration = castEndTime - castStartTime
            end
        elseif event == "UNIT_SPELLCAST_CHANNEL_START" then
            local name, _, _, _, startTime, endTime = UnitChannelInfo("player")
            if name then
                castSpellName = name
                castStartTime = startTime / 1000
                castEndTime = endTime / 1000
                castDuration = castEndTime - castStartTime
                isCasting = false
                isChanneling = true
                f._fill:SetTexture(0.0, 0.75, 1.0, 0.9) -- Cyan
                f._nameText:SetText(name)
                f:Show()
            end
        elseif event == "UNIT_SPELLCAST_CHANNEL_UPDATE" then
            local name, _, _, _, startTime, endTime = UnitChannelInfo("player")
            if name then
                castStartTime = startTime / 1000
                castEndTime = endTime / 1000
                castDuration = castEndTime - castStartTime
            end
        elseif event == "UNIT_SPELLCAST_STOP" or event == "UNIT_SPELLCAST_FAILED" or event == "UNIT_SPELLCAST_INTERRUPTED" then
            if isCasting then
                isCasting = false
                f:Hide()
            end
        elseif event == "UNIT_SPELLCAST_CHANNEL_STOP" then
            if isChanneling then
                isChanneling = false
                f:Hide()
            end
        end
    end)

    f:SetScript("OnUpdate", function(self, dt)
        if not (isCasting or isChanneling) then return end
        
        local currentTime = GetTime()
        if isCasting then
            local elapsed = currentTime - castStartTime
            local pct = math.min(1.0, elapsed / castDuration)
            self._fill:SetWidth(math.max(1, (BAR_W - 2) * pct))
            self._timeText:SetText(string.format("%.1fs", math.max(0, castEndTime - currentTime)))
            if pct >= 1.0 then
                isCasting = false
                self:Hide()
            end
        elseif isChanneling then
            local remaining = castEndTime - currentTime
            local pct = math.min(1.0, remaining / castDuration)
            self._fill:SetWidth(math.max(1, (BAR_W - 2) * pct))
            self._timeText:SetText(string.format("%.1fs", math.max(0, remaining)))
            if pct <= 0 then
                isChanneling = false
                self:Hide()
            end
        end
    end)

    return f
end
