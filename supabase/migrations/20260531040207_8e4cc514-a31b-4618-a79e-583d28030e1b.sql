INSERT INTO public.ih_calendar_config (id, calendar_id, enabled, updated_at)
VALUES (1, '9a7578ab724e69ac2a18fc646c33c684a7b94a2c420127f1069284936486e78c@group.calendar.google.com', true, now())
ON CONFLICT (id) DO UPDATE
SET calendar_id = EXCLUDED.calendar_id,
    enabled = true,
    updated_at = now();