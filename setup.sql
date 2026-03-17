-- RECALLHQ FULL SCHEMA SETUP
-- This script will wipe existing tables and recreate the complete schema.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TASKS TABLE
-- ==========================================
DROP TABLE IF EXISTS public.tasks CASCADE;
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('daily', 'onetime')) DEFAULT 'onetime',
    link TEXT,
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ==========================================
-- 2. PROJECTS TABLE
-- ==========================================
DROP TABLE IF EXISTS public.projects CASCADE;
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    current_milestone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. BRAND DNA TABLE
-- ==========================================
DROP TABLE IF EXISTS public.brand_dna CASCADE;
CREATE TABLE public.brand_dna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    brand_name TEXT,
    mission TEXT,
    vision TEXT,
    values TEXT[],
    target_audience TEXT,
    voice TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SECURITY & POLICIES (RLS)
-- ==========================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_dna ENABLE ROW LEVEL SECURITY;

-- Allow all access for the anonymous user (required for local-first hardcoded user_id model)
-- Note: In production, you would use auth.uid() = user_id
DROP POLICY IF EXISTS "Allow all access to tasks" ON public.tasks;
CREATE POLICY "Allow all access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to projects" ON public.projects;
CREATE POLICY "Allow all access to projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to brand_dna" ON public.brand_dna;
CREATE POLICY "Allow all access to brand_dna" ON public.brand_dna FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- INDICES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_brand_dna_user_id ON public.brand_dna(user_id);

-- ==========================================
-- 4. NOTES TABLE
-- ==========================================
DROP TABLE IF EXISTS public.notes CASCADE;
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    color TEXT DEFAULT 'cream',
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to notes" ON public.notes;
CREATE POLICY "Allow all access to notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at DESC);

-- ==========================================
-- 5. REMINDERS TABLE
-- ==========================================
DROP TABLE IF EXISTS public.reminders CASCADE;
CREATE TABLE public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    note TEXT DEFAULT '',
    remind_at TIMESTAMPTZ NOT NULL,
    repeat TEXT CHECK (repeat IN ('none', 'daily', 'weekly')) DEFAULT 'none',
    done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to reminders" ON public.reminders;
CREATE POLICY "Allow all access to reminders" ON public.reminders FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX idx_reminders_remind_at ON public.reminders(remind_at ASC);

-- ==========================================
-- 6. CARDS TABLE
-- ==========================================
DROP TABLE IF EXISTS public.cards CASCADE;
CREATE TABLE public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to cards" ON public.cards;
CREATE POLICY "Allow all access to cards" ON public.cards FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_cards_user_id ON public.cards(user_id);
CREATE INDEX idx_cards_created_at ON public.cards(created_at DESC);

