-- セラピストのオプション設定（既存のマスターオプションを使用）
INSERT OR IGNORE INTO therapist_options (id, therapist_id, master_option_id, price, is_available, created_at) VALUES
-- therapist-1 のオプション
('opt-t1-aroma', 'therapist-1', 'option-aroma', 1000, 1, datetime('now')),
('opt-t1-head', 'therapist-1', 'option-head', 1500, 1, datetime('now')),
('opt-t1-foot', 'therapist-1', 'option-foot', 1500, 1, datetime('now')),
('opt-t1-stretch', 'therapist-1', 'option-stretch', 1000, 1, datetime('now')),

-- therapist-2 のオプション
('opt-t2-aroma', 'therapist-2', 'option-aroma', 1200, 1, datetime('now')),
('opt-t2-stretch', 'therapist-2', 'option-stretch', 1500, 1, datetime('now')),

-- therapist-3 のオプション
('opt-t3-aroma', 'therapist-3', 'option-aroma', 1000, 1, datetime('now')),
('opt-t3-head', 'therapist-3', 'option-head', 1500, 1, datetime('now')),

-- therapist-4 のオプション
('opt-t4-foot', 'therapist-4', 'option-foot', 1800, 1, datetime('now')),
('opt-t4-stretch', 'therapist-4', 'option-stretch', 1200, 1, datetime('now')),

-- therapist-5 のオプション
('opt-t5-aroma', 'therapist-5', 'option-aroma', 800, 1, datetime('now')),
('opt-t5-head', 'therapist-5', 'option-head', 1200, 1, datetime('now')),
('opt-t5-foot', 'therapist-5', 'option-foot', 1200, 1, datetime('now'));

SELECT 'Options data inserted: ' || COUNT(*) || ' records' as status FROM therapist_options;
