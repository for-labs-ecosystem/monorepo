export default function UsersPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    👥 Kullanıcılar
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Admin ve editör hesaplarının yönetimi
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-16 text-center">
                <div className="inline-flex w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 items-center justify-center mb-5">
                    <span className="text-4xl">👥</span>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                    Kullanıcı Yönetimi
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    CMS paneline erişecek admin, editör ve moderatör hesaplarını
                    buradan oluşturup yönetebileceksiniz. Rol tabanlı yetkilendirme
                    ile her kullanıcının erişim seviyesi kontrol altında olacak.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        🔑 Rol Yönetimi
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        ✉️ Davet Sistemi
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        🔒 Şifre Sıfırlama
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-6 italic">
                    Faz 2.5'te aktif edilecek
                </p>
            </div>
        </div>
    );
}
