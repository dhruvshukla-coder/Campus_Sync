/**
 * ============================================================================
 * CampusSync — Smart Lost & Found Module (js/lost-found.js)
 * ============================================================================
 * Implements Feature 2:
 * 1. Rule-Based Smart Matching Engine (+3 Category, +2 Colour, +2 Location, +1 Keywords)
 * 2. Multi-Filter & Real-Time Search
 * 3. Item Cards Grid with Photos, Status Badges & Relative Timestamps
 * 4. Item Details Modal with Contact / Claim flow
 * 5. Integrated Report Modal (Lost & Found) with Base64 Image Upload
 * ============================================================================
 */

(function () {
  "use strict";

  // Common English stopwords for keyword matching
  const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
    "by", "from", "up", "about", "into", "over", "after", "is", "are", "was", "were",
    "be", "been", "have", "has", "had", "it", "its", "this", "that", "these", "those",
    "i", "you", "he", "she", "we", "they", "my", "your", "his", "her", "left", "found",
    "lost", "near", "on", "of", "some", "item", "please", "contact"
  ]);

  // State
  let currentTypeFilter = "all";
  let currentCategoryFilter = "all";
  let currentLocationFilter = "all";
  let currentSearchQuery = "";
  let uploadedImageBase64 = "";

  // DOM Elements
  const lfSearchInput = document.getElementById("lfSearchInput");
  const lfTypeFilterBtns = document.querySelectorAll("#lfTypeFilters .filter-segment-btn");
  const lfCategorySelect = document.getElementById("lfCategorySelect");
  const lfLocationSelect = document.getElementById("lfLocationSelect");
  const lfResetFiltersBtn = document.getElementById("lfResetFiltersBtn");
  const lfReportsGrid = document.getElementById("lfReportsGrid");
  const lfEmptyState = document.getElementById("lfEmptyState");
  const reportsCounter = document.getElementById("reportsCounter");
  const filterResultsMeta = document.getElementById("filterResultsMeta");
  const sidebarLfCount = document.getElementById("sidebarLfCount");

  // Smart Radar
  const radarMatchesContainer = document.getElementById("radarMatchesContainer");
  const matchRadarCountBadge = document.getElementById("matchRadarCountBadge");

  // Item Details Modal Elements
  const itemDetailsModal = document.getElementById("itemDetailsModal");
  const closeDetailModalBtn = document.getElementById("closeDetailModalBtn");
  const detailCloseBtn = document.getElementById("detailCloseBtn");
  const detailStatusBadge = document.getElementById("detailStatusBadge");
  const detailCategoryBadge = document.getElementById("detailCategoryBadge");
  const detailItemImg = document.getElementById("detailItemImg");
  const detailItemTitle = document.getElementById("detailItemTitle");
  const detailLocation = document.getElementById("detailLocation");
  const detailDate = document.getElementById("detailDate");
  const detailColour = document.getElementById("detailColour");
  const detailDescription = document.getElementById("detailDescription");
  const detailMatchBox = document.getElementById("detailMatchBox");
  const detailMatchText = document.getElementById("detailMatchText");
  const claimItemBtn = document.getElementById("claimItemBtn");
  let currentlyViewedItem = null;

  // Report Modal Elements
  const openReportLostBtn = document.getElementById("openReportLostBtn");
  const openReportFoundBtn = document.getElementById("openReportFoundBtn");
  const reportItemModal = document.getElementById("reportItemModal");
  const closeReportModalBtn = document.getElementById("closeReportModalBtn");
  const cancelReportBtn = document.getElementById("cancelReportBtn");
  const modalReportForm = document.getElementById("modalReportForm");
  const reportModalTitle = document.getElementById("reportModalTitle");
  const tabReportLost = document.getElementById("tabReportLost");
  const tabReportFound = document.getElementById("tabReportFound");
  const reportTypeInput = document.getElementById("reportTypeInput");
  const submitReportModalBtn = document.getElementById("submitReportModalBtn");

  // Image Upload Elements
  const fileUploadDropzone = document.getElementById("fileUploadDropzone");
  const reportImageInput = document.getElementById("reportImageInput");
  const fileUploadPrompt = document.getElementById("fileUploadPrompt");
  const fileUploadPreview = document.getElementById("fileUploadPreview");

  // Form Inputs
  const reportItemName = document.getElementById("reportItemName");
  const reportCategory = document.getElementById("reportCategory");
  const reportColour = document.getElementById("reportColour");
  const reportLocation = document.getElementById("reportLocation");
  const reportDate = document.getElementById("reportDate");
  const reportDesc = document.getElementById("reportDesc");
  const reportContactEmail = document.getElementById("reportContactEmail");

  // ==========================================================================
  // 1. SMART MATCHING ENGINE (Rule-Based AI Radar)
  // ==========================================================================
  function extractKeywords(text) {
    if (!text) return new Set();
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    );
  }

  function calculateMatchScore(lostItem, foundItem) {
    let score = 0;
    const reasons = [];

    // Criterion 1: Category Match (+3)
    if (
      lostItem.category &&
      foundItem.category &&
      lostItem.category.toLowerCase() === foundItem.category.toLowerCase()
    ) {
      score += 3;
      reasons.push(`Category: ${lostItem.category} (+3)`);
    }

    // Criterion 2: Colour Match (+2)
    const lostCol = (lostItem.colour || "").toLowerCase().trim();
    const foundCol = (foundItem.colour || "").toLowerCase().trim();
    if (lostCol && foundCol && (lostCol === foundCol || lostCol.includes(foundCol) || foundCol.includes(lostCol))) {
      score += 2;
      reasons.push(`Colour: ${lostItem.colour} (+2)`);
    }

    // Criterion 3: Location Match (+2)
    const lostLoc = (lostItem.location || "").toLowerCase();
    const foundLoc = (foundItem.location || "").toLowerCase();
    const locTokens = lostLoc.split(/\s+/).filter((t) => t.length > 2);
    if (lostLoc && foundLoc && (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc) || locTokens.some((t) => foundLoc.includes(t)))) {
      score += 2;
      reasons.push(`Location proximity (+2)`);
    }

    // Criterion 4: Keywords (+1)
    const lostKw = extractKeywords(`${lostItem.itemName} ${lostItem.description}`);
    const foundKw = extractKeywords(`${foundItem.itemName} ${foundItem.description}`);
    const intersection = [...lostKw].filter((k) => foundKw.has(k));
    if (intersection.length > 0) {
      score += 1;
      reasons.push(`Keywords: ${intersection.slice(0, 2).join(", ")} (+1)`);
    }

    return {
      score,
      maxScore: 8,
      isMatch: score >= 4,
      confidence: score >= 6 ? "High Match" : "Possible Match",
      reasons
    };
  }

  function findPotentialMatches(reports) {
    const lostList = reports.filter((r) => r.type === "lost");
    const foundList = reports.filter((r) => r.type === "found");
    const matches = [];

    lostList.forEach((lost) => {
      foundList.forEach((found) => {
        const evalResult = calculateMatchScore(lost, found);
        if (evalResult.isMatch) {
          matches.push({
            lostItem: lost,
            foundItem: found,
            score: evalResult.score,
            confidence: evalResult.confidence,
            reasons: evalResult.reasons
          });
        }
      });
    });

    return matches.sort((a, b) => b.score - a.score);
  }

  // ==========================================================================
  // 2. RENDERING CARDS & MATCH RADAR
  // ==========================================================================
  function applyFiltersAndRender() {
    const allReports = getStoredReports();
    const allMatches = findPotentialMatches(allReports);

    // Render Smart Match Radar
    renderRadar(allMatches);

    // Filter Items
    const filtered = allReports.filter((item) => {
      // Type
      if (currentTypeFilter !== "all" && item.type !== currentTypeFilter) return false;

      // Category
      if (currentCategoryFilter !== "all" && item.category !== currentCategoryFilter) return false;

      // Location
      if (currentLocationFilter !== "all") {
        const loc = (item.location || "").toLowerCase();
        if (!loc.includes(currentLocationFilter.toLowerCase())) return false;
      }

      // Query
      if (currentSearchQuery) {
        const fullString = `${item.itemName} ${item.category} ${item.colour} ${item.location} ${item.description}`.toLowerCase();
        if (!fullString.includes(currentSearchQuery)) return false;
      }

      return true;
    });

    // Update Counter Badges
    if (reportsCounter) reportsCounter.textContent = filtered.length;
    if (sidebarLfCount) sidebarLfCount.textContent = allReports.length;

    if (filterResultsMeta) {
      let meta = `Showing ${filtered.length} of ${allReports.length} items`;
      if (currentTypeFilter !== "all") meta += ` • ${currentTypeFilter.toUpperCase()}`;
      if (currentCategoryFilter !== "all") meta += ` • ${currentCategoryFilter}`;
      if (currentSearchQuery) meta += ` • "${currentSearchQuery}"`;
      filterResultsMeta.textContent = meta;
    }

    if (filtered.length === 0) {
      if (lfReportsGrid) lfReportsGrid.innerHTML = "";
      if (lfEmptyState) lfEmptyState.style.display = "block";
    } else {
      if (lfEmptyState) lfEmptyState.style.display = "none";
      renderReportCards(filtered, allMatches);
    }
  }

  function renderRadar(matches) {
    if (!radarMatchesContainer || !matchRadarCountBadge) return;

    matchRadarCountBadge.textContent = `${matches.length} Possible ${matches.length === 1 ? "Pair" : "Pairs"}`;

    if (matches.length === 0) {
      radarMatchesContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 1rem; text-align: center; color: var(--text-dim); font-size: 0.88rem;">
          No matching item pairs currently meet the 4/8 confidence threshold.
        </div>
      `;
      return;
    }

    radarMatchesContainer.innerHTML = matches
      .slice(0, 4)
      .map((m) => `
        <div class="radar-match-pair">
          <span class="match-score-badge">Match: ${m.score}/8 pts</span>

          <div style="font-size: 0.8rem; color: #fcd34d; font-weight: 700;">
            ⚡ ${m.confidence}
          </div>

          <div class="match-items-comparison">
            <div class="match-item-subcard">
              <span style="color: var(--accent-rose); font-weight: 700; font-size: 0.7rem; text-transform: uppercase;">Lost</span>
              <strong>${escapeHTML(m.lostItem.itemName)}</strong>
              <span>📍 ${escapeHTML(m.lostItem.location)}</span>
            </div>
            <span style="color: var(--text-dim); font-size: 1.1rem;">⇄</span>
            <div class="match-item-subcard">
              <span style="color: var(--accent-teal); font-weight: 700; font-size: 0.7rem; text-transform: uppercase;">Found</span>
              <strong>${escapeHTML(m.foundItem.itemName)}</strong>
              <span>📍 ${escapeHTML(m.foundItem.location)}</span>
            </div>
          </div>

          <div class="match-reasons-tags">
            ${m.reasons.map((r) => `<span class="match-reason-tag">✓ ${escapeHTML(r)}</span>`).join("")}
          </div>

          <button class="btn btn-secondary btn-sm view-matched-pair-btn" data-lost-id="${m.lostItem.id}" data-found-id="${m.foundItem.id}" style="margin-top: 0.25rem;">
            Inspect Pair Details
          </button>
        </div>
      `)
      .join("");

    radarMatchesContainer.querySelectorAll(".view-matched-pair-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lostId = btn.getAttribute("data-lost-id");
        const all = getStoredReports();
        const foundItem = all.find((r) => r.id === lostId);
        if (foundItem) openItemDetails(foundItem);
      });
    });
  }

  function renderReportCards(items, matches) {
    if (!lfReportsGrid) return;

    const matchedLostIds = new Set(matches.map((m) => m.lostItem.id));
    const matchedFoundIds = new Set(matches.map((m) => m.foundItem.id));

    lfReportsGrid.innerHTML = items
      .map((item) => {
        const isLost = item.type === "lost";
        const badgeClass = isLost ? "badge-lost" : "badge-found";
        const badgeText = isLost ? "LOST" : "FOUND";
        const isRecovered = item.status === "recovered";
        const hasMatch = (isLost && matchedLostIds.has(item.id)) || (!isLost && matchedFoundIds.has(item.id));
        const itemImg = item.image || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80";

        return `
        <article class="lf-item-card" data-id="${item.id}">
          <div class="lf-card-image-wrap">
            <img src="${itemImg}" alt="${escapeHTML(item.itemName)}" class="lf-card-img" loading="lazy">
            <div class="lf-card-badge">
              <span class="badge ${badgeClass}">${badgeText}</span>
              ${isRecovered ? `<span class="badge badge-primary" style="margin-left: 4px;">RECOVERED</span>` : ""}
            </div>
            <span class="lf-card-time">${escapeHTML(item.relativeTime || "Recently")}</span>
          </div>

          <div class="lf-card-body">
            <h3 class="lf-card-title">${escapeHTML(item.itemName)}</h3>

            <div class="lf-meta-row">
              <span>📍 ${escapeHTML(item.location)}</span>
              <span>•</span>
              <span>📂 ${escapeHTML(item.category)}</span>
            </div>

            <p class="lf-card-desc">${escapeHTML(item.description)}</p>

            ${
              hasMatch
                ? `<div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); padding: 0.3rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.75rem; color: #fcd34d; display: flex; align-items: center; gap: 0.35rem;">
                     <span>⚡</span> <strong>Possible Match Available in Radar</strong>
                   </div>`
                : ""
            }

            <div class="lf-card-footer">
              <span style="font-size: 0.78rem; color: var(--text-dim);">🎨 ${escapeHTML(item.colour)}</span>
              <button class="btn btn-secondary btn-sm view-details-btn" data-id="${item.id}">
                View Details
              </button>
            </div>
          </div>
        </article>
      `;
      })
      .join("");

    // Attach click listeners
    lfReportsGrid.querySelectorAll(".view-details-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const found = items.find((it) => it.id === id);
        if (found) openItemDetails(found);
      });
    });

    lfReportsGrid.querySelectorAll(".lf-item-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        const found = items.find((it) => it.id === id);
        if (found) openItemDetails(found);
      });
    });
  }

  // ==========================================================================
  // 3. ITEM DETAILS MODAL & CLAIM FLOW
  // ==========================================================================
  function openItemDetails(item) {
    currentlyViewedItem = item;
    if (!itemDetailsModal) return;

    const isLost = item.type === "lost";
    if (detailStatusBadge) {
      detailStatusBadge.className = isLost ? "badge badge-lost" : "badge badge-found";
      detailStatusBadge.textContent = isLost ? "LOST ITEM" : "FOUND ITEM";
    }

    if (detailCategoryBadge) detailCategoryBadge.textContent = item.category;
    if (detailItemTitle) detailItemTitle.textContent = item.itemName;
    if (detailLocation) detailLocation.textContent = item.location;
    if (detailDate) detailDate.textContent = item.relativeTime || formatDate(item.date);
    if (detailColour) detailColour.textContent = item.colour || "Not specified";
    if (detailDescription) detailDescription.textContent = item.description;
    if (detailItemImg) detailItemImg.src = item.image || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80";

    // Check if item has a match in opposite pool
    const allReports = getStoredReports();
    const allMatches = findPotentialMatches(allReports);
    const relatedMatch = allMatches.find(
      (m) => (isLost && m.lostItem.id === item.id) || (!isLost && m.foundItem.id === item.id)
    );

    if (detailMatchBox && detailMatchText) {
      if (relatedMatch) {
        detailMatchBox.style.display = "block";
        const opposite = isLost ? relatedMatch.foundItem : relatedMatch.lostItem;
        detailMatchText.textContent = `Scored ${relatedMatch.score}/8 pts against "${opposite.itemName}" at ${opposite.location}. Check the Smart Radar on the board.`;
      } else {
        detailMatchBox.style.display = "none";
      }
    }

    itemDetailsModal.classList.add("open");
  }

  function closeItemDetails() {
    if (itemDetailsModal) itemDetailsModal.classList.remove("open");
    currentlyViewedItem = null;
  }

  if (closeDetailModalBtn) closeDetailModalBtn.addEventListener("click", closeItemDetails);
  if (detailCloseBtn) detailCloseBtn.addEventListener("click", closeItemDetails);
  if (itemDetailsModal) {
    itemDetailsModal.addEventListener("click", (e) => {
      if (e.target === itemDetailsModal) closeItemDetails();
    });
  }

  if (claimItemBtn) {
    claimItemBtn.addEventListener("click", () => {
      if (!currentlyViewedItem) return;
      closeItemDetails();
      if (typeof showPrivateContactNotice === "function") {
        showPrivateContactNotice(currentlyViewedItem);
      } else {
        showToast("Claim request logged! Student services will verify ownership.", "success");
      }
    });
  }

  // ==========================================================================
  // 4. REPORT MODAL (LOST & FOUND) & IMAGE UPLOAD
  // ==========================================================================
  function openReportModal(defaultType = "lost") {
    if (!reportItemModal) return;
    setReportType(defaultType);

    // Set today's date
    if (reportDate) {
      const today = new Date().toISOString().split("T")[0];
      reportDate.value = today;
    }

    reportItemModal.classList.add("open");
  }

  function closeReportModal() {
    if (reportItemModal) reportItemModal.classList.remove("open");
    if (modalReportForm) modalReportForm.reset();
    resetImagePreview();
  }

  function setReportType(type) {
    if (reportTypeInput) reportTypeInput.value = type;

    if (type === "lost") {
      tabReportLost.classList.add("active");
      tabReportFound.classList.remove("active");
      if (reportModalTitle) reportModalTitle.textContent = "Report a Lost Item";
      if (submitReportModalBtn) submitReportModalBtn.textContent = "Submit Lost Item";
    } else {
      tabReportFound.classList.add("active");
      tabReportLost.classList.remove("active");
      if (reportModalTitle) reportModalTitle.textContent = "Report a Found Item";
      if (submitReportModalBtn) submitReportModalBtn.textContent = "Submit Found Item";
    }
  }

  if (openReportLostBtn) openReportLostBtn.addEventListener("click", () => openReportModal("lost"));
  if (openReportFoundBtn) openReportFoundBtn.addEventListener("click", () => openReportModal("found"));
  if (closeReportModalBtn) closeReportModalBtn.addEventListener("click", closeReportModal);
  if (cancelReportBtn) cancelReportBtn.addEventListener("click", closeReportModal);
  if (tabReportLost) tabReportLost.addEventListener("click", () => setReportType("lost"));
  if (tabReportFound) tabReportFound.addEventListener("click", () => setReportType("found"));

  if (reportItemModal) {
    reportItemModal.addEventListener("click", (e) => {
      if (e.target === reportItemModal) closeReportModal();
    });
  }

  // Image upload via FileReader
  if (fileUploadDropzone && reportImageInput) {
    fileUploadDropzone.addEventListener("click", () => {
      reportImageInput.click();
    });

    reportImageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        uploadedImageBase64 = event.target.result;
        if (fileUploadPrompt) fileUploadPrompt.style.display = "none";
        if (fileUploadPreview) {
          fileUploadPreview.src = uploadedImageBase64;
          fileUploadPreview.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function resetImagePreview() {
    uploadedImageBase64 = "";
    if (reportImageInput) reportImageInput.value = "";
    if (fileUploadPrompt) fileUploadPrompt.style.display = "block";
    if (fileUploadPreview) {
      fileUploadPreview.src = "";
      fileUploadPreview.style.display = "none";
    }
  }

  // Handle Form Submission
  if (modalReportForm) {
    modalReportForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const type = reportTypeInput ? reportTypeInput.value : "lost";
      const itemName = reportItemName.value.trim();
      const category = reportCategory.value;
      const colour = reportColour.value.trim();
      const location = reportLocation.value.trim();
      const date = reportDate.value;
      const description = reportDesc.value.trim();
      const contactEmail = reportContactEmail.value.trim();

      if (!itemName || !category || !colour || !location || !date || !description || !contactEmail) {
        showToast("Please fill in all required fields.", "error");
        return;
      }

      // Default sample fallback image if none uploaded
      let itemImage = uploadedImageBase64;
      if (!itemImage) {
        if (category === "Electronics") itemImage = "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80";
        else if (category === "Bags") itemImage = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80";
        else if (category === "Cards/IDs") itemImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";
        else itemImage = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";
      }

      const newReport = {
        id: "lf-" + Date.now(),
        type: type,
        itemName: itemName,
        category: category,
        colour: colour,
        location: location,
        date: date,
        time: "Just now",
        description: description,
        contactEmail: contactEmail,
        image: itemImage,
        status: "active",
        relativeTime: "Just now"
      };

      const existingReports = getStoredReports();
      existingReports.unshift(newReport);
      saveStoredReports(existingReports);

      // Notification & Toast
      const successMsg = type === "lost" ? "Lost item reported successfully." : "Found item reported successfully.";
      showToast(successMsg, "success");
      addNotification(`New ${type.toUpperCase()} Report`, `"${itemName}" was logged at ${location}.`, "match");

      closeReportModal();
      applyFiltersAndRender();
    });
  }

  // ==========================================================================
  // 5. EVENT LISTENERS FOR FILTERS
  // ==========================================================================
  function initFilterListeners() {
    if (lfSearchInput) {
      lfSearchInput.addEventListener("input", (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        applyFiltersAndRender();
      });
    }

    lfTypeFilterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        lfTypeFilterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentTypeFilter = btn.getAttribute("data-type");
        applyFiltersAndRender();
      });
    });

    if (lfCategorySelect) {
      lfCategorySelect.addEventListener("change", (e) => {
        currentCategoryFilter = e.target.value;
        applyFiltersAndRender();
      });
    }

    if (lfLocationSelect) {
      lfLocationSelect.addEventListener("change", (e) => {
        currentLocationFilter = e.target.value;
        applyFiltersAndRender();
      });
    }

    if (lfResetFiltersBtn) {
      lfResetFiltersBtn.addEventListener("click", () => {
        currentTypeFilter = "all";
        currentCategoryFilter = "all";
        currentLocationFilter = "all";
        currentSearchQuery = "";
        if (lfSearchInput) lfSearchInput.value = "";
        if (lfCategorySelect) lfCategorySelect.value = "all";
        if (lfLocationSelect) lfLocationSelect.value = "all";
        lfTypeFilterBtns.forEach((b) => b.classList.toggle("active", b.getAttribute("data-type") === "all"));
        applyFiltersAndRender();
      });
    }
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    initFilterListeners();
    applyFiltersAndRender();
  });

})();
