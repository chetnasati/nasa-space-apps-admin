-- NASA Space Apps Challenge 2026 (BIAS Bhimtal) - Supabase / PostgreSQL Database Schema

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'NASA2026-BIAS-0042'
    team_name VARCHAR(100) NOT NULL,
    institution_name VARCHAR(150) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('School', 'College')),
    team_size INT NOT NULL CHECK (team_size BETWEEN 4 AND 6),
    challenge VARCHAR(150),
    status VARCHAR(20) DEFAULT 'Approved' CHECK (status IN ('Approved', 'Pending', 'Flagged')),
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Participants Table (Leaders + Members)
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(50) REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    is_leader BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Mentors Table (Optional Faculty Mentors)
CREATE TABLE IF NOT EXISTS mentors (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(50) REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(100),
    email VARCHAR(100),
    mobile VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Indexes for fast search and duplicate lookup
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(team_name);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_mobile ON participants(mobile);
CREATE INDEX IF NOT EXISTS idx_participants_team ON participants(team_id);
