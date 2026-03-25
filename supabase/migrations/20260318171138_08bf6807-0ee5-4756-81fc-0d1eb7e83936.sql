
-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('SUPERADMIN', 'FRANQUEADO', 'LOJISTA', 'USER');

-- Create enum for plan status
CREATE TYPE public.plan_status AS ENUM ('ACTIVE', 'INACTIVE');

-- Create enum for plan tier
CREATE TYPE public.plan_tier AS ENUM ('FREE', 'BASIC', 'PRO', 'MAX');

-- Create enum for news source type
CREATE TYPE public.news_source_type AS ENUM ('RSS', 'SCRAPE');

-- Tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  stripe_customer_id TEXT,
  plan_status plan_status NOT NULL DEFAULT 'INACTIVE',
  plan_tier plan_tier NOT NULL DEFAULT 'FREE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'USER',
  UNIQUE(user_id, role)
);

-- User-Tenant relationship
CREATE TABLE public.user_tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- Categories
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Businesses
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT false,
  profile_views INTEGER NOT NULL DEFAULT 0,
  whatsapp_clicks INTEGER NOT NULL DEFAULT 0,
  average_ticket FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Products
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price FLOAT,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Posts (Blog/News)
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- News Sources
CREATE TABLE public.news_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type news_source_type NOT NULL DEFAULT 'RSS',
  auto_publish BOOLEAN NOT NULL DEFAULT false,
  tone_of_voice TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security definer function for tenant membership
CREATE OR REPLACE FUNCTION public.is_tenant_member(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_tenants
    WHERE user_id = _user_id AND tenant_id = _tenant_id
  )
$$;

-- Tenants: public read
CREATE POLICY "Anyone can view active tenants" ON public.tenants
  FOR SELECT USING (active = true);

-- Profiles: own read/write, public read
CREATE POLICY "Public profiles are viewable" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- User tenants
CREATE POLICY "Users can view own tenant memberships" ON public.user_tenants
  FOR SELECT USING (auth.uid() = user_id);

-- Categories: public read, tenant member write
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "Tenant members can manage categories" ON public.categories
  FOR ALL USING (public.is_tenant_member(auth.uid(), tenant_id));

-- Businesses: public read active, owner/tenant write
CREATE POLICY "Anyone can view active businesses" ON public.businesses
  FOR SELECT USING (active = true);
CREATE POLICY "Owners can manage own business" ON public.businesses
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Tenant admins can manage businesses" ON public.businesses
  FOR ALL USING (public.is_tenant_member(auth.uid(), tenant_id));

-- Products
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (active = true);
CREATE POLICY "Tenant members can manage products" ON public.products
  FOR ALL USING (public.is_tenant_member(auth.uid(), tenant_id));

-- Posts
CREATE POLICY "Anyone can view published posts" ON public.posts
  FOR SELECT USING (published = true);
CREATE POLICY "Tenant members can manage posts" ON public.posts
  FOR ALL USING (public.is_tenant_member(auth.uid(), tenant_id));

-- Reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- News sources
CREATE POLICY "Tenant members can view news sources" ON public.news_sources
  FOR SELECT USING (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "Tenant members can manage news sources" ON public.news_sources
  FOR ALL USING (public.is_tenant_member(auth.uid(), tenant_id));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'USER');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_businesses_tenant ON public.businesses(tenant_id);
CREATE INDEX idx_businesses_category ON public.businesses(category_id);
CREATE INDEX idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX idx_products_business ON public.products(business_id);
CREATE INDEX idx_reviews_business ON public.reviews(business_id);
CREATE INDEX idx_posts_tenant ON public.posts(tenant_id);
CREATE INDEX idx_user_tenants_tenant ON public.user_tenants(tenant_id);
CREATE INDEX idx_categories_tenant ON public.categories(tenant_id);
