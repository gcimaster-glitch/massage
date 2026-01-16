-- セラピストのメニュー設定（既存のセラピストとマスターコースを使用）
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
-- therapist-1 のメニュー
('menu-t1-mc1', 'therapist-1', 'mc_1', 3500, 1, datetime('now')),
('menu-t1-mc2', 'therapist-1', 'mc_2', 6500, 1, datetime('now')),
('menu-t1-mc3', 'therapist-1', 'mc_3', 9500, 1, datetime('now')),

-- therapist-2 のメニュー
('menu-t2-mc2', 'therapist-2', 'mc_2', 7000, 1, datetime('now')),
('menu-t2-mc3', 'therapist-2', 'mc_3', 10000, 1, datetime('now')),
('menu-t2-mc4', 'therapist-2', 'mc_4', 13000, 1, datetime('now')),

-- therapist-3 のメニュー
('menu-t3-mc2', 'therapist-3', 'mc_2', 6500, 1, datetime('now')),
('menu-t3-mc3', 'therapist-3', 'mc_3', 9500, 1, datetime('now')),

-- therapist-4 のメニュー
('menu-t4-mc2', 'therapist-4', 'mc_2', 7500, 1, datetime('now')),
('menu-t4-mc3', 'therapist-4', 'mc_3', 11000, 1, datetime('now')),
('menu-t4-mc4', 'therapist-4', 'mc_4', 14000, 1, datetime('now')),

-- therapist-5 のメニュー
('menu-t5-mc1', 'therapist-5', 'mc_1', 3000, 1, datetime('now')),
('menu-t5-mc2', 'therapist-5', 'mc_2', 6000, 1, datetime('now'));

SELECT 'Menu data inserted successfully' as status;
