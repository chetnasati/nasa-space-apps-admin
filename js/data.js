// NASA Space Apps Hackathon 2026 - Initial Dataset & State

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
        id: "REG-2026-8891",
        teamName: "AstroNova",
        category: "College",
        institution: "Birla Institute of Applied Sciences, Bhimtal",
        leaderName: "Priya Singh",
        leaderEmail: "priya.singh@bias.ac.in",
        phone: "+91 98765 43210",
        membersCount: 4,
        members: [
            { name: "Priya Singh", role: "Team Leader", email: "priya.singh@bias.ac.in", phone: "+91 98765 43210" },
            { name: "Rahul Verma", role: "UI/UX Designer", email: "rahul.v@bias.ac.in", phone: "+91 98765 43211" },
            { name: "Ananya Roy", role: "Data Scientist", email: "ananya.r@bias.ac.in", phone: "+91 98765 43212" },
            { name: "Devansh Joshi", role: "Backend Developer", email: "devansh.j@bias.ac.in", phone: "+91 98765 43213" }
        ],
        challenge: "Exoplanet Climate Modeling",
        registrationDate: "2026-09-12",
        status: "Approved",
        isDuplicate: false,
        idCardIssued: true,
        issueDate: "2026-09-13"
    },
    {
        id: "REG-2026-8892",
        teamName: "Cosmic Coders",
        category: "School",
        institution: "St. Xavier's Senior Secondary School",
        leaderName: "Arjun Mehta",
        leaderEmail: "arjun.m@stxaviers.edu",
        phone: "+91 98123 45678",
        membersCount: 3,
        members: [
            { name: "Arjun Mehta", role: "Team Leader", email: "arjun.m@stxaviers.edu", phone: "+91 98123 45678" },
            { name: "Sneha Kapoor", role: "Frontend Dev", email: "sneha.k@stxaviers.edu", phone: "+91 98123 45679" },
            { name: "Karan Patel", role: "Research Lead", email: "karan.p@stxaviers.edu", phone: "+91 98123 45680" }
        ],
        challenge: "Interactive Mapping of Space Debris",
        registrationDate: "2026-09-12",
        status: "Pending",
        isDuplicate: false,
        idCardIssued: false,
        issueDate: null
    },
    {
        id: "REG-2026-8893",
        teamName: "Space Vision",
        category: "College",
        institution: "IIT Delhi",
        leaderName: "Riya Sharma",
        leaderEmail: "riya.sharma@iitd.ac.in",
        phone: "+91 97654 32109",
        membersCount: 5,
        members: [
            { name: "Riya Sharma", role: "Team Leader", email: "riya.sharma@iitd.ac.in", phone: "+91 97654 32109" },
            { name: "Vikram Das", role: "AI Engineer", email: "vikram.d@iitd.ac.in", phone: "+91 97654 32110" },
            { name: "Meera Nair", role: "Astrophysicist", email: "meera.n@iitd.ac.in", phone: "+91 97654 32111" }
        ],
        challenge: "Lunar Habitat Life Support System",
        registrationDate: "2026-09-11",
        status: "Approved",
        isDuplicate: false,
        idCardIssued: true,
        issueDate: "2026-09-12"
    },
    {
        id: "REG-2026-8894",
        teamName: "Orion Explorers",
        category: "School",
        institution: "Delhi Public School, R.K. Puram",
        leaderName: "Aarav Gupta",
        leaderEmail: "aarav.g@dps.edu",
        phone: "+91 98123 45678",
        membersCount: 4,
        members: [
            { name: "Aarav Gupta", role: "Team Leader", email: "aarav.g@dps.edu", phone: "+91 98123 45678" }
        ],
        challenge: "Solar Storm Early Warning App",
        registrationDate: "2026-09-10",
        status: "Flagged",
        isDuplicate: true,
        duplicateReason: "Duplicate Phone (+91 98123 45678) matches REG-2026-8892 (Cosmic Coders)",
        idCardIssued: false,
        issueDate: null
    },
    {
        id: "REG-2026-8895",
        teamName: "Galactic Pioneers",
        category: "College",
        institution: "BITS Pilani",
        leaderName: "Kabir Sen",
        leaderEmail: "priya.singh@bias.ac.in",
        phone: "+91 99887 76655",
        membersCount: 4,
        members: [
            { name: "Kabir Sen", role: "Team Leader", email: "priya.singh@bias.ac.in", phone: "+91 99887 76655" }
        ],
        challenge: "Mars Rover Terrain Navigation",
        registrationDate: "2026-09-09",
        status: "Flagged",
        isDuplicate: true,
        duplicateReason: "Duplicate Email (priya.singh@bias.ac.in) matches REG-2026-8891 (AstroNova)",
        idCardIssued: false,
        issueDate: null
    },
    {
        id: "REG-2026-8896",
        teamName: "Nebula Dynamics",
        category: "College",
        institution: "Birla Institute of Technology, Mesra",
        leaderName: "Tanvi Saxena",
        leaderEmail: "tanvi.s@bitmesra.ac.in",
        phone: "+91 91234 56789",
        membersCount: 4,
        members: [
            { name: "Tanvi Saxena", role: "Team Leader", email: "tanvi.s@bitmesra.ac.in", phone: "+91 91234 56789" },
            { name: "Rohan Bhatt", role: "Embedded Dev", email: "rohan.b@bitmesra.ac.in", phone: "+91 91234 56790" }
        ],
        challenge: "CubeSat Telemetry Dashboard",
        registrationDate: "2026-09-08",
        status: "Approved",
        isDuplicate: false,
        idCardIssued: true,
        issueDate: "2026-09-09"
    },
    {
        id: "REG-2026-8897",
        teamName: "Starlight Voyagers",
        category: "School",
        institution: "Kendriya Vidyalaya, Dehradun",
        leaderName: "Aditya Mishra",
        leaderEmail: "aditya.m@kv.edu.in",
        phone: "+91 92345 67890",
        membersCount: 3,
        members: [
            { name: "Aditya Mishra", role: "Team Leader", email: "aditya.m@kv.edu.in", phone: "+91 92345 67890" }
        ],
        challenge: "Deep Space Signal Processing",
        registrationDate: "2026-09-07",
        status: "Approved",
        isDuplicate: false,
        idCardIssued: true,
        issueDate: "2026-09-08"
    },
    {
        id: "REG-2026-8898",
        teamName: "Quantum Orbit",
        category: "College",
        institution: "IIT Bombay",
        leaderName: "Siddharth Rao",
        leaderEmail: "siddharth.r@iitb.ac.in",
        phone: "+91 93456 78901",
        membersCount: 4,
        members: [
            { name: "Siddharth Rao", role: "Team Leader", email: "siddharth.r@iitb.ac.in", phone: "+91 93456 78901" }
        ],
        challenge: "Quantum Encryption for Deep Space Communications",
        registrationDate: "2026-09-06",
        status: "Approved",
        isDuplicate: false,
        idCardIssued: true,
        issueDate: "2026-09-07"
    }
];

export const UPCOMING_EVENTS = [
    { id: 1, title: "Technical Briefing & NASA Datasets", date: "15 Sep 2026", time: "10:00 AM", type: "Webinar" },
    { id: 2, title: "Mentor Interaction & Team Sync", date: "18 Sep 2026", time: "02:00 PM", type: "Mentorship" },
    { id: 3, title: "Midway Check-in & Prototype Demo", date: "22 Sep 2026", time: "04:00 PM", type: "Review" },
    { id: 4, title: "Final Project Submission Deadline", date: "25 Sep 2026", time: "11:59 PM", type: "Deadline" }
];
