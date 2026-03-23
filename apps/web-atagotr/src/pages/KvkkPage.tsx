import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft } from 'lucide-react'

export default function KvkkPage() {
    useEffect(() => {
        document.title = 'KVKK Aydınlatma Metni | ATAGO TR'
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link
                to="javascript:history.back()"
                onClick={(e) => { e.preventDefault(); window.history.back() }}
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                    <ShieldCheck className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">KVKK Aydınlatma Metni</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Son güncelleme: Mart 2026</p>
                </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-700 leading-relaxed">

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                    <p className="text-sm font-semibold text-amber-800">⚠️ Bu sayfa henüz taslak içerik barındırmaktadır.</p>
                    <p className="text-xs text-amber-700 mt-1">Nihai hukuki metin bir avukat tarafından hazırlandıktan sonra bu içerik güncellenecektir.</p>
                </div>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">1. Veri Sorumlusunun Kimliği</h2>
                    <p>
                        ATAGO TR ("Şirket"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla
                        kişisel verilerinizi aşağıda açıklanan amaçlar doğrultusunda işlemektedir.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">2. İşlenen Kişisel Veriler</h2>
                    <p>Hizmetlerimizden faydalanmanız sürecinde aşağıdaki kişisel verileriniz işlenebilir:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2 text-slate-600">
                        <li>Kimlik bilgileri (ad, soyad)</li>
                        <li>İletişim bilgileri (e-posta adresi, telefon numarası)</li>
                        <li>Adres bilgileri (teslimat ve fatura adresi)</li>
                        <li>Sipariş ve işlem geçmişi</li>
                        <li>Kurumsal bilgiler (şirket adı, vergi numarası)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">3. Kişisel Veri İşleme Amaçları</h2>
                    <p>Kişisel verileriniz; sipariş işlemleri, müşteri hizmetleri, faturalama, yasal yükümlülüklerin yerine getirilmesi
                    ve hizmet kalitesinin iyileştirilmesi amaçlarıyla işlenmektedir.</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">4. Hukuki Dayanak</h2>
                    <p>Kişisel verileriniz; KVKK'nın 5. maddesi kapsamında sözleşmenin ifası, hukuki yükümlülük ve meşru menfaat
                    hukuki sebeplerine dayalı olarak işlenmektedir.</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">5. Veri Güvenliği</h2>
                    <p>Kişisel verileriniz, yetkisiz erişim, kayıp, değiştirme veya ifşaya karşı teknik ve idari güvenlik önlemleriyle
                    korunmaktadır. Tüm iletimler 256-bit SSL şifreleme ile güvence altındadır.</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">6. Haklarınız</h2>
                    <p>KVKK'nın 11. maddesi uyarınca; verilerinize erişim, düzeltme, silme, işlemeyi kısıtlama ve itiraz hakları
                    dahil çeşitli haklara sahipsiniz. Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz.</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">7. İletişim</h2>
                    <p>KVKK kapsamındaki talepleriniz için: <span className="font-medium text-primary-600">kvkk@atagotr.com</span></p>
                </section>
            </div>
        </div>
    )
}
