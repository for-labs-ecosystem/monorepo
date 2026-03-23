import { useEffect } from 'react'
import { Lock, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
    useEffect(() => {
        document.title = 'Gizlilik Politikası | ATAGO TR'
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
            </button>

            <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                    <Lock className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gizlilik Politikası</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Son güncelleme: Mart 2026</p>
                </div>
            </div>

            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                    <p className="text-sm font-semibold text-amber-800">⚠️ Bu sayfa henüz taslak içerik barındırmaktadır.</p>
                    <p className="text-xs text-amber-700 mt-1">Nihai hukuki metin bir avukat tarafından hazırlandıktan sonra bu içerik güncellenecektir.</p>
                </div>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">1. Giriş</h2>
                    <p>
                        ATAGO TR olarak gizliliğinize önem veriyoruz. Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde
                        veya hizmetlerimizi kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklamaktadır.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">2. Toplanan Bilgiler</h2>
                    <p>Aşağıdaki bilgileri toplayabiliriz:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2 text-slate-600">
                        <li>Hesap oluşturma sırasında sağladığınız bilgiler</li>
                        <li>Sipariş ve işlem bilgileri</li>
                        <li>Site kullanım verileri ve çerezler</li>
                        <li>Müşteri hizmetleri yazışmaları</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">3. Bilgilerin Kullanımı</h2>
                    <p>Toplanan bilgiler şu amaçlarla kullanılmaktadır:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2 text-slate-600">
                        <li>Sipariş ve hizmetlerin sağlanması</li>
                        <li>Müşteri desteği ve iletişim</li>
                        <li>Site performansının iyileştirilmesi</li>
                        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">4. Çerezler (Cookies)</h2>
                    <p>
                        Sitemiz, kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktadır. Tarayıcı ayarlarınızdan
                        çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı özellikler düzgün çalışmayabilir.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">5. Üçüncü Taraflarla Paylaşım</h2>
                    <p>
                        Kişisel verileriniz; ödeme işlemcileri, kargo şirketleri ve yasal zorunluluklar dışında üçüncü taraflarla
                        paylaşılmamaktadır. İş ortaklarımız yalnızca hizmet sunumu için gerekli minimum veriyle sınırlıdır.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">6. Veri Güvenliği</h2>
                    <p>
                        Verilerinizi korumak için endüstri standardı güvenlik önlemleri uygulamaktayız. Tüm iletişimler
                        256-bit SSL/TLS şifreleme ile korunmaktadır. Bununla birlikte, internet üzerinden hiçbir iletimin
                        %100 güvenli olmadığını belirtmek isteriz.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">7. Veri Saklama</h2>
                    <p>
                        Kişisel verileriniz, hizmet ilişkisi devam ettiği ve yasal saklama yükümlülükleri bulunduğu sürece muhafaza edilir.
                        Hesabınızı silmeniz halinde verileriniz yasal süreler sonunda silinir.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">8. Haklarınız</h2>
                    <p>Kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2 text-slate-600">
                        <li>Verilerinize erişim ve kopyalarını talep etme</li>
                        <li>Hatalı verilerin düzeltilmesini isteme</li>
                        <li>Verilerinizin silinmesini talep etme</li>
                        <li>Pazarlama iletişimlerinden çıkma</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">9. İletişim</h2>
                    <p>Gizlilik konularındaki talepleriniz için: <span className="font-medium text-primary-600">gizlilik@atagotr.com</span></p>
                </section>
            </div>
        </div>
    )
}
