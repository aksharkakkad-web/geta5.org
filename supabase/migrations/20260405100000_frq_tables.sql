-- FRQ submissions and grading results tables
-- Supports immediate grading + queue-for-later when rate limited

-- ─── frq_submissions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS frq_submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     text NOT NULL,
  subject         text NOT NULL,
  responses       jsonb NOT NULL DEFAULT '{}'::jsonb,
  grading_status  text NOT NULL DEFAULT 'pending'
                  CHECK (grading_status IN ('pending', 'queued', 'graded')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for queue processing: find oldest queued submissions efficiently
CREATE INDEX idx_frq_submissions_queue
  ON frq_submissions (grading_status, created_at ASC)
  WHERE grading_status = 'queued';

-- Index for user's submission history
CREATE INDEX idx_frq_submissions_user
  ON frq_submissions (user_id, created_at DESC);

-- ─── frq_results ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS frq_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   uuid NOT NULL UNIQUE REFERENCES frq_submissions(id) ON DELETE CASCADE,
  total_score     integer NOT NULL,
  max_score       integer NOT NULL,
  part_breakdown  jsonb NOT NULL DEFAULT '[]'::jsonb,
  adi_takeaway    text NOT NULL DEFAULT '',
  graded_at       timestamptz NOT NULL DEFAULT now()
);

-- Index for looking up result by submission
CREATE INDEX idx_frq_results_submission
  ON frq_results (submission_id);

-- ─── RLS Policies ────────────────────────────────────────────────────────────
ALTER TABLE frq_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE frq_results ENABLE ROW LEVEL SECURITY;

-- Users can insert their own submissions
CREATE POLICY frq_submissions_insert ON frq_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own submissions
CREATE POLICY frq_submissions_select ON frq_submissions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can update grading_status (for queue processing)
-- Note: service role bypasses RLS by default, so no explicit policy needed

-- Users can read their own results (via submission ownership)
CREATE POLICY frq_results_select ON frq_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM frq_submissions
      WHERE frq_submissions.id = frq_results.submission_id
        AND frq_submissions.user_id = auth.uid()
    )
  );

-- ─── Admin view for detailed per-user breakdown ──────────────────────────────
-- Run this in Supabase SQL editor to see all user FRQ data
-- (This is a view, not a table — no storage cost)
CREATE OR REPLACE VIEW frq_user_breakdown AS
SELECT
  s.user_id,
  u.email,
  s.subject,
  s.question_id,
  s.grading_status,
  r.total_score,
  r.max_score,
  r.part_breakdown,
  r.adi_takeaway,
  s.created_at AS submitted_at,
  r.graded_at
FROM frq_submissions s
LEFT JOIN frq_results r ON r.submission_id = s.id
LEFT JOIN auth.users u ON u.id = s.user_id
ORDER BY s.created_at DESC;

-- ─── Aggregated stats per user per subject ───────────────────────────────────
CREATE OR REPLACE VIEW frq_user_stats AS
SELECT
  s.user_id,
  s.subject,
  COUNT(*) FILTER (WHERE s.grading_status = 'graded') AS graded_count,
  COUNT(*) FILTER (WHERE s.grading_status = 'queued') AS queued_count,
  COALESCE(SUM(r.total_score), 0) AS total_points_earned,
  COALESCE(SUM(r.max_score), 0) AS total_points_possible,
  CASE
    WHEN SUM(r.max_score) > 0
    THEN ROUND((SUM(r.total_score)::numeric / SUM(r.max_score)::numeric) * 100, 1)
    ELSE 0
  END AS accuracy_pct,
  MAX(s.created_at) AS last_submission_at
FROM frq_submissions s
LEFT JOIN frq_results r ON r.submission_id = s.id
GROUP BY s.user_id, s.subject
ORDER BY s.user_id, s.subject;