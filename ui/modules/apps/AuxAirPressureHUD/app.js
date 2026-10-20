/* ===================================================================
   Auxiliary Air Pressure HUD - BeamNG.drive
   -------------------------------------------------------------------
   FILE: app.js
   Edit this file to tweak SVG structure, needle angles, tick values,
   and logic!
   =================================================================== */

angular.module('beamng.apps')
  .directive('auxAirPressureHud', [function () {
    return {
      template:
        '<div class="aux-air-hud-container bngApp" ng-show="hasAirSystem" ng-click="toggleUnit()" title="Aux Air Pressure Gauge - Tap to toggle: PSI / Bar / Minimal">' +
        '<!-- Live CSS link with cache-busting so app.css updates on Ctrl+L -->' +
        '<link type="text/css" rel="stylesheet" ng-href="{{ cssUrl }}">' +
        '<svg ng-if="hasAirSystem" xmlns="http://www.w3.org/2000/svg" class="aux-air-svg" viewBox="0 0 660 660" preserveAspectRatio="xMidYMid meet">' +
        '<defs>' +
        '<!-- Center slate disc gradient -->' +
        '<radialGradient id="auxCenterDiscGrad" cx="50%" cy="50%" r="60%">' +
        '<stop offset="0%" stop-color="#00000002" />' +
        '<stop offset="57%" stop-color="rgba(0, 0, 0, 0.1)" />' +
        '<stop offset="58%" stop-color="#0000007a" />' +
        '<stop offset="100%" stop-color="#0000007a" />' +
        '</radialGradient>' +
        '<!-- Green bulb glow filter -->' +
        '<filter id="auxBulbGlow" x="-50%" y="-50%" width="200%" height="200%">' +
        '<feGaussianBlur stdDeviation="6" result="blur" />' +
        '<feMerge>' +
        '<feMergeNode in="blur" />' +
        '<feMergeNode in="SourceGraphic" />' +
        '</feMerge>' +
        '</filter>' +
        '</defs>' +

        '<!-- 1. Dark Donut Gauge Track (270 deg sweep from bottom-left to bottom-right) -->' +
        '<circle cx="330" cy="330" r="254" fill="none" stroke="#0000002c" stroke-width="75" stroke-dasharray="1197.0 2000" transform="rotate(135, 330, 330)" />' +

        '<!-- 2. Active Sweeping Arc (Turns red on low air, white when safe) -->' +
        '<circle class="aux-active-arc" ng-class="{\'low-air\': isLowAir}" cx="330" cy="330" r="254" fill="none" ng-attr-stroke="{{ isLowAir ? \'#ff1744\' : \'#ffffff\' }}" stroke-width="65" ng-attr-stroke-dasharray="{{ auxArcDash }}" transform="rotate(135, 330, 330)" />' +

        '<!-- 3. Red Low-Air Danger Sector (0 - 60 PSI / 40% of scale) - Rendered ON TOP of Active Sweeping Arc -->' +
        '<circle class="aux-danger-sector" cx="330" cy="330" r="254" fill="none" stroke="#b71c1c" stroke-width="65" stroke-dasharray="478.8 2000" transform="rotate(135, 330, 330)" opacity="0.75" />' +

        '<!-- 4. Radial Tick Dividers on each number - Rendered ON TOP of the white speedometer arc -->' +
        '<g stroke="#141920" stroke-width="4.5" stroke-linecap="butt">' +
        '<line x1="330" y1="43" x2="330" y2="109" transform="rotate(-135, 330, 330)" />' +
        '<line x1="330" y1="43" x2="330" y2="109" transform="rotate(-81, 330, 330)" />' +
        '<line x1="330" y1="43" x2="330" y2="109" transform="rotate(-27, 330, 330)" />' +
        '<line x1="330" y1="43" x2="330" y2="109" transform="rotate(27, 330, 330)" />' +
        '<line x1="330" y1="43" x2="330" y2="109" transform="rotate(81, 330, 330)" />' +
        '<line x1="330" y1="43" x2="330" y2="109" transform="rotate(135, 330, 330)" />' +
        '</g>' +

        '<!-- 5. Red Needle Bar Indicator at Leading Edge -->' +
        '<g class="aux-needle-group" ng-attr-transform="rotate({{ auxAngle }}, 330, 330)">' +
        '<rect class="aux-needle-rect" x="324" y="42" width="12" height="68" fill="#d70000" rx="1" />' +
        '</g>' +

        '<!-- ================= FULL DIAL MODE (displayMode !== 2) ================= -->' +
        '<g ng-if="displayMode !== 2">' +
        '<!-- 6. Center Slate Disc Face -->' +
        '<circle cx="330" cy="330" r="217" fill="url(#auxCenterDiscGrad)" stroke="#262d36" stroke-width="2.5" />' +

        '<!-- 7. Dial Scale Numbers (White, Large) -->' +
        '<g class="aux-tick-text">' +
        '<text ng-repeat="tick in ticks" ng-attr-x="{{ tick.x }}" ng-attr-y="{{ tick.y }}">{{ tick.text }}</text>' +
        '</g>' +

        '<!-- 8. Compressor Charging Bulb (In the Middle) -->' +
        '<g class="aux-bulb-group">' +
        '<circle cx="330" cy="195" r="18" fill="#1b2128" stroke="#2d3642" stroke-width="2.5" />' +
        '<g ng-if="compressorEngaged">' +
        '<circle cx="330" cy="195" r="25" fill="#00e676" opacity="0.4" filter="url(#auxBulbGlow)" />' +
        '<circle cx="330" cy="195" r="14" fill="#00e676" />' +
        '<ellipse cx="326" cy="191" rx="5" ry="3" fill="#ffffff" opacity="0.65" transform="rotate(-25, 326, 191)" />' +
        '</g>' +
        '<g ng-if="!compressorEngaged">' +
        '<circle cx="330" cy="195" r="14" fill="#141920" stroke="#1d252f" stroke-width="1" />' +
        '<ellipse cx="326" cy="191" rx="4" ry="2.2" fill="#ffffff" opacity="0.1" transform="rotate(-25, 326, 191)" />' +
        '</g>' +
        '<text class="aux-compressor-text" x="330" y="235" ng-attr-fill="{{ compressorEngaged ? \'#00e676\' : \'rgba(255, 255, 255, 0.84)\' }}">COMPRESSOR</text>' +
        '</g>' +

        '<!-- 9. Center Main Digital Readout (White, Large) -->' +
        '<text class="aux-boost-val" x="330" y="338">{{ auxDisplayVal }}</text>' +
        '<text class="aux-boost-unit" x="330" y="405">{{ currentUnit }}</text>' +
        '<text class="aux-sub-label" x="330" y="445">AUX AIR</text>' +

        '<!-- 10. Bottom Status / Warning Text -->' +
        '<text ng-if="isLowAir && hasAirSystem" class="aux-pri-label aux-low-air-blink" x="330" y="510">⚠️ LOW AIR</text>' +
        '<text ng-if="!isLowAir && hasAirSystem && !isSharedCircuit" class="aux-pri-label" x="330" y="510">PRI: {{ priDisplayVal }} {{ currentUnit }}</text>' +
        '<text ng-if="!isLowAir && hasAirSystem && isSharedCircuit" class="aux-pri-label" x="330" y="510" style="letter-spacing:1px;">SHARED CIRCUIT</text>' +
        '</g>' +

        '<!-- ================= MINIMAL CLEAN MODE (displayMode === 2) ================= -->' +
        '<g ng-if="displayMode === 2">' +
        '<!-- Compressor Charging Bulb in Middle (No text label) -->' +
        '<g class="aux-bulb-group">' +
        '<circle cx="330" cy="240" r="19" fill="#1b2128" stroke="#2d3642" stroke-width="2.5" />' +
        '<g ng-if="compressorEngaged">' +
        '<circle cx="330" cy="240" r="28" fill="#00e676" opacity="0.45" filter="url(#auxBulbGlow)" />' +
        '<circle cx="330" cy="240" r="15" fill="#00e676" />' +
        '<ellipse cx="326" cy="235" rx="5.5" ry="3.2" fill="#ffffff" opacity="0.7" transform="rotate(-25, 326, 235)" />' +
        '</g>' +
        '<g ng-if="!compressorEngaged">' +
        '<circle cx="330" cy="240" r="15" fill="#141920" stroke="#1d252f" stroke-width="1" />' +
        '<ellipse cx="326" cy="235" rx="4.5" ry="2.5" fill="#ffffff" opacity="0.12" transform="rotate(-25, 326, 235)" />' +
        '</g>' +
        '</g>' +

        '<!-- AUX AIR text in middle (Larger) -->' +
        '<text class="aux-minimal-sub-label" x="330" y="335">AUX AIR</text>' +

        '<!-- Big Blinking LOW AIR text without glow and darker red -->' +
        '<text ng-if="isLowAir" class="aux-minimal-low-air-big aux-low-air-blink" x="330" y="420" fill="#b71c1c">⚠️ LOW AIR</text>' +
        '</g>' +

        '</svg>' +
        '</div>',
      replace: true,
      restrict: 'EA',
      scope: true,
      controller: ['$log', '$scope', function ($log, $scope) {
        // Live cache-busting URL so edits in app.css reload immediately on Ctrl+L
        $scope.cssUrl = '/ui/modules/apps/AuxAirPressureHUD/app.css?' + Date.now();

        // Arc geometry constants (r=254, 270 deg sweep)
        var TOTAL_ARC_LEN = 1197.0;

        // Display Modes: 0 = Full PSI, 1 = Full Bar, 2 = Minimal Clean Mode
        var savedMode = parseInt(localStorage.getItem('auxAirHud_displayMode'), 10);
        $scope.displayMode = (!isNaN(savedMode) && savedMode >= 0 && savedMode <= 2) ? savedMode : 0;

        // Units setup
        var manualUnit = localStorage.getItem('auxAirHud_manualUnit');
        if ($scope.displayMode === 0) {
          $scope.currentUnit = 'PSI';
        } else if ($scope.displayMode === 1) {
          $scope.currentUnit = 'Bar';
        } else {
          $scope.currentUnit = manualUnit || 'PSI';
        }

        // Scale tick points (R=175, angles: -135, -81, -27, 27, 81, 135)
        var tickCoords = [
          { x: 206, y: 454 },
          { x: 157, y: 303 },
          { x: 251, y: 174 },
          { x: 409, y: 174 },
          { x: 503, y: 303 },
          { x: 454, y: 454 }
        ];

        function updateTicks() {
          var tickValues;
          if ($scope.currentUnit === 'Bar' || $scope.currentUnit === 'bar') {
            tickValues = ['0', '2', '4', '6', '8', '10'];
          } else if ($scope.currentUnit === 'kPa') {
            tickValues = ['0', '200', '400', '600', '800', '1000'];
          } else {
            tickValues = ['0', '30', '60', '90', '120', '150'];
          }

          $scope.ticks = tickCoords.map(function (coord, index) {
            return {
              x: coord.x,
              y: coord.y,
              text: tickValues[index]
            };
          });
        }
        updateTicks();

        // State variables - initialized as false so it stays hidden on cars without air
        $scope.hasAirSystem = false;
        $scope.isSharedCircuit = false;
        $scope.compressorEngaged = false;
        $scope.isLowAir = false;

        $scope.auxDisplayVal = '---';
        $scope.priDisplayVal = '---';
        $scope.auxAngle = -135;
        $scope.auxArcDash = '0 2000';

        // 3-Way Tap Handler: PSI -> Bar -> Minimal -> PSI...
        $scope.toggleUnit = function () {
          $scope.displayMode = ($scope.displayMode + 1) % 3;
          localStorage.setItem('auxAirHud_displayMode', $scope.displayMode);

          if ($scope.displayMode === 0) {
            $scope.currentUnit = 'PSI';
            manualUnit = 'PSI';
            localStorage.setItem('auxAirHud_manualUnit', 'PSI');
          } else if ($scope.displayMode === 1) {
            $scope.currentUnit = 'Bar';
            manualUnit = 'Bar';
            localStorage.setItem('auxAirHud_manualUnit', 'Bar');
          }
          // In mode 2 (Minimal), currentUnit stays for scale ratio
          updateTicks();
        };

        // Streams Manager setup
        var streamsList = ['electrics', 'pneumaticsData'];
        StreamsManager.add(streamsList);

        $scope.$on('$destroy', function () {
          StreamsManager.remove(streamsList);
        });

        // Streams Update Handler
        $scope.$on('streamsUpdate', function (event, streams) {
          $scope.$evalAsync(function () {
            var electrics = streams.electrics || {};
            var pneumatics = streams.pneumaticsData || {};

            var rawAuxPa = null;
            var rawPriPa = null;
            var hasAir = false;

            // Check custom vehicle extension outputs
            if (electrics.hud_hasAirSystem !== undefined) {
              hasAir = electrics.hud_hasAirSystem === 1;
              rawAuxPa = electrics.hud_auxAirPressure;
              rawPriPa = electrics.hud_primaryAirPressure;
              $scope.isSharedCircuit = electrics.hud_isSharedCircuit === 1;
              $scope.compressorEngaged = electrics.hud_compressorEngaged === 1;
            } else {
              // Direct electrics fallbacks
              if (electrics.auxAirTank_pressureRelative !== undefined) {
                rawAuxPa = electrics.auxAirTank_pressureRelative;
                hasAir = true;
              }
              if (electrics.mainAirTank_pressureRelative !== undefined) {
                rawPriPa = electrics.mainAirTank_pressureRelative;
                hasAir = true;
              }
              // Pneumatics stream fallback
              if (pneumatics.tankPressure !== undefined && pneumatics.tankPressure !== null) {
                var pPa = pneumatics.tankPressure * 1000;
                if (rawPriPa === null) rawPriPa = pPa;
                if (rawAuxPa === null) rawAuxPa = pPa;
                hasAir = true;
              }
              if (rawAuxPa === null && rawPriPa !== null) {
                rawAuxPa = rawPriPa;
                $scope.isSharedCircuit = true;
              }
              $scope.compressorEngaged = pneumatics.compressorState === 'Engaged';
            }

            $scope.hasAirSystem = hasAir;

            if (!hasAir || rawAuxPa === null) {
              $scope.auxDisplayVal = '---';
              $scope.priDisplayVal = '---';
              $scope.auxAngle = -135;
              $scope.auxArcDash = '0 2000';
              $scope.compressorEngaged = false;
              $scope.isLowAir = false;
              return;
            }

            rawAuxPa = Math.max(0, rawAuxPa);
            rawPriPa = Math.max(0, rawPriPa || 0);

            // Auto-detect unit from UiUnits if user hasn't manually clicked to override
            if (!manualUnit && $scope.displayMode !== 2 && window.UiUnits && typeof window.UiUnits.pressure === 'function') {
              var autoRes = window.UiUnits.pressure(rawAuxPa / 1000);
              if (autoRes && autoRes.unit && autoRes.unit !== $scope.currentUnit) {
                $scope.currentUnit = autoRes.unit;
                updateTicks();
              }
            }

            var auxVal = 0;
            var priVal = 0;
            var maxScale = 150;
            var lowThreshold = 60;

            if ($scope.currentUnit === 'Bar' || $scope.currentUnit === 'bar') {
              auxVal = rawAuxPa * 0.00001;
              priVal = rawPriPa * 0.00001;
              maxScale = 10;
              lowThreshold = 4.1;
              $scope.auxDisplayVal = auxVal.toFixed(1);
              $scope.priDisplayVal = priVal.toFixed(1);
            } else if ($scope.currentUnit === 'kPa') {
              auxVal = rawAuxPa / 1000;
              priVal = rawPriPa / 1000;
              maxScale = 1000;
              lowThreshold = 410;
              $scope.auxDisplayVal = Math.round(auxVal).toString();
              $scope.priDisplayVal = Math.round(priVal).toString();
            } else { // PSI
              auxVal = rawAuxPa * 0.0001450377;
              priVal = rawPriPa * 0.0001450377;
              maxScale = 150;
              lowThreshold = 60;
              $scope.auxDisplayVal = Math.round(auxVal).toString();
              $scope.priDisplayVal = Math.round(priVal).toString();
            }

            var auxRatio = Math.min(Math.max(auxVal / maxScale, 0), 1);
            $scope.auxAngle = -135 + (auxRatio * 270);
            $scope.auxArcDash = (auxRatio * TOTAL_ARC_LEN).toFixed(1) + ' 2000';
            $scope.isLowAir = auxVal < lowThreshold;
          });
        });
      }]
    };
  }]);
