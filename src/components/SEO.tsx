import { Helmet } from "react-helmet-async";
import { usePlatform } from "@/contexts/PlatformContext";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile" | "business.business";
  canonical?: string;
  keywords?: string[];
  schema?: Record<string, any> | Array<Record<string, any>>;
}

export const SEO = ({ 
  title, 
  description, 
  image, 
  url, 
  type = "website",
  canonical,
  keywords,
  schema
}: SEOProps) => {
  const { config } = usePlatform();
  
  const siteName = config.platform_name || "Meu Guia Comercial";
  const defaultDescription = config.platform_description || "O melhor guia comercial da sua cidade.";
  const defaultLogo = config.platform_logo_url;
  
  const seoTitle = title ? `${title} | ${siteName}` : siteName;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultLogo;
  const seoUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const canonicalUrl = canonical || seoUrl;

  return (
    <Helmet>
      {/* Metas Principais */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="author" content={siteName} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      {seoImage && <meta property="og:image" content={seoImage} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={seoUrl} />
      <meta property="twitter:title" content={seoTitle} />
      <meta property="twitter:description" content={seoDescription} />
      {seoImage && <meta property="twitter:image" content={seoImage} />}

      {/* Structured Data (Schema.org / JSON-LD) para Google */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

