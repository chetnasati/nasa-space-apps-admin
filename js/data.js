// NASA Space Apps Challenge 2026 - Data Store & Content

export const EVENT_DETAILS = {
    title: "NASA Space Apps Challenge 2026",
    host: "Birla Institute of Applied Sciences (BIAS), Bhimtal",
    organizer: "Astroverse & BIAS Innovation Cell",
    collegeDate: "2026-11-14T09:00:00",
    collegeDateDisplay: "14–15 November 2026",
    schoolDateDisplay: "To Be Announced",
    venue: "BIAS Campus, Bhimtal, Uttarakhand 263136",
    contactEmail: "spaceapps@bias.ac.in",
    contactPhone: "+91 98765 43210"
};

export const INITIAL_STATS = {
    totalRegistrations: 1248,
    totalTeams: 320,
    schoolTeams: 142,
    collegeTeams: 178,
    activeMissions: 8,
    upcomingEvents: 6,
    pendingApprovals: 14,
    flaggedDuplicates: 3
};

export const INITIAL_TEAMS = [
    {
        id: "NASA2026-BIAS-0042",
        teamName: "AstroNova",
        category: "College",
        institution: "Birla Institute of Applied Sciences, Bhimtal",
        teamSize: 4,
        leaderName: "Priya Singh",
        leaderEmail: "priya.singh@bias.ac.in",
        phone: "+91 98765 43210",
        members: [
            { name: "Priya Singh", role: "Team Leader", email: "priya.singh@bias.ac.in", phone: "+91 98765 43210", isLeader: true },
            { name: "Rahul Verma", role: "UI/UX Designer", email: "rahul.v@bias.ac.in", phone: "+91 98765 43211", isLeader: false },
            { name: "Ananya Roy", role: "Data Scientist", email: "ananya.r@bias.ac.in", phone: "+91 98765 43212", isLeader: false },
            { name: "Devansh Joshi", role: "Backend Developer", email: "devansh.j@bias.ac.in", phone: "+91 98765 43213", isLeader: false }
        ],
        mentor: { name: "Dr. H.S. Bhadauria", email: "bhadauria@bias.ac.in", phone: "+91 94120 12345" },
        challenge: "Exoplanet Climate Modeling",
        registrationDate: "2026-09-12",
        status: "Approved",
        isDuplicate: false,
        idCardIssued: true
    },
    {
        id: "NASA2026-BIAS-0089",
        teamName: "Cosmic Coders",
        category: "School",
        institution: "St. Xavier's Senior Secondary School",
        teamSize: 4,
        leaderName: "Arjun Mehta",
        leaderEmail: "arjun.m@stxaviers.edu",
        phone: "+91 98123 45678",
        members: [
            { name: "Arjun Mehta", role: "Team Leader", email: "arjun.m@stxaviers.edu", phone: "+91 98123 45678", isLeader: true },
            { name: "Sneha Kapoor", role: "Frontend Dev", email: "sneha.k@stxaviers.edu", phone: "+91 98123 45679", isLeader: false },
            { name: "Karan Patel", role: "Research Lead", email: "karan.p@stxaviers.edu", phone: "+91 98123 45680", isLeader: false },
            { name: "Riya Sen", role: "Hardware Dev", email: "riya.s@stxaviers.edu", phone: "+91 98123 45681", isLeader: false }
        ],
        mentor: { name: "Prof. Sunita Sharma", email: "sunita@stxaviers.edu", phone: "+91 98222 33344" },
        challenge: "Interactive Mapping of Space Debris",
        registrationDate: "2026-09-12",
        status: "Pending",
        isDuplicate: false,
        idCardIssued: false
    },
    {
        id: "NASA2026-BIAS-0104",
        teamName: "Space Vision",
        category: "College",
        institution: "IIT Delhi",
        teamSize: 5,
        leaderName: "Riya Sharma",
        leaderEmail: "riya.sharma@iitd.ac.in",
        phone: "+91 97654 32109",
        members: [
            { name: "Riya Sharma", role: "Team Leader", email: "riya.sharma@iitd.ac.in", phone: "+91 97654 32109", isLeader: true },
            { name: "Vikram Das", role: "AI Engineer", email: "vikram.d@iitd.ac.in", phone: "+91 97654 32110", isLeader: false },
            { name: "Meera Nair", role: "Astrophysicist", email: "meera.n@iitd.ac.in", phone: "+91 97654 32111", isLeader: false },
            { name: "Aditya Kumar", role: "Full Stack Dev", email: "aditya.k@iitd.ac.in", phone: "+91 97654 32112", isLeader: false },
            { name: "Tanya Bisht", role: "Data Analyst", email: "tanya.b@iitd.ac.in", phone: "+91 97654 32113", isLeader: false }
        ],
        mentor: null,
        challenge: "Lunar Habitat Life Support System",
        registrationDate: "2026-09-11",
        status: "Approved",
        isDuplicate: false,
        idCardIssued: true
    }
];

export const GALLERY_PHOTOS = [
    { id: 1, title: "Opening Ceremony 2025", category: "Ceremony", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop", caption: "Keynote presentation at BIAS Auditorium." },
    { id: 2, title: "Teams Hacking Overnight", category: "Hackathon", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop", caption: "College developers tackling NASA space debris datasets." },
    { id: 3, title: "NASA Subject Expert Mentorship", category: "Mentorship", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop", caption: "Mentors guiding teams on satellite telemetry analysis." },
    { id: 4, title: "Final Prototype Presentations", category: "Pitching", url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop", caption: "School edition winners pitching their solar flare alert app." },
    { id: 5, title: "Awards Ceremony & Trophy Distribution", category: "Winners", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop", caption: "Top 3 winning teams celebrating their NASA global nominations." }
];

export const VIDEO_SHOWCASE = [
    { id: 1, title: "NASA Space Apps BIAS 2025 - Official Recap", duration: "3:45", thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: 2, title: "Participant Testimonials & Experience", duration: "2:15", thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
];

export const WHY_PARTICIPATE_CARDS = [
    { title: "Official NASA Certificates", desc: "All verified participants receive official NASA Space Apps Challenge certificates of completion.", icon: "award" },
    { title: "Swag & Goodies", desc: "Exclusive NASA Space Apps t-shirts, stickers, badges, and tech kits for all attendees.", icon: "gift" },
    { title: "Expert Mentorship", desc: "Direct guidance from space scientists, ISRO alumni, and leading industry engineers.", icon: "users" },
    { title: "Global Innovation", desc: "Access real open-source NASA earth observation data & space mission APIs.", icon: "globe" },
    { title: "Networking & Community", desc: "Connect with top coders, designers, and innovators across school and college divisions.", icon: "zap" },
    { title: "Global Nomination", desc: "Winning projects advance to global judging for official NASA Space Apps awards.", icon: "star" }
];

export const FAQS_LIST = [
    { q: "Is registration free for NASA Space Apps Challenge 2026?", a: "Yes! Registration is 100% free of cost for both School and College divisions." },
    { q: "What is the allowed team size?", a: "Teams must consist of a minimum of 4 members and a maximum of 6 members. Individual participation is not permitted." },
    { q: "Who is eligible to participate?", a: "Students currently enrolled in School (Classes 8th to 12th) or College / Universities (Undergraduate & Postgraduate) are eligible." },
    { q: "Can team members belong to different institutions?", a: "No. All team members must belong to the exact same school or college institution." },
    { q: "What should participants bring to the venue?", a: "Participants must bring their laptops, chargers, college/school student ID cards, and enthusiasm! Wi-Fi and power setups are provided." },
    { q: "Are official certificates provided?", a: "Yes! All registered participants who submit a valid project will receive official NASA Space Apps certificates." }
];
