import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function LoginCallbackPage() {
    const { handleGoogleCallback } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const errorParam = params.get("error");

        if (errorParam) {
            navigate(`/login?error=${encodeURIComponent("Google girişi iptal edildi")}`, { replace: true });
            return;
        }

        if (!code) {
            navigate("/login", { replace: true });
            return;
        }

        handleGoogleCallback(code)
            .then(() => {
                navigate("/", { replace: true });
            })
            .catch((err) => {
                const message = err instanceof Error ? err.message : "Giriş başarısız";
                setError(message);
                setTimeout(() => {
                    navigate(`/login?error=${encodeURIComponent(message)}`, { replace: true });
                }, 2000);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafbfc] gap-4">
            {error ? (
                <>
                    <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    </div>
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                    <p className="text-xs text-slate-400">Giriş sayfasına yönlendiriliyorsunuz...</p>
                </>
            ) : (
                <>
                    <Loader2 size={28} className="animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-500 font-medium">Google hesabınız doğrulanıyor...</p>
                </>
            )}
        </div>
    );
}
