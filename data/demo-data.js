/**
 * ============================================================================
 * CampusSync — Master Demo & Seed Data Layer (data/demo-data.js)
 * ============================================================================
 * Realistic, production-grade sample data for all four core features:
 * 1. CAMPUS_LOCATIONS (Where is your Block? Navigation waypoints & buildings)
 * 2. DEMO_LOST_FOUND (Lost & Found reports with photos, status & match pairs)
 * 3. DEMO_SPACES (Study spaces, empty classrooms, and availability timelines)
 * 4. DEMO_EVENTS (Upcoming, Happening Now, and Completed campus events)
 * 5. CAMPUS_ACTIVITIES (Live ticker feed for the Home Dashboard)
 * ============================================================================
 */

// ============================================================================
// 1. CAMPUS LOCATIONS & NAVIGATION WAYPOINTS (LPU Campus reference coordinates)
// ============================================================================
const CAMPUS_LOCATIONS = [
  {
    id: "block-s",
    name: "Block S",
    category: "Academic Block",
    subName: "School of Computer Science & Engineering",
    lat: 31.2548,
    lng: 75.7032,
    description: "Main computing hub housing AI, Robotics, and Software Engineering labs.",
    facilities: ["Wi-Fi", "Computer Labs", "Smart Classrooms", "Elevator", "Water Coolers"],
    floors: 5,
    walkingDistanceMeters: 450,
    walkingMinutes: 6,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "block-32",
    name: "Block 32",
    category: "Academic Block",
    subName: "Department of Electronics & Mechanical Sciences",
    lat: 31.2532,
    lng: 75.7055,
    description: "Houses engineering workshops, IoT hardware labs, and lecture halls 301-320.",
    facilities: ["Hardware Labs", "Lecture Halls", "Wi-Fi", "Seminar Rooms"],
    floors: 6,
    walkingDistanceMeters: 550,
    walkingMinutes: 7,
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "central-library",
    name: "Central Library",
    category: "Library & Study Zone",
    subName: "Dr. APJ Abdul Kalam Central Library",
    lat: 31.2541,
    lng: 75.7042,
    description: "4-story multi-disciplinary library with silent reading zones, digital reference desks, and discussion pods.",
    facilities: ["Silent Zone", "High-speed Wi-Fi", "AC", "Charging Stations", "Discussion Pods"],
    floors: 4,
    walkingDistanceMeters: 300,
    walkingMinutes: 4,
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cafeteria",
    name: "Central Cafeteria",
    category: "Dining & Food",
    subName: "Student Center Food Court & Kiosks",
    lat: 31.2525,
    lng: 75.7038,
    description: "Multi-cuisine student dining hall featuring healthy bowls, fresh juice bars, and outdoor shaded tables.",
    facilities: ["Food Stalls", "Indoor Seating", "Outdoor Patio", "UPI Accepted"],
    floors: 2,
    walkingDistanceMeters: 220,
    walkingMinutes: 3,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "auditorium",
    name: "Main Auditorium",
    category: "Events & Cultural",
    subName: "Grand Convention & Cultural Hall",
    lat: 31.2555,
    lng: 75.7058,
    description: "2,500-seat acoustic amphitheatre auditorium hosting university convocations, guest talks, and cultural fests.",
    facilities: ["Dolby Audio", "Central Air Conditioning", "Green Rooms", "Tiered Seating"],
    floors: 3,
    walkingDistanceMeters: 620,
    walkingMinutes: 8,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "sports-complex",
    name: "Sports Complex",
    category: "Sports & Fitness",
    subName: "Indoor Arena & Olympic Track",
    lat: 31.2515,
    lng: 75.7025,
    description: "Badminton courts, Olympic swimming pool, gym, table tennis arena, and 400m synthetic running track.",
    facilities: ["Lockers", "Shower Rooms", "Equipment Rental", "Floodlights"],
    floors: 2,
    walkingDistanceMeters: 750,
    walkingMinutes: 10,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "innovation-center",
    name: "Innovation & Startup Incubator",
    category: "Technology Lab",
    subName: "Design Thinking & Prototyping Hub",
    lat: 31.2550,
    lng: 75.7020,
    description: "Maker space equipped with 3D printers, laser cutters, electronics benches, and collaborative startup desks.",
    facilities: ["3D Printers", "Whiteboards", "High-speed Internet", "Coffee Station"],
    floors: 3,
    walkingDistanceMeters: 400,
    walkingMinutes: 5,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hostel-zone",
    name: "Boys & Girls Hostels Zone",
    category: "Residential",
    subName: "Hostels 1-8 & Resident Services",
    lat: 31.2505,
    lng: 75.7060,
    description: "Student residential towers with convenience mart, dispensary, laundromat, and night study rooms.",
    facilities: ["24/7 Security", "Study Lounge", "Dispensary", "Laundromat"],
    floors: 10,
    walkingDistanceMeters: 900,
    walkingMinutes: 12,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "seminar-hall",
    name: "Seminar Hall (Block S)",
    category: "Academic Block",
    subName: "Hall 102, Ground Floor",
    lat: 31.2547,
    lng: 75.7031,
    description: "120-capacity tiered seminar room for departmental presentations, project defenses, and guest lectures.",
    facilities: ["Projector", "Wireless Mics", "AC", "Tiered Desks"],
    floors: 1,
    walkingDistanceMeters: 440,
    walkingMinutes: 6,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80"
  }
];

// Predefined campus path network for walking route simulation
const CAMPUS_WAYPOINTS = {
  gate: [31.2530, 75.7010],
  centralSquare: [31.2538, 75.7038],
  libraryWalk: [31.2540, 75.7040],
  blockSGate: [31.2546, 75.7031],
  block32Walk: [31.2533, 75.7050],
  foodCourtLane: [31.2526, 75.7036],
  auditoriumDrive: [31.2553, 75.7055]
};

// ============================================================================
// 2. LOST & FOUND SAMPLE DATA (Mixture of Lost, Found & Recovered with photos)
// ============================================================================
const DEMO_LOST_FOUND = [
  {
    id: "lf-1",
    type: "lost",
    itemName: "AirPods Pro (2nd Gen) Case",
    category: "Electronics",
    colour: "White",
    location: "Central Library 2nd Floor",
    date: "2026-09-11",
    time: "10:30 PM",
    description: "Glossy white Apple AirPods charging case with a small black dragon sticker on the back. Engraved with 'CS'.",
    contactEmail: "student@campus.edu",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    status: "active",
    relativeTime: "2 hours ago"
  },
  {
    id: "lf-2",
    type: "found",
    itemName: "AirPods Pro Case (White)",
    category: "Electronics",
    colour: "White",
    location: "Central Library Silent Cubicles",
    date: "2026-09-11",
    time: "11:15 PM",
    description: "Found white AirPods Pro case on Desk #14. Has a sticker on the reverse side. Handed over to 2nd Floor librarian desk.",
    contactEmail: "librarian.help@campus.edu",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    status: "active",
    relativeTime: "1 hour ago"
  },
  {
    id: "lf-3",
    type: "lost",
    itemName: "Matte Black Backpack",
    category: "Bags",
    colour: "Black",
    location: "Block 32 — Room 301",
    date: "2026-09-11",
    time: "07:45 PM",
    description: "Black Wildcraft water-resistant backpack containing DSA handwritten lecture notes, USB-C cable, and blue metal flask.",
    contactEmail: "rahul.k@campus.edu",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    status: "active",
    relativeTime: "5 hours ago"
  },
  {
    id: "lf-4",
    type: "found",
    itemName: "Black Wildcraft Backpack",
    category: "Bags",
    colour: "Black",
    location: "Block 32 Corridor near Room 302",
    date: "2026-09-11",
    time: "08:30 PM",
    description: "Found black Wildcraft laptop bag near water dispenser outside Room 302. Contains notebooks and study stationary.",
    contactEmail: "security.block32@campus.edu",
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
    status: "active",
    relativeTime: "4 hours ago"
  },
  {
    id: "lf-5",
    type: "found",
    itemName: "Student ID Card — B.Tech CSE",
    category: "Cards/IDs",
    colour: "Blue",
    location: "Central Cafeteria Food Counter",
    date: "2026-09-11",
    time: "09:40 PM",
    description: "Student identity badge on official blue lanyard. Name starts with 'Priyanshu', Reg No ends in 2026.",
    contactEmail: "cafeteria.mgr@campus.edu",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    status: "active",
    relativeTime: "1 hour ago"
  },
  {
    id: "lf-6",
    type: "found",
    itemName: "Blue Stainless Steel Water Bottle",
    category: "Personal",
    colour: "Blue",
    location: "Sports Complex Badminton Court",
    date: "2026-09-10",
    time: "06:15 PM",
    description: "Milton 750ml insulated thermos bottle in matte royal blue. Has gym sticker and silver cap.",
    contactEmail: "sports.desk@campus.edu",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    status: "active",
    relativeTime: "Yesterday"
  },
  {
    id: "lf-7",
    type: "lost",
    itemName: "Algorithms Spiral Notebook",
    category: "Books/Notes",
    colour: "Blue",
    location: "Block S — Room 204",
    date: "2026-09-10",
    time: "04:30 PM",
    description: "Classmate spiral blue hardcover notebook with Design & Analysis of Algorithms notes and lab flowcharts.",
    contactEmail: "ananya.s@campus.edu",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    status: "active",
    relativeTime: "Yesterday"
  },
  {
    id: "lf-8",
    type: "lost",
    itemName: "Casio fx-991EX ClassWiz Calculator",
    category: "Electronics",
    colour: "Black",
    location: "Block S Lab 3",
    date: "2026-09-09",
    time: "02:00 PM",
    description: "Original Casio scientific calculator with silver slide cover and QR code test function. Small scratch on reverse.",
    contactEmail: "dev.patel@campus.edu",
    image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    status: "active",
    relativeTime: "2 days ago"
  },
  {
    id: "lf-9",
    type: "found",
    itemName: "Casio Scientific Calculator",
    category: "Electronics",
    colour: "Black",
    location: "Block S Lab 3",
    date: "2026-09-09",
    time: "05:00 PM",
    description: "Found Black scientific calculator left behind on Terminal #18 after digital electronics practical lab.",
    contactEmail: "lab.assistant@campus.edu",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
    status: "active",
    relativeTime: "2 days ago"
  },
  {
    id: "lf-10",
    type: "found",
    itemName: "Set of Bike & Locker Keys",
    category: "Keys",
    colour: "Silver",
    location: "Academic Block 33 Bike Parking",
    date: "2026-09-08",
    time: "01:20 PM",
    description: "Two silver keys with a red silicone Honda keychain and a brass padlock key.",
    contactEmail: "parking.security@campus.edu",
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    status: "recovered",
    relativeTime: "3 days ago"
  }
];

// ============================================================================
// 3. CAMPUS SPACES (Empty Classrooms, Quiet Zones, Timelines & Facilities)
// ============================================================================
const DEMO_SPACES = [
  {
    id: "space-block-s-204",
    name: "Block S — Room 204",
    category: "Classroom",
    building: "Block S",
    roomNumber: "204",
    floor: "2nd Floor",
    location: "Block S, 2nd Floor West Wing",
    capacity: 60,
    occupancy: 0,
    occupancyPercent: 0,
    crowdLevel: "Empty",
    crowdBadgeColor: "#10b981",
    noiseLevel: "Silent (0 dB)",
    availabilityStatus: "🟢 EMPTY",
    availabilityBadge: "Empty Classroom",
    availabilityClass: "green",
    availableNow: true,
    availableFrom: "6:00 PM",
    availableUntil: "8:00 PM",
    availableForHours: "2 hours",
    facilities: ["Wi-Fi", "Dual Projectors", "AC", "Power Outlets", "Whiteboard"],
    suitableFor: "Group study, coding sprints, project practice",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { time: "Now", status: "empty", label: "0/60" },
      { time: "6 PM", status: "empty", label: "Empty" },
      { time: "7 PM", status: "empty", label: "Empty" },
      { time: "8 PM", status: "busy", label: "Class" },
      { time: "9 PM", status: "empty", label: "Empty" }
    ],
    shortDescription: "Empty lecture classroom with clean whiteboards and uninterrupted high-speed campus Wi-Fi."
  },
  {
    id: "space-block-32-301",
    name: "Block 32 — Room 301",
    category: "Classroom",
    building: "Block 32",
    roomNumber: "301",
    floor: "3rd Floor",
    location: "Block 32, 3rd Floor East",
    capacity: 45,
    occupancy: 0,
    occupancyPercent: 0,
    crowdLevel: "Empty",
    crowdBadgeColor: "#10b981",
    noiseLevel: "Silent",
    availabilityStatus: "🟢 EMPTY",
    availabilityBadge: "Empty Classroom",
    availabilityClass: "green",
    availableNow: true,
    availableFrom: "7:00 PM",
    availableUntil: "9:00 PM",
    availableForHours: "2 hours",
    facilities: ["AC", "Tiered Seating", "Power sockets at every desk", "Wi-Fi"],
    suitableFor: "Individual deep work, laptop revision",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { time: "Now", status: "empty", label: "Empty" },
      { time: "7 PM", status: "empty", label: "Empty" },
      { time: "8 PM", status: "empty", label: "Empty" },
      { time: "9 PM", status: "busy", label: "Maintenance" }
    ],
    shortDescription: "Quiet tiered classroom with power sockets installed at each row. Completely empty until 9:00 PM."
  },
  {
    id: "space-library-silent",
    name: "Central Library — Silent Zone",
    category: "Library",
    building: "Central Library",
    roomNumber: "Floor 2 Cubicles",
    floor: "2nd Floor",
    location: "Central Library, 2nd Floor North",
    capacity: 60,
    occupancy: 18,
    occupancyPercent: 30,
    crowdLevel: "Low Crowd",
    crowdBadgeColor: "#10b981",
    noiseLevel: "Whisper Quiet (< 15 dB)",
    availabilityStatus: "Available Now",
    availabilityBadge: "Low Crowd",
    availabilityClass: "green",
    availableNow: true,
    availableFrom: "8:00 AM",
    availableUntil: "11:30 PM",
    availableForHours: "All Day",
    facilities: ["High-speed Wi-Fi", "Charging Ports", "Ergonomic Chairs", "Air Conditioning", "Silent Rule"],
    suitableFor: "Exam revision, research paper writing, thesis work",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { time: "Now", status: "low", label: "18/60" },
      { time: "8 PM", status: "low", label: "22/60" },
      { time: "9 PM", status: "moderate", label: "34/60" },
      { time: "10 PM", status: "low", label: "20/60" },
      { time: "11 PM", status: "empty", label: "Closing" }
    ],
    shortDescription: "Individual study cubicles isolated from library walkways. Strictly monitored zero-noise policy."
  },
  {
    id: "space-block-s-study-hall",
    name: "Block S Study Hall",
    category: "Study",
    building: "Block S",
    roomNumber: "Study Hall 101",
    floor: "1st Floor",
    location: "Block S, Ground Floor Lobby West",
    capacity: 40,
    occupancy: 12,
    occupancyPercent: 30,
    crowdLevel: "Low Crowd",
    crowdBadgeColor: "#10b981",
    noiseLevel: "Very Quiet",
    availabilityStatus: "Available Now",
    availabilityBadge: "Low Crowd",
    availabilityClass: "green",
    availableNow: true,
    availableFrom: "9:00 AM",
    availableUntil: "10:00 PM",
    availableForHours: "Until 10 PM",
    facilities: ["Wi-Fi", "Charging Stations", "Whiteboards", "Water Dispenser"],
    suitableFor: "Collaborative coding, whiteboarding algorithms",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { time: "Now", status: "low", label: "12/40" },
      { time: "7 PM", status: "low", label: "15/40" },
      { time: "8 PM", status: "moderate", label: "25/40" },
      { time: "9 PM", status: "low", label: "10/40" }
    ],
    shortDescription: "Spacious collaborative hall right inside Block S with glass write-on boards."
  },
  {
    id: "space-innovation-lab",
    name: "Innovation Center Tech Lab",
    category: "Computer Lab",
    building: "Innovation Center",
    roomNumber: "Lab 04",
    floor: "Ground Floor",
    location: "Innovation Hub, Ground Floor",
    capacity: 30,
    occupancy: 8,
    occupancyPercent: 27,
    crowdLevel: "Very Quiet",
    crowdBadgeColor: "#10b981",
    noiseLevel: "Moderate (Keyboard clatter)",
    availabilityStatus: "Available Now",
    availabilityBadge: "Low Crowd",
    availabilityClass: "green",
    availableNow: true,
    availableFrom: "10:00 AM",
    availableUntil: "9:00 PM",
    availableForHours: "Until 9 PM",
    facilities: ["Linux Workstations", "Gigabit Ethernet", "Monitors", "Hardware Kits"],
    suitableFor: "Heavy computing, GPU machine learning, web development",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { time: "Now", status: "low", label: "8/30" },
      { time: "6 PM", status: "low", label: "10/30" },
      { time: "7 PM", status: "moderate", label: "16/30" },
      { time: "8 PM", status: "low", label: "9/30" }
    ],
    shortDescription: "High-spec workstation stations for students working on AI models and hackathon code."
  },
  {
    id: "space-seminar-hall",
    name: "Block S Seminar Hall",
    category: "Hall",
    building: "Block S",
    roomNumber: "Hall 102",
    floor: "1st Floor",
    location: "Block S, Central Wing",
    capacity: 120,
    occupancy: 75,
    occupancyPercent: 62,
    crowdLevel: "Moderately Busy",
    crowdBadgeColor: "#f59e0b",
    noiseLevel: "Lecture Ongoing",
    availabilityStatus: "Moderately Busy",
    availabilityBadge: "Moderately Busy",
    availabilityClass: "amber",
    availableNow: false,
    availableFrom: "6:30 PM",
    availableUntil: "9:00 PM",
    availableForHours: "Open after 6:30 PM",
    facilities: ["Projector", "Podium Mic", "Tiered Acoustics"],
    suitableFor: "Evening club presentations and rehearsals",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { time: "Now", status: "busy", label: "Tech Talk" },
      { time: "6:30 PM", status: "empty", label: "Free" },
      { time: "7 PM", status: "empty", label: "Free" },
      { time: "8 PM", status: "empty", label: "Free" }
    ],
    shortDescription: "Tiered seminar hall currently hosting the AI talk. Free for open study from 6:30 PM."
  },
  {
    id: "space-cafeteria-outdoor",
    name: "Cafeteria Shaded Patio",
    category: "Outdoor",
    building: "Cafeteria",
    roomNumber: "Outdoor Deck",
    floor: "Ground Floor",
    location: "Student Center, East Lawn",
    capacity: 80,
    occupancy: 58,
    occupancyPercent: 72,
    crowdLevel: "Busy",
    crowdBadgeColor: "#f43f5e",
    noiseLevel: "Lively / Social",
    availabilityStatus: "Busy",
    availabilityBadge: "Peak / Busy",
    availabilityClass: "rose",
    availableNow: true,
    availableFrom: "Open 24/7",
    availableUntil: "Late Night",
    availableForHours: "24/7",
    facilities: ["Outdoor Wi-Fi", "Covered Canopy", "Snacks Nearby"],
    suitableFor: "Casual discussions, coffee breaks, club hangouts",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { time: "Now", status: "busy", label: "58/80" },
      { time: "6 PM", status: "busy", label: "Evening Rush" },
      { time: "8 PM", status: "moderate", label: "35/80" },
      { time: "9 PM", status: "low", label: "18/80" }
    ],
    shortDescription: "Breezy outdoor seating with umbrella canopies. Best for casual talk and refreshments."
  }
];

// ============================================================================
// 4. CAMPUS EVENTS (Happening Now, Upcoming, Completed with live indicators)
// ============================================================================
const DEMO_EVENTS = [
  {
    id: "ev-1",
    name: "Tech Talk: Future of Agentic AI & Systems",
    status: "live",
    isLiveNow: true,
    category: "Technology",
    date: "2026-09-12",
    time: "05:00 PM – 06:30 PM",
    startedAgo: "Started 25 minutes ago",
    remainingMinutes: 65,
    location: "Block S — Seminar Hall 102",
    buildingId: "block-s",
    organizer: "Google Developer Student Club (GDSC)",
    rsvps: 142,
    capacity: 150,
    description: "Deep dive into multi-agent systems, local LLM evaluation, and real-time tooling for autonomous workflows with live coding demos.",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
    speakers: ["Dr. Aarav Mehta (AI Lead)", "Neha Sen (Staff ML Engineer)"]
  },
  {
    id: "ev-2",
    name: "Campus Freshers Fest: Genesis 2026",
    status: "upcoming",
    isLiveNow: false,
    category: "Cultural",
    date: "2026-10-24",
    time: "05:00 PM",
    location: "Main Auditorium Amphitheatre",
    buildingId: "auditorium",
    organizer: "University Cultural Council",
    rsvps: 580,
    capacity: 1200,
    description: "The grand annual welcome celebration featuring live bands, dance crew showcases, interactive booths, and campus food trucks.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    speakers: ["Student Council Presidents", "Celebrity DJ Guest"]
  },
  {
    id: "ev-3",
    name: "Open Mic Night & Poetry Slam",
    status: "upcoming",
    isLiveNow: false,
    category: "Entertainment",
    date: "2026-10-28",
    time: "07:00 PM",
    location: "Central Cafeteria Amphitheatre",
    buildingId: "cafeteria",
    organizer: "Literary & Dramatic Arts Club",
    rsvps: 94,
    capacity: 120,
    description: "An unplugged acoustic and spoken word evening open to all students. Acoustic guitars, poetry readings, and stand-up comedy sets.",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    speakers: ["Student Poets", "Campus Indie Artists"]
  },
  {
    id: "ev-4",
    name: "Campus HackFest 2026 (36-Hour Hackathon)",
    status: "upcoming",
    isLiveNow: false,
    category: "Technology",
    date: "2026-10-30",
    time: "09:00 AM",
    location: "Innovation & Startup Incubator",
    buildingId: "innovation-center",
    organizer: "ACM Student Chapter & CS Department",
    rsvps: 340,
    capacity: 400,
    description: "Build prototype web apps, robotics hardware, and AI tools across 36 hours. Mentorship from industry engineers, free meals, and $5k prize pool.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    speakers: ["Judge Panel: Ex-Google, Microsoft, AWS"]
  },
  {
    id: "ev-5",
    name: "Inter-Department Badminton Tournament",
    status: "upcoming",
    isLiveNow: false,
    category: "Sports",
    date: "2026-11-02",
    time: "04:00 PM",
    location: "Sports Complex Indoor Courts",
    buildingId: "sports-complex",
    organizer: "Campus Athletics Department",
    rsvps: 116,
    capacity: 200,
    description: "Singles and doubles knockout tournament between Engineering, Sciences, Business, and Architecture departments.",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
    speakers: ["Campus Sports Coaches"]
  },
  {
    id: "ev-6",
    name: "Hands-on Workshop: Web Security & Ethical Hacking",
    status: "upcoming",
    isLiveNow: false,
    category: "Workshops",
    date: "2026-11-06",
    time: "10:30 AM",
    location: "Block S — Lab 3",
    buildingId: "block-s",
    organizer: "CyberSec Campus Society",
    rsvps: 78,
    capacity: 80,
    description: "Capture the flag walkthrough, OWASP Top 10 vulnerabilities demo, and vulnerability scanning with Kali Linux virtual labs.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    speakers: ["Offensive Security Certified Lead"]
  },
  {
    id: "ev-7",
    name: "Career Workshop: Resume & GitHub Portfolio Review",
    status: "completed",
    isLiveNow: false,
    category: "Academic",
    date: "2026-09-05",
    time: "03:00 PM",
    location: "Central Library Conference Room",
    buildingId: "central-library",
    organizer: "Placement & Training Cell",
    rsvps: 210,
    capacity: 250,
    description: "Senior engineers reviewed over 150 student resumes with 1-on-1 feedback on open source projects and mock technical interviews.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
    speakers: ["Campus Placement Officers"]
  }
];

// ============================================================================
// 5. LIVE CAMPUS ACTIVITY FEED (For the Home Dashboard Ticker)
// ============================================================================
const CAMPUS_ACTIVITIES = [
  {
    id: "act-1",
    icon: "🟢",
    text: "Block S — Room 204 is now completely EMPTY (Available until 8:00 PM)",
    time: "Just now",
    type: "space",
    actionUrl: "spaces.html#space-block-s-204"
  },
  {
    id: "act-2",
    icon: "⚡",
    text: "Possible match found: Casio Scientific Calculator matches Found item at Lab 3",
    time: "4 mins ago",
    type: "match",
    actionUrl: "lost-found.html#matchRadarSection"
  },
  {
    id: "act-3",
    icon: "🔴",
    text: "Happening Now: Tech Talk on Agentic AI at Seminar Hall (65 mins remaining)",
    time: "Live",
    type: "event",
    actionUrl: "events.html"
  },
  {
    id: "act-4",
    icon: "🔎",
    text: "Student ID Card found near Central Cafeteria counter — handed to helpdesk",
    time: "18 mins ago",
    type: "lost-found",
    actionUrl: "lost-found.html"
  },
  {
    id: "act-5",
    icon: "📚",
    text: "Central Library Silent Zone has 42 study cubicles available right now",
    time: "25 mins ago",
    type: "space",
    actionUrl: "spaces.html"
  },
  {
    id: "act-6",
    icon: "🎉",
    text: "Campus HackFest 2026 registrations crossed 340 participants",
    time: "1 hour ago",
    type: "event",
    actionUrl: "events.html"
  }
];

