CREATE POLICY "Authenticated users can delete candidates"
ON public.candidates
FOR DELETE
TO authenticated
USING (true);