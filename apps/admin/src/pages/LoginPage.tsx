import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Loader2, LogIn, FlaskConical } from "lucide-react";

export default function LoginPage() {
    const { user, login, isLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-500" size={28} />
            </div>
        );

    if (user) return <Navigate to="/" replace />;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || "E-posta veya şifre hatalı");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left — decorative panel */}
            <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#0f172a] p-12 relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, #4f46e5 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, #0ea5e9 0%, transparent 50%)`
                    }}
                />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
                            <FlaskConical size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-base leading-none">For-Labs</p>
                            <p className="text-slate-500 text-xs mt-0.5">CMS Admin Panel</p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <blockquote className="text-white/70 text-sm leading-relaxed italic border-l-2 border-indigo-500/50 pl-4">
                        "Çok sayıda domaini tek bir merkezden yönetin. İçerik, ürün, hizmet ve müşteri taleplerini tam kontrol altında tutun."
                    </blockquote>
                    <div className="mt-8 grid grid-cols-2 gap-3">
                        {[
                            { label: "Aktif Site", value: "7" },
                            { label: "Toplam Ürün", value: "6+" },
                            { label: "Tenant", value: "Multi" },
                            { label: "Çalışma Süresi", value: "99.9%" },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/5 border border-white/10 rounded-lg p-3">
                                <p className="text-white font-bold text-xl leading-none">{s.value}</p>
                                <p className="text-slate-500 text-xs mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — login form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <FlaskConical size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-slate-900">For-Labs CMS</span>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">
                        Yönetim Paneli
                    </h1>
                    <p className="text-slate-500 text-sm mb-8">
                        Giriş yaparak devam edin
                    </p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="label">
                                E-posta adresi
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@for-labs.com"
                                required
                                autoFocus
                                className="input"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label">
                                Şifre
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary btn-lg w-full mt-2"
                        >
                            {submitting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <LogIn size={16} />
                            )}
                            {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-8">
                        For-Labs Multi-Tenant CMS &copy; 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
