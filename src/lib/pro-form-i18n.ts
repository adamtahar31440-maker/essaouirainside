export type ProFormStrings = {
  heading: string;
  intro: string;
  langLabel: string;
  langHint: string;
  contactName: string;
  category: string;
  subcategory: string;
  name: string;
  description: string;
  address: string;
  addressHint: string;
  lat: string;
  lng: string;
  phone: string;
  whatsapp: string;
  website: string;
  priceLevel: string;
  images: string;
  submit: string;
};

export const PRO_FORM_STRINGS: Record<string, ProFormStrings> = {
  fr: {
    heading: "Devenir partenaire",
    intro:
      "Remplis la fiche complète de ton établissement. Un membre de l'équipe Essaouira Inside l'examinera avant de la publier et de valider ton compte.",
    langLabel: "Langue de rédaction",
    langHint:
      "Choisissez la langue dans laquelle vous allez rédiger votre fiche. Dès l'envoi de votre demande, elle sera automatiquement traduite dans toutes les autres langues du site avant d'être examinée par notre équipe.",
    contactName: "Responsable",
    category: "Catégorie",
    subcategory: "Sous-catégorie",
    name: "Nom de l'établissement",
    description: "Description",
    address: "Adresse",
    addressHint: "Tapez pour rechercher une adresse existante à Essaouira.",
    lat: "Latitude",
    lng: "Longitude",
    phone: "Téléphone",
    whatsapp: "WhatsApp",
    website: "Site internet",
    priceLevel: "Niveau de prix",
    images: "Photos (une URL par ligne)",
    submit: "Envoyer ma demande",
  },
  en: {
    heading: "Become a partner",
    intro:
      "Fill in your establishment's complete listing. A member of the Essaouira Inside team will review it before publishing it and validating your account.",
    langLabel: "Writing language",
    langHint:
      "Choose the language you'll write your listing in. As soon as you submit your application, it will be automatically translated into every other language on the site before being reviewed by our team.",
    contactName: "Contact person",
    category: "Category",
    subcategory: "Subcategory",
    name: "Business name",
    description: "Description",
    address: "Address",
    addressHint: "Type to search for an existing address in Essaouira.",
    lat: "Latitude",
    lng: "Longitude",
    phone: "Phone",
    whatsapp: "WhatsApp",
    website: "Website",
    priceLevel: "Price level",
    images: "Photos (one URL per line)",
    submit: "Submit my application",
  },
  ar: {
    heading: "كن شريكًا",
    intro:
      "املأ الملف الكامل لمنشأتك. سيقوم أحد أعضاء فريق Essaouira Inside بمراجعته قبل نشره والتحقق من حسابك.",
    langLabel: "لغة الكتابة",
    langHint:
      "اختر اللغة التي ستكتب بها ملفك. بمجرد إرسال طلبك، سيُترجم تلقائيًا إلى جميع اللغات الأخرى في الموقع قبل مراجعته من قبل فريقنا.",
    contactName: "الشخص المسؤول",
    category: "الفئة",
    subcategory: "الفئة الفرعية",
    name: "اسم المنشأة",
    description: "الوصف",
    address: "العنوان",
    addressHint: "اكتب للبحث عن عنوان موجود في الصويرة.",
    lat: "خط العرض",
    lng: "خط الطول",
    phone: "الهاتف",
    whatsapp: "واتساب",
    website: "الموقع الإلكتروني",
    priceLevel: "مستوى السعر",
    images: "الصور (رابط واحد في كل سطر)",
    submit: "إرسال طلبي",
  },
  es: {
    heading: "Conviértete en socio",
    intro:
      "Completa la ficha completa de tu establecimiento. Un miembro del equipo de Essaouira Inside la revisará antes de publicarla y validar tu cuenta.",
    langLabel: "Idioma de redacción",
    langHint:
      "Elige el idioma en el que vas a redactar tu ficha. En cuanto envíes tu solicitud, se traducirá automáticamente a todos los demás idiomas del sitio antes de ser revisada por nuestro equipo.",
    contactName: "Responsable",
    category: "Categoría",
    subcategory: "Subcategoría",
    name: "Nombre del establecimiento",
    description: "Descripción",
    address: "Dirección",
    addressHint: "Escribe para buscar una dirección existente en Essaouira.",
    lat: "Latitud",
    lng: "Longitud",
    phone: "Teléfono",
    whatsapp: "WhatsApp",
    website: "Sitio web",
    priceLevel: "Nivel de precio",
    images: "Fotos (una URL por línea)",
    submit: "Enviar mi solicitud",
  },
  de: {
    heading: "Partner werden",
    intro:
      "Füllen Sie das vollständige Profil Ihres Betriebs aus. Ein Mitglied des Essaouira-Inside-Teams prüft es, bevor es veröffentlicht und Ihr Konto bestätigt wird.",
    langLabel: "Sprache der Eingabe",
    langHint:
      "Wählen Sie die Sprache, in der Sie Ihr Profil verfassen möchten. Sobald Sie Ihren Antrag senden, wird er automatisch in alle anderen Sprachen der Website übersetzt, bevor unser Team ihn prüft.",
    contactName: "Ansprechpartner",
    category: "Kategorie",
    subcategory: "Unterkategorie",
    name: "Name des Betriebs",
    description: "Beschreibung",
    address: "Adresse",
    addressHint: "Tippen Sie, um nach einer bestehenden Adresse in Essaouira zu suchen.",
    lat: "Breitengrad",
    lng: "Längengrad",
    phone: "Telefon",
    whatsapp: "WhatsApp",
    website: "Webseite",
    priceLevel: "Preisniveau",
    images: "Fotos (eine URL pro Zeile)",
    submit: "Antrag senden",
  },
  it: {
    heading: "Diventa partner",
    intro:
      "Compila la scheda completa della tua attività. Un membro del team di Essaouira Inside la esaminerà prima di pubblicarla e convalidare il tuo account.",
    langLabel: "Lingua di redazione",
    langHint:
      "Scegli la lingua in cui scriverai la tua scheda. Non appena invii la richiesta, verrà tradotta automaticamente in tutte le altre lingue del sito prima di essere esaminata dal nostro team.",
    contactName: "Referente",
    category: "Categoria",
    subcategory: "Sottocategoria",
    name: "Nome dell'attività",
    description: "Descrizione",
    address: "Indirizzo",
    addressHint: "Digita per cercare un indirizzo esistente a Essaouira.",
    lat: "Latitudine",
    lng: "Longitudine",
    phone: "Telefono",
    whatsapp: "WhatsApp",
    website: "Sito web",
    priceLevel: "Fascia di prezzo",
    images: "Foto (un URL per riga)",
    submit: "Invia la mia richiesta",
  },
  pt: {
    heading: "Torne-se parceiro",
    intro:
      "Preencha a ficha completa do seu estabelecimento. Um membro da equipe Essaouira Inside irá analisá-la antes de publicá-la e validar sua conta.",
    langLabel: "Idioma de redação",
    langHint:
      "Escolha o idioma em que você vai redigir sua ficha. Assim que enviar sua solicitação, ela será traduzida automaticamente para todos os outros idiomas do site antes de ser analisada pela nossa equipe.",
    contactName: "Responsável",
    category: "Categoria",
    subcategory: "Subcategoria",
    name: "Nome do estabelecimento",
    description: "Descrição",
    address: "Endereço",
    addressHint: "Digite para buscar um endereço existente em Essaouira.",
    lat: "Latitude",
    lng: "Longitude",
    phone: "Telefone",
    whatsapp: "WhatsApp",
    website: "Site",
    priceLevel: "Nível de preço",
    images: "Fotos (uma URL por linha)",
    submit: "Enviar minha solicitação",
  },
  ru: {
    heading: "Стать партнёром",
    intro:
      "Заполните полную анкету вашего заведения. Сотрудник команды Essaouira Inside рассмотрит её перед публикацией и подтверждением вашего аккаунта.",
    langLabel: "Язык заполнения",
    langHint:
      "Выберите язык, на котором вы заполните анкету. Как только вы отправите заявку, она будет автоматически переведена на все остальные языки сайта перед рассмотрением нашей командой.",
    contactName: "Ответственное лицо",
    category: "Категория",
    subcategory: "Подкатегория",
    name: "Название заведения",
    description: "Описание",
    address: "Адрес",
    addressHint: "Введите текст, чтобы найти существующий адрес в Эс-Сувейре.",
    lat: "Широта",
    lng: "Долгота",
    phone: "Телефон",
    whatsapp: "WhatsApp",
    website: "Веб-сайт",
    priceLevel: "Уровень цен",
    images: "Фото (один URL на строку)",
    submit: "Отправить заявку",
  },
  zh: {
    heading: "成为合作伙伴",
    intro:
      "请填写您商户的完整资料。Essaouira Inside 团队成员将在发布并验证您的账户之前进行审核。",
    langLabel: "填写语言",
    langHint:
      "请选择您将用来填写资料的语言。提交申请后，系统会在我们团队审核之前自动将其翻译成网站的所有其他语言。",
    contactName: "负责人",
    category: "类别",
    subcategory: "子类别",
    name: "商户名称",
    description: "描述",
    address: "地址",
    addressHint: "输入以搜索索维拉现有的地址。",
    lat: "纬度",
    lng: "经度",
    phone: "电话",
    whatsapp: "WhatsApp",
    website: "网站",
    priceLevel: "价格等级",
    images: "照片（每行一个网址）",
    submit: "提交申请",
  },
  ko: {
    heading: "파트너 되기",
    intro:
      "업체의 전체 정보를 작성해 주세요. Essaouira Inside 팀원이 게시 및 계정 승인 전에 검토합니다.",
    langLabel: "작성 언어",
    langHint:
      "정보를 작성할 언어를 선택하세요. 신청서를 제출하면 저희 팀이 검토하기 전에 사이트의 다른 모든 언어로 자동 번역됩니다.",
    contactName: "담당자",
    category: "카테고리",
    subcategory: "하위 카테고리",
    name: "업체명",
    description: "설명",
    address: "주소",
    addressHint: "에사우이라의 기존 주소를 검색하려면 입력하세요.",
    lat: "위도",
    lng: "경도",
    phone: "전화번호",
    whatsapp: "WhatsApp",
    website: "웹사이트",
    priceLevel: "가격대",
    images: "사진 (한 줄에 하나의 URL)",
    submit: "신청서 제출",
  },
  tr: {
    heading: "Partner olun",
    intro:
      "İşletmenizin eksiksiz bilgilerini doldurun. Essaouira Inside ekibinden bir üye, yayınlamadan ve hesabınızı onaylamadan önce inceleyecektir.",
    langLabel: "Yazım dili",
    langHint:
      "Bilgilerinizi hangi dilde yazacağınızı seçin. Başvurunuzu gönderdiğiniz anda, ekibimiz incelemeden önce sitedeki diğer tüm dillere otomatik olarak çevrilecektir.",
    contactName: "Yetkili kişi",
    category: "Kategori",
    subcategory: "Alt kategori",
    name: "İşletme adı",
    description: "Açıklama",
    address: "Adres",
    addressHint: "Essaouira'da mevcut bir adresi aramak için yazın.",
    lat: "Enlem",
    lng: "Boylam",
    phone: "Telefon",
    whatsapp: "WhatsApp",
    website: "Web sitesi",
    priceLevel: "Fiyat seviyesi",
    images: "Fotoğraflar (satır başına bir URL)",
    submit: "Başvurumu gönder",
  },
  he: {
    heading: "הצטרפו כשותפים",
    intro:
      "מלאו את הפרופיל המלא של העסק שלכם. חבר צוות Essaouira Inside יבדוק אותו לפני הפרסום ואישור החשבון שלכם.",
    langLabel: "שפת המילוי",
    langHint:
      "בחרו את השפה שבה תמלאו את הפרופיל שלכם. ברגע שתשלחו את הבקשה, היא תתורגם אוטומטית לכל שאר שפות האתר לפני שהצוות שלנו יבדוק אותה.",
    contactName: "איש קשר",
    category: "קטגוריה",
    subcategory: "תת-קטגוריה",
    name: "שם העסק",
    description: "תיאור",
    address: "כתובת",
    addressHint: "הקלידו כדי לחפש כתובת קיימת באסאווירה.",
    lat: "קו רוחב",
    lng: "קו אורך",
    phone: "טלפון",
    whatsapp: "וואטסאפ",
    website: "אתר אינטרנט",
    priceLevel: "רמת מחיר",
    images: "תמונות (כתובת URL אחת בכל שורה)",
    submit: "שליחת הבקשה",
  },
};
