/**
 * ============================================================================
 * CampusSync — Campus Events Discovery Module (js/events.js)
 * ============================================================================
 * Implements Feature 3:
 * 1. 🔴 Happening Now Section with Live Countdown & Pulse
 * 2. Upcoming Events Feed with RSVP & Bookmark Interactions
 * 3. Completed Past Events Archive
 * 4. Timing & Category Filtering
 * 5. Event Details Modal with "Navigate to Venue" Deep-linking
 * ============================================================================
 */

(function () {
  "use strict";

  // State
  let currentTimingFilter = "all";
  let currentCategoryFilter = "all";
  let currentSearchQuery = "";
  let activeEventInModal = null;

  // DOM Elements
  const liveEventsContainer = document.getElementById("liveEventsContainer");
  const upcomingEventsGrid = document.getElementById("upcomingEventsGrid");
  const completedEventsGrid = document.getElementById("completedEventsGrid");
  const upcomingCount = document.getElementById("upcomingCount");
  const eventsFilterMeta = document.getElementById("eventsFilterMeta");
  const eventsEmptyState = document.getElementById("eventsEmptyState");
  const eventSearchInput = document.getElementById("eventSearchInput");
  const eventTimingFilterBtns = document.querySelectorAll("#eventTimingFilters .filter-segment-btn");
  const eventCategorySelect = document.getElementById("eventCategorySelect");
  const eventResetFiltersBtn = document.getElementById("eventResetFiltersBtn");
  const happeningNowSection = document.getElementById("happeningNowSection");
  const completedEventsSection = document.getElementById("completedEventsSection");

  // Modal Elements
  const eventDetailsModal = document.getElementById("eventDetailsModal");
  const closeEventModalBtn = document.getElementById("closeEventModalBtn");
  const modalEventBadge = document.getElementById("modalEventBadge");
  const modalEventLiveTag = document.getElementById("modalEventLiveTag");
  const modalEventBanner = document.getElementById("modalEventBanner");
  const modalEventTitle = document.getElementById("modalEventTitle");
  const modalEventOrganizer = document.getElementById("modalEventOrganizer");
  const modalEventDateTime = document.getElementById("modalEventDateTime");
  const modalEventVenue = document.getElementById("modalEventVenue");
  const modalEventDesc = document.getElementById("modalEventDesc");
  const modalEventRsvpCount = document.getElementById("modalEventRsvpCount");
  const modalNavigateVenueBtn = document.getElementById("modalNavigateVenueBtn");
  const modalBookmarkBtn = document.getElementById("modalBookmarkBtn");
  const modalRsvpBtn = document.getElementById("modalRsvpBtn");

  // ==========================================================================
  // 1. FILTERING & RENDERING PIPELINE
  // ==========================================================================
  function applyEventsFilters() {
    const allEvents = getStoredEvents();

    // 1. Render Live Happening Now Section
    const liveEvents = allEvents.filter((ev) => ev.isLiveNow || ev.status === "live");
    renderLiveEvents(liveEvents);

    // 2. Filter Upcoming & Completed sets
    const filtered = allEvents.filter((ev) => {
      // Timing filter
      if (currentTimingFilter === "live") {
        if (!ev.isLiveNow && ev.status !== "live") return false;
      } else if (currentTimingFilter === "upcoming") {
        if (ev.status === "completed" || ev.isLiveNow) return false;
      } else if (currentTimingFilter === "completed") {
        if (ev.status !== "completed") return false;
      } else if (currentTimingFilter === "thisWeek") {
        if (ev.status === "completed") return false;
      }

      // Category filter
      if (currentCategoryFilter !== "all" && ev.category !== currentCategoryFilter) {
        return false;
      }

      // Search keyword filter
      if (currentSearchQuery) {
        const text = `${ev.name} ${ev.organizer} ${ev.location} ${ev.category} ${ev.description}`.toLowerCase();
        if (!text.includes(currentSearchQuery)) return false;
      }

      return true;
    });

    const upcomingList = filtered.filter((ev) => ev.status !== "completed");
    const completedList = filtered.filter((ev) => ev.status === "completed");

    if (upcomingCount) upcomingCount.textContent = upcomingList.length;

    if (eventsFilterMeta) {
      let meta = `Showing ${filtered.length} of ${allEvents.length} events`;
      if (currentTimingFilter !== "all") meta += ` • ${currentTimingFilter}`;
      if (currentCategoryFilter !== "all") meta += ` • ${currentCategoryFilter}`;
      if (currentSearchQuery) meta += ` • "${currentSearchQuery}"`;
      eventsFilterMeta.textContent = meta;
    }

    // Toggle Empty State vs Grids
    if (filtered.length === 0) {
      if (upcomingEventsGrid) upcomingEventsGrid.innerHTML = "";
      if (completedEventsGrid) completedEventsGrid.innerHTML = "";
      if (eventsEmptyState) eventsEmptyState.style.display = "block";
    } else {
      if (eventsEmptyState) eventsEmptyState.style.display = "none";
      renderUpcomingGrid(upcomingList);
      renderCompletedGrid(completedList);
    }
  }

  // ==========================================================================
  // 2. RENDER 🔴 HAPPENING NOW SECTION
  // ==========================================================================
  function renderLiveEvents(liveEvents) {
    if (!liveEventsContainer || !happeningNowSection) return;

    if (liveEvents.length === 0) {
      happeningNowSection.style.display = "none";
      return;
    }

    happeningNowSection.style.display = "block";
    const ev = liveEvents[0];
    const userRsvps = getUserRsvps();
    const isRsvped = userRsvps.includes(ev.id);

    liveEventsContainer.innerHTML = `
      <div class="live-event-banner-card">
        <div class="live-event-content">
          <div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
              <span class="live-countdown-pill">
                <span class="pulse-dot" style="background: #fff;"></span>
                <span>${escapeHTML(ev.startedAgo || "Started 25 mins ago")}</span>
              </span>
              <span class="badge badge-purple">${escapeHTML(ev.category)}</span>
            </div>

            <h3 style="color: #fff; font-size: 1.6rem; font-weight: 800; line-height: 1.25; margin-bottom: 0.5rem;">
              ${escapeHTML(ev.name)}
            </h3>

            <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.75rem;">
              <span>📍 <strong style="color: #fff;">${escapeHTML(ev.location)}</strong></span>
              <span>🕒 <strong style="color: #fff;">${escapeHTML(ev.time)}</strong></span>
              <span>👥 <strong style="color: #fff;">${ev.rsvps || 142} Attending</strong></span>
            </div>

            <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; max-width: 650px;">
              ${escapeHTML(ev.description)}
            </p>
          </div>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn btn-primary view-event-btn" data-id="${ev.id}">
              View Live Event
            </button>
            <a href="navigation.html?dest=${encodeURIComponent(ev.location)}" class="btn btn-nav-action">
              <span>📍</span> Walk to Venue &rarr;
            </a>
            <button class="rsvp-pill-btn live-rsvp-btn ${isRsvped ? "rsvped" : ""}" data-id="${ev.id}">
              ${isRsvped ? "✓ Attending" : `RSVP (${ev.rsvps})`}
            </button>
          </div>
        </div>

        <div class="live-event-img-wrap">
          <img src="${ev.image || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80"}" alt="${escapeHTML(ev.name)}">
        </div>
      </div>
    `;

    // Attach listeners
    liveEventsContainer.querySelectorAll(".view-event-btn").forEach((btn) => {
      btn.addEventListener("click", () => openEventModal(ev));
    });

    liveEventsContainer.querySelectorAll(".live-rsvp-btn").forEach((btn) => {
      btn.addEventListener("click", () => toggleRsvp(ev.id));
    });
  }

  // ==========================================================================
  // 3. RENDER UPCOMING EVENTS
  // ==========================================================================
  function renderUpcomingGrid(events) {
    if (!upcomingEventsGrid) return;
    const userRsvps = getUserRsvps();
    const savedEventIds = getSavedEvents();

    upcomingEventsGrid.innerHTML = events
      .map((ev) => {
        const isRsvped = userRsvps.includes(ev.id);
        const isBookmarked = savedEventIds.includes(ev.id);
        const dateObj = new Date(ev.date + "T00:00:00");
        const monthStr = dateObj.toLocaleDateString("en-US", { month: "short" });
        const dayStr = dateObj.getDate();

        return `
        <article class="event-card" data-id="${ev.id}">
          <div class="event-banner-wrap">
            <img src="${ev.image || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"}" alt="${escapeHTML(ev.name)}" class="event-banner-img" loading="lazy">
            <div class="event-date-chip">
              <span class="month">${monthStr}</span>
              <span class="day">${dayStr}</span>
            </div>
            ${
              ev.isLiveNow
                ? `<span class="badge badge-live" style="position: absolute; top: 0.75rem; right: 0.75rem;">LIVE</span>`
                : ""
            }
          </div>

          <div class="event-card-body">
            <span class="badge badge-purple event-category-badge">${escapeHTML(ev.category)}</span>
            <h3 class="event-title">${escapeHTML(ev.name)}</h3>

            <div class="event-details-meta">
              <span>📍 ${escapeHTML(ev.location)}</span>
              <span>🕒 ${escapeHTML(ev.time)}</span>
              <span>🏛️ ${escapeHTML(ev.organizer || "Campus Society")}</span>
            </div>

            <div class="event-card-footer">
              <button class="rsvp-pill-btn ${isRsvped ? "rsvped" : ""}" data-id="${ev.id}">
                ${isRsvped ? "✓ Attending" : `RSVP (${ev.rsvps || 0})`}
              </button>
              <div style="display: flex; gap: 0.4rem;">
                <button class="btn btn-outline btn-sm bookmark-btn ${isBookmarked ? "bookmarked" : ""}" data-id="${ev.id}" title="Bookmark event">
                  ${isBookmarked ? "🔖 Saved" : "🔖"}
                </button>
                <button class="btn btn-secondary btn-sm view-event-btn" data-id="${ev.id}">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
      })
      .join("");

    attachCardListeners(upcomingEventsGrid, events);
  }

  // ==========================================================================
  // 4. RENDER COMPLETED EVENTS
  // ==========================================================================
  function renderCompletedGrid(events) {
    if (!completedEventsGrid || !completedEventsSection) return;

    if (events.length === 0) {
      completedEventsSection.style.display = "none";
      return;
    }

    completedEventsSection.style.display = "block";
    completedEventsGrid.innerHTML = events
      .map((ev) => `
        <article class="event-card" style="opacity: 0.85;" data-id="${ev.id}">
          <div class="event-banner-wrap">
            <img src="${ev.image || "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"}" alt="${escapeHTML(ev.name)}" class="event-banner-img" loading="lazy">
            <span class="badge badge-secondary" style="position: absolute; top: 0.75rem; right: 0.75rem;">Completed</span>
          </div>

          <div class="event-card-body">
            <span class="badge badge-primary event-category-badge">${escapeHTML(ev.category)}</span>
            <h3 class="event-title">${escapeHTML(ev.name)}</h3>
            <div class="event-details-meta">
              <span>📍 ${escapeHTML(ev.location)}</span>
              <span>📅 ${formatDate(ev.date)}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">${escapeHTML(ev.description)}</p>
            <div class="event-card-footer">
              <span style="font-size: 0.8rem; color: var(--text-dim);">Concluded</span>
              <button class="btn btn-secondary btn-sm view-event-btn" data-id="${ev.id}">View Recap</button>
            </div>
          </div>
        </article>
      `)
      .join("");

    attachCardListeners(completedEventsGrid, events);
  }

  function attachCardListeners(container, eventList) {
    container.querySelectorAll(".view-event-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const found = eventList.find((ev) => ev.id === id);
        if (found) openEventModal(found);
      });
    });

    container.querySelectorAll(".rsvp-pill-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        toggleRsvp(id);
      });
    });

    container.querySelectorAll(".bookmark-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        toggleSavedEvent(id);
        applyEventsFilters();
      });
    });

    container.querySelectorAll(".event-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        const found = eventList.find((ev) => ev.id === id);
        if (found) openEventModal(found);
      });
    });
  }

  // ==========================================================================
  // 5. RSVP & BOOKMARK TOGGLES
  // ==========================================================================
  function toggleRsvp(eventId) {
    const allEvents = getStoredEvents();
    const eventItem = allEvents.find((e) => e.id === eventId);
    if (!eventItem) return;

    let userRsvps = getUserRsvps();
    const isAlready = userRsvps.includes(eventId);

    if (isAlready) {
      userRsvps = userRsvps.filter((id) => id !== eventId);
      eventItem.rsvps = Math.max(0, (eventItem.rsvps || 1) - 1);
      showToast("RSVP cancelled", "info");
    } else {
      userRsvps.push(eventId);
      eventItem.rsvps = (eventItem.rsvps || 0) + 1;
      showToast("RSVP confirmed! See you there 🎉", "success");
      addNotification("RSVP Confirmed", `Your seat for ${eventItem.name} is reserved.`, "event");
    }

    saveStoredEvents(allEvents);
    saveUserRsvps(userRsvps);

    // Refresh modal if active
    if (activeEventInModal && activeEventInModal.id === eventId) {
      activeEventInModal.rsvps = eventItem.rsvps;
      updateModalControls(activeEventInModal);
    }

    applyEventsFilters();
  }

  // ==========================================================================
  // 6. EVENT DETAILS MODAL & VENUE DEEP-LINK
  // ==========================================================================
  function openEventModal(event) {
    activeEventInModal = event;
    if (!eventDetailsModal) return;

    if (modalEventBadge) modalEventBadge.textContent = event.category;
    if (modalEventLiveTag) modalEventLiveTag.style.display = event.isLiveNow ? "inline-flex" : "none";
    if (modalEventBanner) modalEventBanner.src = event.image || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80";
    if (modalEventTitle) modalEventTitle.textContent = event.name;
    if (modalEventOrganizer) modalEventOrganizer.textContent = `Organized by: ${event.organizer || "Campus Student Council"}`;
    if (modalEventDateTime) modalEventDateTime.textContent = `${formatDate(event.date)} • ${event.time}`;
    if (modalEventVenue) modalEventVenue.textContent = event.location;
    if (modalEventDesc) modalEventDesc.textContent = event.description;
    if (modalEventRsvpCount) modalEventRsvpCount.textContent = `${event.rsvps || 0} Students Attending`;

    updateModalControls(event);

    // Deep link to Block Navigation!
    if (modalNavigateVenueBtn) {
      modalNavigateVenueBtn.onclick = () => {
        window.location.href = `navigation.html?dest=${encodeURIComponent(event.location)}`;
      };
    }

    eventDetailsModal.classList.add("open");
  }

  function updateModalControls(event) {
    const userRsvps = getUserRsvps();
    const savedEventIds = getSavedEvents();
    const isRsvped = userRsvps.includes(event.id);
    const isBookmarked = savedEventIds.includes(event.id);

    if (modalRsvpBtn) {
      modalRsvpBtn.textContent = isRsvped ? "✓ Attending (Cancel RSVP)" : "RSVP Now";
      modalRsvpBtn.className = isRsvped ? "btn btn-outline" : "btn btn-primary";
      modalRsvpBtn.onclick = () => toggleRsvp(event.id);
    }

    if (modalBookmarkBtn) {
      modalBookmarkBtn.textContent = isBookmarked ? "🔖 Saved ✓" : "🔖 Bookmark";
      modalBookmarkBtn.onclick = () => {
        toggleSavedEvent(event.id);
        updateModalControls(event);
        applyEventsFilters();
      };
    }
  }

  function closeEventModal() {
    if (eventDetailsModal) eventDetailsModal.classList.remove("open");
    activeEventInModal = null;
  }

  if (closeEventModalBtn) closeEventModalBtn.addEventListener("click", closeEventModal);
  if (eventDetailsModal) {
    eventDetailsModal.addEventListener("click", (e) => {
      if (e.target === eventDetailsModal) closeEventModal();
    });
  }

  // ==========================================================================
  // 7. EVENT LISTENERS FOR FILTERS
  // ==========================================================================
  function initFilterListeners() {
    if (eventSearchInput) {
      eventSearchInput.addEventListener("input", (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        applyEventsFilters();
      });
    }

    eventTimingFilterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        eventTimingFilterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentTimingFilter = btn.getAttribute("data-time");
        applyEventsFilters();
      });
    });

    if (eventCategorySelect) {
      eventCategorySelect.addEventListener("change", (e) => {
        currentCategoryFilter = e.target.value;
        applyEventsFilters();
      });
    }

    if (eventResetFiltersBtn) {
      eventResetFiltersBtn.addEventListener("click", () => {
        currentTimingFilter = "all";
        currentCategoryFilter = "all";
        currentSearchQuery = "";
        if (eventSearchInput) eventSearchInput.value = "";
        if (eventCategorySelect) eventCategorySelect.value = "all";
        eventTimingFilterBtns.forEach((b) => b.classList.toggle("active", b.getAttribute("data-time") === "all"));
        applyEventsFilters();
      });
    }
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    initFilterListeners();
    applyEventsFilters();
  });

})();
