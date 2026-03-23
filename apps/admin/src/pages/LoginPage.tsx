import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate, useSearchParams } from "react-router-dom";
import { Loader2, Shield, FileText, ShoppingCart, ImageIcon, Lock } from "lucide-react";

export default function LoginPage() {
    const { user, loginWithGoogle, isLoading } = useAuth();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState(() => {
        const err = searchParams.get("error");
        return err ? decodeURIComponent(err) : "";
    });
    const [submitting, setSubmitting] = useState(false);

    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-500" size={28} />
            </div>
        );

    if (user) return <Navigate to="/" replace />;

    const handleGoogleLogin = async () => {
        setError("");
        setSubmitting(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Giriş başarısız";
            setError(message);
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#fafbfc]">
            {/* Left — enterprise hero panel */}
            <div className="hidden lg:flex lg:w-[48%] flex-col justify-between bg-[#0f172a] p-12 relative overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            radial-gradient(ellipse at 20% 20%, rgba(79, 70, 229, 0.25) 0%, transparent 55%),
                            radial-gradient(ellipse at 80% 80%, rgba(14, 165, 233, 0.20) 0%, transparent 55%),
                            radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.10) 0%, transparent 60%)
                        `
                    }}
                />
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Top: Logo */}
                <div className="relative">
                    <img 
                        src="/forlabs-logo.svg" 
                        alt="For-Labs Logo" 
                        className="h-8 w-auto object-contain opacity-95" 
                    />
                </div>

                {/* Middle: Feature highlights */}
                <div className="relative space-y-8">
                    <div>
                        <h2 className="text-white text-2xl font-bold tracking-tight leading-tight">
                            For-Labs Dijital<br />Ekosistemi
                        </h2>
                        <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-md">
                            Ekosistemdeki tüm websitelerin içerik, ürün ve sipariş operasyonlarını tek bir merkezden, tam kontrolle yönetin.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: FileText, label: "Merkezi İçerik Yönetimi", desc: "Tüm sitelerdeki sayfaları, blogları ve kategorileri tek noktadan yayınlayın." },
                            { icon: ShoppingCart, label: "Sipariş ve Operasyon", desc: "Gelen e-ticaret siparişlerini ve müşteri taleplerini anlık olarak takip edin." },
                            { icon: ImageIcon, label: "Ortak Medya Havuzu", desc: "Görsel ve belgeleri merkezi kütüphanede toplayarak tüm sitelerde kullanın." },
                            { icon: Lock, label: "Kurumsal Güvenlik", desc: "Sadece yetkilendirilmiş şirket hesaplarıyla, şifresiz ve güvenli giriş yapın." },
                        ].map((f) => {
                            const Icon = f.icon;
                            return (
                                <div key={f.label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 backdrop-blur-sm">
                                    <Icon size={18} className="text-indigo-400 mb-2.5" strokeWidth={1.75} />
                                    <p className="text-white text-sm font-semibold">{f.label}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom: Stats bar */}
                <div className="relative flex items-center gap-8">
                    {[
                        { value: "7+", label: "Aktif Marka" },
                        { value: "Tek", label: "Kontrol Merkezi" },
                        { value: "%100", label: "Senkronize Operasyon" },
                    ].map((s) => (
                        <div key={s.label}>
                            <p className="text-white font-bold text-lg tabular-nums">{s.value}</p>
                            <p className="text-slate-600 text-[10px] font-medium uppercase tracking-wider">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right — login area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-95">
                    {/* Mobile logo */}
                    <div className="lg:hidden mb-10">
                        <img 
                            src="/forlabs-logo.svg" 
                            alt="For-Labs Logo" 
                            className="h-7 w-auto object-contain" 
                        />
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-[1.625rem] font-bold text-slate-900 tracking-tight">
                            Yönetim Paneli
                        </h1>
                        <p className="text-slate-500 text-sm mt-1.5">
                            Kurumsal Google hesabınız ile güvenli giriş yapın
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                            <span className="leading-snug">{error}</span>
                        </div>
                    )}

                    {/* Google SSO Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-[0.9375rem] font-medium text-slate-700 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {submitting ? (
                            <Loader2 size={20} className="animate-spin text-slate-400" />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                        )}
                        <span>Google ile Giriş Yap</span>
                    </button>

                    {/* Security notice */}
                    <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-start gap-2.5">
                            <Shield size={14} className="text-indigo-400 shrink-0 mt-0.5" strokeWidth={2} />
                            <div>
                                <p className="text-xs font-medium text-slate-600">Kurumsal Güvenlik</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                    Sadece yönetici tarafından yetkilendirilmiş Google hesapları ile giriş yapılabilir. Şifre kullanılmaz.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-[11px] text-slate-400 mt-10">
                        For-Labs Multi-Tenant CMS &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}
