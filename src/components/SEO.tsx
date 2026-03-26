import { Helmet } from "react-helmet-async";
import { usePlatform } from "@/contexts/PlatformContext";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
}

export const SEO = ({ 
  title, 
  description, 
  image, 
  url, 
  type = "website" 
}: SEOProps) => {
  const { config } = usePlatform();
  
  const siteName = config.platform_name || "Meu Guia Comercial";
  const defaultDescription = config.platform_description || "O melhor guia comercial da sua cidade.";
  const defaultLogo = config.platform_logo_url;
  
  const seoTitle = title ? `${title} | ${siteName}` : siteName;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultLogo;
  const seoUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Metas Principais */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="author" content={siteName} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={seoUrl} />
      <meta property="twitter:title" content={seoTitle} />
      <meta property="twitter:description" content={seoDescription} />
      <meta property="twitter:image" content={seoImage} />
    </Helmet>
  );
};
