import { CreditCard, Mail, Palette, DollarSign } from "lucide-react";

const features = [
    { icon: CreditCard, title: "Iyzico Ayarları", desc: "API anahtarları, sandbox/prod modu" },
    { icon: Mail, title: "E-posta (SMTP)", desc: "Bildirim ve fatura e-postaları" },
    { icon: Palette, title: "Tema Yapılandırma", desc: "Site bazlı renk ve logo ayarları" },
    { icon: DollarSign, title: "KDV / Para Birimi", desc: "Vergi oranları ve para birimi" },
];

export default function SettingsPage() {
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Ayarlar</h1>
                <p className="page-subtitle">Genel sistem ve site konfigürasyonları</p>
            </div>

            <div className="card p-12 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5">
                    <CreditCard size={28} className="text-indigo-500" strokeWidth={1.5} />
                </div>
                <h2 className="text-base font-semibold text-slate-800 mb-2">Sistem Ayarları</h2>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Iyzico API anahtarları, SMTP konfigürasyonu, varsayılan KDV oranı ve site bazlı tema ayarlarını buradan yönetebileceksiniz.
                </p>
                <div className="grid grid-cols-2 gap-3 text-left">
                    {features.map((f) => {
                        const Icon = f.icon;
                        return (
                            <div key={f.title} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <Icon size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                                <div>
                                    <p className="text-xs font-medium text-slate-700">{f.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-slate-400 mt-6 italic">Faz 5'te aktif edilecek</p>
            </div>
        </div>
    );
}
