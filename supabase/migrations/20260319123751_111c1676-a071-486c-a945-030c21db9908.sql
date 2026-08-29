CREATE POLICY "Business owners can delete products"
ON public.products FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = products.business_id
    AND businesses.owner_id = auth.uid()
  )
);