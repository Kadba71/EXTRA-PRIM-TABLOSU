# Personel Prim Paneli

Tarayıcı üzerinde çalışan bu panel ile **V.İ.P AS EKİP** ve **DIŞ EKİP** prim kayıtlarını yönetebilir, yönettiğiniz verileri ana sayfada görseldeki tarza yakın bir kart düzeninde görüntüleyebilirsiniz. Tüm veriler tarayıcının `localStorage` alanında tutulur, bu nedenle sunucuya ihtiyaç yoktur.

## Özellikler

- Her ekip için ayrı yönetim paneli
- Personel satırı ekleme, silme, yukarı/aşağı taşıma
- `Kaydet ve Göster` butonu ile verileri kaydedip ana sayfayı güncelleme
- Tarihçe için tarayıcıya kalıcı (localStorage) kayıt
- Tek tıkla örnek verileri yükleme veya tümünü temizleme
- Görseldeki altın tonlu kart yerleşimini taklit eden modern tasarım

## Kurulum

Ekstra kurulum gerektirmez. Depoyu indirdikten sonra `index.html` dosyasını çift tıklayarak tarayıcıda açmanız yeterlidir.

```
.
├── assets
│   ├── script.js   # Etkileşimli panel mantığı
│   └── style.css   # Görsel tasarım
└── index.html      # Uygulama girişi
```

## Kullanım

1. Tarayıcıda açtıktan sonra üst menüden **Yönetim Paneli** sekmesine geçin.
2. İlgili ekip altında personel satırlarını doldurun, gerekirse `+ Personel Satırı Ekle` ile ek satırlar açın.
3. `Kaydet ve Göster` butonuna basın. Ana sayfa kartları otomatik güncellenecektir.
4. Veriler tarayıcıda saklandığı için sayfayı yenilediğinizde kayıtlarınız korunur.

İsterseniz `Örnek Verileri Yükle` butonuyla paylaşılan ekran görüntüsündeki değerleri hızlıca test edebilirsiniz.

## Dağıtım (GitHub + Railway)

Bu depo, ana dal (`main`) üzerine her push'ta Railway'a otomatik deploy edecek bir GitHub Actions iş akışı içerir.

### 1) GitHub Repo

- Bu klasörü bir GitHub repo olarak yayınlayın (örn. `git init`, `git add .`, `git commit`, `git branch -M main`, `git remote add origin <repo-url>`, `git push -u origin main`).

### 2) Railway Projesi ve Token

- Railway üzerinde bir proje ve servis oluşturun.
- Proje ayarlarında `Tokens` altından bir "Project Token" oluşturun.
- Servis ID (Service ID) değerini kopyalayın. Railway CLI deploy komutunda kullanılır.

### 3) GitHub Secrets

GitHub repo ayarlarında `Settings` -> `Secrets and variables` -> `Actions` altından şu secrets'ları ekleyin:

- `RAILWAY_TOKEN`: Railway Project Token değeri.
- `RAILWAY_SERVICE_ID`: Railway servis ID (örn. `svc_xxx...`).

### 4) Otomatik Deploy

- `.github/workflows/deploy.yml` dosyası, `main` dalına push olduğunda otomatik çalışır ve Railway CLI ile deploy eder:

```
container: ghcr.io/railwayapp/cli:latest
env:
  RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  SVC_ID: ${{ secrets.RAILWAY_SERVICE_ID }}
steps:
  - uses: actions/checkout@v4
  - run: railway up --service=${{ env.SVC_ID }}
```

### Notlar

- Uygulama Node.js Express ile `server.js` içinden çalışır ve `process.env.PORT` kullanır; Railway ortamında port otomatik atanır.
- Alternatif olarak Railway Dashboard üzerinden GitHub repo bağlayıp, Railway’in kendi Auto Deploy özelliğini de kullanabilirsiniz.
