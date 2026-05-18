-- =============================================
-- BATTLE BOTS EVENT MANAGEMENT SCHEMA
-- Run this in your Supabase SQL Editor
-- =============================================

-- Teams / Participants table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT NOT NULL UNIQUE,
  captain_name TEXT NOT NULL,
  captain_email TEXT NOT NULL UNIQUE,
  college TEXT NOT NULL,
  phone TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  bot_weight_class TEXT NOT NULL CHECK (bot_weight_class IN ('Featherweight','Lightweight','Middleweight','Heavyweight')),
  members TEXT[] DEFAULT '{}',
  points INTEGER DEFAULT 1000,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  avatar_color TEXT DEFAULT '#FF3A00',
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auction items table
CREATE TABLE IF NOT EXISTS auction_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Weapon','Armor','Drive System','Electronics','Special')),
  image_url TEXT,
  starting_bid INTEGER NOT NULL DEFAULT 50,
  current_bid INTEGER,
  current_bidder_id UUID REFERENCES teams(id),
  current_bidder_name TEXT,
  min_increment INTEGER DEFAULT 10,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','ended')),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES auction_items(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_a_id UUID REFERENCES teams(id),
  team_b_id UUID REFERENCES teams(id),
  team_a_name TEXT NOT NULL,
  team_b_name TEXT NOT NULL,
  winner_id UUID REFERENCES teams(id),
  winner_name TEXT,
  round TEXT NOT NULL CHECK (round IN ('Qualifiers','Quarter-Finals','Semi-Finals','Finals')),
  scheduled_at TIMESTAMPTZ,
  arena TEXT DEFAULT 'Arena Alpha',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info','warning','success','danger')),
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin table (simple password-based)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public insert teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read auction_items" ON auction_items FOR SELECT USING (true);
CREATE POLICY "Public read bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Public insert bids" ON bids FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);

-- Admin write policies (using service role from your app)
CREATE POLICY "Public update teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Public update auction_items" ON auction_items FOR UPDATE USING (true);
CREATE POLICY "Admin insert auction_items" ON auction_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin insert matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Admin insert announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin delete announcements" ON announcements FOR DELETE USING (true);

-- Seed some announcements
INSERT INTO announcements (title, content, type, pinned) VALUES
  ('Welcome to Battle Bots 2025!', 'Registration is now open. All teams must submit their bot specifications by the deadline.', 'success', true),
  ('Weight Class Update', 'Heavyweight category now allows up to 13.6kg. Please review the updated rules.', 'warning', false),
  ('Auction Opens Soon', 'The component auction will begin 48 hours before the event. Make sure your team is registered!', 'info', false);
