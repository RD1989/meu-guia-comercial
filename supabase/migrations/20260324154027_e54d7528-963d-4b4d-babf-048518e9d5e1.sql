
-- Allow tenant members to delete categories
CREATE POLICY "Tenant members can delete categories"
ON public.categories FOR DELETE
TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

-- Allow tenant members to delete news sources
CREATE POLICY "Tenant members can delete news sources"
ON public.news_sources FOR DELETE
TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

-- Allow tenant members to delete posts
CREATE POLICY "Tenant members can delete posts"
ON public.posts FOR DELETE
TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));
