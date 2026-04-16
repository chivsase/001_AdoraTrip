import {
  PromoBanner,
  HeroSearch,
  DestinationCards,
  DealsSection,
  PopularCities,
  TrustBar,
  AppDownloadBanner,
  Footer
} from '@/components/landing'

/**
 * Homepage
 * ────────────────────────────────────────────────────────
 * The TopBar + Sidebar are provided by (public)/layout.tsx via
 * PublicShell, so this page only renders the scrollable main content.
 * ProductTabs has been removed — navigation lives in the Sidebar now.
 */
export default function HomePage() {
  return (
    <div className='flex flex-col'>
      {/* Dismissible promotional strip */}
      <PromoBanner />

      {/* 1 · Hero search form */}
      <HeroSearch />

      {/* 2 · Popular destinations grid */}
      <DestinationCards />

      {/* 3 · Live-countdown deals */}
      <DealsSection />

      {/* 4 · Trending cities horizontal scroll */}
      <PopularCities />

      {/* 5 · Trust signals */}
      <TrustBar />

      {/* 6 · App download CTA */}
      <AppDownloadBanner />

      <Footer />
    </div>
  )
}
