# CampusSync — Your Campus, In Sync.

> **One platform for everyday campus discovery.**  
> Built for Round 1 of a 36-Hour Student Hackathon by a team of 4 first-semester B.Tech CSE students.

---

## 📌 Project Overview

Every university campus is a buzzing ecosystem of thousands of students moving between lecture halls, labs, libraries, and cafeterias. Despite existing portals and notice boards, students face three friction points every single day:
1. **Lost belongings** are scattered across fragmented WhatsApp groups, Telegram channels, and physical noticeboards where finders and owners rarely connect.
2. **Finding a quiet desk, study cubicle, or computer lab with power sockets** requires physically wandering around campus before exams.
3. **Upcoming hackathons, technical workshops, and club events** get buried under chat noise, leaving first-year students unaware of key opportunities.

**CampusSync** brings these three everyday campus discovery experiences into a single, unified web application designed with modern student SaaS visual polish, privacy guardrails, and zero external dependencies.

---

## 💡 Team Strategy & Design Principle

```
WORKING CORE > EXPLAINABILITY > USER EXPERIENCE > VISUAL POLISH > EXTRA FEATURES
```

We are first-semester computer science students. Rather than attempting an unstable, complex multi-tier stack that could crash during live judging, our Round 1 strategy is intentionally simple:

$$\text{HTML5} + \text{CSS3} + \text{Vanilla JavaScript} + \text{Browser localStorage}$$

- **100% Offline & Local:** Runs directly in any web browser without Node.js, Python, or database servers.
- **No Heavy Frameworks:** No React, Vue, Angular, Bootstrap, Tailwind, or complex build tools.
- **Beginner-Friendly & Explainable:** Every single line of code can be understood, explained, and defended by all four team members.
- **SaaS Glassmorphic Polish:** Dark navy theme, authentic campus backdrop (`assets/images/lpu_campus.jpg`), backdrop filters, live dashboard hero preview, and smooth responsive grids.

---

## 👥 Team Roles & Division

| Team Member | Role | Core Responsibilities |
| :--- | :--- | :--- |
| **Member 1** | **JavaScript Lead** | JavaScript logic, DOM manipulation, form validation, localStorage layer, search/filter algorithms, and rule-based matching engine. |
| **Member 2** | **HTML / CSS Lead** | Semantic HTML5 structure, responsive layout grids, flexbox components, form styling, and cards design system. |
| **Member 3** | **CSS + UI/UX + Testing** | Responsive design verification across devices (mobile/tablet/laptop), UX polish, cross-browser testing, and bug finding. |
| **Member 4** | **Presentation & Documentation** | Hackathon report, ASCII architecture diagrams, demo script, judge Q&A preparation, and project positioning. |

---

## 🎯 Four Core Modules

### 1. 📍 WHERE IS YOUR BLOCK? (Campus Walking Navigation)
- **Step 1 — Search:** Autocomplete search across all academic blocks, lecture halls, libraries, and campus zones with quick suggestion chips (`Block S`, `Block 32`, `Library`, `Cafeteria`, etc.).
- **Step 2 — Confirm Destination:** Clean confirmation card displaying building photo, department info, facilities, and distance estimate before routing begins.
- **Step 3 — Geolocation & Permission Handling:** Requests authentic browser GPS coordinates with a graceful fallback selector if location access is unavailable.
- **Step 4 — Interactive Dark Map:** Leaflet.js map with CartoDB Dark Matter tiles, campus building polygons, labeled destinations, pulsing user pin, and glowing walking route polylines.
- **Step 5 — Dynamic Route Metrics:** Floating route card displaying walking minutes, distance in meters, dynamic arrival time (ETA), and `[ Start Walking ]`.
- **Step 6 — Live Navigation & Off-Route Detection:** Real-time distance and ETA countdowns via `watchPosition`, progress fill bar, automatic off-route detection (>45m) with auto-recalculation, arrival celebration, and an indoor walk step simulator for demo presentations.

### 2. 🔎 SMART LOST & FOUND
- **Dual Intake:** Log lost belongings or report found items with client-side image upload preview (`FileReader`), item name, category, location, date, description, and contact info.
- **Live Board:** Multi-filtering by report type (*All*, *Lost*, *Found*), category (*Electronics*, *Bags*, *ID Cards*, *Books*, *Personal*, *Keys*), location, and keyword search.
- **Smart Match Radar:** Compares active Lost reports against candidate Found items using our explainable rule-based scoring engine (+3 category, +2 colour, +2 location, +1 keywords, max 8/8).
- **Item Details & Claim Modal:** Inspect item photo, description, matching breakdown, and initiate protected student claim mediation.

### 3. 📅 CAMPUS EVENTS DISCOVERY
- **🔴 Happening Now:** Prominent live banner with glowing pulse indicator, elapsed duration ("Started 25 mins ago"), and live countdown timer.
- **Upcoming & Completed Feeds:** Curated timeline of hackathons, technical workshops, sports tourneys, and cultural fests with category badges and event banners.
- **Interactive RSVP & Bookmarking:** One-click demo RSVP counter (+1 / -1) and bookmarking persisting in `localStorage`.
- **Venue Navigation:** Event Details modal includes a `[ 📍 Navigate to Venue ]` button linking directly to the campus walking navigation engine.

### 4. 🏫 CAMPUS SPACES & EMPTY CLASSROOMS
- **Empty Classrooms Spotlight:** Real-time vacant room directory highlighting **Block S — Room 204** (🟢 EMPTY, Capacity 60, Available 6:00 PM – 8:00 PM) and **Block 32 — Room 301** (🟢 EMPTY, Capacity 45, Available 7:00 PM – 9:00 PM).
- **Quiet Spaces Near You:** Less-crowded study cubicles, coding labs, and libraries with visual occupancy percentages and noise ratings.
- **Smart Recommendations:** Highlights the highest scoring study spot based on current capacity, noise rating, and walking distance.
- **Hourly Availability Timeline:** Hour-by-hour availability bars (`Now | 6 PM | 7 PM | 8 PM | 9 PM`) highlighting vacant and busy slots.
- **Direct Block Routing:** Space details modal connects directly to Block Navigation with a `[ 📍 Navigate Here ]` button.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Markup** | HTML5 (Semantic) | Clean semantic markup with modern accessible elements. |
| **Styling** | CSS3 (Modern Vanilla) | Dark glassmorphism, responsive sidebar layout, CSS custom properties, backdrop filters. |
| **Logic** | Vanilla JavaScript (ES6+) | Native DOM methods, rule-based matching engine, geolocation tracking, zero build dependencies. |
| **Mapping** | Leaflet.js + CartoDB Dark | Interactive campus maps, route polylines, custom pulsing markers, dark theme without private API keys. |
| **Persistence** | Browser `localStorage` | Client-side key-value JSON storage for demo data, reports, RSVPs, and bookmarks. |

---

## 📁 Project Structure

```
CampusSync/
├── index.html              # Unified Dashboard: Greeting, search + map preview, quick actions, live ticker
├── navigation.html         # Where is your Block? Full 6-step walking navigation & GPS engine
├── lost-found.html         # Smart Lost & Found board with radar, category/location filters, modals
├── spaces.html             # Campus Spaces directory with Empty Classrooms & availability timelines
├── events.html             # Campus Events feed with 🔴 Happening Now, upcoming cards & RSVP
├── report.html             # Dedicated report intake form with image upload preview
│
├── css/
│   └── style.css           # Premium Dark Glassmorphism design system & responsive layout
│
├── js/
│   ├── main.js             # Shared data storage, dynamic greeting, notification center, profile modal
│   ├── navigation.js       # Walking routing engine, GPS tracking, step simulator & off-route alerts
│   ├── lost-found.js       # Intake validation, rule-based matching engine, item details & claim modal
│   ├── spaces.js           # Spaces directory filtering, occupancy meters, availability timelines
│   └── events.js           # Live countdowns, RSVP counters, activity bookmarking & venue routing
│
├── data/
│   └── demo-data.js        # Realistic seed dataset (Locations, Lost/Found items, Spaces, Events, Ticker)
│
├── docs/
│   └── PROJECT_REPORT.md   # Project technical overview and architecture
│
└── README.md               # Public documentation
```

---

## 💾 How `localStorage` Works

Browser `localStorage` stores data purely as text **strings** mapped to specific keys. To store structured JavaScript objects or arrays, we use the JSON serialization pattern:

```
JavaScript Object / Array
           │
           ▼ JSON.stringify()
    JSON Text String
           │
           ▼ localStorage.setItem("campussync_reports", text)
   [ Browser Storage ]
           │
           ▼ localStorage.getItem("campussync_reports")
    JSON Text String
           │
           ▼ JSON.parse()
JavaScript Object / Array
```

### Storage Functions in `js/main.js`:
- `getStoredReports()`: Reads and parses reports from `localStorage` (`campussync_reports`).
- `getStoredSpaces()` / `getStoredEvents()`: Manages spaces and activities.
- `getSavedEvents()` / `getSavedSpaces()`: Manages bookmarked items with badge count updates.
- `getNotifications()` / `addNotification()`: Powers the in-session prototype notification bell.

---

## 🧠 Rule-Based Matching Algorithm

Rather than using complex machine learning models that require cloud API keys, network connectivity, and can hallucinate during judging, CampusConnect implements a **transparent rule-based scoring engine** (`js/lost-found.js`):

| Matching Attribute | Score | Evaluation Logic |
| :--- | :---: | :--- |
| **Category Match** | `+3` | Exact match on item type (`Personal`, `Electronics`, etc.) |
| **Colour Match** | `+2` | Exact or substring token match (e.g., *"Black"* vs. *"Black Leather"*) |
| **Location Match** | `+2` | Location substring or token overlap (e.g., *"Central Library"* vs. *"Library"*) |
| **Description Keywords** | `+1` | Stopword-filtered keyword overlap between descriptions |
| **Total Maximum** | **`8`** | **Max potential score** |

### Confidence Tiers:
- **Score $\ge$ 6:** `High Similarity`
- **Score 4 – 5:** `Possible Match`
- **Score 2 – 3:** `Potential Match` (Not displayed on radar to avoid noise)
- **Score < 2:** Filtered out

### Ethical AI Guardrail:
CampusConnect **strictly never** states that an item is a *"Confirmed Match"*. It only identifies *"Possible Matches"* to guide students toward manual verification (checking student IDs, lockscreen PINs, or secret markings).

---

## 🏗️ Technical Architecture (Current vs Future)

### Current Round 1 Architecture (Frontend Only)

```
             STUDENT / USER
                   │
                   ▼
            HTML5 STRUCTURE
                   │
                   ▼
              CSS3 DESIGN
                   │
                   ▼
          VANILLA JAVASCRIPT
             /            \
            ▼              ▼
       DOM UPDATES    localStorage
                           │
                           ▼
                    Saved JSON Data
                           │
                           ▼
                    Matching Engine
```

### Future Round 2 Architecture (Full-Stack Upgrade)

If our team qualifies for Round 2, the decoupled data layer allows us to seamlessly upgrade to a centralized backend:

```
ROUND 1 (Current)
HTML/CSS/JS ──► localStorage

           ▼ QUALIFICATION (Round 2 Upgrade)

ROUND 2 (Future)
HTML/CSS/JS ──► fetch() API ──► Python (Flask) ──► SQLite DB ──► Optional AI/NLP
```

---

## ⚠️ Current Prototype Limitations

1. **Browser-Local Storage:** Data is stored locally on the device running the browser; it is not yet synchronized across multiple devices or users.
2. **Demo Space Availability:** Space busyness and noise levels are simulated for demonstration; they are not connected to real-time IoT occupancy sensors.
3. **Demo Event Feed:** Events and RSVPs illustrate user interaction; they are not yet integrated with university club management portals.
4. **No User Authentication:** No login or student credentials are required in Round 1 to maximize judging accessibility and speed.

---

## 🚀 How to Run the Project

No installation, build tools, or servers are needed!

1. Clone or download this repository.
2. Open `index.html` directly in any web browser (Google Chrome, Edge, Firefox, Safari).
3. Alternatively, use a local server:
   ```bash
   # Optional Python one-line server
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000` in your browser.

