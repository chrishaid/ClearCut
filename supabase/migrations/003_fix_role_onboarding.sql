-- Fix: Allow role to be NULL so onboarding can set it
-- Previously, role defaulted to 'student' which bypassed onboarding

-- Remove the NOT NULL constraint and default from role
ALTER TABLE profiles
  ALTER COLUMN role DROP NOT NULL,
  ALTER COLUMN role DROP DEFAULT;

-- Update the handle_new_user function to NOT set a role
-- Users will set their role during onboarding
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NULL  -- Role will be set during onboarding
  );

  -- Also create initial streak record
  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- For existing users who were auto-set to 'student' but never completed onboarding,
-- you may want to reset their role to NULL:
-- UPDATE profiles SET role = NULL WHERE role = 'student' AND study_start_date IS NULL;
