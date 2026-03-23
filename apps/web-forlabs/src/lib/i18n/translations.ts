import type { Language } from './LanguageContext'

const translations = {
  // ─── Common ───
  'common.home': { tr: 'Anasayfa', en: 'Home' },
  'common.products': { tr: 'Ürünler', en: 'Products' },
  'common.services': { tr: 'Hizmetler', en: 'Services' },
  'common.solutions': { tr: 'Çözümler', en: 'Solutions' },
  'common.academy': { tr: 'Akademi', en: 'Academy' },
  'common.corporate': { tr: 'Kurumsal', en: 'About Us' },
  'common.contact': { tr: 'İletişim', en: 'Contact' },
  'common.getQuote': { tr: 'Teklif Al', en: 'Get Quote' },
  'common.explore': { tr: 'İncele', en: 'Explore' },
  'common.viewAll': { tr: 'Tümünü Gör', en: 'View All' },
  'common.learnMore': { tr: 'Daha Fazla', en: 'Learn More' },
  'common.startNow': { tr: 'Şimdi Başla', en: 'Start Now' },
  'common.tryNow': { tr: 'Şimdi Dene', en: 'Try Now' },
  'common.send': { tr: 'Gönder', en: 'Send' },
  'common.sending': { tr: 'Gönderiliyor…', en: 'Sending…' },
  'common.subscribe': { tr: 'Abone Ol', en: 'Subscribe' },
  'common.reset': { tr: 'Sıfırla', en: 'Reset' },
  'common.back': { tr: 'Geri', en: 'Back' },
  'common.next': { tr: 'İleri', en: 'Next' },
  'common.score': { tr: 'SKOR', en: 'SCORE' },
  'common.clientPortal': { tr: 'Client Portal', en: 'Client Portal' },
  'common.detailedExplore': { tr: 'Detaylı incele', en: 'Explore in detail' },

  // ─── NetworkBar ───
  'networkBar.ecosystem': { tr: 'Ecosystem', en: 'Ecosystem' },
  'networkBar.megaMenuTitle1': { tr: 'Ecosystem', en: 'Ecosystem' },
  'networkBar.megaMenuTitle2': { tr: 'For-Labs', en: 'For-Labs' },
  'networkBar.megaMenuDesc': {
    tr: 'Global ölçekteki tüm laboratuvar, analiz, tedarik ve eğitim platformlarımıza tek bir merkezden erişin.',
    en: 'Access all our laboratory, analysis, procurement, and education platforms globally from a single center.',
  },
  'networkBar.viewAll': { tr: 'Tüm Ağı Görüntüle', en: 'View All Network' },

  // ─── Network Brand Descriptions ───
  'network.atagotr': { tr: 'Optik Ölçüm', en: 'Optical Measurement' },
  'network.gidatest': { tr: 'Analiz Kitleri', en: 'Analysis Kits' },
  'network.labkurulum': { tr: 'Proje & Tasarım', en: 'Project & Design' },
  'network.gidakimya': { tr: 'Sarf Malzeme', en: 'Consumables' },
  'network.alerjen': { tr: 'Hızlı Testler', en: 'Rapid Tests' },
  'network.hijyenkontrol': { tr: 'ATP Testleri', en: 'ATP Tests' },

  // ─── MainHeader Nav ───
  'nav.solutions': { tr: 'Çözümler', en: 'Solutions' },
  'nav.products': { tr: 'Ürünler', en: 'Products' },
  'nav.services': { tr: 'Hizmetler', en: 'Services' },
  'nav.academy': { tr: 'Akademi', en: 'Academy' },
  'nav.corporate': { tr: 'Kurumsal', en: 'About' },
  'nav.contact': { tr: 'İletişim', en: 'Contact' },

  // ─── MegaFooter ───
  'footer.brand.desc': {
    tr: 'Akademik metotlar ve yüksek teknoloji laboratuvar cihazlarını tek bir ekosistemde buluşturan platform.',
    en: 'A platform uniting academic methods and high-technology laboratory instruments in a single ecosystem.',
  },
  'footer.col.solutions': { tr: 'Çözümler', en: 'Solutions' },
  'footer.col.products': { tr: 'Ürünler', en: 'Products' },
  'footer.col.info': { tr: 'Bilgi', en: 'Info' },
  'footer.col.support': { tr: 'Destek', en: 'Support' },
  'footer.link.foodAnalysis': { tr: 'Gıda Analizi', en: 'Food Analysis' },
  'footer.link.waterEnv': { tr: 'Su & Çevre', en: 'Water & Environment' },
  'footer.link.pharma': { tr: 'İlaç & Kozmetik', en: 'Pharma & Cosmetics' },
  'footer.link.chemistry': { tr: 'Kimya & Petrokimya', en: 'Chemistry & Petrochemistry' },
  'footer.link.analyzers': { tr: 'Analiz Cihazları', en: 'Analytical Instruments' },
  'footer.link.equipment': { tr: 'Lab Ekipmanları', en: 'Lab Equipment' },
  'footer.link.consumables': { tr: 'Sarf Malzemeleri', en: 'Consumables' },
  'footer.link.allProducts': { tr: 'Tüm Ürünler', en: 'All Products' },
  'footer.link.academy': { tr: 'Akademi', en: 'Academy' },
  'footer.link.about': { tr: 'Hakkımızda', en: 'About Us' },
  'footer.link.references': { tr: 'Referanslar', en: 'References' },
  'footer.link.contact': { tr: 'İletişim', en: 'Contact' },
  'footer.link.techSupport': { tr: 'Teknik Destek', en: 'Technical Support' },
  'footer.link.projectQuote': { tr: 'Proje Teklifi', en: 'Project Quote' },
  'footer.link.shipping': { tr: 'Kargo & Teslimat', en: 'Shipping & Delivery' },
  'footer.link.faq': { tr: 'SSS', en: 'FAQ' },
  'footer.certifications': { tr: 'Sertifikalar', en: 'Certifications' },
  'footer.copyright': {
    tr: 'For Labs Laboratuvar Teknolojileri A.Ş. Tüm hakları saklıdır.',
    en: 'For Labs Laboratory Technologies Inc. All rights reserved.',
  },
  'footer.privacy': { tr: 'Gizlilik Politikası', en: 'Privacy Policy' },
  'footer.terms': { tr: 'Kullanım Koşulları', en: 'Terms of Use' },
  'footer.kvkk': { tr: 'KVKK', en: 'GDPR' },

  // ─── HomePage: HeroSection ───
  'home.hero.badge': { tr: 'LABROTORY INTELLIGENCE PLATFORM', en: 'LABORATORY INTELLIGENCE PLATFORM' },
  'home.hero.titleLine1': { tr: 'Laboratuvarlar için', en: 'Wizard' },
  'home.hero.titleLine2': { tr: 'kurulum sihirbazı', en: 'for laboratories' },
  'home.hero.desc': {
    tr: 'Wizard For-Labs ile laboratuvar kurulum süreçlerini',
    en: 'With Wizard For-Labs, reduce laboratory setup processes from',
  },
  'home.hero.descHighlight': { tr: 'haftalardan saniyelere', en: 'weeks to seconds' },
  'home.hero.descSuffix': { tr: 'indirin.', en: '.' },
  'home.hero.ctaPrimary': { tr: 'Sihirbazı Başlat', en: 'Launch Wizard' },
  'home.hero.ctaSecondary': { tr: 'Uzmanla Görüş', en: 'Talk to Expert' },
  'home.hero.step1Label': { tr: 'ADIM 1', en: 'STEP 1' },
  'home.hero.step1': { tr: 'Sektör', en: 'Sector' },
  'home.hero.step2Label': { tr: 'ADIM 2', en: 'STEP 2' },
  'home.hero.step2': { tr: 'Analiz', en: 'Analysis' },
  'home.hero.step3Label': { tr: 'ADIM 3', en: 'STEP 3' },
  'home.hero.step3': { tr: 'Uyumluluk', en: 'Compliance' },
  'home.hero.step4Label': { tr: 'ADIM 4', en: 'STEP 4' },
  'home.hero.step4': { tr: 'Otomasyon', en: 'Automation' },

  // ─── HomePage: BentoSection ───
  'home.bento.titlePre': { tr: 'Karmaşadan', en: 'From chaos' },
  'home.bento.titleHighlight': { tr: 'netliğe.', en: 'to clarity.' },
  'home.bento.desc': {
    tr: 'Laboratuvar tedarik ve yönetim süreçlerindeki kaosu, yerini akıllı ve entegre bir düzene bırakıyor.',
    en: 'The chaos in laboratory procurement and management processes gives way to a smart, integrated system.',
  },
  'home.bento.productsTitle': { tr: 'Ürünler', en: 'Products' },
  'home.bento.productsDesc': {
    tr: 'Laboratuvarınızın ihtiyacı olan tüm cihaz, sarf malzeme ve kimyasallar. Teknik şartnameleri, stok durumlarını ve fiyatları tek ekranda karşılaştırın.',
    en: 'All instruments, consumables, and chemicals your laboratory needs. Compare specifications, stock status, and prices on a single screen.',
  },
  'home.bento.productsCta': { tr: 'Ürün Kataloğunu İncele', en: 'Browse Product Catalog' },
  'home.bento.wizardTitle': { tr: 'Wizard For-Labs', en: 'Wizard For-Labs' },
  'home.bento.wizardDesc': {
    tr: 'Laboratuvarınızın DNA\'sını analiz eder. Sektör, bütçe ve hedeflerinize en uygun konfigürasyonu saniyeler içinde oluşturur.',
    en: 'Analyzes the DNA of your laboratory. Creates the most suitable configuration for your sector, budget, and goals in seconds.',
  },
  'home.bento.wizardCta': { tr: 'Şimdi Dene', en: 'Try Now' },
  'home.bento.solutionsTitle': { tr: 'Çözümler', en: 'Solutions' },
  'home.bento.solutionsDesc': {
    tr: 'Anahtar teslim laboratuvar kurulumu ve mühendislik hizmetleri.',
    en: 'Turnkey laboratory setup and engineering services.',
  },
  'home.bento.solutionsStep1': { tr: 'Keşif', en: 'Discovery' },
  'home.bento.solutionsStep2': { tr: 'Proje', en: 'Project' },
  'home.bento.solutionsStep3': { tr: 'Kurulum', en: 'Setup' },
  'home.bento.academyTitle': { tr: 'Akademi', en: 'Academy' },
  'home.bento.academyDesc': {
    tr: 'Bilimsel makaleler, uygulama notları ve eğitim içerikleri.',
    en: 'Scientific articles, application notes, and educational content.',
  },

  // ─── HomePage: EcosystemSection ───
  'home.ecosystem.badge': { tr: 'Ekosistem', en: 'Ecosystem' },
  'home.ecosystem.titlePre': { tr: 'Uçtan Uca', en: 'End-to-End' },
  'home.ecosystem.titleHighlight': { tr: 'Laboratuvar Ekosistemi.', en: 'Laboratory Ecosystem.' },
  'home.ecosystem.desc': {
    tr: 'Sarf malzemeden analiz cihazlarına, hijyen kontrolünden projelendirmeye kadar tüm ihtiyaçlarınızla ilgili bilgi ve ürün bulabileceğiniz tek ekosistem.',
    en: 'The only ecosystem where you can find information and products for all your needs — from consumables to analytical instruments, from hygiene control to engineering.',
  },
  'home.ecosystem.atagotr': { tr: 'Optik Ölçüm Sistemleri', en: 'Optical Measurement Systems' },
  'home.ecosystem.gidatest': { tr: 'Hızlı Analiz Kitleri', en: 'Rapid Analysis Kits' },
  'home.ecosystem.gidakimya': { tr: 'Sarf Malzeme Deposu', en: 'Consumables Store' },
  'home.ecosystem.alerjen': { tr: 'Gıda Alerjen Testleri', en: 'Food Allergen Tests' },
  'home.ecosystem.hijyenkontrol': { tr: 'ATP Hijyen Doğrulama', en: 'ATP Hygiene Verification' },
  'home.ecosystem.labkurulum': { tr: 'Proje & Mühendislik', en: 'Project & Engineering' },

  // ─── HomePage: FooterCTA ───
  'home.cta.wizardTitle1': { tr: 'Laboratuvarınıza özel', en: 'Discover the solution' },
  'home.cta.wizardTitle2': { tr: 'çözümü keşfedin.', en: 'tailored for your lab.' },
  'home.cta.wizardDesc': {
    tr: '5 dakikada sektörünüzü, ihtiyaçlarınızı ve bütçenizi analiz eden Wizard For-Labs size en uygun laboratuvar kurulumunu önerir.',
    en: 'Wizard For-Labs analyzes your sector, needs, and budget in 5 minutes and recommends the best laboratory setup for you.',
  },
  'home.cta.wizardBtn': { tr: 'Analizi Başlat', en: 'Start Analysis' },
  'home.cta.newsTitle1': { tr: 'Bilim dünyasından', en: 'Stay updated' },
  'home.cta.newsTitle2': { tr: 'haberdar olun.', en: 'from the world of science.' },
  'home.cta.newsDesc': {
    tr: 'Yeni analiz cihazları, sektör trendleri ve akademik içerikleri aylık bültenimizle takip edin.',
    en: 'Follow new analytical instruments, industry trends, and academic content with our monthly newsletter.',
  },
  'home.cta.emailPlaceholder': { tr: 'e-posta adresiniz', en: 'your email address' },
  'home.cta.spamNote': {
    tr: 'Spam göndermiyoruz. İstediğiniz zaman aboneliğinizi iptal edebilirsiniz.',
    en: 'We don\'t send spam. You can unsubscribe at any time.',
  },

  // ─── HeroSection (standalone component) ───
  'heroSection.badge': { tr: 'Laboratuvar Teknolojileri Ekosistemi', en: 'Laboratory Technologies Ecosystem' },
  'heroSection.titleLine1': { tr: 'Bilimsel Know-How', en: 'Scientific Know-How' },
  'heroSection.titleLine2': { tr: 've Yüksek Teknoloji,', en: 'and High Technology,' },
  'heroSection.titleLine3': { tr: 'Tek Bir Ekosistemde.', en: 'In a Single Ecosystem.' },
  'heroSection.desc': {
    tr: 'Akademik metotlarınızı uygulayabileceğiniz doğru cihazları keşfedin. Analiz yöntemleri, ürün eşleştirme ve teknik danışmanlıkla laboratuvarınızı geleceğe taşıyın.',
    en: 'Discover the right instruments for your academic methods. Advance your laboratory with analysis methods, product matching, and technical consultancy.',
  },
  'heroSection.ctaProducts': { tr: 'Ürünleri Keşfet', en: 'Explore Products' },
  'heroSection.ctaAcademy': { tr: 'Akademi\'ye Göz At', en: 'Browse Academy' },
  'heroSection.imgCaption': { tr: 'Gıda Analiz Laboratuvarı — İstanbul', en: 'Food Analysis Laboratory — Istanbul' },
  'heroSection.metric.years': { tr: 'YIL DENEYİM', en: 'YEARS EXPERIENCE' },
  'heroSection.metric.quality': { tr: 'KALİTE YÖNETİMİ', en: 'QUALITY MANAGEMENT' },
  'heroSection.metric.clients': { tr: 'KURUMSAL MÜŞTERİ', en: 'CORPORATE CLIENTS' },
  'heroSection.metric.companies': { tr: 'GRUP ŞİRKETİ', en: 'GROUP COMPANIES' },

  // ─── FeaturesSection (SectorsGrid) ───
  'sectors.badge': { tr: 'Sektörel Uzmanlık', en: 'Sectoral Expertise' },
  'sectors.title': { tr: 'Hangi sektöre hizmet veriyoruz?', en: 'Which sectors do we serve?' },
  'sectors.allSolutions': { tr: 'Tüm çözümler', en: 'All solutions' },
  'sectors.food.tag': { tr: 'GIDA ANALİZİ', en: 'FOOD ANALYSIS' },
  'sectors.food.title': { tr: 'Gıda & İçecek Laboratuvarları', en: 'Food & Beverage Laboratories' },
  'sectors.food.desc': {
    tr: 'Mikrobiyolojik testlerden kimyasal analizlere, gıda güvenliği ve kalite kontrol süreçleriniz için eksiksiz cihaz parkuru ve uygulama desteği.',
    en: 'From microbiological tests to chemical analyses, complete instrument solutions and application support for your food safety and quality control processes.',
  },
  'sectors.pharma.tag': { tr: 'İLAÇ & KOZMETİK', en: 'PHARMA & COSMETICS' },
  'sectors.pharma.title': { tr: 'Farmasötik Ar-Ge', en: 'Pharmaceutical R&D' },
  'sectors.pharma.desc': {
    tr: 'Saflık analizi, stabilite testleri ve formülasyon kontrol süreçleri için yüksek hassasiyetli enstrüman çözümleri.',
    en: 'High-precision instrument solutions for purity analysis, stability testing, and formulation control processes.',
  },
  'sectors.water.tag': { tr: 'SU & ÇEVRE', en: 'WATER & ENVIRONMENT' },
  'sectors.water.title': { tr: 'Çevre Analiz Laboratuvarları', en: 'Environmental Analysis Laboratories' },
  'sectors.water.desc': {
    tr: 'Su, atık su ve toprak analizleri için akredite laboratuvar kurulumu ve saha tipi portatif ölçüm cihazları.',
    en: 'Accredited laboratory setup and field-type portable measurement instruments for water, wastewater, and soil analyses.',
  },
  'sectors.chemistry.tag': { tr: 'KİMYA & PETROKİMYA', en: 'CHEMISTRY & PETROCHEMISTRY' },
  'sectors.chemistry.title': { tr: 'Endüstriyel Kimya & Petrokimya', en: 'Industrial Chemistry & Petrochemistry' },
  'sectors.chemistry.desc': {
    tr: 'Proses kontrol, hammadde analizi ve kalite güvence süreçleriniz için endüstriyel seviye laboratuvar teknolojileri.',
    en: 'Industrial-grade laboratory technologies for your process control, raw material analysis, and quality assurance processes.',
  },

  // ─── StatsSection (Capabilities) ───
  'capabilities.badge': { tr: 'Ekosistem Avantajı', en: 'Ecosystem Advantage' },
  'capabilities.title': { tr: 'Know-How ve teknoloji, tek çatı altında.', en: 'Know-How and technology, under one roof.' },
  'capabilities.cap1.title': { tr: 'Analiz Cihazları & Enstrümanlar', en: 'Analytical Instruments & Equipment' },
  'capabilities.cap1.desc': {
    tr: 'Spektrofotometre, kromatografi, refraktometre ve daha fazlası. Akademik metotlarınıza uygun cihaz eşleştirme hizmeti sunuyoruz.',
    en: 'Spectrophotometers, chromatography, refractometers, and more. We offer instrument matching services suited to your academic methods.',
  },
  'capabilities.cap2.title': { tr: 'Anahtar Teslim Lab Kurulumu', en: 'Turnkey Lab Setup' },
  'capabilities.cap2.desc': {
    tr: 'Fizibilite çalışmasından ekipman montajına, akreditasyon danışmanlığına kadar komple proje yönetimi.',
    en: 'Complete project management from feasibility studies to equipment installation and accreditation consultancy.',
  },
  'capabilities.cap3.title': { tr: 'Akademi & Bilimsel Know-How', en: 'Academy & Scientific Know-How' },
  'capabilities.cap3.desc': {
    tr: 'Uygulama notları, analiz metotları ve eğitim içerikleri — doğru cihazı, doğru metotla buluşturun.',
    en: 'Application notes, analysis methods, and training content — match the right instrument with the right method.',
  },
  'capabilities.labImgAlt': { tr: 'Laboratuvar cihazları ve araştırma ortamı', en: 'Laboratory instruments and research environment' },

  // ─── CTASection ───
  'cta.badge': { tr: 'Bir Sonraki Adım', en: 'The Next Step' },
  'cta.titleLine1': { tr: 'Laboratuvarınızı', en: 'Let\'s take your' },
  'cta.titleLine2': { tr: 'geleceğe taşıyalım.', en: 'laboratory to the future.' },
  'cta.desc': {
    tr: 'Doğru analiz metodu, doğru cihaz ve uzman danışmanlık — ekosistemimizin tüm avantajlarından yararlanın. İlk görüşme ücretsizdir.',
    en: 'The right analysis method, the right instrument, and expert consultancy — benefit from all the advantages of our ecosystem. The first consultation is free.',
  },
  'cta.requestQuote': { tr: 'Proje Teklifi İste', en: 'Request Project Quote' },
  'cta.orCall': { tr: 'veya arayın:', en: 'or call:' },
  'cta.imgAlt': { tr: 'Modern laboratuvar ekipmanları', en: 'Modern laboratory equipment' },

  // ─── HeroWizard (inline component) ───
  'heroWizard.badge': { tr: 'Laboratory Intelligence Platform', en: 'Laboratory Intelligence Platform' },
  'heroWizard.select': { tr: 'seçiniz', en: 'select' },
  'heroWizard.designSystem': { tr: 'Sistemimi Tasarla', en: 'Design My System' },
  'heroWizard.loading': { tr: 'Laboratuvar kurgunuz hazırlanıyor...', en: 'Preparing your lab configuration...' },
  'heroWizard.loadingSub': { tr: 'Ürünler ve makaleler eşleştiriliyor', en: 'Matching products and articles' },

  // ─── HeroWizard Steps ───
  'heroWizard.step1.prefix': { tr: 'Biz', en: 'We are an organization' },
  'heroWizard.step1.suffix': { tr: 'alanında faaliyet gösteren bir kurumuz.', en: 'operating in the field of' },
  'heroWizard.step2.prefix': { tr: 'Ağırlıklı olarak', en: 'We primarily want to' },
  'heroWizard.step2.suffix': { tr: 'testleri yapmak istiyoruz.', en: 'perform tests.' },
  'heroWizard.step3.prefix': { tr: 'Laboratuvarımızda', en: 'In our laboratory, we seek compliance with' },
  'heroWizard.step3.suffix': { tr: 'standartlarına uygunluk arıyoruz.', en: 'standards.' },
  'heroWizard.step4.prefix': { tr: 'Sistem altyapısı olarak', en: 'As system infrastructure, we expect a' },
  'heroWizard.step4.suffix': { tr: 'bir çözüm bekliyoruz.', en: 'solution.' },

  // ─── WizardPage Steps ───
  'wizard.step1.title': { tr: 'Sektör', en: 'Sector' },
  'wizard.step1.prefix': { tr: 'Merhaba, biz', en: 'Hello, we are a team' },
  'wizard.step1.suffix': { tr: 'sektöründe faaliyet gösteren bir ekibiz.', en: 'operating in the sector.' },
  'wizard.step1.opt1.label': { tr: 'Gıda ve İçecek', en: 'Food & Beverage' },
  'wizard.step1.opt1.desc': { tr: 'Üretim, işleme ve paketleme tesisleri', en: 'Production, processing, and packaging facilities' },
  'wizard.step1.opt2.label': { tr: 'İlaç ve Ar-Ge', en: 'Pharma & R&D' },
  'wizard.step1.opt2.desc': { tr: 'Farmasötik araştırma ve geliştirme', en: 'Pharmaceutical research and development' },
  'wizard.step1.opt3.label': { tr: 'Çevre Analizi', en: 'Environmental Analysis' },
  'wizard.step1.opt3.desc': { tr: 'Su, atık ve toprak analiz laboratuvarları', en: 'Water, waste, and soil analysis laboratories' },
  'wizard.step1.opt4.label': { tr: 'Endüstriyel Kimya', en: 'Industrial Chemistry' },
  'wizard.step1.opt4.desc': { tr: 'Hammadde ve ürün kalite kontrolü', en: 'Raw material and product quality control' },

  'wizard.step2.title': { tr: 'Analiz Tipi', en: 'Analysis Type' },
  'wizard.step2.prefix': { tr: 'Laboratuvar çalışmalarımızın odağında', en: 'Our laboratory work will focus on' },
  'wizard.step2.suffix': { tr: 'süreçleri yer alacak.', en: 'processes.' },
  'wizard.step2.opt1.label': { tr: 'Kalite Kontrol', en: 'Quality Control' },
  'wizard.step2.opt1.desc': { tr: 'Rutin ürün standartlarını doğrulama', en: 'Routine product standards verification' },
  'wizard.step2.opt2.label': { tr: 'Temel Araştırma', en: 'Fundamental Research' },
  'wizard.step2.opt2.desc': { tr: 'Yeni metot ve ürün geliştirme', en: 'New method and product development' },
  'wizard.step2.opt3.label': { tr: 'Mikrobiyoloji', en: 'Microbiology' },
  'wizard.step2.opt3.desc': { tr: 'Bakteri, maya ve küf sayımı', en: 'Bacteria, yeast, and mold counting' },
  'wizard.step2.opt4.label': { tr: 'Fiziksel Analiz', en: 'Physical Analysis' },
  'wizard.step2.opt4.desc': { tr: 'Viskozite, yoğunluk ve refraktometre', en: 'Viscosity, density, and refractometer' },

  'wizard.step3.title': { tr: 'Uyumluluk', en: 'Compliance' },
  'wizard.step3.prefix': { tr: 'Güvenilir sonuçlar için', en: 'For reliable results, we aim for full compliance with' },
  'wizard.step3.suffix': { tr: 'standartlarına tam uyum hedefliyoruz.', en: 'standards.' },
  'wizard.step3.opt1.label': { tr: 'ISO 17025', en: 'ISO 17025' },
  'wizard.step3.opt1.desc': { tr: 'Akredite laboratuvar yetkinliği', en: 'Accredited laboratory competence' },
  'wizard.step3.opt2.label': { tr: 'GMP / GLP', en: 'GMP / GLP' },
  'wizard.step3.opt2.desc': { tr: 'İyi Üretim ve Laboratuvar Uygulamaları', en: 'Good Manufacturing and Laboratory Practices' },
  'wizard.step3.opt3.label': { tr: 'FDA', en: 'FDA' },
  'wizard.step3.opt3.desc': { tr: 'Elektronik kayıt ve imza güvenliği', en: 'Electronic record and signature security' },
  'wizard.step3.opt4.label': { tr: 'Standart / Belirtilmemiş', en: 'Standard / Not Specified' },
  'wizard.step3.opt4.desc': { tr: 'Genel endüstriyel standartlar', en: 'General industrial standards' },

  'wizard.step4.title': { tr: 'Otomasyon', en: 'Automation' },
  'wizard.step4.prefix': { tr: 'İş akışımızda', en: 'In our workflow, we envision a' },
  'wizard.step4.suffix': { tr: 'bir sistem kurgusu hayal ediyoruz.', en: 'system setup.' },
  'wizard.step4.opt1.label': { tr: 'Manuel', en: 'Manual' },
  'wizard.step4.opt1.desc': { tr: 'Operatör kontrollü klasik sistemler', en: 'Operator-controlled classic systems' },
  'wizard.step4.opt2.label': { tr: 'Yarı-Otomatik', en: 'Semi-Automatic' },
  'wizard.step4.opt2.desc': { tr: 'Kısmi otomasyon ve veri aktarımı', en: 'Partial automation and data transfer' },
  'wizard.step4.opt3.label': { tr: 'Tam Otomatik', en: 'Fully Automatic' },
  'wizard.step4.opt3.desc': { tr: 'İnsan müdahalesiz robotik sistemler', en: 'Robotic systems without human intervention' },

  // ─── WizardPage UI ───
  'wizard.headerTitle': { tr: 'Laboratuvar Kurgu Sihirbazı', en: 'Laboratory Setup Wizard' },
  'wizard.goBack': { tr: 'Başa Dön', en: 'Start Over' },
  'wizard.introTitle': { tr: 'Laboratuvarınızı birlikte tasarlayalım.', en: 'Let\'s design your laboratory together.' },
  'wizard.introDesc': {
    tr: 'Aşağıdaki cümlelerdeki boşlukları doldurarak ihtiyacınıza özel cihaz ve çözüm önerileri alın.',
    en: 'Fill in the blanks in the sentences below to receive customized instrument and solution recommendations.',
  },
  'wizard.pleaseSelect': { tr: 'Lütfen bir seçim yapın', en: 'Please make a selection' },
  'wizard.submitBtn': { tr: 'Laboratuvar Kurgusunu Başlat', en: 'Launch Lab Configuration' },
  'wizard.submitting': { tr: 'Analiz Yapılıyor…', en: 'Analyzing…' },
  'wizard.submitDesc': {
    tr: 'Seçtiğiniz kriterlere göre en uygun cihaz ve dökümanlar derlenecektir.',
    en: 'The most suitable instruments and documents will be compiled based on your criteria.',
  },
  'wizard.apiError': {
    tr: 'API bağlantısı kurulamadı. Lütfen tekrar deneyin.',
    en: 'Could not connect to API. Please try again.',
  },
  'wizard.loadingTitle': { tr: 'Laboratuvarınız tasarlanıyor...', en: 'Designing your laboratory...' },
  'wizard.loadingDesc': {
    tr: 'Wizard For-Labs, sektörel gereksinimlerinizi ve regülasyonları analiz ederek en uygun konfigürasyonu oluşturuyor.',
    en: 'Wizard For-Labs is creating the optimal configuration by analyzing your sectoral requirements and regulations.',
  },
  'wizard.loadingDescSector': { tr: 'sektörel gereksinimlerinizi', en: 'your sectoral requirements' },
  'wizard.loadingDescRegulations': { tr: 'regülasyonları', en: 'regulations' },

  // ─── WizardResults ───
  'results.badge': { tr: 'Analiz Tamamlandı', en: 'Analysis Complete' },
  'results.title': { tr: 'Laboratuvar kurgunuz hazır.', en: 'Your laboratory setup is ready.' },
  'results.noResultsTitle': { tr: 'Uygun sonuç bulunamadı.', en: 'No suitable results found.' },
  'results.descHardware': { tr: 'donanım', en: 'hardware' },
  'results.descAnd': { tr: 've', en: 'and' },
  'results.descKnowledge': { tr: 'bilgi kaynağı', en: 'knowledge resource' },
  'results.descCreated': { tr: 'ile optimum çözümü oluşturdu.', en: 'to create the optimum solution.' },
  'results.noResultsDesc': {
    tr: 'Farklı kriterlerle tekrar deneyin veya doğrudan uzmanlarımızla iletişime geçin.',
    en: 'Try again with different criteria or contact our experts directly.',
  },
  'results.changeCriteria': { tr: 'Kriterleri Değiştir', en: 'Change Criteria' },
  'results.restart': { tr: 'Yeniden Başla', en: 'Start Over' },
  'results.hardwareTitle': { tr: 'Donanım Çözümleri', en: 'Hardware Solutions' },
  'results.deviceCount': { tr: 'CİHAZ', en: 'DEVICES' },
  'results.productPage': { tr: 'Ürün Sayfası', en: 'Product Page' },
  'results.investmentSummary': { tr: 'Yatırım Özeti', en: 'Investment Summary' },
  'results.estimatedBudget': { tr: 'Tahmini Bütçe', en: 'Estimated Budget' },
  'results.taxNote': { tr: 'Vergiler Dahil Değildir', en: 'Taxes Not Included' },
  'results.requestQuote': { tr: 'Proje Teklifi İste', en: 'Request Project Quote' },
  'results.knowledgeBase': { tr: 'Bilgi Bankası', en: 'Knowledge Base' },
  'results.articleCount': { tr: 'makale', en: 'articles' },
  'results.view': { tr: 'İncele', en: 'View' },
  'results.noArticles': { tr: 'Eşleşen teknik doküman bulunamadı.', en: 'No matching technical documents found.' },

  // ─── WizardResults: Contact Form ───
  'results.form.badge': { tr: 'Uzman Desteği', en: 'Expert Support' },
  'results.form.title1': { tr: 'Projenizi birlikte', en: 'Let\'s bring your project' },
  'results.form.title2': { tr: 'hayata geçirelim.', en: 'to life together.' },
  'results.form.desc': {
    tr: 'Wizard tarafından oluşturulan kurgu hakkında teknik ekibimizden detaylı bilgi, demo talebi ve fiyat teklifi alın.',
    en: 'Get detailed information, demo requests, and price quotes from our technical team about the setup created by Wizard.',
  },
  'results.form.feature1': { tr: 'Ücretsiz Keşif Görüşmesi', en: 'Free Discovery Call' },
  'results.form.feature1Desc': { tr: 'İhtiyaçlarınızı teknik ekibimizle netleştirin.', en: 'Clarify your needs with our technical team.' },
  'results.form.feature2': { tr: 'Özel Fiyat Teklifi', en: 'Custom Price Quote' },
  'results.form.feature2Desc': { tr: 'Wizard önerileri baz alınarak hazırlanır.', en: 'Prepared based on Wizard recommendations.' },
  'results.form.feature3': { tr: 'Kurulum & Eğitim Planı', en: 'Setup & Training Plan' },
  'results.form.feature3Desc': { tr: 'Sahaya girişten itibaren tam destek.', en: 'Full support from field entry.' },
  'results.form.name': { tr: 'Ad Soyad', en: 'Full Name' },
  'results.form.namePlaceholder': { tr: 'Adınız Soyadınız', en: 'Your Full Name' },
  'results.form.company': { tr: 'Firma', en: 'Company' },
  'results.form.companyPlaceholder': { tr: 'Firma Adı', en: 'Company Name' },
  'results.form.email': { tr: 'E-Posta', en: 'Email' },
  'results.form.phone': { tr: 'Telefon', en: 'Phone' },
  'results.form.message': { tr: 'Mesaj', en: 'Message' },
  'results.form.messagePlaceholder': {
    tr: 'Laboratuvar kurgunuz, beklentileriniz veya sorularınız hakkında kısaca bilgi verin…',
    en: 'Briefly describe your laboratory setup, expectations, or questions…',
  },
  'results.form.successTitle': { tr: 'Mesajınız alındı.', en: 'Your message has been received.' },
  'results.form.successDesc': {
    tr: 'Ekibimiz en kısa sürede sizinle iletişime geçecektir.',
    en: 'Our team will contact you as soon as possible.',
  },
  'results.form.subject': { tr: 'Wizard — Laboratuvar Kurgu Talebi', en: 'Wizard — Lab Configuration Request' },

  // ─── Products Page ───
  'products.pageTitle': { tr: 'Ürünler', en: 'Products' },
  'products.pageDesc': {
    tr: 'Laboratuvarınız için gereken tüm analiz cihazları, sarf malzemeler ve ekipmanlar. Teknik şartnameleri karşılaştırın, sepetinize ekleyin.',
    en: 'All analytical instruments, consumables, and equipment for your laboratory. Compare specifications and add to your cart.',
  },
  'products.productCount': { tr: 'ürün', en: 'products' },
  'products.searchPlaceholder': { tr: 'Ürün adı, marka veya SKU ara…', en: 'Search product name, brand or SKU…' },
  'products.filters': { tr: 'Filtreler', en: 'Filters' },
  'products.filterCategory': { tr: 'Kategori', en: 'Category' },
  'products.filterBrand': { tr: 'Marka', en: 'Brand' },
  'products.allCategories': { tr: 'Tüm Kategoriler', en: 'All Categories' },
  'products.allBrands': { tr: 'Tüm Markalar', en: 'All Brands' },
  'products.clearFilters': { tr: 'Filtreleri Temizle', en: 'Clear Filters' },
  'products.sortDefault': { tr: 'Varsayılan Sıralama', en: 'Default Sort' },
  'products.sortPriceAsc': { tr: 'Fiyat: Düşükten Yükseğe', en: 'Price: Low to High' },
  'products.sortPriceDesc': { tr: 'Fiyat: Yüksekten Düşüğe', en: 'Price: High to Low' },
  'products.sortNameAsc': { tr: 'İsim: A-Z', en: 'Name: A-Z' },
  'products.sortNewest': { tr: 'En Yeni', en: 'Newest' },
  'products.addToCart': { tr: 'Sepete Ekle', en: 'Add to Cart' },
  'products.inCart': { tr: 'Sepette', en: 'In Cart' },
  'products.contactForPrice': { tr: 'Fiyat İçin Arayın', en: 'Call for Price' },
  'products.noResults': { tr: 'Ürün bulunamadı.', en: 'No products found.' },
  'products.noResultsDesc': {
    tr: 'Arama kriterlerinize uygun ürün bulunamadı. Farklı filtreler deneyebilirsiniz.',
    en: 'No products match your search criteria. Try different filters.',
  },

  // ─── Product Detail Page ───
  'products.backToProducts': { tr: 'Ürünlere Dön', en: 'Back to Products' },
  'product.modelNumber': { tr: 'Model Numarası', en: 'Model Number' },
  'product.warranty': { tr: 'Garanti Süresi', en: 'Warranty Period' },
  'product.automationLevel': { tr: 'Otomasyon Seviyesi', en: 'Automation Level' },
  'product.tabDescription': { tr: 'Açıklama', en: 'Description' },
  'product.tabSpecs': { tr: 'Teknik Özellikler', en: 'Specifications' },
  'product.tabFeatures': { tr: 'Özellikler & Uygulama', en: 'Features & Application' },
  'product.features': { tr: 'Öne Çıkan Özellikler', en: 'Key Features' },
  'product.applicationAreas': { tr: 'Uygulama Alanları', en: 'Application Areas' },
  'product.compliance': { tr: 'Uyum & Sertifikalar', en: 'Compliance & Certifications' },
  'product.relatedProducts': { tr: 'Benzer Ürünler', en: 'Related Products' },

  // ─── Auth ───
  'auth.loginTitle': { tr: 'Hesabınıza giriş yapın', en: 'Sign in to your account' },
  'auth.registerTitle': { tr: 'Hesap oluşturun', en: 'Create your account' },
  'auth.email': { tr: 'E-posta Adresi', en: 'Email Address' },
  'auth.password': { tr: 'Şifre', en: 'Password' },
  'auth.fullName': { tr: 'Ad Soyad', en: 'Full Name' },
  'auth.phone': { tr: 'Telefon', en: 'Phone' },
  'auth.companyName': { tr: 'Şirket Adı (Opsiyonel)', en: 'Company Name (Optional)' },
  'auth.loginBtn': { tr: 'Giriş Yap', en: 'Sign In' },
  'auth.registerBtn': { tr: 'Kayıt Ol', en: 'Create Account' },
  'auth.loggingIn': { tr: 'Giriş yapılıyor…', en: 'Signing in…' },
  'auth.registering': { tr: 'Kayıt oluşturuluyor…', en: 'Creating account…' },
  'auth.forgotPassword': { tr: 'Şifremi Unuttum', en: 'Forgot Password' },
  'auth.noAccount': { tr: 'Hesabınız yok mu?', en: "Don't have an account?" },
  'auth.hasAccount': { tr: 'Zaten hesabınız var mı?', en: 'Already have an account?' },
  'auth.googleLogin': { tr: 'Google ile Giriş Yap', en: 'Sign in with Google' },
  'auth.orSeparator': { tr: 'veya', en: 'or' },
  'auth.loginLink': { tr: 'Giriş Yapın', en: 'Sign In' },
  'auth.registerLink': { tr: 'Kayıt Olun', en: 'Create Account' },
  'auth.loginSignup': { tr: 'Giriş Yap / Üye Ol', en: 'Sign In / Register' },
  'auth.myAccount': { tr: 'Hesabım', en: 'My Account' },

  // ─── Account Page ───
  'account.title': { tr: 'Hesabım', en: 'My Account' },
  'account.tabProfile': { tr: 'Profil & Adresler', en: 'Profile & Addresses' },
  'account.tabOrders': { tr: 'Siparişlerim', en: 'My Orders' },
  'account.tabFavorites': { tr: 'Favorilerim', en: 'My Favorites' },
  'account.tabInquiries': { tr: 'Mesajlar', en: 'Messages' },
  'account.profileTitle': { tr: 'Profil Bilgileri', en: 'Profile Information' },
  'account.addressesTitle': { tr: 'Kayıtlı Adresler', en: 'Saved Addresses' },
  'account.addAddress': { tr: 'Yeni Adres Ekle', en: 'Add New Address' },
  'account.editAddress': { tr: 'Adresi Düzenle', en: 'Edit Address' },
  'account.saveChanges': { tr: 'Değişiklikleri Kaydet', en: 'Save Changes' },
  'account.saving': { tr: 'Kaydediliyor…', en: 'Saving…' },
  'account.saved': { tr: 'Kaydedildi', en: 'Saved' },
  'account.logout': { tr: 'Çıkış Yap', en: 'Sign Out' },
  'account.noOrders': { tr: 'Henüz siparişiniz bulunmuyor.', en: 'You have no orders yet.' },
  'account.noFavorites': { tr: 'Henüz favori ürün veya makaleniz yok.', en: 'No favorite products or articles yet.' },
  'account.favProducts': { tr: 'Favori Ürünler', en: 'Favorite Products' },
  'account.favArticles': { tr: 'Kaydedilen Makaleler', en: 'Saved Articles' },
  'account.addressType': { tr: 'Adres Tipi', en: 'Address Type' },
  'account.individual': { tr: 'Bireysel', en: 'Individual' },
  'account.corporate': { tr: 'Kurumsal', en: 'Corporate' },
  'account.addressTitle': { tr: 'Adres Başlığı', en: 'Address Title' },
  'account.city': { tr: 'İl', en: 'City' },
  'account.district': { tr: 'İlçe', en: 'District' },
  'account.fullAddress': { tr: 'Açık Adres', en: 'Full Address' },
  'account.taxOffice': { tr: 'Vergi Dairesi', en: 'Tax Office' },
  'account.taxNumber': { tr: 'Vergi Numarası', en: 'Tax Number' },
  'account.cancel': { tr: 'İptal', en: 'Cancel' },
  'account.save': { tr: 'Kaydet', en: 'Save' },

  // ─── Academy Page ───
  'academy.pageTitle': { tr: 'Akademi', en: 'Academy' },
  'academy.metaDesc': {
    tr: 'For-Labs Akademi: Bilimsel makaleler, uygulama notları, analiz yöntemleri ve laboratuvar eğitim içerikleri.',
    en: 'For-Labs Academy: Scientific articles, application notes, analysis methods, and laboratory training content.',
  },
  'academy.badge': { tr: 'Bilgi Bankası', en: 'Knowledge Base' },
  'academy.heroTitle': { tr: 'Akademi', en: 'Academy' },
  'academy.heroSubtitle': {
    tr: 'Akademik bilgiyle doğru cihazların eşleştiği tek ekosistem.',
    en: 'The only ecosystem where academic knowledge meets the right instruments.',
  },
  'academy.featured': { tr: 'ÖNE ÇIKAN', en: 'FEATURED' },
  'academy.latest': { tr: 'SON EKLENEN', en: 'LATEST' },
  'academy.popular': { tr: 'POPÜLER', en: 'POPULAR' },
  'academy.readArticle': { tr: 'Makaleyi Oku', en: 'Read Article' },
  'academy.searchPlaceholder': { tr: 'Makale ara…', en: 'Search articles…' },
  'academy.allCategories': { tr: 'Tümü', en: 'All' },
  'academy.catFood': { tr: 'Gıda', en: 'Food' },
  'academy.catChemistry': { tr: 'Kimya', en: 'Chemistry' },
  'academy.catAccreditation': { tr: 'Akreditasyon', en: 'Accreditation' },
  'academy.catEnvironment': { tr: 'Çevre', en: 'Environment' },
  'academy.catPharma': { tr: 'İlaç', en: 'Pharma' },
  'academy.catMicrobiology': { tr: 'Mikrobiyoloji', en: 'Microbiology' },
  'academy.readTime': { tr: 'dk okuma', en: 'min read' },
  'academy.loading': { tr: 'Makaleler yükleniyor…', en: 'Loading articles…' },
  'academy.error': { tr: 'Makaleler yüklenemedi. Lütfen tekrar deneyin.', en: 'Failed to load articles. Please try again.' },
  'academy.retry': { tr: 'Tekrar Dene', en: 'Retry' },
  'academy.noArticles': { tr: 'Henüz makale eklenmemiştir.', en: 'No articles have been added yet.' },
  'academy.noResults': { tr: 'Aramanızla eşleşen makale bulunamadı.', en: 'No articles match your search.' },
  'academy.articleCount': { tr: 'makale', en: 'articles' },

  // ─── Services Page ───
  'services.pageTitle': { tr: 'Laboratuvar\nHizmetlerimiz', en: 'Our Laboratory\nServices' },
  'services.pageDesc': {
    tr: 'Anahtar teslim laboratuvar kurulumu, kalibrasyon, metot geliştirme ve akreditasyon süreçlerinde profesyonel çözümler sunuyoruz.',
    en: 'We offer professional solutions in turnkey laboratory setup, calibration, method development, and accreditation processes.',
  },
  'services.metaDesc': {
    tr: 'For-Labs laboratuvar hizmetleri: kurulum, kalibrasyon, eğitim, danışmanlık ve teknik servis.',
    en: 'For-Labs laboratory services: setup, calibration, training, consultancy, and technical service.',
  },
  'services.badge': { tr: 'Profesyonel Hizmetler', en: 'Professional Services' },
  'services.explore': { tr: 'İncele', en: 'Explore' },
  'services.loading': { tr: 'Hizmetler yükleniyor…', en: 'Loading services…' },
  'services.error': { tr: 'Hizmetler yüklenemedi. Lütfen tekrar deneyin.', en: 'Failed to load services. Please try again.' },
  'services.noServices': { tr: 'Henüz hizmet içeriği eklenmemiştir.', en: 'No services have been added yet.' },
  'services.retry': { tr: 'Tekrar Dene', en: 'Retry' },

  // ─── Service Detail Page ───
  'serviceDetail.backToServices': { tr: 'Hizmetlere Dön', en: 'Back to Services' },
  'serviceDetail.loading': { tr: 'Hizmet detayı yükleniyor…', en: 'Loading service details…' },
  'serviceDetail.notFound': { tr: 'Hizmet bulunamadı.', en: 'Service not found.' },
  'serviceDetail.ctaBadge': { tr: 'Proje Talebi', en: 'Project Request' },
  'serviceDetail.ctaTitle': { tr: 'Bu hizmet için proje uzmanıyla görüşün', en: 'Consult with a project expert for this service' },
  'serviceDetail.ctaDesc': {
    tr: 'Laboratuvarınızın ihtiyaçlarını birlikte değerlendirelim. Ücretsiz keşif görüşmesi ile projenize özel teklif hazırlayalım.',
    en: 'Let\'s evaluate your laboratory needs together. We\'ll prepare a custom quote for your project with a free discovery call.',
  },
  'serviceDetail.ctaBtn': { tr: 'Uzmanla Görüşme Talep Et', en: 'Request Expert Consultation' },
  'serviceDetail.ctaPhone': { tr: 'veya bizi arayın', en: 'or call us' },
  'serviceDetail.relatedServices': { tr: 'Diğer Hizmetlerimiz', en: 'Our Other Services' },

  // ─── Article Detail Page ───
  'articleDetail.backToAcademy': { tr: 'Akademiye Dön', en: 'Back to Academy' },
  'articleDetail.loading': { tr: 'Makale yükleniyor…', en: 'Loading article…' },
  'articleDetail.notFound': { tr: 'Makale bulunamadı.', en: 'Article not found.' },
  'articleDetail.readTime': { tr: 'dk okuma', en: 'min read' },
  'articleDetail.publishedOn': { tr: 'Yayınlanma', en: 'Published' },
  'articleDetail.author': { tr: 'Yazar', en: 'Author' },
  'articleDetail.sidebarTitle': { tr: 'Bu Analiz İçin Önerilen Cihazlar', en: 'Recommended Instruments for This Analysis' },
  'articleDetail.sidebarEmpty': { tr: 'Bu makaleye henüz ilişkili ürün eklenmemiştir.', en: 'No related products have been added to this article yet.' },
  'articleDetail.viewProduct': { tr: 'Ürünü İncele', en: 'View Product' },
  'articleDetail.shareTitle': { tr: 'Paylaş', en: 'Share' },
  'articleDetail.ctaTitle': { tr: 'Bu konu hakkında profesyonel destek alın', en: 'Get professional support on this topic' },
  'articleDetail.ctaDesc': {
    tr: 'Analizleriniz için doğru cihaz seçimi ve laboratuvar kurulumu konusunda uzmanlarımızla iletişime geçin.',
    en: 'Contact our experts for choosing the right instruments for your analyses and laboratory setup.',
  },
  'articleDetail.ctaBtn': { tr: 'Uzmanla Görüşme Talep Et', en: 'Request Expert Consultation' },
  'articleDetail.ctaPhone': { tr: 'veya bizi arayın', en: 'or call us' },
  'articleDetail.ctaBadge': { tr: 'Proje Talebi', en: 'Project Request' },
  'articleDetail.relatedArticles': { tr: 'Diğer Makaleler', en: 'More Articles' },
} as const

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, lang: Language): string {
  const entry = translations[key]
  if (!entry) return key
  return entry[lang] || entry.tr
}

/**
 * Pick the correct CMS field based on language.
 * CMS entities have `field` (Turkish) and `field_en` (English).
 * If English is selected but `_en` value is null/empty, falls back to Turkish.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function localizedField(item: any, field: string, lang: Language): string {
  if (lang === 'en') {
    const enKey = `${field}_en`
    const enValue = item[enKey]
    if (typeof enValue === 'string' && enValue.trim()) return enValue
  }
  const trValue = item[field]
  return typeof trValue === 'string' ? trValue : ''
}
