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
