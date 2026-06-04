ALTER TABLE public.ih_staff_profiles DISABLE TRIGGER USER;
UPDATE public.ih_staff_profiles SET status = 'Active' WHERE email = 'zarnaaz@theaihq.net' AND status = 'Pending';
ALTER TABLE public.ih_staff_profiles ENABLE TRIGGER USER;