# AuTP Database Backup Summary
Generated: 2026-04-01

## Tables with Data:
- services: 6 rows
- profiles: 1 row  
- user_roles: 1 row
- resources: 5 rows

## Empty Tables (no data):
- bookings, applications, news_updates, notifications, booking_resources, service_activity_log

## Backup Files:
- backup_services.csv
- backup_profiles.csv
- backup_user_roles.csv
- backup_resources.csv
- (empty tables also exported as empty CSV files)

## Restoration Instructions:
1. Create a new Supabase project
2. Run the migration SQL files from supabase/migrations/ to recreate schema
3. Import CSV data using Supabase dashboard (Table Editor > Import)
4. Set up RLS policies (included in migrations)
5. Configure storage buckets: service-media (public), news-images (private)

## Code Backup:
Connect to GitHub via Project Settings > GitHub to sync the full codebase.
Clone from GitHub to deploy on Vercel/Netlify.
