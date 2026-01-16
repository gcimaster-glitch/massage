-- データ投入状況の確認
SELECT 'Sites (APPROVED):' as info;
SELECT id, name, area, type, status FROM sites WHERE status='APPROVED';

SELECT 'Therapists:' as info;
SELECT tp.id, u.name, tp.experience_years, tp.rating, tp.status
FROM therapist_profiles tp
JOIN users u ON tp.user_id = u.id
WHERE tp.id IN ('therapist-1', 'therapist-2', 'therapist-3', 'therapist-4', 'therapist-5');

SELECT 'Menus per Therapist:' as info;
SELECT therapist_id, COUNT(*) as menu_count
FROM therapist_menu
WHERE therapist_id IN ('therapist-1', 'therapist-2', 'therapist-3', 'therapist-4', 'therapist-5')
GROUP BY therapist_id;

SELECT 'Options per Therapist:' as info;
SELECT therapist_id, COUNT(*) as option_count
FROM therapist_options
WHERE therapist_id IN ('therapist-1', 'therapist-2', 'therapist-3', 'therapist-4', 'therapist-5')
GROUP BY therapist_id;
