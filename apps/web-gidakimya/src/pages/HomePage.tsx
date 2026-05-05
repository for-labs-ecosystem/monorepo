import HeroBento from '@/components/sections/HeroBento'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import ApplicationAreas from '@/components/sections/ApplicationAreas'
import LatestArticles from '@/components/sections/LatestArticles'
import CtaSection from '@/components/sections/CtaSection'

export default function HomePage() {
    return (
        <>
            <title>GıdaKimya | Gıda Analiz & Kalite Kontrol Cihazları</title>
            <meta name="description" content="Hammaddeden son ürüne gıda sektörüne yönelik kalite kontrol ve analiz cihazları. For-Labs Ekosistemi." />

            <HeroBento />
            <FeaturedProducts />
            <ApplicationAreas />
            <LatestArticles />
            <CtaSection />
        </>
    )
}
