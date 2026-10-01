-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- Inspections Table
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES auth.users(id),
    image_url TEXT NOT NULL,
    status TEXT DEFAULT 'Pending Review',
    inspection_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anomalies Table
CREATE TABLE anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    x_coordinate DECIMAL,
    y_coordinate DECIMAL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own projects
CREATE POLICY "Users manage own projects" ON projects
    FOR ALL USING (auth.uid() = user_id);

-- Inspections are viewable if the user owns the parent project
CREATE POLICY "Users view own inspections" ON inspections
    FOR ALL USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = inspections.project_id AND projects.user_id = auth.uid())
    );

-- Anomalies follow the same project ownership logic
CREATE POLICY "Users view own anomalies" ON anomalies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM inspections 
            JOIN projects ON inspections.project_id = projects.id 
            WHERE inspections.id = anomalies.inspection_id AND projects.user_id = auth.uid()
        )
    );
