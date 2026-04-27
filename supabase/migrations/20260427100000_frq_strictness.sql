-- Persist the strictness tier the user selected at submission time so we can
-- regrade queued submissions later with the same rigor they originally chose.
-- Existing rows default to 'moderate' (the historical default for the submit
-- modal); new rows must specify one of the three valid tiers.

ALTER TABLE frq_submissions
  ADD COLUMN IF NOT EXISTS strictness text NOT NULL DEFAULT 'moderate'
    CHECK (strictness IN ('light', 'moderate', 'strict'));

-- Refresh the admin view to expose strictness for analytics.
DROP VIEW IF EXISTS frq_user_breakdown;
CREATE OR REPLACE VIEW frq_user_breakdown AS
SELECT
  s.user_id,
  u.email,
  s.subject,
  s.question_id,
  s.grading_status,
  s.strictness,
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
