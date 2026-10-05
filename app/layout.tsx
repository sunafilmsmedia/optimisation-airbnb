import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Tracking is opt-in per client: set these in Vercel env vars.
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Conciergîte | Découvrez le potentiel de votre Airbnb",
  description:
    "Estimez en 2 minutes combien votre Airbnb pourrait vous rapporter par mois et par saison avec une gestion optimisée, grâce à l'intelligence artificielle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-[#0B1F4D] font-sans">
        {FB_PIXEL_ID && (
          <>
            <Script id="fb-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${FB_PIXEL_ID}');fbq('track','PageView');`}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                alt=""
                src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}

        {CLARITY_ID && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
          </Script>
        )}

        {children}
      </body>
    </html>
  );
}
