import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'

const HomePage = lazy(() => import('@/pages/HomePage'))
const WizardPage = lazy(() => import('@/pages/WizardPage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const ServicesPage = lazy(() => import('@/pages/ServicesPage'))
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetailPage'))
const AcademyPage = lazy(() => import('@/pages/AcademyPage'))
const ArticleDetailPage = lazy(() => import('@/pages/ArticleDetailPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const SuccessPage = lazy(() => import('@/pages/SuccessPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const AccountPage = lazy(() => import('@/pages/AccountPage'))
const CorporatePage = lazy(() => import('@/pages/CorporatePage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const EcosystemPage = lazy(() => import('@/pages/EcosystemPage'))
const KvkkPage = lazy(() => import('@/pages/KvkkPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'wizard', element: <WizardPage /> },
      { path: 'ekosistem', element: <EcosystemPage /> },
      { path: 'urunler', element: <ProductsPage /> },
      { path: 'urunler/:slug', element: <ProductDetailPage /> },
      { path: 'hizmetler', element: <ServicesPage /> },
      { path: 'hizmetler/:slug', element: <ServiceDetailPage /> },
      { path: 'akademi', element: <AcademyPage /> },
      { path: 'akademi/:slug', element: <ArticleDetailPage /> },
      { path: 'sepet', element: <CartPage /> },
      { path: 'odeme', element: <CheckoutPage /> },
      { path: 'siparis-basarili', element: <SuccessPage /> },
      { path: 'giris-yap', element: <LoginPage /> },
      { path: 'kayit-ol', element: <RegisterPage /> },
      { path: 'hesabim', element: <AccountPage /> },
      { path: 'kurumsal', element: <CorporatePage /> },
      { path: 'iletisim', element: <ContactPage /> },
      { path: 'kvkk', element: <KvkkPage /> },
      { path: 'kullanim-kosullari', element: <TermsPage /> },
      { path: 'gizlilik-politikasi', element: <PrivacyPage /> },
    ],
  },
])
