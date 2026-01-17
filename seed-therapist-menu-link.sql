-- セラピストメニューの投入
-- 各セラピストに適切なコース・オプションを割り当て

-- ===== profile-1: リラクゼーション系 =====
INSERT INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tmenu-1-1', 'profile-1', 'course-relax-60', 8000, 1),
('tmenu-1-2', 'profile-1', 'course-relax-90', 12000, 1),
('tmenu-1-3', 'profile-1', 'course-shoulder-45', 6000, 1);

INSERT INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('topt-1-1', 'profile-1', 'option-head', 2000, 1),
('topt-1-2', 'profile-1', 'option-foot', 2000, 1),
('topt-1-3', 'profile-1', 'option-aroma', 1000, 1);

-- ===== profile-2: もみほぐし系 =====
INSERT INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tmenu-2-1', 'profile-2', 'course-massage-60', 8500, 1),
('tmenu-2-2', 'profile-2', 'course-massage-90', 12500, 1),
('tmenu-2-3', 'profile-2', 'course-back-45', 6500, 1);

INSERT INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('topt-2-1', 'profile-2', 'option-stretch', 2000, 1),
('topt-2-2', 'profile-2', 'option-footreflex', 2500, 1);

-- ===== profile-3: 整体系 =====
INSERT INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tmenu-3-1', 'profile-3', 'course-therapy-60', 9000, 1),
('tmenu-3-2', 'profile-3', 'course-therapy-90', 13000, 1),
('tmenu-3-3', 'profile-3', 'course-posture-75', 11000, 1);

INSERT INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('topt-3-1', 'profile-3', 'option-pelvis', 3000, 1),
('topt-3-2', 'profile-3', 'option-cupping', 3000, 1);

-- ===== profile-4: リンパマッサージ系 =====
INSERT INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tmenu-4-1', 'profile-4', 'course-lymph-60', 8500, 1),
('tmenu-4-2', 'profile-4', 'course-lymph-90', 12500, 1),
('tmenu-4-3', 'profile-4', 'course-facial-45', 7000, 1);

INSERT INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('topt-4-1', 'profile-4', 'option-beauty-needle', 4000, 1),
('topt-4-2', 'profile-4', 'option-decollete', 2000, 1);

-- ===== profile-5: タイ古式マッサージ系 =====
INSERT INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tmenu-5-1', 'profile-5', 'course-thai-60', 8000, 1),
('tmenu-5-2', 'profile-5', 'course-thai-90', 12000, 1),
('tmenu-5-3', 'profile-5', 'course-headspa-45', 6500, 1);

INSERT INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('topt-5-1', 'profile-5', 'option-thai-foot', 2500, 1),
('topt-5-2', 'profile-5', 'option-hotstone', 3000, 1);

-- ===== profile-6: アロママッサージ系 =====
INSERT INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tmenu-6-1', 'profile-6', 'course-aroma-60', 9000, 1),
('tmenu-6-2', 'profile-6', 'course-aroma-90', 13000, 1),
('tmenu-6-3', 'profile-6', 'course-balinese-75', 11000, 1);

INSERT INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('topt-6-1', 'profile-6', 'option-bodyscrub', 3000, 1),
('topt-6-2', 'profile-6', 'option-reflexology', 2500, 1);

-- ===== profile-7: スポーツマッサージ系 =====
INSERT INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tmenu-7-1', 'profile-7', 'course-sports-60', 9000, 1),
('tmenu-7-2', 'profile-7', 'course-sports-90', 13000, 1),
('tmenu-7-3', 'profile-7', 'course-condition-45', 6500, 1);

INSERT INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('topt-7-1', 'profile-7', 'option-taping', 2000, 1),
('topt-7-2', 'profile-7', 'option-icing', 1000, 1);

-- ===== profile-8: 指圧・鍼灸系 =====
INSERT INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tmenu-8-1', 'profile-8', 'course-shiatsu-60', 8500, 1),
('tmenu-8-2', 'profile-8', 'course-shiatsu-90', 12500, 1),
('tmenu-8-3', 'profile-8', 'course-acupuncture-60', 10000, 1);

INSERT INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('topt-8-1', 'profile-8', 'option-moxibustion', 2000, 1),
('topt-8-2', 'profile-8', 'option-suction', 2500, 1);

-- ===== profile-9: リフレクソロジー系 =====
INSERT INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tmenu-9-1', 'profile-9', 'course-reflexology-60', 7500, 1),
('tmenu-9-2', 'profile-9', 'course-reflexology-90', 11000, 1),
('tmenu-9-3', 'profile-9', 'course-hand-45', 6000, 1);

INSERT INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('topt-9-1', 'profile-9', 'option-calf', 2000, 1),
('topt-9-2', 'profile-9', 'option-paraffin', 2500, 1);

