-- Make receiptnumber required again for registrations table
ALTER TABLE public.registrations 
ALTER COLUMN receiptnumber SET NOT NULL;