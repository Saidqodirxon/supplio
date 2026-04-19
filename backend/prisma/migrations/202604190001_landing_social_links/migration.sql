UPDATE "LandingContent"
SET
  "socialTelegram"  = 'https://t.me/supplioapp',
  "socialInstagram" = 'https://www.instagram.com/supplio__app/',
  "socialLinkedin"  = 'https://www.linkedin.com/company/supplioapp'
WHERE id = 'LANDING'
  AND (
    "socialTelegram"  IS NULL OR "socialTelegram"  = '' OR
    "socialInstagram" IS NULL OR "socialInstagram" = '' OR
    "socialLinkedin"  IS NULL OR "socialLinkedin"  = ''
  );
