/**
 * ============================================================================
 * CampusSync — Campus Spaces & Empty Classrooms Module (js/spaces.js)
 * ============================================================================
 * Implements Feature 4:
 * 1. Directory of Campus Spaces with Occupancy Meters & Noise Ratings
 * 2. Empty Classrooms & Quiet Spaces Spotlights
 * 3. Space Availability Timelines (Hourly slots)
 * 4. Space Details Modal with Direct Navigation Deep-linking
 * ============================================================================
 */

(function () {
  "use strict";

  // State
  let currentCategory = "all";
  let currentAvailability = "all";
  let currentSearchQuery = "";
  let activeSpaceInModal = null;

  // DOM Elements
  const spacesGridContainer = document.getElementById("spacesGridContainer");
  const spacesCounter = document.getElementById("spacesCounter");
  const spacesFilterMeta = document.getElementById("spacesFilterMeta");
  const spacesEmptyState = document.getElementById("spacesEmptyState");
  const spaceSearchInput = document.getElementById("spaceSearchInput");
  const spaceCategoryPills = document.querySelectorAll("#spaceCategoryPills .filter-segment-btn");
  const spaceAvailabilitySelect = document.getElementById("spaceAvailabilitySelect");
  const spaceResetFiltersBtn = document.getElementById("spaceResetFiltersBtn");

  // Modal Elements
  const spaceDetailsModal = document.getElementById("spaceDetailsModal");
  const closeSpaceModalBtn = document.getElementById("closeSpaceModalBtn");
  const modalSpaceBadge = document.getElementById("modalSpaceBadge");
  const modalSpaceCrowdBadge = document.getElementById("modalSpaceCrowdBadge");
  const modalSpaceImg = document.getElementById("modalSpaceImg");
  const modalSpaceTitle = document.getElementById("modalSpaceTitle");
  const modalSpaceLocation = document.getElementById("modalSpaceLocation");
  const modalSpaceOccupancyText = document.getElementById("modalSpaceOccupancyText");
  const modalOccupancyMeterFill = document.getElementById("modalOccupancyMeterFill");
  const modalSpaceNoise = document.getElementById("modalSpaceNoise");
  const modalSpaceUntil = document.getElementById("modalSpaceUntil");
  const modalTimelineUntilText = document.getElementById("modalTimelineUntilText");
  const modalTimelineSlotsContainer = document.getElementById("modalTimelineSlotsContainer");
  const modalSpaceFacilities = document.getElementById("modalSpaceFacilities");
  const modalSpaceSuitableFor = document.getElementById("modalSpaceSuitableFor");
  const modalSpaceBookmarkBtn = document.getElementById("modalSpaceBookmarkBtn");
  const modalSpaceNavigateBtn = document.getElementById("modalSpaceNavigateBtn");

  // ==========================================================================
  // 1. FILTERING & RENDERING PIPELINE
  // ==========================================================================
  function applySpacesFilters() {
    const allSpaces = getStoredSpaces();

    const filtered = allSpaces.filter((space) => {
      // Category filter
      if (currentCategory !== "all") {
        if (space.category.toLowerCase() !== currentCategory.toLowerCase()) return false;
      }

      // Availability filter
      if (currentAvailability !== "all") {
        const badge = (space.availabilityBadge || space.availabilityStatus || "").toLowerCase();
        const filterVal = currentAvailability.toLowerCase();
        if (!badge.includes(filterVal)) return false;
      }

      // Search keyword filter
      if (currentSearchQuery) {
        const facilitiesText = (space.facilities || []).join(" ");
        const target = `${space.name} ${space.category} ${space.location} ${facilitiesText} ${space.suitableFor || ""} ${space.shortDescription || ""}`.toLowerCase();
        if (!target.includes(currentSearchQuery)) return false;
      }

      return true;
    });

    if (spacesCounter) spacesCounter.textContent = filtered.length;

    if (spacesFilterMeta) {
      let meta = `Showing ${filtered.length} of ${allSpaces.length} campus zones`;
      if (currentCategory !== "all") meta += ` • ${currentCategory}`;
      if (currentAvailability !== "all") meta += ` • ${currentAvailability}`;
      if (currentSearchQuery) meta += ` • "${currentSearchQuery}"`;
      spacesFilterMeta.textContent = meta;
    }

    if (filtered.length === 0) {
      if (spacesGridContainer) spacesGridContainer.innerHTML = "";
      if (spacesEmptyState) spacesEmptyState.style.display = "block";
    } else {
      if (spacesEmptyState) spacesEmptyState.style.display = "none";
      renderSpacesCards(filtered);
    }
  }

  // ==========================================================================
  // 2. RENDER SPACES CARDS
  // ==========================================================================
  function renderSpacesCards(spaces) {
    if (!spacesGridContainer) return;
    const savedSpacesIds = getSavedSpaces();

    spacesGridContainer.innerHTML = spaces
      .map((sp) => {
        const isBookmarked = savedSpacesIds.includes(sp.id);
        const percent = sp.occupancyPercent || Math.round((sp.occupancy / sp.capacity) * 100);
        let meterClass = "meter-green";
        if (percent > 65) meterClass = "meter-rose";
        else if (percent > 35) meterClass = "meter-amber";

        const facilitiesHTML = (sp.facilities || [])
          .slice(0, 3)
          .map((f) => `<span class="facility-pill">✓ ${escapeHTML(f)}</span>`)
          .join("");

        return `
        <article class="space-card" data-id="${sp.id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="badge badge-primary">${escapeHTML(sp.category)}</span>
              <h3 style="color: #fff; font-size: 1.2rem; font-weight: 700; margin-top: 0.4rem;">${escapeHTML(sp.name)}</h3>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.15rem;">📍 ${escapeHTML(sp.location)}</div>
            </div>
            <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: ${sp.crowdBadgeColor || "#34d399"}; border: 1px solid rgba(16, 185, 129, 0.3);">
              ${escapeHTML(sp.crowdLevel || "Available")}
            </span>
          </div>

          <!-- Occupancy Meter -->
          <div>
            <div class="space-occupancy-indicator">
              <span>👥 ${sp.occupancy} / ${sp.capacity} people</span>
              <span style="font-size: 0.8rem; color: var(--text-dim);">${percent}% full</span>
            </div>
            <div class="occupancy-meter-bg">
              <div class="occupancy-meter-fill ${meterClass}" style="width: ${Math.max(4, percent)}%;"></div>
            </div>
          </div>

          <!-- Noise & Availability info -->
          <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted); padding: 0.4rem 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
            <span>🤫 Noise: <strong style="color: #fff;">${escapeHTML(sp.noiseLevel || "Quiet")}</strong></span>
            <span>🕒 <strong style="color: #7dd3fc;">Available until ${escapeHTML(sp.availableUntil || "Late")}</strong></span>
          </div>

          <!-- Facilities Pills -->
          <div class="space-facilities-pills">
            ${facilitiesHTML}
          </div>

          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${escapeHTML(sp.shortDescription || sp.description || "")}
          </p>

          <div style="display: flex; gap: 0.5rem; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--border);">
            <button class="btn btn-secondary btn-sm view-space-btn" data-id="${sp.id}" style="flex: 1;">
              View Space
            </button>
            <a href="navigation.html?dest=${encodeURIComponent(sp.building || sp.name)}" class="btn btn-nav-action btn-sm">
              <span>📍</span> Walk
            </a>
            <button class="btn btn-outline btn-sm bookmark-space-btn" data-id="${sp.id}" title="Bookmark space">
              ${isBookmarked ? "🔖 Saved" : "🔖"}
            </button>
          </div>
        </article>
      `;
      })
      .join("");

    attachSpaceListeners();
  }

  function attachSpaceListeners() {
    // View Space buttons
    document.querySelectorAll(".view-space-btn, .inspect-space-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const all = getStoredSpaces();
        const found = all.find((s) => s.id === id);
        if (found) openSpaceModal(found);
      });
    });

    // Space cards click
    document.querySelectorAll(".space-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        const all = getStoredSpaces();
        const found = all.find((s) => s.id === id);
        if (found) openSpaceModal(found);
      });
    });

    // Bookmark buttons
    document.querySelectorAll(".bookmark-space-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        toggleSavedSpace(id);
        applySpacesFilters();
      });
    });
  }

  // ==========================================================================
  // 3. SPACE DETAILS MODAL & TIMELINE
  // ==========================================================================
  function openSpaceModal(space) {
    activeSpaceInModal = space;
    if (!spaceDetailsModal) return;

    if (modalSpaceBadge) modalSpaceBadge.textContent = space.category;
    if (modalSpaceCrowdBadge) {
      modalSpaceCrowdBadge.textContent = space.crowdLevel || "Available";
      modalSpaceCrowdBadge.style.color = space.crowdBadgeColor || "#34d399";
    }

    if (modalSpaceImg) modalSpaceImg.src = space.image || "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80";
    if (modalSpaceTitle) modalSpaceTitle.textContent = space.name;
    if (modalSpaceLocation) modalSpaceLocation.textContent = `📍 ${space.location}`;

    // Occupancy
    const percent = space.occupancyPercent || Math.round((space.occupancy / space.capacity) * 100);
    if (modalSpaceOccupancyText) modalSpaceOccupancyText.textContent = `${space.occupancy} / ${space.capacity} people (${percent}% full)`;
    if (modalOccupancyMeterFill) {
      modalOccupancyMeterFill.style.width = `${Math.max(4, percent)}%`;
      modalOccupancyMeterFill.className = `occupancy-meter-fill ${percent > 65 ? "meter-rose" : percent > 35 ? "meter-amber" : "meter-green"}`;
    }

    if (modalSpaceNoise) modalSpaceNoise.textContent = space.noiseLevel || "Normal";
    if (modalSpaceUntil) modalSpaceUntil.textContent = space.availableUntil || "Late Night";
    if (modalTimelineUntilText) modalTimelineUntilText.textContent = `Available until ${space.availableUntil || "8:00 PM"}`;

    // Render Timeline Slots
    if (modalTimelineSlotsContainer) {
      const timelineData = space.timeline || [
        { time: "Now", status: space.occupancy === 0 ? "empty" : "low", label: `${space.occupancy}/${space.capacity}` },
        { time: "6 PM", status: "empty", label: "Free" },
        { time: "7 PM", status: "empty", label: "Free" },
        { time: "8 PM", status: "busy", label: "Busy" },
        { time: "9 PM", status: "empty", label: "Free" }
      ];

      modalTimelineSlotsContainer.innerHTML = timelineData
        .map((slot) => {
          const slotClass = slot.status === "empty" ? "slot-empty" : slot.status === "busy" ? "slot-busy" : "slot-empty";
          return `
          <div class="timeline-slot ${slotClass}">
            <strong>${escapeHTML(slot.time)}</strong><br>
            <span>${escapeHTML(slot.label)}</span>
          </div>
        `;
        })
        .join("");
    }

    // Facilities
    if (modalSpaceFacilities) {
      modalSpaceFacilities.innerHTML = (space.facilities || ["Wi-Fi", "AC", "Power Outlets"])
        .map((f) => `<span class="facility-pill">✓ ${escapeHTML(f)}</span>`)
        .join("");
    }

    if (modalSpaceSuitableFor) {
      modalSpaceSuitableFor.textContent = space.suitableFor || "Individual study, laptop work, revision.";
    }

    // Bookmark button
    const savedSpacesIds = getSavedSpaces();
    const isBookmarked = savedSpacesIds.includes(space.id);
    if (modalSpaceBookmarkBtn) {
      modalSpaceBookmarkBtn.textContent = isBookmarked ? "🔖 Saved ✓" : "🔖 Bookmark Space";
      modalSpaceBookmarkBtn.onclick = () => {
        toggleSavedSpace(space.id);
        const nowSaved = getSavedSpaces().includes(space.id);
        modalSpaceBookmarkBtn.textContent = nowSaved ? "🔖 Saved ✓" : "🔖 Bookmark Space";
        applySpacesFilters();
      };
    }

    // Direct Deep-Link to Block Navigation!
    if (modalSpaceNavigateBtn) {
      modalSpaceNavigateBtn.onclick = () => {
        const destination = space.building || space.name;
        window.location.href = `navigation.html?dest=${encodeURIComponent(destination)}`;
      };
    }

    spaceDetailsModal.classList.add("open");
  }

  function closeSpaceModal() {
    if (spaceDetailsModal) spaceDetailsModal.classList.remove("open");
    activeSpaceInModal = null;
  }

  if (closeSpaceModalBtn) closeSpaceModalBtn.addEventListener("click", closeSpaceModal);
  if (spaceDetailsModal) {
    spaceDetailsModal.addEventListener("click", (e) => {
      if (e.target === spaceDetailsModal) closeSpaceModal();
    });
  }

  // ==========================================================================
  // 4. EVENT LISTENERS FOR FILTERS
  // ==========================================================================
  function initFilterListeners() {
    if (spaceSearchInput) {
      spaceSearchInput.addEventListener("input", (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        applySpacesFilters();
      });
    }

    spaceCategoryPills.forEach((btn) => {
      btn.addEventListener("click", () => {
        spaceCategoryPills.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.getAttribute("data-category");
        applySpacesFilters();
      });
    });

    if (spaceAvailabilitySelect) {
      spaceAvailabilitySelect.addEventListener("change", (e) => {
        currentAvailability = e.target.value;
        applySpacesFilters();
      });
    }

    if (spaceResetFiltersBtn) {
      spaceResetFiltersBtn.addEventListener("click", () => {
        currentCategory = "all";
        currentAvailability = "all";
        currentSearchQuery = "";
        if (spaceSearchInput) spaceSearchInput.value = "";
        if (spaceAvailabilitySelect) spaceAvailabilitySelect.value = "all";
        spaceCategoryPills.forEach((b) => b.classList.toggle("active", b.getAttribute("data-category") === "all"));
        applySpacesFilters();
      });
    }
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    initFilterListeners();
    applySpacesFilters();
  });

})();
