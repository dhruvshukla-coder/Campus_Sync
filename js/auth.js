/**
 * ============================================================================
 * CampusSync — Authentication, Session & Access Gate (js/auth.js)
 * ============================================================================
 * Handles:
 * 1. Configurable university email domain constraint (@lpu.in)
 * 2. User account registration & login verification (stored in localStorage)
 * 3. Secure client-side password hashing (SHA-256 via Web Crypto API + fallback)
 * 4. Active session management, persistence across refresh, and logout
 * 5. Route guarding / direct-URL protection for protected pages
 * ============================================================================
 */

// ============================================================================
// 1. CONFIGURATION
// ============================================================================
const AUTH_CONFIG = {
  // Required University Email Domain (change here if needed)
  UNIVERSITY_EMAIL_DOMAIN: "@lpu.in",

  // Field validation constraints
  MIN_NAME_LENGTH: 3,
  REG_NO_LENGTH: 8,
  MIN_PASSWORD_LENGTH: 6,

  // LocalStorage storage keys
  STORAGE_KEYS: {
    USERS: "campussync_users",
    CURRENT_SESSION: "campussync_current_session"
  }
};

// ============================================================================
// 2. SHA-256 PASSWORD HASHING UTILITY
// ============================================================================

/**
 * Standard pure JS fallback for SHA-256 in case Web Crypto API is unavailable.
 */
function jsSha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = "length";
  let i, j;
  let result = "";

  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let wordsLength = 0;
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  wordsLength = ascii[lengthProperty];
  words[wordsLength >> 2] |= 0x80 << ((3 - (wordsLength % 4)) * 8);
  words[(((wordsLength + 8) >> 6) << 4) + 15] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      let i2 = i + j;
      const w15 = w[i - 15], w2 = w[i - 2];

      const a = hash[0], e = hash[4];
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & hash[5]) ^ (~e & hash[6]);
      const temp1 = hash[7] + s1 + ch + k[i] + (w[i] = (i < 16) ? w[i] : (
        w[i - 16] +
        (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
        w[i - 7] +
        (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
      ) | 0);
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = s0 + maj;

      hash = [(temp1 + temp2) | 0, a, hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}

/**
 * Computes hexadecimal SHA-256 hash using Web Crypto API when available,
 * falling back to pure JavaScript SHA-256 otherwise.
 * @param {string} password 
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  const str = String(password || "");
  if (window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === "function") {
    try {
      const msgBuffer = new TextEncoder().encode(str);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      // Fallback
    }
  }
  return jsSha256(str);
}

// ============================================================================
// 3. STORAGE & DATA MANAGEMENT
// ============================================================================

/**
 * Returns stored accounts. Seeds a default demo student account if empty.
 */
function getStoredUsers() {
  try {
    const raw = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading stored users:", err);
  }

  // Default demo user for instant testing:
  // Email: anukalp.shukla@lpu.in | Reg No: 12104567 | Password: Password@123
  const seedUsers = [
    {
      fullName: "Anukalp Shukla",
      email: "anukalp.shukla@lpu.in",
      regNo: "12104567",
      passwordHash: "ff7bd97b1a7789ddd2775122fd6817f3173672da9f802ceec57f284325bf589f",
      createdAt: new Date().toISOString()
    }
  ];

  saveStoredUsers(seedUsers);
  return seedUsers;
}

/**
 * Persists accounts array to localStorage.
 */
function saveStoredUsers(users) {
  try {
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
  } catch (err) {
    console.error("Error saving users to storage:", err);
    return false;
  }
}

/**
 * Migration helper: seamlessly updates legacy cached data in user's browser.
 */
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

/**
 * Retrieves the currently logged-in user session, or null if unauthenticated.
 */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_SESSION) ||
                localStorage.getItem("campussync_user_profile");
    if (raw) {
      const session = JSON.parse(raw);
      if (session && (session.fullName || session.name)) {
        return session;
      }
    }
  } catch (err) {
    console.error("Error reading session:", err);
  }
  return null;
}

/**
 * Saves current user session to localStorage across both session keys.
 */
function saveSession(user) {
  const session = {
    fullName: user.fullName || user.name,
    name: user.fullName || user.name,
    email: user.email,
    regNo: user.regNo || user.registrationNumber,
    registrationNumber: user.regNo || user.registrationNumber,
    course: user.course || user.department || "",
    department: user.department || user.course || "",
    year: user.year || "",
    loginTime: Date.now()
  };
  try {
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    localStorage.setItem("campussync_user_profile", JSON.stringify(session));
  } catch (err) {}
  return session;
}

/**
 * Clears current session and redirects to login screen.
 */
function logout() {
  try {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_SESSION);
    localStorage.removeItem("campussync_user_profile");
  } catch (err) {}
  window.location.replace("login.html");
}

/**
 * Global click delegation for logout buttons across the document.
 */
if (typeof document !== "undefined") {
  document.addEventListener("click", function (e) {
    const btn = e.target && e.target.closest && e.target.closest(".logout-btn");
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      logout();
    }
  });
}

/**
 * Generates initials from full name (e.g. "Rahul Sharma" -> "RS", "Priya" -> "P").
 * First letter of first & last word; single-word names use one letter.
 */
function getInitials(name) {
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

// ============================================================================
// 4. SIGNUP & LOGIN ACTIONS
// ============================================================================

/**
 * Registers a new student account.
 * Validates:
 * - Full Name (min 3 chars)
 * - University Email ID (ends with AUTH_CONFIG.UNIVERSITY_EMAIL_DOMAIN)
 * - Registration Number (exactly 8 digits, numeric only)
 * - Password (min 6 chars) and matching confirmation
 * - Duplicate checks (email or registration number)
 */
async function signup({ fullName, email, regNo, password, confirmPassword }) {
  const cleanName = (fullName || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanRegNo = (regNo || "").trim();
  const cleanPassword = password || "";
  const cleanConfirmPassword = confirmPassword || "";

  // 1. Full name validation
  if (!cleanName || cleanName.length < AUTH_CONFIG.MIN_NAME_LENGTH) {
    return {
      success: false,
      error: `Full Name must be at least ${AUTH_CONFIG.MIN_NAME_LENGTH} characters.`
    };
  }

  // 2. University Email validation
  if (!cleanEmail) {
    return {
      success: false,
      error: "University Email ID is required."
    };
  }

  const expectedDomain = AUTH_CONFIG.UNIVERSITY_EMAIL_DOMAIN.toLowerCase();
  if (!cleanEmail.endsWith(expectedDomain)) {
    return {
      success: false,
      error: `University Email ID must end with ${AUTH_CONFIG.UNIVERSITY_EMAIL_DOMAIN}`
    };
  }

  // Check valid prefix before domain
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      success: false,
      error: "Please enter a valid university email address format."
    };
  }

  // 3. Registration Number validation (exactly 8 digits, numeric only)
  const regNoRegex = /^\d{8}$/;
  if (!regNoRegex.test(cleanRegNo)) {
    return {
      success: false,
      error: `Registration Number must be exactly ${AUTH_CONFIG.REG_NO_LENGTH} digits (numbers only).`
    };
  }

  // 4. Password validation
  if (cleanPassword.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: `Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters long.`
    };
  }

  if (cleanPassword !== cleanConfirmPassword) {
    return {
      success: false,
      error: "Passwords do not match. Please re-enter."
    };
  }

  // 5. Duplicate account check
  const users = getStoredUsers();
  const existingEmail = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return {
      success: false,
      error: "An account with this University Email ID already exists. Please log in."
    };
  }

  const existingRegNo = users.find((u) => String(u.regNo) === cleanRegNo);
  if (existingRegNo) {
    return {
      success: false,
      error: "An account with this Registration Number already exists. Please log in."
    };
  }

  // 6. Hash password and save
  const passwordHash = await hashPassword(cleanPassword);
  const newUser = {
    fullName: cleanName,
    email: cleanEmail,
    regNo: cleanRegNo,
    passwordHash: passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveStoredUsers(users);

  // 7. Save session
  const session = saveSession(newUser);

  return {
    success: true,
    user: session
  };
}

/**
 * Authenticates an existing student.
 * Identifier can be University Email ID or Registration Number.
 */
async function login({ identifier, password }) {
  const cleanId = (identifier || "").trim();
  const cleanPassword = password || "";

  if (!cleanId) {
    return {
      success: false,
      error: "Please enter your University Email ID or Registration Number."
    };
  }

  if (!cleanPassword) {
    return {
      success: false,
      error: "Please enter your password."
    };
  }

  const users = getStoredUsers();
  const normalizedId = cleanId.toLowerCase();

  // Find by email or regNo
  const user = users.find(
    (u) => u.email.toLowerCase() === normalizedId || String(u.regNo) === cleanId
  );

  if (!user) {
    return {
      success: false,
      error: "No account found matching this Email or Registration Number."
    };
  }

  // Hash and compare
  const enteredHash = await hashPassword(cleanPassword);
  if (enteredHash !== user.passwordHash) {
    return {
      success: false,
      error: "Incorrect password. Please verify your credentials and try again."
    };
  }

  // Save session
  const session = saveSession(user);

  return {
    success: true,
    user: session
  };
}

// ============================================================================
// 5. ROUTE GUARDS & ACCESS GATES
// ============================================================================

/**
 * Call on protected pages (index.html, navigation.html, etc.).
 * If no session is active, hides the document and redirects immediately to login.html.
 */
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    try {
      if (document.documentElement) {
        document.documentElement.style.display = "none";
      }
    } catch (e) {}
    window.location.replace("login.html");
    return false;
  }
  return true;
}

/**
 * Call on login.html.
 * If user is already logged in, redirects immediately to index.html.
 */
function redirectIfLoggedIn() {
  const user = getCurrentUser();
  if (user) {
    try {
      if (document.documentElement) {
        document.documentElement.style.display = "none";
      }
    } catch (e) {}
    window.location.replace("index.html");
    return true;
  }
  return false;
}

// Export to window global namespace and module.exports (if present)
const CampusAuth = {
  CONFIG: AUTH_CONFIG,
  hashPassword,
  getStoredUsers,
  saveStoredUsers,
  getCurrentUser,
  saveSession,
  logout,
  getInitials,
  signup,
  login,
  requireAuth,
  redirectIfLoggedIn
};

if (typeof window !== "undefined") {
  window.CampusAuth = CampusAuth;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = CampusAuth;
}

