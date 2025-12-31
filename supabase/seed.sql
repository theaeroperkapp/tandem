-- Tandem Office Listings Seed Data
-- Run this in your Supabase SQL editor after creating the schema

-- Clear existing data
TRUNCATE TABLE office_listings CASCADE;

-- San Francisco Listings

INSERT INTO office_listings (
  title, address, city, neighborhood, square_feet, price_per_month, max_capacity,
  available_date, min_lease_months, max_lease_months, amenities, images, primary_image_url,
  description, highlights, is_available
) VALUES
-- SF Listing 1: SOMA Modern Tech Space
(
  'Modern SOMA Tech Hub',
  '201 Townsend Street, San Francisco, CA 94107',
  'San Francisco',
  'SOMA',
  2400,
  9600,
  18,
  '2025-02-01',
  12,
  36,
  '{"conference_rooms": 2, "kitchen": true, "parking_spots": 4, "24_7_access": true, "natural_light": true, "bike_storage": true}',
  '[{"url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800", "caption": "Open workspace", "order": 1}, {"url": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800", "caption": "Conference room", "order": 2}]',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  'Bright, modern office space in the heart of SOMA tech corridor. Open floor plan with high ceilings, exposed brick, and abundant natural light. Walking distance to Caltrain and multiple bus lines.',
  ARRAY['Walking distance to Caltrain', 'Exposed brick & high ceilings', 'Fiber internet ready', 'Dog-friendly building'],
  true
),

-- SF Listing 2: Financial District Premium
(
  'Premium FiDi Tower Suite',
  '555 California Street, Suite 1200, San Francisco, CA 94104',
  'San Francisco',
  'Financial District',
  3200,
  16000,
  24,
  '2025-03-01',
  24,
  60,
  '{"conference_rooms": 3, "kitchen": true, "parking_spots": 8, "24_7_access": true, "reception": true, "mail_room": true}',
  '[{"url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800", "caption": "Building exterior", "order": 1}]',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  'Class A office space in iconic FiDi tower. Panoramic city and bay views, premium finishes, and full-service building amenities. Ideal for client-facing businesses.',
  ARRAY['Panoramic bay views', 'Building concierge', 'BART accessible', 'Premium finishes'],
  true
),

-- SF Listing 3: Mission Bay Innovation
(
  'Mission Bay Innovation Center',
  '450 Mission Bay Boulevard, San Francisco, CA 94158',
  'San Francisco',
  'Mission Bay',
  1800,
  7200,
  14,
  '2025-01-15',
  12,
  24,
  '{"conference_rooms": 1, "kitchen": true, "parking_spots": 6, "24_7_access": true, "natural_light": true, "shower": true, "gym": true}',
  '[{"url": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800", "caption": "Main workspace", "order": 1}]',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
  'New construction in rapidly growing Mission Bay. Open layout with floor-to-ceiling windows, building gym access, and proximity to UCSF campus. Perfect for health/biotech startups.',
  ARRAY['Building gym included', 'Near UCSF campus', 'New construction', 'Shower facilities'],
  true
),

-- SF Listing 4: Dogpatch Creative
(
  'Dogpatch Creative Loft',
  '2525 3rd Street, San Francisco, CA 94107',
  'San Francisco',
  'Dogpatch',
  2000,
  6000,
  15,
  '2025-02-15',
  12,
  36,
  '{"conference_rooms": 1, "kitchen": true, "parking_spots": 10, "24_7_access": true, "natural_light": true, "pet_friendly": true}',
  '[{"url": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800", "caption": "Creative workspace", "order": 1}]',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
  'Converted warehouse space in trendy Dogpatch neighborhood. Industrial aesthetic with polished concrete floors, original timber beams, and plenty of street parking. Growing restaurant scene nearby.',
  ARRAY['Industrial aesthetic', 'Street parking available', 'Pet-friendly', 'Trendy neighborhood'],
  true
),

-- SF Listing 5: SOMA Startup Suite
(
  'SOMA Startup Suite',
  '995 Market Street, Suite 400, San Francisco, CA 94103',
  'San Francisco',
  'SOMA',
  1200,
  4800,
  10,
  '2025-01-01',
  6,
  24,
  '{"conference_rooms": 1, "kitchen": true, "parking_spots": 0, "24_7_access": true, "furnished": true}',
  '[{"url": "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800", "caption": "Furnished office", "order": 1}]',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800',
  'Move-in ready furnished office perfect for early-stage startups. Flexible 6-month minimum lease. Central SOMA location with excellent transit access (Powell St BART, multiple Muni lines).',
  ARRAY['Fully furnished', 'Flexible lease terms', 'Steps from Powell BART', 'Move-in ready'],
  true
),

-- SF Listing 6: Financial District Value
(
  'FiDi Efficient Office',
  '100 Pine Street, Suite 800, San Francisco, CA 94111',
  'San Francisco',
  'Financial District',
  1500,
  6750,
  12,
  '2025-02-01',
  12,
  36,
  '{"conference_rooms": 1, "kitchen": true, "parking_spots": 2, "24_7_access": true}',
  '[{"url": "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800", "caption": "Office space", "order": 1}]',
  'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800',
  'Cost-effective FiDi option without sacrificing location. Professional environment in established building. Close to Embarcadero BART and Ferry Building.',
  ARRAY['Great value for FiDi', 'Near Ferry Building', 'BART accessible', 'Professional building'],
  true
),

-- SF Listing 7: Mission Trendy
(
  'Mission Street Creative Space',
  '2175 Mission Street, San Francisco, CA 94110',
  'San Francisco',
  'Mission',
  1600,
  5600,
  12,
  '2025-01-15',
  12,
  24,
  '{"conference_rooms": 1, "kitchen": true, "parking_spots": 3, "24_7_access": true, "natural_light": true}',
  '[{"url": "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=800", "caption": "Creative space", "order": 1}]',
  'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=800',
  'Vibrant Mission District location with character. Great for creative agencies and lifestyle brands. Amazing food scene, BART nearby, and authentic SF neighborhood vibe.',
  ARRAY['Vibrant neighborhood', '16th St BART nearby', 'Amazing food options', 'Creative atmosphere'],
  true
),

-- SF Listing 8: Large SOMA HQ
(
  'SOMA Headquarters Space',
  '88 Bluxome Street, San Francisco, CA 94107',
  'San Francisco',
  'SOMA',
  5000,
  22500,
  40,
  '2025-04-01',
  36,
  60,
  '{"conference_rooms": 4, "kitchen": true, "parking_spots": 15, "24_7_access": true, "natural_light": true, "reception": true, "shower": true}',
  '[{"url": "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800", "caption": "Large open floor", "order": 1}]',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800',
  'Full-floor headquarters space for growing companies. Multiple conference rooms, executive offices available, and room for continued expansion. Loading dock access for events.',
  ARRAY['Full floor available', 'Executive offices', 'Loading dock', 'Expansion potential'],
  true
),

-- NYC Listings

-- NYC Listing 1: Flatiron Premium
(
  'Flatiron District Premium',
  '225 Park Avenue South, New York, NY 10003',
  'New York',
  'Flatiron',
  2800,
  15400,
  22,
  '2025-02-01',
  24,
  60,
  '{"conference_rooms": 3, "kitchen": true, "parking_spots": 0, "24_7_access": true, "natural_light": true, "reception": true}',
  '[{"url": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800", "caption": "Modern office", "order": 1}]',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
  'Prestigious Flatiron address with modern amenities. High ceilings, column-free floor plan, and views of Madison Square Park. Multiple subway lines within 2 blocks.',
  ARRAY['Madison Square Park views', 'Multiple subway access', 'High ceilings', 'Prestigious address'],
  true
),

-- NYC Listing 2: Chelsea Creative
(
  'Chelsea Gallery District Office',
  '520 West 25th Street, New York, NY 10001',
  'New York',
  'Chelsea',
  2200,
  11000,
  16,
  '2025-03-01',
  12,
  36,
  '{"conference_rooms": 2, "kitchen": true, "parking_spots": 0, "24_7_access": true, "natural_light": true, "rooftop": true}',
  '[{"url": "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800", "caption": "Loft space", "order": 1}]',
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800',
  'Stunning loft space in Chelsea gallery district. Rooftop access, industrial charm, and creative neighborhood energy. Perfect for design, media, and creative companies.',
  ARRAY['Rooftop access', 'Gallery district location', 'Industrial charm', 'High Line nearby'],
  true
),

-- NYC Listing 3: FiDi Tower
(
  'Financial District Tower',
  '1 Liberty Plaza, Suite 2400, New York, NY 10006',
  'New York',
  'Financial District',
  4000,
  24000,
  32,
  '2025-04-01',
  36,
  60,
  '{"conference_rooms": 4, "kitchen": true, "parking_spots": 0, "24_7_access": true, "reception": true, "mail_room": true}',
  '[{"url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800", "caption": "Tower view", "order": 1}]',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  'Premier Financial District location with World Trade Center views. Full-service building with 24/7 security, concierge, and on-site amenities. Direct PATH and subway access.',
  ARRAY['WTC views', 'Full-service building', 'PATH access', 'On-site dining'],
  true
),

-- NYC Listing 4: DUMBO Tech
(
  'DUMBO Brooklyn Tech Space',
  '55 Washington Street, Brooklyn, NY 11201',
  'New York',
  'DUMBO',
  2000,
  9000,
  16,
  '2025-02-15',
  12,
  36,
  '{"conference_rooms": 2, "kitchen": true, "parking_spots": 3, "24_7_access": true, "natural_light": true, "bike_storage": true}',
  '[{"url": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800", "caption": "Brooklyn views", "order": 1}]',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
  'Brooklyn waterfront office with Manhattan skyline views. Former warehouse conversion with exposed brick and timber. Growing tech hub with restaurants and Brooklyn Bridge Park nearby.',
  ARRAY['Manhattan skyline views', 'Brooklyn Bridge Park', 'Converted warehouse', 'Bike-friendly'],
  true
),

-- NYC Listing 5: Midtown Affordable
(
  'Midtown Value Office',
  '370 Lexington Avenue, Suite 1200, New York, NY 10017',
  'New York',
  'Midtown',
  1400,
  8400,
  11,
  '2025-01-15',
  12,
  24,
  '{"conference_rooms": 1, "kitchen": true, "parking_spots": 0, "24_7_access": true}',
  '[{"url": "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800", "caption": "Office view", "order": 1}]',
  'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800',
  'Affordable Midtown option near Grand Central. Professional environment with excellent transit connectivity. Great for teams that need easy access from Metro North and multiple subway lines.',
  ARRAY['Grand Central access', 'Value pricing', 'Transit hub location', 'Professional building'],
  true
),

-- NYC Listing 6: SoHo Boutique
(
  'SoHo Cast Iron Loft',
  '594 Broadway, New York, NY 10012',
  'New York',
  'SoHo',
  1800,
  12600,
  14,
  '2025-03-01',
  24,
  48,
  '{"conference_rooms": 1, "kitchen": true, "parking_spots": 0, "24_7_access": true, "natural_light": true}',
  '[{"url": "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800", "caption": "Loft interior", "order": 1}]',
  'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800',
  'Iconic SoHo cast-iron building with original architectural details. High ceilings, large windows, and legendary neighborhood. Perfect for brands that value aesthetics and location.',
  ARRAY['Historic cast-iron building', 'SoHo shopping district', 'Architectural landmark', 'Premium address'],
  true
),

-- NYC Listing 7: Chelsea Startup
(
  'Chelsea Startup Hub',
  '119 West 24th Street, New York, NY 10011',
  'New York',
  'Chelsea',
  1100,
  5500,
  9,
  '2025-01-01',
  6,
  18,
  '{"conference_rooms": 1, "kitchen": true, "parking_spots": 0, "24_7_access": true, "furnished": true}',
  '[{"url": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800", "caption": "Startup space", "order": 1}]',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
  'Flexible startup space with short-term lease options. Fully furnished and move-in ready. Chelsea location with easy access to tech scene and investor meetings.',
  ARRAY['Furnished space', 'Flexible lease', 'Startup-friendly', 'Central location'],
  true
),

-- NYC Listing 8: Williamsburg Creative
(
  'Williamsburg Waterfront',
  '25 Kent Avenue, Brooklyn, NY 11249',
  'New York',
  'Williamsburg',
  2400,
  10800,
  18,
  '2025-02-01',
  12,
  36,
  '{"conference_rooms": 2, "kitchen": true, "parking_spots": 5, "24_7_access": true, "natural_light": true, "rooftop": true, "bike_storage": true}',
  '[{"url": "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800", "caption": "Waterfront view", "order": 1}]',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800',
  'New development on Williamsburg waterfront with East River views. Modern build-out, rooftop amenities, and ferry access to Manhattan. Thriving creative community.',
  ARRAY['East River views', 'NYC Ferry access', 'Rooftop deck', 'New construction'],
  true
);

-- Verify data was inserted
SELECT city, neighborhood, COUNT(*) as count,
       MIN(price_per_month) as min_price,
       MAX(price_per_month) as max_price
FROM office_listings
GROUP BY city, neighborhood
ORDER BY city, neighborhood;
