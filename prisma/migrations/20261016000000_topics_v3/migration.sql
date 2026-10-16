-- The six categories of the v3 redesign (/articles chips). Idempotent: slugs
-- that already exist (system-building, ai, team) are renamed and described in
-- place so articles keep their links; the rest are inserted.
INSERT INTO topics (id, slug, name, description, created_at, updated_at) VALUES
  ('topic_management',      'management',      'مدیریت',        'تجربه‌های مدیریتی از میدان کسب‌وکار.',                                  now(), now()),
  ('topic_system_building', 'system-building', 'سیستم‌سازی',     'نوشتن فرایند، تعریف مرز تصمیم، و کم کردن وابستگی کار به حافظهٔ آدم‌ها.', now(), now()),
  ('topic_ai',              'ai',              'هوش مصنوعی',    'استفادهٔ کاربردی از هوش مصنوعی در کسب‌وکار واقعی.',                      now(), now()),
  ('topic_business',        'business',        'کسب‌وکار',      'نگاه عملی به رشد، عملیات و تصمیم‌گیری در کسب‌وکارها.',                  now(), now()),
  ('topic_team',            'team',            'رهبری و تیم',   'استخدام، آموزش، انتقال دانش و رهبری تیم.',                              now(), now()),
  ('topic_personal_growth', 'personal-growth', 'توسعه فردی',    'یادگیری و رشد فردی برای مدیران.',                                       now(), now())
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      updated_at = now();
