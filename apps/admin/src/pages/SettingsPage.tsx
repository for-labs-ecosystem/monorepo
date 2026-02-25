export default function SettingsPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    ⚙️ Ayarlar
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Genel sistem ve site konfigürasyonları
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-16 text-center">
                <div className="inline-flex w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 items-center justify-center mb-5">
                    <span className="text-4xl">⚙️</span>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                    Sistem Ayarları
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    Iyzico API anahtarları, SMTP konfigürasyonu, varsayılan KDV oranı,
                    site bazlı tema ayarları ve genel sistem parametrelerini buradan
                    yönetebileceksiniz.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        💳 Iyzico Ayarları
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        📧 E-posta (SMTP)
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        🎨 Tema Yapılandırma
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        💰 KDV / Para Birimi
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-6 italic">
                    Faz 5'te aktif edilecek
                </p>
            </div>
        </div>
    );
}
