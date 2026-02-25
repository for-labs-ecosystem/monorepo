import { Users, Shield, Mail, Lock } from "lucide-react";

const features = [
    { icon: Shield, title: "Rol Yönetimi", desc: "super_admin, admin, editor rolleri" },
    { icon: Mail, title: "Davet Sistemi", desc: "E-posta ile güvenli davet" },
    { icon: Lock, title: "Şifre Sıfırlama", desc: "Güvenli token tabanlı reset" },
    { icon: Users, title: "Erişim Kontrolü", desc: "Sayfa bazlı yetkilendirme" },
];

export default function UsersPage() {
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Kullanıcılar</h1>
                <p className="page-subtitle">Admin ve editör hesaplarının yönetimi</p>
            </div>

            <div className="card p-12 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5">
                    <Users size={28} className="text-indigo-500" strokeWidth={1.5} />
                </div>
                <h2 className="text-base font-semibold text-slate-800 mb-2">Kullanıcı Yönetimi</h2>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    CMS paneline erişecek admin, editör ve moderatör hesaplarını buradan oluşturup yönetebileceksiniz.
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
                <p className="text-xs text-slate-400 mt-6 italic">Faz 2.5'te aktif edilecek</p>
            </div>
        </div>
    );
}
