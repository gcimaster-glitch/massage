-- Insert default schedules for all therapists
-- Monday to Friday: 10:00-20:00

-- therapist-1
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-t1-mon', 'therapist-1', 1, '10:00', '20:00', 1),
('sched-t1-tue', 'therapist-1', 2, '10:00', '20:00', 1),
('sched-t1-wed', 'therapist-1', 3, '10:00', '20:00', 1),
('sched-t1-thu', 'therapist-1', 4, '10:00', '20:00', 1),
('sched-t1-fri', 'therapist-1', 5, '10:00', '20:00', 1);

-- therapist-2
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-t2-mon', 'therapist-2', 1, '10:00', '20:00', 1),
('sched-t2-tue', 'therapist-2', 2, '10:00', '20:00', 1),
('sched-t2-wed', 'therapist-2', 3, '10:00', '20:00', 1),
('sched-t2-thu', 'therapist-2', 4, '10:00', '20:00', 1),
('sched-t2-fri', 'therapist-2', 5, '10:00', '20:00', 1);

-- therapist-3 (山田 健二)
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-t3-mon', 'therapist-3', 1, '10:00', '20:00', 1),
('sched-t3-tue', 'therapist-3', 2, '10:00', '20:00', 1),
('sched-t3-wed', 'therapist-3', 3, '10:00', '20:00', 1),
('sched-t3-thu', 'therapist-3', 4, '10:00', '20:00', 1),
('sched-t3-fri', 'therapist-3', 5, '10:00', '20:00', 1);

-- therapist-4 (佐藤 花子)
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-t4-mon', 'therapist-4', 1, '10:00', '20:00', 1),
('sched-t4-tue', 'therapist-4', 2, '10:00', '20:00', 1),
('sched-t4-wed', 'therapist-4', 3, '10:00', '20:00', 1),
('sched-t4-thu', 'therapist-4', 4, '10:00', '20:00', 1),
('sched-t4-fri', 'therapist-4', 5, '10:00', '20:00', 1);

-- therapist-5 (鈴木 翔太)
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-t5-mon', 'therapist-5', 1, '10:00', '20:00', 1),
('sched-t5-tue', 'therapist-5', 2, '10:00', '20:00', 1),
('sched-t5-wed', 'therapist-5', 3, '10:00', '20:00', 1),
('sched-t5-thu', 'therapist-5', 4, '10:00', '20:00', 1),
('sched-t5-fri', 'therapist-5', 5, '10:00', '20:00', 1);

-- therapist-6 (田中 美咲)
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-t6-mon', 'therapist-6', 1, '10:00', '20:00', 1),
('sched-t6-tue', 'therapist-6', 2, '10:00', '20:00', 1),
('sched-t6-wed', 'therapist-6', 3, '10:00', '20:00', 1),
('sched-t6-thu', 'therapist-6', 4, '10:00', '20:00', 1),
('sched-t6-fri', 'therapist-6', 5, '10:00', '20:00', 1);

-- therapist-7 (渡辺 大輔)
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-t7-mon', 'therapist-7', 1, '10:00', '20:00', 1),
('sched-t7-tue', 'therapist-7', 2, '10:00', '20:00', 1),
('sched-t7-wed', 'therapist-7', 3, '10:00', '20:00', 1),
('sched-t7-thu', 'therapist-7', 4, '10:00', '20:00', 1),
('sched-t7-fri', 'therapist-7', 5, '10:00', '20:00', 1);

-- therapist-8 (伊藤 愛)
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-t8-mon', 'therapist-8', 1, '10:00', '20:00', 1),
('sched-t8-tue', 'therapist-8', 2, '10:00', '20:00', 1),
('sched-t8-wed', 'therapist-8', 3, '10:00', '20:00', 1),
('sched-t8-thu', 'therapist-8', 4, '10:00', '20:00', 1),
('sched-t8-fri', 'therapist-8', 5, '10:00', '20:00', 1);

-- therapist-9 (中村 拓海)
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-t9-mon', 'therapist-9', 1, '10:00', '20:00', 1),
('sched-t9-tue', 'therapist-9', 2, '10:00', '20:00', 1),
('sched-t9-wed', 'therapist-9', 3, '10:00', '20:00', 1),
('sched-t9-thu', 'therapist-9', 4, '10:00', '20:00', 1),
('sched-t9-fri', 'therapist-9', 5, '10:00', '20:00', 1);

-- therapist-10 (小林 結衣)
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-t10-mon', 'therapist-10', 1, '10:00', '20:00', 1),
('sched-t10-tue', 'therapist-10', 2, '10:00', '20:00', 1),
('sched-t10-wed', 'therapist-10', 3, '10:00', '20:00', 1),
('sched-t10-thu', 'therapist-10', 4, '10:00', '20:00', 1),
('sched-t10-fri', 'therapist-10', 5, '10:00', '20:00', 1);

-- therapist-11 (高橋 大地)
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-t11-mon', 'therapist-11', 1, '10:00', '20:00', 1),
('sched-t11-tue', 'therapist-11', 2, '10:00', '20:00', 1),
('sched-t11-wed', 'therapist-11', 3, '10:00', '20:00', 1),
('sched-t11-thu', 'therapist-11', 4, '10:00', '20:00', 1),
('sched-t11-fri', 'therapist-11', 5, '10:00', '20:00', 1);
