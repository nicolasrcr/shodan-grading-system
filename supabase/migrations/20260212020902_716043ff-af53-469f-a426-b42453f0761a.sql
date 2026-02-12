
-- 1. Fix candidates: replace permissive policies with role-based ones
DROP POLICY IF EXISTS "Authenticated users can insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can update candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can view candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can delete candidates" ON public.candidates;

CREATE POLICY "Authenticated users can view candidates"
  ON public.candidates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and moderators can insert candidates"
  ON public.candidates FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can update candidates"
  ON public.candidates FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete candidates"
  ON public.candidates FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 2. Fix evaluations: replace permissive policies with role-based ones
DROP POLICY IF EXISTS "Authenticated users can insert evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Authenticated users can update evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Authenticated users can view evaluations" ON public.evaluations;

CREATE POLICY "Authenticated users can view evaluations"
  ON public.evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and moderators can insert evaluations"
  ON public.evaluations FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can update evaluations"
  ON public.evaluations FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete evaluations"
  ON public.evaluations FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 3. Fix grade_programs: make read authenticated-only, add admin write policies
DROP POLICY IF EXISTS "Anyone can view grade programs" ON public.grade_programs;

CREATE POLICY "Authenticated users can view grade programs"
  ON public.grade_programs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert grade programs"
  ON public.grade_programs FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update grade programs"
  ON public.grade_programs FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete grade programs"
  ON public.grade_programs FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 4. Fix theoretical_questions: make read authenticated-only, add admin write policies
DROP POLICY IF EXISTS "Anyone can view theoretical questions" ON public.theoretical_questions;

CREATE POLICY "Authenticated users can view theoretical questions"
  ON public.theoretical_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert theoretical questions"
  ON public.theoretical_questions FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update theoretical questions"
  ON public.theoretical_questions FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete theoretical questions"
  ON public.theoretical_questions FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
