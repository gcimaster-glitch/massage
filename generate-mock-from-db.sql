-- セラピストデータを取得（11名）
SELECT 
  tp.id,
  u.name,
  u.email,
  u.phone,
  u.avatar_url,
  tp.bio,
  tp.specialties,
  tp.experience_years,
  tp.rating,
  tp.review_count,
  tp.approved_areas,
  tp.status,
  o.name as office_name,
  o.id as office_id
FROM therapist_profiles tp
JOIN users u ON tp.user_id = u.id
LEFT JOIN offices o ON tp.office_id = o.id
WHERE tp.status = 'APPROVED'
ORDER BY tp.id
LIMIT 11;
