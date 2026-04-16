-- Thumbs up/down feedback per rubric scoring point
-- Weak signal for identifying which FRQ criteria need tuning — never auto-applied

CREATE TABLE IF NOT EXISTS frq_feedback (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   uuid NOT NULL REFERENCES frq_submissions(id) ON DELETE CASCADE,
  point_id        text NOT NULL,
  vote            text NOT NULL CHECK (vote IN ('up', 'down')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- One vote per point per submission (prevent spam)
CREATE UNIQUE INDEX idx_frq_feedback_unique
  ON frq_feedback (submission_id, point_id);

-- Quick lookup for monitoring: which points get the most downvotes?
CREATE INDEX idx_frq_feedback_vote
  ON frq_feedback (vote, created_at DESC);

-- RLS
ALTER TABLE frq_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert feedback for their own submissions
CREATE POLICY frq_feedback_insert ON frq_feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM frq_submissions
      WHERE frq_submissions.id = frq_feedback.submission_id
        AND frq_submissions.user_id = auth.uid()
    )
  );

-- Users can read their own feedback
CREATE POLICY frq_feedback_select ON frq_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM frq_submissions
      WHERE frq_submissions.id = frq_feedback.submission_id
        AND frq_submissions.user_id = auth.uid()
    )
  );

-- Admin view: accuracy signal dashboard
CREATE OR REPLACE VIEW frq_feedback_summary AS
SELECT
  s.subject,
  s.question_id,
  f.point_id,
  COUNT(*) FILTER (WHERE f.vote = 'up') AS upvotes,
  COUNT(*) FILTER (WHERE f.vote = 'down') AS downvotes,
  ROUND(
    COUNT(*) FILTER (WHERE f.vote = 'down')::numeric /
    NULLIF(COUNT(*), 0)::numeric * 100, 1
  ) AS downvote_pct
FROM frq_feedback f
JOIN frq_submissions s ON s.id = f.submission_id
GROUP BY s.subject, s.question_id, f.point_id
ORDER BY downvote_pct DESC NULLS LAST;
