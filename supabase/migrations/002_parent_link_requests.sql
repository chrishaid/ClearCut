-- Parent-child linking requests table
-- Allows parents to request linking to a student account

CREATE TABLE IF NOT EXISTS parent_link_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,

  UNIQUE(parent_id, student_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS parent_link_requests_student_id_idx ON parent_link_requests(student_id);
CREATE INDEX IF NOT EXISTS parent_link_requests_parent_id_idx ON parent_link_requests(parent_id);
CREATE INDEX IF NOT EXISTS parent_link_requests_status_idx ON parent_link_requests(status);

-- RLS policies
ALTER TABLE parent_link_requests ENABLE ROW LEVEL SECURITY;

-- Parents can see their own requests
CREATE POLICY "Parents can view own link requests"
  ON parent_link_requests
  FOR SELECT
  USING (auth.uid() = parent_id);

-- Parents can create link requests
CREATE POLICY "Parents can create link requests"
  ON parent_link_requests
  FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

-- Students can see requests sent to them
CREATE POLICY "Students can view requests to them"
  ON parent_link_requests
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can update (accept/decline) requests to them
CREATE POLICY "Students can update requests to them"
  ON parent_link_requests
  FOR UPDATE
  USING (auth.uid() = student_id);
