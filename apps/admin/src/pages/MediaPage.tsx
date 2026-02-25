export default function MediaPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    🖼️ Medya Kütüphanesi
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    R2 bucket üzerindeki PDF, görsel ve dosyaların merkezi yönetimi
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-16 text-center">
                <div className="inline-flex w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 items-center justify-center mb-5">
                    <span className="text-4xl">🖼️</span>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                    Medya Kütüphanesi
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    SDS/TDS dökümanları, ürün görselleri ve proje fotoğraflarını buradan
                    yükleyip yönetebileceksiniz. Dosyalar tenant-aware klasör yapısıyla
                    R2 bucket'a depolanacak.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        📤 Dosya Yükleme
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        📁 Klasör Yapısı
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        🔗 CDN URL'leri
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        📋 Metadata
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-6 italic">
                    Faz 4'te aktif edilecek
                </p>
            </div>
        </div>
    );
}
