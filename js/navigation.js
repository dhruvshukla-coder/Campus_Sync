/**
 * ============================================================================
 * CampusSync — Walking Navigation Engine (js/navigation.js)
 * ============================================================================
 * Implements Feature 1: "Where is your Block?"
 * 
 * Flow:
 * - Step 1: Search block / building with suggestion chips & autocomplete
 * - Step 2: Confirm destination card ("Do you want to go here?")
 * - Step 3: Browser geolocation permission & real GPS location (or manual fallback)
 * - Step 4: Leaflet dark map with walking route polyline & campus buildings
 * - Step 5: Floating route info card (distance, duration, dynamic ETA, "Start Walking")
 * - Step 6: Live Walking Navigation with watchPosition, real-time metrics,
 *           indoor test step simulator, off-route detection & arrival celebration.
 * ============================================================================
 */

(function () {
  "use strict";

  // Navigation State
  let map = null;
  let userLocation = null;       // [lat, lng]
  let isRealGps = false;
  let selectedDestination = null; // object from CAMPUS_LOCATIONS
  let activeRoutePolyline = null;
  let userMarker = null;
  let destMarker = null;
  let buildingLayers = [];
  let watchPositionId = null;
  let isNavigating = false;
  let currentStepIndex = 0;
  let simulatedRoutePoints = [];

  // Default campus center (LPU Punjab reference coordinates)
  const CAMPUS_CENTER = [31.2536, 75.7040];

  // DOM Elements
  const stepSearch = document.getElementById("navStepSearch");
  const stepConfirm = document.getElementById("navStepConfirm");
  const stepLocationPrompt = document.getElementById("navStepLocationPrompt");
  const stepRouteInfo = document.getElementById("navStepRouteInfo");
  const stepActiveNav = document.getElementById("navStepActiveNav");

  const destSearchInput = document.getElementById("destSearchInput");
  const destinationsList = document.getElementById("destinationsList");
  const quickChips = document.querySelectorAll("#quickSuggestionChips .suggestion-chip");
  const gpsStatusPill = document.getElementById("gpsStatusPill");

  // Confirm card elements
  const confirmDestImg = document.getElementById("confirmDestImg");
  const confirmDestName = document.getElementById("confirmDestName");
  const confirmDestCategory = document.getElementById("confirmDestCategory");
  const confirmDestSub = document.getElementById("confirmDestSub");
  const confirmDestFacilities = document.getElementById("confirmDestFacilities");
  const cancelConfirmBtn = document.getElementById("cancelConfirmBtn");
  const getDirectionsBtn = document.getElementById("getDirectionsBtn");

  // Location prompt elements
  const retryGpsBtn = document.getElementById("retryGpsBtn");
  const manualStartSelect = document.getElementById("manualStartSelect");
  const confirmManualStartBtn = document.getElementById("confirmManualStartBtn");

  // Route Info elements
  const routeDestName = document.getElementById("routeDestName");
  const routeDestSub = document.getElementById("routeDestSub");
  const routeDurationText = document.getElementById("routeDurationText");
  const routeDistanceText = document.getElementById("routeDistanceText");
  const routeEtaText = document.getElementById("routeEtaText");
  const startWalkingBtn = document.getElementById("startWalkingBtn");
  const resetRouteBtn = document.getElementById("resetRouteBtn");

  // Active Navigation elements
  const activeDestTitle = document.getElementById("activeDestTitle");
  const activeModeLabel = document.getElementById("activeModeLabel");
  const liveRemainingMinutes = document.getElementById("liveRemainingMinutes");
  const liveRemainingDistance = document.getElementById("liveRemainingDistance");
  const liveProgressPercent = document.getElementById("liveProgressPercent");
  const liveProgressFill = document.getElementById("liveProgressFill");
  const liveDynamicEta = document.getElementById("liveDynamicEta");
  const offRouteAlert = document.getElementById("offRouteAlert");
  const arrivedAlert = document.getElementById("arrivedAlert");
  const arrivedFinishBtn = document.getElementById("arrivedFinishBtn");
  const endNavigationBtn = document.getElementById("endNavigationBtn");
  const simulateWalkStepBtn = document.getElementById("simulateWalkStepBtn");

  // Map Controls
  const mapZoomIn = document.getElementById("mapZoomIn");
  const mapZoomOut = document.getElementById("mapZoomOut");
  const mapRecenterBtn = document.getElementById("mapRecenterBtn");
  const mapFitCampusBtn = document.getElementById("mapFitCampusBtn");

  // ==========================================================================
  // 1. INITIALIZE MAP
  // ==========================================================================
  function initMap() {
    if (!document.getElementById("map") || typeof L === "undefined") return;

    // CartoDB Dark Matter map layer (Free, fast, no API key required)
    map = L.map("map", {
      zoomControl: false,
      attributionControl: false
    }).setView(CAMPUS_CENTER, 16);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd"
    }).addTo(map);

    // Plot campus building polygons / markers
    renderCampusBuildingsOnMap();

    // Map control listeners
    if (mapZoomIn) mapZoomIn.addEventListener("click", () => map.zoomIn());
    if (mapZoomOut) mapZoomOut.addEventListener("click", () => map.zoomOut());
    if (mapFitCampusBtn) {
      mapFitCampusBtn.addEventListener("click", () => {
        map.flyTo(CAMPUS_CENTER, 16, { duration: 1.2 });
      });
    }
    if (mapRecenterBtn) {
      mapRecenterBtn.addEventListener("click", () => {
        if (userLocation) {
          map.flyTo(userLocation, 17, { duration: 1 });
        } else {
          showToast("User location not available yet. Please allow GPS.", "warn");
        }
      });
    }

    // Leaflet resize handler
    setTimeout(() => map.invalidateSize(), 300);
  }

  /**
   * Renders campus building footprints and labels on the Leaflet map.
   */
  function renderCampusBuildingsOnMap() {
    if (typeof CAMPUS_LOCATIONS === "undefined") return;

    CAMPUS_LOCATIONS.forEach((bld) => {
      // Create custom dark neon icon
      const iconHTML = `
        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.5); color: #fff; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 10px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px;">
          <span>📍</span> ${bld.name}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-building-label",
        html: iconHTML,
        iconSize: [80, 24],
        iconAnchor: [40, 12]
      });

      const marker = L.marker([bld.lat, bld.lng], { icon: customIcon }).addTo(map);
      marker.on("click", () => {
        selectDestination(bld);
      });
      buildingLayers.push(marker);
    });
  }

  // ==========================================================================
  // 2. STEP 1: DESTINATION SEARCH & SUGGESTIONS
  // ==========================================================================
  function initDestinationsSearch() {
    renderDestinationsList(CAMPUS_LOCATIONS || []);

    if (destSearchInput) {
      destSearchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          renderDestinationsList(CAMPUS_LOCATIONS || []);
          return;
        }

        const filtered = (CAMPUS_LOCATIONS || []).filter((loc) => {
          return (
            loc.name.toLowerCase().includes(query) ||
            loc.category.toLowerCase().includes(query) ||
            (loc.subName && loc.subName.toLowerCase().includes(query)) ||
            (loc.facilities && loc.facilities.some((f) => f.toLowerCase().includes(query)))
          );
        });

        renderDestinationsList(filtered);
      });
    }

    quickChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const destName = chip.getAttribute("data-dest");
        const found = (CAMPUS_LOCATIONS || []).find((c) =>
          c.name.toLowerCase().includes(destName.toLowerCase())
        );
        if (found) selectDestination(found);
      });
    });
  }

  function renderDestinationsList(locations) {
    if (!destinationsList) return;

    if (locations.length === 0) {
      destinationsList.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-dim); font-size: 0.88rem;">
          No campus block found matching your search.
        </div>
      `;
      return;
    }

    destinationsList.innerHTML = locations
      .map((loc) => `
        <div class="destination-item" data-dest-id="${loc.id}">
          <div class="destination-item-icon">🏛️</div>
          <div class="destination-item-info">
            <div class="destination-item-name">${escapeHTML(loc.name)}</div>
            <div class="destination-item-sub">${escapeHTML(loc.category)} • ${loc.floors || 3} Floors</div>
          </div>
          <div class="destination-item-distance">
            ${loc.walkingDistanceMeters || 400}m
          </div>
        </div>
      `)
      .join("");

    // Attach click listeners
    destinationsList.querySelectorAll(".destination-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-dest-id");
        const found = (CAMPUS_LOCATIONS || []).find((c) => c.id === id);
        if (found) selectDestination(found);
      });
    });
  }

  // ==========================================================================
  // 3. STEP 2: CONFIRM DESTINATION
  // ==========================================================================
  function selectDestination(dest) {
    selectedDestination = dest;

    // Show Step 2 Confirm Destination
    showView("confirm");

    if (confirmDestName) confirmDestName.textContent = dest.name;
    if (confirmDestCategory) confirmDestCategory.textContent = dest.category;
    if (confirmDestSub) confirmDestSub.textContent = dest.subName || dest.description;
    if (confirmDestImg) confirmDestImg.src = dest.image || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80";

    if (confirmDestFacilities) {
      confirmDestFacilities.innerHTML = (dest.facilities || ["Wi-Fi", "Elevator"])
        .map((f) => `<span class="facility-pill">✓ ${escapeHTML(f)}</span>`)
        .join("");
    }

    // Pan map to destination
    if (map) {
      map.flyTo([dest.lat, dest.lng], 17, { duration: 1 });
    }
  }

  if (cancelConfirmBtn) {
    cancelConfirmBtn.addEventListener("click", () => {
      selectedDestination = null;
      showView("search");
    });
  }

  // ==========================================================================
  // 4. STEP 3: GET USER LOCATION (REAL GPS & FALLBACK)
  // ==========================================================================
  if (getDirectionsBtn) {
    getDirectionsBtn.addEventListener("click", () => {
      requestUserLocation();
    });
  }

  function requestUserLocation() {
    if (!navigator.geolocation) {
      handleLocationDenied("Geolocation is not supported by your browser.");
      return;
    }

    gpsStatusPill.textContent = "Requesting GPS...";
    gpsStatusPill.className = "badge badge-amber";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        userLocation = [lat, lng];
        isRealGps = true;

        gpsStatusPill.textContent = "Real GPS Active";
        gpsStatusPill.className = "badge badge-emerald";

        onUserLocationEstablished();
      },
      (error) => {
        console.warn("Geolocation denied or timed out:", error.message);
        handleLocationDenied("Location permission denied or unavailable.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  function handleLocationDenied(reason) {
    isRealGps = false;
    gpsStatusPill.textContent = "Manual / Campus Mode";
    gpsStatusPill.className = "badge badge-amber";

    showView("locationPrompt");
  }

  if (retryGpsBtn) {
    retryGpsBtn.addEventListener("click", () => {
      requestUserLocation();
    });
  }

  if (confirmManualStartBtn && manualStartSelect) {
    confirmManualStartBtn.addEventListener("click", () => {
      const selectedKey = manualStartSelect.value;
      const coords = (typeof CAMPUS_WAYPOINTS !== "undefined" && CAMPUS_WAYPOINTS[selectedKey])
        ? CAMPUS_WAYPOINTS[selectedKey]
        : [31.2530, 75.7010];

      userLocation = coords;
      isRealGps = false;
      onUserLocationEstablished();
    });
  }

  function onUserLocationEstablished() {
    if (!userLocation || !selectedDestination) return;

    // Place user marker
    updateUserMarkerOnMap(userLocation);

    // Place destination marker
    updateDestMarkerOnMap([selectedDestination.lat, selectedDestination.lng]);

    // Calculate walking path & show Step 5 Route Info
    computeAndDisplayRoute(userLocation, [selectedDestination.lat, selectedDestination.lng]);
  }

  // ==========================================================================
  // 5. STEP 4 & 5: MAP ROUTE DRAWING & ROUTE INFO
  // ==========================================================================
  function updateUserMarkerOnMap(latlng) {
    if (!map) return;

    if (!userMarker) {
      const pulseDiv = L.divIcon({
        className: "user-loc-marker",
        html: `<div class="custom-pulse-marker" title="Your Location"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      userMarker = L.marker(latlng, { icon: pulseDiv }).addTo(map);
      userMarker.bindTooltip("🔵 Your Location", { permanent: false, direction: "top" });
    } else {
      userMarker.setLatLng(latlng);
    }
  }

  function updateDestMarkerOnMap(latlng) {
    if (!map) return;

    if (!destMarker) {
      const destDiv = L.divIcon({
        className: "dest-pin-marker",
        html: `<div style="font-size: 28px; line-height: 1; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6));">📍</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      destMarker = L.marker(latlng, { icon: destDiv }).addTo(map);
      destMarker.bindTooltip(`📍 ${selectedDestination.name}`, { permanent: true, direction: "top" });
    } else {
      destMarker.setLatLng(latlng);
    }
  }

  /**
   * Generates realistic walking waypoints between start and end.
   */
  function computeAndDisplayRoute(start, end) {
    if (!map) return;

    // Calculate straight-line distance in meters
    const distMeters = Math.round(getDistanceInMeters(start[0], start[1], end[0], end[1]));
    // Typical walking speed ~ 1.2 m/s -> ~75 meters per minute
    const walkingMinutes = Math.max(1, Math.round(distMeters / 75));

    // Dynamic arrival time calculation
    const now = new Date();
    const arrivalDate = new Date(now.getTime() + walkingMinutes * 60000);
    const etaString = arrivalDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

    // Update Route Info Card
    if (routeDestName) routeDestName.textContent = selectedDestination.name;
    if (routeDestSub) routeDestSub.textContent = `${selectedDestination.category} • Campus Walk`;
    if (routeDurationText) routeDurationText.textContent = `${walkingMinutes} min`;
    if (routeDistanceText) routeDistanceText.textContent = `${distMeters} m`;
    if (routeEtaText) routeEtaText.textContent = `Arrive around ${etaString}`;

    // Generate walking polyline (with realistic intermediate campus turns)
    const waypoints = generateCampusWalkingPath(start, end);
    simulatedRoutePoints = waypoints;

    if (activeRoutePolyline) {
      map.removeLayer(activeRoutePolyline);
    }

    // Glow polyline (Cyan / Purple gradient style)
    activeRoutePolyline = L.polyline(waypoints, {
      color: "#38bdf8",
      weight: 5,
      opacity: 0.9,
      lineCap: "round",
      dashArray: "1, 10",
      dashOffset: "0"
    }).addTo(map);

    // Fit map bounds to show route
    map.fitBounds(activeRoutePolyline.getBounds(), { padding: [60, 60], maxZoom: 18 });

    showView("routeInfo");
  }

  function generateCampusWalkingPath(start, end) {
    // Intermediate waypoint simulation to follow campus walkways rather than direct diagonals
    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;

    const corner1 = [start[0], midLng];
    const corner2 = [midLat, midLng];
    const corner3 = [end[0], midLng];

    return [
      start,
      corner1,
      corner2,
      corner3,
      end
    ];
  }

  if (resetRouteBtn) {
    resetRouteBtn.addEventListener("click", () => {
      endNavigation();
      showView("search");
    });
  }

  // ==========================================================================
  // 6. STEP 6: LIVE WALKING NAVIGATION & OFF-ROUTE DETECTION
  // ==========================================================================
  if (startWalkingBtn) {
    startWalkingBtn.addEventListener("click", () => {
      startLiveNavigation();
    });
  }

  function startLiveNavigation() {
    isNavigating = true;
    currentStepIndex = 0;

    showView("activeNav");

    if (activeDestTitle) activeDestTitle.textContent = `Walking to ${selectedDestination.name}`;
    if (activeModeLabel) activeModeLabel.textContent = isRealGps ? "Live GPS Mode" : "Campus Mode";

    // Zoom closely to user position
    if (map && userLocation) {
      map.flyTo(userLocation, 18, { duration: 1 });
    }

    // If real GPS available, continuously watch position
    if (isRealGps && navigator.geolocation) {
      watchPositionId = navigator.geolocation.watchPosition(
        (pos) => {
          if (!isNavigating) return;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          onLiveLocationUpdate([lat, lng]);
        },
        (err) => console.warn("watchPosition error:", err),
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
  }

  /**
   * Called whenever user's position updates (real GPS or simulator).
   */
  function onLiveLocationUpdate(newCoords) {
    if (!isNavigating || !selectedDestination) return;

    userLocation = newCoords;
    updateUserMarkerOnMap(newCoords);

    // Check Distance to Destination
    const distToDest = Math.round(
      getDistanceInMeters(newCoords[0], newCoords[1], selectedDestination.lat, selectedDestination.lng)
    );

    // Check Distance from active Route Path (Off-Route Detection)
    const distToRoute = getMinDistanceToPolyline(newCoords, simulatedRoutePoints);

    if (distToRoute > 45) { // Off route threshold: 45 meters
      triggerOffRoute(newCoords);
    } else {
      if (offRouteAlert) offRouteAlert.style.display = "none";
    }

    // Check Arrival State (< 20 meters from destination)
    if (distToDest <= 20) {
      triggerArrival();
      return;
    }

    // Update Live Metrics
    const remainingMins = Math.max(1, Math.round(distToDest / 75));
    const now = new Date();
    const arrivalDate = new Date(now.getTime() + remainingMins * 60000);
    const etaStr = arrivalDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

    if (liveRemainingMinutes) liveRemainingMinutes.textContent = `${remainingMins} min`;
    if (liveRemainingDistance) liveRemainingDistance.textContent = `${distToDest} m`;
    if (liveDynamicEta) liveDynamicEta.textContent = `Arrive around ${etaStr}`;

    // Update Progress Fill
    const totalDist = selectedDestination.walkingDistanceMeters || 450;
    const progressPercent = Math.min(95, Math.max(5, Math.round(((totalDist - distToDest) / totalDist) * 100)));
    if (liveProgressPercent) liveProgressPercent.textContent = `${progressPercent}%`;
    if (liveProgressFill) liveProgressFill.style.width = `${progressPercent}%`;

    // Recenter map smoothly on walking user
    if (map) {
      map.panTo(newCoords, { animate: true });
    }
  }

  /**
   * Off-Route Detection: Recalculates route and updates visuals dynamically.
   */
  function triggerOffRoute(currentCoords) {
    if (offRouteAlert) offRouteAlert.style.display = "flex";

    // Recalculate route from current off-route coords
    const newWaypoints = generateCampusWalkingPath(currentCoords, [selectedDestination.lat, selectedDestination.lng]);
    simulatedRoutePoints = newWaypoints;

    if (activeRoutePolyline) {
      activeRoutePolyline.setLatLngs(newWaypoints);
      activeRoutePolyline.setStyle({ color: "#f43f5e" }); // Red while recalculating
      setTimeout(() => {
        if (activeRoutePolyline) activeRoutePolyline.setStyle({ color: "#38bdf8" });
      }, 1200);
    }
  }

  function triggerArrival() {
    if (arrivedAlert) arrivedAlert.style.display = "block";
    if (liveRemainingMinutes) liveRemainingMinutes.textContent = "0 min";
    if (liveRemainingDistance) liveRemainingDistance.textContent = "0 m";
    if (liveProgressPercent) liveProgressPercent.textContent = "100%";
    if (liveProgressFill) liveProgressFill.style.width = "100%";

    if (typeof showToast === "function") {
      showToast("You've arrived at your destination! 🎉", "success");
    }

    if (typeof addNotification === "function") {
      addNotification("Destination Reached", `Arrived at ${selectedDestination.name}`, "success");
    }
  }

  if (arrivedFinishBtn) {
    arrivedFinishBtn.addEventListener("click", () => {
      endNavigation();
      showView("search");
    });
  }

  if (endNavigationBtn) {
    endNavigationBtn.addEventListener("click", () => {
      endNavigation();
      showView("routeInfo");
    });
  }

  function endNavigation() {
    isNavigating = false;
    if (watchPositionId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchPositionId);
      watchPositionId = null;
    }
    if (arrivedAlert) arrivedAlert.style.display = "none";
    if (offRouteAlert) offRouteAlert.style.display = "none";
  }

  // ==========================================================================
  // 7. INDOOR TEST WALK STEP SIMULATOR
  // ==========================================================================
  if (simulateWalkStepBtn) {
    simulateWalkStepBtn.addEventListener("click", () => {
      if (!isNavigating || !simulatedRoutePoints || simulatedRoutePoints.length === 0) return;

      currentStepIndex++;
      const fraction = currentStepIndex / 6;

      if (fraction >= 1) {
        // Arrived at destination
        onLiveLocationUpdate([selectedDestination.lat, selectedDestination.lng]);
      } else {
        // Compute interpolated position along route
        const start = simulatedRoutePoints[0];
        const end = simulatedRoutePoints[simulatedRoutePoints.length - 1];
        const currentLat = start[0] + (end[0] - start[0]) * fraction;
        const currentLng = start[1] + (end[1] - start[1]) * fraction;
        onLiveLocationUpdate([currentLat, currentLng]);
      }
    });
  }

  // ==========================================================================
  // 8. MATH & GEOMETRIC UTILITIES
  // ==========================================================================
  function getDistanceInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in metres
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  function getMinDistanceToPolyline(point, polylineCoords) {
    if (!polylineCoords || polylineCoords.length === 0) return 0;
    let minDist = Infinity;
    for (let i = 0; i < polylineCoords.length; i++) {
      const d = getDistanceInMeters(point[0], point[1], polylineCoords[i][0], polylineCoords[i][1]);
      if (d < minDist) minDist = d;
    }
    return minDist;
  }

  // ==========================================================================
  // 9. VIEW TRANSITION CONTROLLER
  // ==========================================================================
  function showView(viewName) {
    const views = {
      search: stepSearch,
      confirm: stepConfirm,
      locationPrompt: stepLocationPrompt,
      routeInfo: stepRouteInfo,
      activeNav: stepActiveNav
    };

    Object.keys(views).forEach((k) => {
      if (views[k]) {
        views[k].style.display = k === viewName ? "block" : "none";
      }
    });
  }

  // ==========================================================================
  // 10. CHECK QUERY PARAMS (DEEP-LINK SUPPORT)
  // ==========================================================================
  function checkUrlDestination() {
    const urlParams = new URLSearchParams(window.location.search);
    const destParam = urlParams.get("dest");
    if (!destParam || typeof CAMPUS_LOCATIONS === "undefined") return;

    const found = CAMPUS_LOCATIONS.find((c) =>
      c.name.toLowerCase().includes(destParam.toLowerCase()) ||
      destParam.toLowerCase().includes(c.name.toLowerCase())
    );

    if (found) {
      selectDestination(found);
    }
  }

  // ==========================================================================
  // 11. MOBILE VIEW SWITCHER (< 1024px)
  // ==========================================================================
  function initMobileViewToggle() {
    const layout = document.getElementById("navPageLayout");
    const tabPanelBtn = document.getElementById("navTabPanelBtn");
    const tabMapBtn = document.getElementById("navTabMapBtn");

    if (!tabPanelBtn || !tabMapBtn || !layout) return;

    function switchToPanel() {
      tabPanelBtn.classList.add("active");
      tabPanelBtn.setAttribute("aria-selected", "true");
      tabMapBtn.classList.remove("active");
      tabMapBtn.setAttribute("aria-selected", "false");
      layout.classList.remove("mobile-show-map");
      layout.classList.add("mobile-show-panel");
    }

    function switchToMap() {
      tabMapBtn.classList.add("active");
      tabMapBtn.setAttribute("aria-selected", "true");
      tabPanelBtn.classList.remove("active");
      tabPanelBtn.setAttribute("aria-selected", "false");
      layout.classList.remove("mobile-show-panel");
      layout.classList.add("mobile-show-map");
      if (map) {
        setTimeout(() => {
          map.invalidateSize();
        }, 150);
      }
    }

    tabPanelBtn.addEventListener("click", switchToPanel);
    tabMapBtn.addEventListener("click", switchToMap);

    // Global helper for buttons to switch to map view programmatically
    window.switchNavMobileView = (mode) => {
      if (mode === "map") switchToMap();
      else switchToPanel();
    };
  }

  // ==========================================================================
  // INITIALIZATION ON LOAD
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    initMap();
    initDestinationsSearch();
    checkUrlDestination();
    initMobileViewToggle();
  });

})();

