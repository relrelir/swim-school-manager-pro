-- Make receiptnumber nullable in registrations table to allow discounts without receipt numbers
ALTER TABLE public.registrations 
ALTER COLUMN receiptnumber DROP NOT NULL;