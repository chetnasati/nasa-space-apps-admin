-- NASA Space Apps Challenge 2026 (BIAS Bhimtal) - Supabase / PostgreSQL Production Database Schema

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'NASA2026-BIAS-0042'
    team_name VARCHAR(100) NOT NULL,
    institution_name VARCHAR(150) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('School', 'College')),
    team_size INT NOT NULL CHECK (team_size BETWEEN 4 AND 6),
    challenge VARCHAR(150) DEFAULT 'General Space Innovation',
    status VARCHAR(20) DEFAULT 'Approved' CHECK (status IN ('Approved', 'Pending', 'Flagged')),
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Participants Table (Leaders + Members)
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    is_leader BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'Member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Mentors Table (Optional Faculty Mentors)
CREATE TABLE IF NOT EXISTS mentors (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    mobile VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Indexes for fast search and duplicate lookup
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(team_name);
CREATE INDEX IF NOT EXISTS idx_teams_category ON teams(category);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_mobile ON participants(mobile);
CREATE INDEX IF NOT EXISTS idx_participants_team ON participants(team_id);

-- 5. Enable Row Level Security (RLS) for Supabase
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;

-- Public Select Policies
CREATE POLICY "Allow public read access to teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Allow public read access to mentors" ON mentors FOR SELECT USING (true);

-- Public Insert Policy for Registration
CREATE POLICY "Allow public insertion for teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insertion for participants" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insertion for mentors" ON mentors FOR INSERT WITH CHECK (true);

-- Sample Seed Data for Testing
INSERT INTO teams (id, team_name, institution_name, category, team_size, challenge, status) VALUES
('NASA2026-BIAS-0042', 'AstroNova', 'Birla Institute of Applied Sciences, Bhimtal', 'College', 4, 'Exoplanet Climate Modeling', 'Approved'),
('NASA2026-BIAS-0089', 'Cosmic Coders', 'St. Xavier''s Senior Secondary School', 'School', 4, 'Interactive Mapping of Space Debris', 'Pending'),
('NASA2026-BIAS-0104', 'Space Vision', 'IIT Delhi', 'College', 5, 'Lunar Habitat Life Support System', 'Approved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO participants (team_id, name, email, mobile, is_leader, role) VALUES
('NASA2026-BIAS-0042', 'Priya Singh', 'priya.singh@bias.ac.in', '+91 98765 43210', TRUE, 'Team Leader'),
('NASA2026-BIAS-0042', 'Rahul Verma', 'rahul.v@bias.ac.in', '+91 98765 43211', FALSE, 'UI/UX Designer'),
('NASA2026-BIAS-0042', 'Ananya Roy', 'ananya.r@bias.ac.in', '+91 98765 43212', FALSE, 'Data Scientist'),
('NASA2026-BIAS-0042', 'Devansh Joshi', 'devansh.j@bias.ac.in', '+91 98765 43213', FALSE, 'Backend Developer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO mentors (team_id, name, email, mobile) VALUES
('NASA2026-BIAS-0042', 'Dr. H.S. Bhadauria', 'bhadauria@bias.ac.in', '+91 94120 12345')
ON CONFLICT DO NOTHING;

