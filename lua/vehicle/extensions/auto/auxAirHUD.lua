-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}

local storages = nil
local compressorDevice = nil
local initialized = false

local function initAirSystem()
  storages = (energyStorage and energyStorage.getStorages and energyStorage.getStorages()) or nil

  compressorDevice = nil
  if powertrain then
    if powertrain.getDevice then
      compressorDevice = powertrain.getDevice("airCompressor1")
    end
    if not compressorDevice and powertrain.getDevices then
      for _, dev in pairs(powertrain.getDevices() or {}) do
        if dev and dev.type == "compressor" then
          compressorDevice = dev
          break
        end
      end
    end
  end

  initialized = true
end

local function onReset()
  initAirSystem()
end

local function onVehicleLoaded()
  initAirSystem()
end

local function updateGFX(dt)
  if not playerInfo or not playerInfo.firstPlayerSeated then
    return
  end

  if not initialized or not storages then
    initAirSystem()
  end

  local mainTankPressure = nil
  local auxTankPressure = nil
  local primaryTankFound = false
  local auxTankFound = false
  local anyPressureTankFound = false
  local tankCount = 0

  local envP = (powertrain and powertrain.currentEnvPressure) or 101325

  if storages then
    for name, storage in pairs(storages) do
      if storage and (storage.type == "pressureTank" or storage.currentPressure ~= nil) then
        anyPressureTankFound = true
        tankCount = tankCount + 1
        local currentP = storage.currentPressure or 0
        local relPressure = math.max(0, currentP - envP)
        local lowerName = string.lower(name)

        if string.find(lowerName, "aux") or string.find(lowerName, "sec") or string.find(lowerName, "tank2") then
          auxTankPressure = relPressure
          auxTankFound = true
        elseif string.find(lowerName, "main") or string.find(lowerName, "pri") or string.find(lowerName, "tank1") then
          mainTankPressure = relPressure
          primaryTankFound = true
        else
          -- If not explicitly named, prioritize main first, then aux
          if not mainTankPressure then
            mainTankPressure = relPressure
            primaryTankFound = true
          elseif not auxTankPressure then
            auxTankPressure = relPressure
            auxTankFound = true
          end
        end
      end
    end
  end

  -- Fallback to electrics exported by vehicle jbeams
  if auxTankPressure == nil and electrics and electrics.values then
    if electrics.values.auxAirTank_pressureRelative ~= nil then
      auxTankPressure = math.max(0, electrics.values.auxAirTank_pressureRelative)
      auxTankFound = true
      anyPressureTankFound = true
    elseif electrics.values.secondaryAirTank_pressureRelative ~= nil then
      auxTankPressure = math.max(0, electrics.values.secondaryAirTank_pressureRelative)
      auxTankFound = true
      anyPressureTankFound = true
    end
  end

  if mainTankPressure == nil and electrics and electrics.values then
    if electrics.values.mainAirTank_pressureRelative ~= nil then
      mainTankPressure = math.max(0, electrics.values.mainAirTank_pressureRelative)
      primaryTankFound = true
      anyPressureTankFound = true
    end
  end

  -- In vehicles with a single air circuit (e.g. standard Gavril T-Series where secondary
  -- air circuit is supplied from the main reservoir), auxiliary pressure mirrors main tank.
  local isShared = false
  if auxTankPressure == nil and mainTankPressure ~= nil then
    auxTankPressure = mainTankPressure
    isShared = true
  end

  -- Compressor engagement state
  local compressorEngaged = 0
  if compressorDevice and compressorDevice.engaged then
    compressorEngaged = 1
  end

  -- Export to electrics so UI apps receive it via standard streams
  if electrics and electrics.values then
    electrics.values.hud_hasAirSystem = anyPressureTankFound and 1 or 0
    electrics.values.hud_hasAuxTank = auxTankFound and 1 or 0
    electrics.values.hud_isSharedCircuit = isShared and 1 or 0
    electrics.values.hud_auxAirPressure = auxTankPressure or 0        -- Pa (Relative)
    electrics.values.hud_primaryAirPressure = mainTankPressure or 0    -- Pa (Relative)
    electrics.values.hud_compressorEngaged = compressorEngaged
    electrics.values.hud_airTankCount = tankCount
  end
end

M.onReset = onReset
M.onVehicleLoaded = onVehicleLoaded
M.updateGFX = updateGFX

return M
