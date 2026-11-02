/**
 * ============================================================================
 * CampusSync — Shared Core Utilities, Data Layer & Navigation (js/main.js)
 * ============================================================================
 * Handles:
 * 1. Data Storage & Initialization (localStorage seed from demo-data.js)
 * 2. Responsive Dashboard Sidebar & Mobile Navigation Drawer
 * 3. Dynamic Student Greeting Utility
 * 4. Notification Center Dropdown & Live Toasts
 * 5. Unified Student Profile & Bookmarks Modal
 * 6. Global Navigation Helpers (Deep-link to Where is your Block?)
 * ============================================================================
 */

// Storage Keys
const STORAGE_KEYS = {
  REPORTS: "campussync_reports",
  SPACES: "campussync_spaces",
  EVENTS: "campussync_events",
  SAVED_EVENTS: "campussync_saved_events",
  SAVED_SPACES: "campussync_saved_spaces",
  NOTIFICATIONS: "campussync_notifications",
  USER_RSVPS: "campussync_user_rsvps",
  USER_PROFILE: "campussync_user_profile"
};

// Automatic cleanup / migration of any legacy cached strings in browser
try {
  if (typeof localStorage !== "undefined") {
    ["campussync_current_session", "campussync_user_profile", "campussync_users"].forEach((k) => {
      const raw = localStorage.getItem(k);
      if (raw && (raw.includes("Shivom Gupta") || raw.includes("shivom.gupta@lpu.in"))) {
        const fixed = raw
          .replace(/Shivom Gupta/g, "Anukalp Shukla")
          .replace(/shivom\.gupta@lpu\.in/g, "anukalp.shukla@lpu.in");
        localStorage.setItem(k, fixed);
      }
    });
  }
} catch (e) {}

// ============================================================================
// 1. DATA STORAGE LAYER
// ============================================================================

/**
 * Reads all Lost & Found reports. Seeds with DEMO_LOST_FOUND if empty.
 */
function getStoredReports() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error reading reports:", error);
  }

  if (typeof DEMO_LOST_FOUND !== "undefined" && Array.isArray(DEMO_LOST_FOUND)) {
    saveStoredReports(DEMO_LOST_FOUND);
    return DEMO_LOST_FOUND;
  }
  return [];
}

function saveStoredReports(reportsArray) {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reportsArray));
    return true;
  } catch (error) {
    console.error("Error saving reports:", error);
    return false;
  }
}

/**
 * Reads all Campus Spaces. Seeds with DEMO_SPACES if empty.
 */
function getStoredSpaces() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.SPACES);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error reading spaces:", error);
  }

  if (typeof DEMO_SPACES !== "undefined" && Array.isArray(DEMO_SPACES)) {
    try {
      localStorage.setItem(STORAGE_KEYS.SPACES, JSON.stringify(DEMO_SPACES));
    } catch (e) {}
    return DEMO_SPACES;
  }
  return [];
}

function saveStoredSpaces(spacesArray) {
  try {
    localStorage.setItem(STORAGE_KEYS.SPACES, JSON.stringify(spacesArray));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Reads Campus Events. Seeds with DEMO_EVENTS if empty.
 */
function getStoredEvents() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error reading events:", error);
  }

  if (typeof DEMO_EVENTS !== "undefined" && Array.isArray(DEMO_EVENTS)) {
    saveStoredEvents(DEMO_EVENTS);
    return DEMO_EVENTS;
  }
  return [];
}

function saveStoredEvents(eventsArray) {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(eventsArray));
    return true;
  } catch (error) {
    console.error("Error saving events:", error);
    return false;
  }
}

/**
 * User RSVPs
 */
function getUserRsvps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_RSVPS);
    return raw ? JSON.parse(raw) : ["ev-1"]; // default RSVP to live talk
  } catch (e) {
    return ["ev-1"];
  }
}

function saveUserRsvps(rsvpsArray) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_RSVPS, JSON.stringify(rsvpsArray));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Saved / Bookmarked Items
 */
function getSavedEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_EVENTS);
    return raw ? JSON.parse(raw) : ["ev-4"]; // default HackFest bookmarked
  } catch (e) {
    return ["ev-4"];
  }
}

function toggleSavedEvent(eventId) {
  let saved = getSavedEvents();
  const index = saved.indexOf(eventId);
  let isSaved = false;

  if (index > -1) {
    saved.splice(index, 1);
    isSaved = false;
    showToast("Event removed from bookmarks", "info");
  } else {
    saved.push(eventId);
    isSaved = true;
    showToast("Event saved to bookmarks! 🔖", "success");
    addNotification("Event Bookmarked", "Saved event to your campus activities calendar.", "bookmark");
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_EVENTS, JSON.stringify(saved));
  } catch (e) {}

  updateBadges();
  return isSaved;
}

function getSavedSpaces() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_SPACES);
    return raw ? JSON.parse(raw) : ["space-library-silent"];
  } catch (e) {
    return ["space-library-silent"];
  }
}

function toggleSavedSpace(spaceId) {
  let saved = getSavedSpaces();
  const index = saved.indexOf(spaceId);
  let isSaved = false;

  if (index > -1) {
    saved.splice(index, 1);
    isSaved = false;
    showToast("Space removed from saved", "info");
  } else {
    saved.push(spaceId);
    isSaved = true;
    showToast("Space saved to bookmarks! 🔖", "success");
    addNotification("Space Saved", "Added study space to your bookmarked spots.", "bookmark");
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_SPACES, JSON.stringify(saved));
  } catch (e) {}

  updateBadges();
  return isSaved;
}

// ============================================================================
// 2. DYNAMIC GREETING & USER CARD UTILITIES
// ============================================================================

/**
 * Returns greeting prefix based on local device time:
 * - 05:00 to 11:59 → "Good Morning"
 * - 12:00 to 16:59 → "Good Afternoon"
 * - 17:00 to 20:59 → "Good Evening"
 * - 21:00 to 04:59 → "Good Night"
 */
function getGreetingPrefix(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
}

/**
 * Formats greeting as: "<Greeting>, <FirstName>! 👋"
 * Dynamically uses the logged-in user's first name.
 * Falls back to "Student" or guest greeting if not logged in.
 */
function getStudentGreeting(customDate) {
  const user = typeof CampusAuth !== "undefined" ? CampusAuth.getCurrentUser() : null;
  const prefix = getGreetingPrefix(customDate || new Date());
  if (user && (user.fullName || user.name) && (user.fullName || user.name).trim()) {
    const rawName = (user.fullName || user.name).trim();
    const firstName = rawName.split(/\s+/)[0];
    return `${prefix}, ${firstName}! 👋`;
  }
  return `${prefix}, Student! 👋`;
}

function initDynamicGreeting() {
  const greetingEl = document.getElementById("studentGreeting");
  if (greetingEl) {
    greetingEl.textContent = getStudentGreeting();
  }
}

/**
 * Computes dynamic avatar initials from a full name:
 * - "Rahul Sharma" -> "RS"
 * - "Priya" -> "P"
 * - Multi-word: first letter of first word + first letter of last word, uppercase.
 * - Single-word: first letter, uppercase.
 * - Empty / Guest: "--"
 */
function getAvatarInitials(name) {
  if (!name || typeof name !== "string") return "--";
  const trimmed = name.trim();
  if (!trimmed) return "--";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return "--";
}

/**
 * Updates sidebar profile card & any user indicators with logged-in user details:
 * - If logged in: shows user's entered name, registration number/course, and initials.
 * - If not logged in: shows guest/blank state ("Guest Student", "--", "Not signed in").
 * - Does NOT hardcode any course or prior name.
 */
function initUserCard() {
  const user = typeof CampusAuth !== "undefined" ? CampusAuth.getCurrentUser() : null;
  const isLoggedIn = !!(user && (user.fullName || user.name) && (user.fullName || user.name).trim());
  const fullName = isLoggedIn ? (user.fullName || user.name).trim() : "Student";
  const initials = isLoggedIn ? getAvatarInitials(fullName) : "--";
  
  // Registration / Course line: only show user-provided values, otherwise "Not signed in" or empty
  let subtitle = "";
  if (isLoggedIn) {
    if (user.course || user.department) {
      subtitle = user.course || user.department;
      if (user.year) subtitle += ` • ${user.year}`;
    } else if (user.regNo || user.registrationNumber) {
      subtitle = user.regNo || user.registrationNumber;
    } else {
      subtitle = "Campus Member";
    }
  } else {
    subtitle = "Not signed in";
  }

  // 1. Update avatar initials
  document.querySelectorAll(".sidebar-user .user-avatar, .user-avatar.user-initials").forEach((el) => {
    el.textContent = initials;
  });

  // 2. Update user full name
  document.querySelectorAll(".sidebar-user .user-name").forEach((el) => {
    el.textContent = fullName;
  });

  // 3. Update subtitle (course/regNo/status)
  document.querySelectorAll(".sidebar-user .user-dept, .user-dept.user-reg-no").forEach((el) => {
    el.textContent = subtitle;
  });

  // 4. Attach logout button handlers
  document.querySelectorAll(".logout-btn").forEach((btn) => {
    if (btn._logoutAttached) return;
    btn._logoutAttached = true;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof CampusAuth !== "undefined") {
        CampusAuth.logout();
      } else {
        try {
          localStorage.removeItem("campussync_current_session");
          localStorage.removeItem("campussync_user_profile");
        } catch (err) {}
        window.location.href = "login.html";
      }
    });
  });
}

// Expose globally for instant update after login/signup & tests
if (typeof window !== "undefined") {
  window.getGreetingPrefix = getGreetingPrefix;
  window.getStudentGreeting = getStudentGreeting;
  window.getAvatarInitials = getAvatarInitials;
  window.initDynamicGreeting = initDynamicGreeting;
  window.initUserCard = initUserCard;
}

// ============================================================================
// 3. NOTIFICATIONS SYSTEM
// ============================================================================
function getNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const defaults = [
    {
      id: "notif-1",
      title: "Possible Match Detected",
      message: "Casio Scientific Calculator has an 8/8 rule match with a recent Found report.",
      type: "match",
      time: "4 mins ago"
    },
    {
      id: "notif-2",
      title: "Block S Room 204 Empty",
      message: "Classroom 204 is now completely vacant and open for study until 8:00 PM.",
      type: "space",
      time: "15 mins ago"
    },
    {
      id: "notif-3",
      title: "Tech Talk Live Now",
      message: "Future of Agentic AI has started in Seminar Hall 102.",
      type: "event",
      time: "25 mins ago"
    },
    {
      id: "notif-4",
      title: "Event RSVP Confirmed",
      message: "Your seat for Campus HackFest 2026 is confirmed.",
      type: "success",
      time: "1 hour ago"
    }
  ];

  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaults));
  } catch (e) {}
  return defaults;
}

function addNotification(title, message, type = "info") {
  const notifs = getNotifications();
  const newNotif = {
    id: "notif-" + Date.now(),
    title: title,
    message: message,
    type: type,
    time: "Just now"
  };

  notifs.unshift(newNotif);
  if (notifs.length > 15) notifs.pop();

  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {}

  updateBadges();
}

function initNotificationCenter() {
  const notifBtns = document.querySelectorAll(".notif-toggle-btn");
  const notifDropdown = document.getElementById("notifDropdown");
  const notifList = document.getElementById("notifList");
  const clearNotifsBtn = document.getElementById("clearNotifsBtn");

  if (!notifDropdown) return;

  notifBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = notifDropdown.classList.contains("open");
      if (!isOpen) {
        renderNotificationsList();
        notifDropdown.classList.add("open");
      } else {
        notifDropdown.classList.remove("open");
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!notifDropdown.contains(e.target)) {
      notifDropdown.classList.remove("open");
    }
  });

  if (clearNotifsBtn) {
    clearNotifsBtn.addEventListener("click", () => {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
      renderNotificationsList();
      updateBadges();
    });
  }

  function renderNotificationsList() {
    if (!notifList) return;
    const notifs = getNotifications();

    if (notifs.length === 0) {
      notifList.innerHTML = `
        <div style="padding: 2rem 1.5rem; text-align: center; color: var(--text-dim);">
          <p style="font-size: 0.95rem; margin-bottom: 0.25rem;">No new notifications</p>
          <small>Campus updates and match alerts will appear here.</small>
        </div>
      `;
      return;
    }

    notifList.innerHTML = notifs
      .map((n) => {
        let icon = "🔔";
        if (n.type === "match") icon = "⚡";
        else if (n.type === "space") icon = "🟢";
        else if (n.type === "event" || n.type === "bookmark") icon = "📅";
        else if (n.type === "success") icon = "✅";

        return `
        <div class="notif-item">
          <span style="font-size: 1.1rem; line-height: 1;">${icon}</span>
          <div style="flex: 1;">
            <strong>${escapeHTML(n.title)}</strong>
            <p>${escapeHTML(n.message)}</p>
            <span class="notif-time">${escapeHTML(n.time)}</span>
          </div>
        </div>
      `;
      })
      .join("");
  }
}

// ============================================================================
// 4. TOAST ALERTS
// ============================================================================
function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-message toast-${type}`;
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "warn") icon = "⚡";
  if (type === "error") icon = "⚠️";

  toast.innerHTML = `
    <span style="font-size: 1.1rem;">${icon}</span>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================================================
// 5. BADGES & COUNTERS
// ============================================================================
function updateBadges() {
  const notifBadges = document.querySelectorAll(".notif-badge-pill");
  const notifs = getNotifications();
  notifBadges.forEach((b) => {
    b.textContent = notifs.length;
    b.style.display = notifs.length > 0 ? "inline-flex" : "none";
  });

  const savedCount = getSavedEvents().length + getSavedSpaces().length;
  const savedBadges = document.querySelectorAll(".saved-badge-pill");
  savedBadges.forEach((b) => {
    b.textContent = savedCount;
    b.style.display = savedCount > 0 ? "inline-flex" : "none";
  });
}

// ============================================================================
// 6. STUDENT PROFILE & BOOKMARKS MODAL
// ============================================================================
function initProfileModal() {
  const profileBtns = document.querySelectorAll(".profile-trigger-btn");
  let modal = document.getElementById("profileModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "profileModal";
    modal.className = "custom-modal";
    document.body.appendChild(modal);
  }

  profileBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      renderProfileContent();
      modal.classList.add("open");
    });
  });

  function renderProfileContent() {
    const savedEvents = getSavedEvents();
    const savedSpaces = getSavedSpaces();
    const userRsvps = getUserRsvps();
    const allEvents = getStoredEvents();
    const allSpaces = getStoredSpaces();

    const bookmarkedEventsList = allEvents.filter((ev) => savedEvents.includes(ev.id));
    const bookmarkedSpacesList = allSpaces.filter((sp) => savedSpaces.includes(sp.id));
    const rsvpEventsList = allEvents.filter((ev) => userRsvps.includes(ev.id));

    // Dynamic user session resolution - no hardcoded name or course
    const user = typeof CampusAuth !== "undefined" ? CampusAuth.getCurrentUser() : null;
    const isLoggedIn = !!(user && (user.fullName || user.name) && (user.fullName || user.name).trim());
    const fullName = isLoggedIn ? (user.fullName || user.name).trim() : "Student";
    const initials = isLoggedIn ? getAvatarInitials(fullName) : "--";

    // Course / registration line: ONLY show if user provided it, otherwise blank or sign-in link
    let courseLine = "";
    if (isLoggedIn) {
      if (user.course || user.department) {
        courseLine = `<span style="font-size: 0.8rem; color: var(--accent-primary);">${escapeHTML(user.course || user.department)}${user.year ? ` • ${escapeHTML(user.year)}` : ''}</span>`;
      } else if (user.regNo || user.registrationNumber) {
        courseLine = `<span style="font-size: 0.8rem; color: var(--accent-primary);">Reg No: ${escapeHTML(user.regNo || user.registrationNumber)}${user.email ? ` • ${escapeHTML(user.email)}` : ''}</span>`;
      } else if (user.email) {
        courseLine = `<span style="font-size: 0.8rem; color: var(--accent-primary);">${escapeHTML(user.email)}</span>`;
      }
    } else {
      courseLine = `<a href="login.html" style="font-size: 0.8rem; color: var(--accent-primary); text-decoration: underline;">Sign In to CampusSync</a>`;
    }

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="user-avatar" style="width: 44px; height: 44px; font-size: 1.1rem;">${escapeHTML(initials)}</div>
            <div>
              <h3 class="modal-title" style="margin: 0;">${escapeHTML(fullName)}</h3>
              ${courseLine}
            </div>
          </div>
          <button class="modal-close" onclick="closeProfileModal()">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Active RSVPs -->
          <div>
            <h4 style="color: #fff; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
              <span>🎟️</span> Confirmed Event RSVPs (${rsvpEventsList.length})
            </h4>
            ${
              rsvpEventsList.length === 0
                ? `<p style="font-size: 0.85rem; color: var(--text-dim);">No event RSVPs yet.</p>`
                : `<div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${rsvpEventsList
                      .map(
                        (ev) => `
                      <div style="background: rgba(255, 255, 255, 0.04); padding: 0.75rem; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <strong style="color: #fff; font-size: 0.9rem;">${escapeHTML(ev.name)}</strong>
                          <div style="font-size: 0.78rem; color: var(--text-muted);">📅 ${ev.date} • 📍 ${ev.location}</div>
                        </div>
                        <a href="events.html" class="btn btn-outline btn-sm">View</a>
                      </div>
                    `
                      )
                      .join("")}
                   </div>`
            }
          </div>

          <!-- Bookmarked Spaces -->
          <div>
            <h4 style="color: #fff; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
              <span>🔖</span> Saved Study Spots (${bookmarkedSpacesList.length})
            </h4>
            ${
              bookmarkedSpacesList.length === 0
                ? `<p style="font-size: 0.85rem; color: var(--text-dim);">No saved study spaces.</p>`
                : `<div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${bookmarkedSpacesList
                      .map(
                        (sp) => `
                      <div style="background: rgba(255, 255, 255, 0.04); padding: 0.75rem; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <strong style="color: #fff; font-size: 0.9rem;">${escapeHTML(sp.name)}</strong>
                          <div style="font-size: 0.78rem; color: var(--accent-teal);">📍 ${sp.location} • ${sp.availabilityBadge || "Available"}</div>
                        </div>
                        <a href="navigation.html?dest=${encodeURIComponent(sp.building || sp.name)}" class="btn btn-nav-action btn-sm">Navigate 🚶</a>
                      </div>
                    `
                      )
                      .join("")}
                   </div>`
            }
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          ${isLoggedIn ? `<button type="button" class="btn btn-outline btn-sm logout-btn" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.4); cursor: pointer;" onclick="if(typeof CampusAuth!=='undefined'){CampusAuth.logout();}else{try{localStorage.removeItem('campussync_current_session');localStorage.removeItem('campussync_user_profile');}catch(e){}window.location.href='login.html';}">Log Out 🚪</button>` : `<a href="login.html" class="btn btn-primary btn-sm">Log In</a>`}
          <button type="button" class="btn btn-primary" onclick="closeProfileModal()">Done</button>
        </div>
      </div>
    `;
  }

  window.closeProfileModal = () => modal.classList.remove("open");

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });
}

// ============================================================================
// 7. RESPONSIVE SIDEBAR & MOBILE DRAWER
// ============================================================================
function initResponsiveNavigation() {
  const sidebar = document.querySelector(".app-sidebar");
  const mobileToggle = document.getElementById("mobileMenuBtn");
  const sidebarClose = document.getElementById("sidebarCloseBtn");

  // Ensure backdrop element exists
  let backdrop = document.querySelector(".sidebar-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    document.body.appendChild(backdrop);
  }

  function openDrawer() {
    if (sidebar) sidebar.classList.add("drawer-open");
    if (backdrop) backdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (sidebar) sidebar.classList.remove("drawer-open");
    if (backdrop) backdrop.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (mobileToggle) {
    mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (sidebar && sidebar.classList.contains("drawer-open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeDrawer();
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeDrawer);
  }

  // Close drawer on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar && sidebar.classList.contains("drawer-open")) {
      closeDrawer();
    }
  });

  // Close drawer when clicking a navigation link on mobile
  const drawerLinks = sidebar ? sidebar.querySelectorAll(".sidebar-link, a") : [];
  drawerLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 1024) {
        closeDrawer();
      }
    });
  });

  // Highlight active menu item based on window.location
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const allNavLinks = document.querySelectorAll(".sidebar-link, .bottom-nav-item");
  allNavLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// ============================================================================
// 8. STRING & HTML UTILITIES
// ============================================================================
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const dateObj = new Date(dateString + "T00:00:00");
    return dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch (e) {
    return dateString;
  }
}

// ============================================================================
// 9. DOM INITIALIZATION
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Ensure demo data is loaded into storage
  getStoredReports();
  getStoredSpaces();
  getStoredEvents();
  getNotifications();

  initResponsiveNavigation();
  initUserCard();
  initDynamicGreeting();
  initNotificationCenter();
  initProfileModal();
  updateBadges();

  // Re-check greeting every minute if tab remains open
  setInterval(initDynamicGreeting, 60000);
});

// Keep user card and greeting in sync across back-forward navigation & tab updates
if (typeof window !== "undefined") {
  window.addEventListener("pageshow", () => {
    initUserCard();
    initDynamicGreeting();
  });
  window.addEventListener("storage", (e) => {
    if (e.key === "campussync_current_session" || e.key === "campussync_user_profile") {
      initUserCard();
      initDynamicGreeting();
    }
  });
}
