
-- Create storage bucket for business images
INSERT INTO storage.buckets (id, name, public) VALUES ('business-images', 'business-images', true);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Allow authenticated users to upload to business-images
CREATE POLICY "Authenticated users can upload business images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'business-images');

-- Allow anyone to view business images (public bucket)
CREATE POLICY "Anyone can view business images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'business-images');

-- Allow authenticated users to update their business images
CREATE POLICY "Authenticated users can update business images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'business-images');

-- Allow authenticated users to delete their business images
CREATE POLICY "Authenticated users can delete business images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'business-images');

-- Allow authenticated users to upload to product-images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow anyone to view product images (public bucket)
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-images');

-- Allow authenticated users to update their product images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users to delete their product images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images');
