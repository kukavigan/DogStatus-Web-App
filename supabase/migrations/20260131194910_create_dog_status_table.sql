/*
  # Create dog status table

  1. New Tables
    - `dog_status`
      - `id` (uuid, primary key) - Single record ID
      - `status` (text) - Current status: "inside" or "outside"
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `dog_status` table
    - Add policy for anyone to read status (public access)
    - Add policy for anyone to update status (public access)
  
  3. Initial Data
    - Insert default record with status "inside"

  Note: This is a single-document table that will only ever contain one row
  to track the current dog status in real-time.
*/

CREATE TABLE IF NOT EXISTS dog_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL CHECK (status IN ('inside', 'outside')),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dog_status ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the dog status
CREATE POLICY "Anyone can read dog status"
  ON dog_status
  FOR SELECT
  TO anon
  USING (true);

-- Allow anyone to update the dog status
CREATE POLICY "Anyone can update dog status"
  ON dog_status
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Insert initial status record
INSERT INTO dog_status (status, updated_at)
VALUES ('inside', now())
ON CONFLICT DO NOTHING;