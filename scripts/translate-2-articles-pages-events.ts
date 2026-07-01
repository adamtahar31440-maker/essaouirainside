import { getDb } from "../src/db";
import { articles, contentPages, events } from "../src/db/schema";
import { eq } from "drizzle-orm";

const db = getDb();

const ARTICLES: Record<string, { title: Record<string, string>; excerpt: Record<string, string>; body: Record<string, string> }> = {
  "guide-3-jours-essaouira": {
    title: {
      es: "Essaouira en 3 días: el itinerario completo", de: "Essaouira in 3 Tagen: die komplette Route",
      it: "Essaouira in 3 giorni: l'itinerario completo", pt: "Essaouira em 3 dias: o itinerário completo",
      ru: "Эс-Сувейра за 3 дня: полный маршрут", zh: "三天玩转埃萨维拉：完整行程指南",
      ko: "3일간의 에사우이라: 완벽한 여행 코스", tr: "3 günde Essaouira: eksiksiz gezi rotası", he: "אסווירה ב-3 ימים: מסלול מלא",
    },
    excerpt: {
      es: "Nuestra guía paso a paso para descubrir lo esencial de Essaouira en un fin de semana largo.",
      de: "Unser Schritt-für-Schritt-Guide, um das Wesentliche von Essaouira an einem langen Wochenende zu entdecken.",
      it: "La nostra guida passo dopo passo per scoprire l'essenziale di Essaouira in un lungo weekend.",
      pt: "O nosso guia passo a passo para descobrir o essencial de Essaouira num fim de semana prolongado.",
      ru: "Наш пошаговый гид, чтобы познакомиться с главными достопримечательностями Эс-Сувейры за длинные выходные.",
      zh: "我们的分步指南，助您在一个长周末内领略埃萨维拉的精华。",
      ko: "긴 주말 동안 에사우이라의 핵심을 둘러보는 단계별 가이드입니다.",
      tr: "Uzun bir hafta sonunda Essaouira'nın önemli noktalarını keşfetmek için adım adım rehberimiz.",
      he: "המדריך שלנו צעד אחר צעד לגילוי עיקרי אסווירה בסוף שבוע ארוך.",
    },
    body: {
      es: "Día 1: medina y murallas. Día 2: playa y deportes acuáticos. Día 3: excursión al valle del Argán...",
      de: "Tag 1: Medina und Stadtmauern. Tag 2: Strand und Wassersport. Tag 3: Ausflug ins Arganöl-Tal...",
      it: "Giorno 1: medina e bastioni. Giorno 2: spiaggia e sport acquatici. Giorno 3: escursione nella valle dell'Argan...",
      pt: "Dia 1: medina e muralhas. Dia 2: praia e desportos náuticos. Dia 3: excursão ao vale do argan...",
      ru: "День 1: медина и крепостные стены. День 2: пляж и водные виды спорта. День 3: экскурсия в долину аргании...",
      zh: "第一天：麦地那老城与城墙。第二天：海滩和水上运动。第三天：阿甘树谷游览……",
      ko: "1일차: 메디나와 성벽. 2일차: 해변과 수상 스포츠. 3일차: 아르간 밸리 투어...",
      tr: "1. gün: medine ve surlar. 2. gün: plaj ve su sporları. 3. gün: argan vadisi gezisi...",
      he: "יום 1: המדינה העתיקה והחומות. יום 2: חוף וספורט ימי. יום 3: טיול לעמק הארגן...",
    },
  },
  "quand-partir-essaouira": {
    title: {
      es: "¿Cuándo viajar a Essaouira? Clima y mejor temporada", de: "Wann nach Essaouira reisen? Wetter und beste Reisezeit",
      it: "Quando andare a Essaouira? Meteo e stagione migliore", pt: "Quando ir a Essaouira? Clima e melhor época",
      ru: "Когда ехать в Эс-Сувейру? Погода и лучший сезон", zh: "什么时候去埃萨维拉最好？天气与最佳季节",
      ko: "에사우이라 여행 최적기는 언제일까요? 날씨와 베스트 시즌", tr: "Essaouira'ya ne zaman gidilir? Hava durumu ve en iyi sezon",
      he: "מתי לנסוע לאסווירה? מזג אוויר והעונה הטובה ביותר",
    },
    excerpt: {
      es: "Viento, temperatura, afluencia: todo lo que hay que saber para elegir el mejor momento.",
      de: "Wind, Temperatur, Andrang: alles, was Sie wissen müssen, um den besten Zeitpunkt zu wählen.",
      it: "Vento, temperatura, affluenza: tutto quello che c'è da sapere per scegliere il periodo migliore.",
      pt: "Vento, temperatura, afluência: tudo o que precisa de saber para escolher a melhor altura.",
      ru: "Ветер, температура, наплыв туристов: всё, что нужно знать, чтобы выбрать лучшее время.",
      zh: "风力、气温、游客量：选择最佳出行时间必知的一切。",
      ko: "바람, 기온, 혼잡도: 최적의 여행 시기를 선택하기 위해 알아야 할 모든 것.",
      tr: "Rüzgar, sıcaklık, yoğunluk: en iyi dönemi seçmek için bilmeniz gereken her şey.",
      he: "רוח, טמפרטורה, עומס מבקרים: כל מה שצריך לדעת כדי לבחור את התקופה הטובה ביותר.",
    },
    body: {
      es: "Essaouira disfruta de un clima suave todo el año, pero el viento (el famoso 'alisio') es más fuerte entre abril y septiembre...",
      de: "Essaouira genießt das ganze Jahr über ein mildes Klima, aber der Wind (der berühmte 'Alizé') ist zwischen April und September stärker...",
      it: "Essaouira gode di un clima mite tutto l'anno, ma il vento (il famoso 'aliseo') è più forte tra aprile e settembre...",
      pt: "Essaouira beneficia de um clima ameno durante todo o ano, mas o vento (o famoso 'alísio') é mais forte entre abril e setembro...",
      ru: "Эс-Сувейра наслаждается мягким климатом круглый год, но ветер (знаменитый пассат) сильнее с апреля по сентябрь...",
      zh: "埃萨维拉全年气候温和，但著名的信风在四月至九月间更为强劲……",
      ko: "에사우이라는 연중 온화한 기후를 자랑하지만, 유명한 무역풍은 4월에서 9월 사이에 더 강하게 붑니다...",
      tr: "Essaouira tüm yıl boyunca ılıman bir iklime sahiptir, ancak ünlü rüzgar (Alize) Nisan-Eylül arasında daha güçlüdür...",
      he: "אסווירה נהנית מאקלים נעים לאורך כל השנה, אך הרוח המפורסמת חזקה יותר בין אפריל לספטמבר...",
    },
  },
  "nouveau-festival-gnaoua-2026": {
    title: {
      es: "Festival Gnaoua 2026: lo que hay que saber", de: "Gnaoua-Festival 2026: was Sie wissen müssen",
      it: "Festival Gnaoua 2026: cosa sapere", pt: "Festival Gnaoua 2026: o que é preciso saber",
      ru: "Фестиваль Гнауа 2026: что нужно знать", zh: "2026年格纳瓦音乐节：你需要知道的一切",
      ko: "2026 그나와 페스티벌: 알아야 할 사항", tr: "Gnaoua Festivali 2026: bilmeniz gerekenler",
      he: "פסטיבל גנאווה 2026: מה שצריך לדעת",
    },
    excerpt: {
      es: "Fechas, programación y consejos prácticos para el mayor festival de música de la ciudad.",
      de: "Termine, Programm und praktische Tipps für das größte Musikfestival der Stadt.",
      it: "Date, programma e consigli pratici per il più grande festival musicale della città.",
      pt: "Datas, programação e conselhos práticos para o maior festival de música da cidade.",
      ru: "Даты, программа и практические советы для крупнейшего музыкального фестиваля города.",
      zh: "日期、节目安排及实用建议，带你了解这座城市最大的音乐节。",
      ko: "이 도시 최대 규모의 음악 축제를 위한 날짜, 프로그램 및 실용적인 팁.",
      tr: "Şehrin en büyük müzik festivali için tarihler, program ve pratik ipuçları.",
      he: "תאריכים, תוכניה וטיפים מעשיים לפסטיבל המוזיקה הגדול ביותר בעיר.",
    },
    body: {
      es: "El Festival Gnaoua y Músicas del Mundo vuelve este año con una programación internacional...",
      de: "Das Gnaoua World Music Festival kehrt dieses Jahr mit einem internationalen Programm zurück...",
      it: "Il Festival Gnaoua e Musiche del Mondo torna quest'anno con un programma internazionale...",
      pt: "O Festival Gnaoua e Músicas do Mundo regressa este ano com uma programação internacional...",
      ru: "Фестиваль Гнауа и мировой музыки в этом году возвращается с международной программой...",
      zh: "格纳瓦与世界音乐节今年将带来国际化的演出阵容重磅回归……",
      ko: "그나와 월드 뮤직 페스티벌이 올해 국제적인 라인업으로 돌아옵니다...",
      tr: "Gnaoua ve Dünya Müzikleri Festivali bu yıl uluslararası bir programla geri dönüyor...",
      he: "פסטיבל גנאווה ומוזיקת העולם חוזר השנה עם תוכניה בינלאומית...",
    },
  },
  "interview-artisan-thuya": {
    title: {
      es: "Encuentro con un maestro artesano de la madera de tuya", de: "Begegnung mit einem Meisterhandwerker der Thuja-Holzverarbeitung",
      it: "Incontro con un maestro artigiano del legno di tuia", pt: "Encontro com um mestre artesão da madeira de tuia",
      ru: "Встреча с мастером-ремесленником по обработке древесины туи", zh: "对话崖柏木雕刻大师",
      ko: "튜야 나무 장인과의 만남", tr: "Tuya ağacı ustası bir zanaatkarla söyleşi", he: "פגישה עם אמן במלאכת עץ התויה",
    },
    excerpt: {
      es: "Retrato de un artesano que perpetúa un saber hacer transmitido de generación en generación.",
      de: "Porträt eines Handwerkers, der ein von Generation zu Generation weitergegebenes Können bewahrt.",
      it: "Ritratto di un artigiano che tramanda un sapere trasmesso di generazione in generazione.",
      pt: "Retrato de um artesão que perpetua um saber transmitido de geração em geração.",
      ru: "Портрет ремесленника, который сохраняет мастерство, передаваемое из поколения в поколение.",
      zh: "一位世代传承手艺的匠人肖像。",
      ko: "세대를 거쳐 전해 내려온 기술을 이어가는 장인의 초상.",
      tr: "Nesilden nesile aktarılan bir zanaati sürdüren bir ustanın portresi.",
      he: "דיוקן של אומן המשמר מסורת מלאכה שעוברת מדור לדור.",
    },
    body: {
      es: "En su taller de la medina, Hassan trabaja la madera de tuya desde hace más de treinta años...",
      de: "In seiner Werkstatt in der Medina bearbeitet Hassan seit über dreißig Jahren Thuja-Holz...",
      it: "Nella sua bottega nella medina, Hassan lavora il legno di tuia da oltre trent'anni...",
      pt: "Na sua oficina na medina, Hassan trabalha a madeira de tuia há mais de trinta anos...",
      ru: "В своей мастерской в медине Хасан обрабатывает древесину туи уже более тридцати лет...",
      zh: "在麦地那老城的工坊里，哈桑加工崖柏木已有三十多年……",
      ko: "메디나에 있는 그의 작업실에서 하산은 30년 넘게 튜야 나무를 다듬어 왔습니다...",
      tr: "Medine'deki atölyesinde Hassan, otuz yılı aşkın süredir tuya ağacını işliyor...",
      he: "בסדנה שלו במדינה העתיקה, חסן מעצב עץ תויה כבר יותר משלושים שנה...",
    },
  },
  "reportage-cooperative-argan-femmes": {
    title: {
      es: "En una cooperativa femenina de aceite de argán", de: "In einer Frauenkooperative für Arganöl",
      it: "In una cooperativa femminile di olio di argan", pt: "Numa cooperativa feminina de óleo de argan",
      ru: "В женском кооперативе по производству арганового масла", zh: "走进女性摩洛哥坚果油合作社",
      ko: "여성 아르간 오일 협동조합 탐방", tr: "Bir kadın argan yağı kooperatifinde", he: "בקואופרטיב נשים לשמן ארגן",
    },
    excerpt: {
      es: "Reportaje sobre las mujeres que producen el oro líquido de Marruecos.",
      de: "Reportage über die Frauen, die Marokkos flüssiges Gold herstellen.",
      it: "Reportage sulle donne che producono l'oro liquido del Marocco.",
      pt: "Reportagem junto das mulheres que produzem o ouro líquido de Marrocos.",
      ru: "Репортаж о женщинах, производящих жидкое золото Марокко.",
      zh: "探访生产摩洛哥“液体黄金”的女性们。",
      ko: "모로코의 '액체 황금'을 생산하는 여성들을 만나다.",
      tr: "Fas'ın sıvı altınını üreten kadınlarla röportaj.",
      he: "כתבה על הנשים שמייצרות את הזהב הנוזלי של מרוקו.",
    },
    body: {
      es: "Cada mañana, una treintena de mujeres se reúnen para partir las nueces de argán a mano...",
      de: "Jeden Morgen versammeln sich rund dreißig Frauen, um die Arganüsse von Hand zu knacken...",
      it: "Ogni mattina, una trentina di donne si riuniscono per sgusciare a mano le noci di argan...",
      pt: "Todas as manhãs, cerca de trinta mulheres reúnem-se para descascar as nozes de argan à mão...",
      ru: "Каждое утро около тридцати женщин собираются, чтобы вручную расколоть орехи аргании...",
      zh: "每天早晨，约三十名妇女聚集在一起，用手工敲开摩洛哥坚果……",
      ko: "매일 아침, 약 30명의 여성들이 모여 손으로 아르간 견과류를 깝니다...",
      tr: "Her sabah otuza yakın kadın, argan cevizlerini elle kırmak için bir araya geliyor...",
      he: "כל בוקר, כשלושים נשים מתכנסות כדי לפצח בידיים את אגוזי הארגן...",
    },
  },
};

const PAGES: Record<string, { title: Record<string, string>; body: Record<string, string> }> = {
  histoire: {
    title: {
      es: "Historia de Essaouira", de: "Geschichte von Essaouira", it: "Storia di Essaouira", pt: "História de Essaouira",
      ru: "История Эс-Сувейры", zh: "埃萨维拉的历史", ko: "에사우이라의 역사", tr: "Essaouira'nın Tarihi", he: "ההיסטוריה של אסווירה",
    },
    body: {
      es: "Fundada en el siglo XVIII por el sultán Mohammed III, Essaouira (antes Mogador) fue concebida como un puerto estratégico abierto a Europa...",
      de: "Essaouira (früher Mogador) wurde im 18. Jahrhundert von Sultan Mohammed III. gegründet und als strategischer, nach Europa offener Hafen konzipiert...",
      it: "Fondata nel XVIII secolo dal sultano Mohammed III, Essaouira (già Mogador) fu concepita come un porto strategico aperto verso l'Europa...",
      pt: "Fundada no século XVIII pelo sultão Mohammed III, Essaouira (antiga Mogador) foi concebida como um porto estratégico aberto à Europa...",
      ru: "Основанная в XVIII веке султаном Мохаммедом III, Эс-Сувейра (ранее Могадор) была задумана как стратегический порт, открытый для Европы...",
      zh: "埃萨维拉（旧称摩加多尔）由苏丹穆罕默德三世于18世纪建立，最初被设计为面向欧洲的战略港口……",
      ko: "18세기 술탄 모하메드 3세에 의해 세워진 에사우이라(옛 이름 모가도르)는 유럽에 개방된 전략적 항구로 설계되었습니다...",
      tr: "18. yüzyılda Sultan Mohammed III tarafından kurulan Essaouira (eski adıyla Mogador), Avrupa'ya açık stratejik bir liman olarak tasarlandı...",
      he: "נוסדה במאה ה-18 על ידי הסולטאן מוחמד השלישי, אסווירה (לשעבר מוגדור) תוכננה כנמל אסטרטגי הפתוח לאירופה...",
    },
  },
  medina: {
    title: {
      es: "La Medina", de: "Die Medina", it: "La Medina", pt: "A Medina", ru: "Медина", zh: "麦地那老城", ko: "메디나", tr: "Medine", he: "המדינה העתיקה",
    },
    body: {
      es: "Declarada Patrimonio de la Humanidad por la UNESCO, la medina de Essaouira seduce con sus callejuelas blancas y azules, sus murallas y sus animados zocos...",
      de: "Die von der UNESCO zum Weltkulturerbe erklärte Medina von Essaouira begeistert mit ihren weiß-blauen Gassen, Stadtmauern und lebendigen Souks...",
      it: "Dichiarata Patrimonio dell'Umanità dall'UNESCO, la medina di Essaouira seduce con i suoi vicoli bianchi e blu, le mura e i suoi vivaci souk...",
      pt: "Classificada como Património Mundial pela UNESCO, a medina de Essaouira encanta com as suas ruelas brancas e azuis, as suas muralhas e os seus animados souks...",
      ru: "Внесённая в список Всемирного наследия ЮНЕСКО, медина Эс-Сувейры очаровывает своими бело-голубыми улочками, крепостными стенами и оживлёнными сук (рынками)...",
      zh: "被联合国教科文组织列为世界遗产的埃萨维拉麦地那，以其蓝白相间的小巷、城墙和热闹的集市令人着迷……",
      ko: "유네스코 세계문화유산으로 등재된 에사우이라의 메디나는 파란색과 흰색이 어우러진 골목길, 성벽, 활기찬 수크(시장)로 매력을 발산합니다...",
      tr: "UNESCO Dünya Mirası olarak listelenen Essaouira medinesi, beyaz-mavi sokakları, surları ve hareketli çarşılarıyla büyülüyor...",
      he: "המוכרזת כאתר מורשת עולמי על ידי אונסק״ו, המדינה העתיקה של אסווירה מקסימה בסמטאותיה הכחולות-לבנות, בחומותיה ובשווקים התוססים שלה...",
    },
  },
  plages: {
    title: {
      es: "Las Playas", de: "Die Strände", it: "Le Spiagge", pt: "As Praias", ru: "Пляжи", zh: "海滩", ko: "해변", tr: "Plajlar", he: "החופים",
    },
    body: {
      es: "La gran playa de Essaouira se extiende varios kilómetros, ideal para el viento, el surf y los paseos a caballo o en camello...",
      de: "Der lange Strand von Essaouira erstreckt sich über mehrere Kilometer und eignet sich ideal für Windsport, Surfen sowie Pferde- oder Kamelritte...",
      it: "La grande spiaggia di Essaouira si estende per diversi chilometri, ideale per il vento, il surf e le passeggiate a cavallo o in cammello...",
      pt: "A grande praia de Essaouira estende-se por vários quilómetros, ideal para o vento, o surf e passeios a cavalo ou em camelo...",
      ru: "Большой пляж Эс-Сувейры протянулся на несколько километров, идеально подходит для виндсёрфинга, сёрфинга, а также прогулок на лошадях или верблюдах...",
      zh: "埃萨维拉的大海滩绵延数公里，非常适合风上运动、冲浪以及骑马或骑骆驼漫步……",
      ko: "에사우이라의 넓은 해변은 몇 킬로미터에 걸쳐 펼쳐져 있으며, 윈드스포츠, 서핑, 승마나 낙타 타기에 이상적입니다...",
      tr: "Essaouira'nın büyük plajı birkaç kilometre uzanır; rüzgar sporları, sörf ve at ya da deve gezintileri için idealdir...",
      he: "החוף הגדול של אסווירה משתרע על פני מספר קילומטרים, אידיאלי לספורט רוח, גלישה וטיולי סוסים או גמלים...",
    },
  },
  culture: {
    title: {
      es: "Cultura y Artesanía", de: "Kultur und Handwerk", it: "Cultura e Artigianato", pt: "Cultura e Artesanato",
      ru: "Культура и ремёсла", zh: "文化与手工艺", ko: "문화와 공예", tr: "Kültür ve El Sanatları", he: "תרבות ומלאכת יד",
    },
    body: {
      es: "Essaouira es una encrucijada cultural donde se mezclan la música gnaoua, las artes plásticas y la artesanía de la madera de tuya...",
      de: "Essaouira ist ein kultureller Knotenpunkt, an dem sich Gnaoua-Musik, bildende Kunst und Thuja-Holzhandwerk vermischen...",
      it: "Essaouira è un crocevia culturale dove si mescolano musica gnaoua, arti plastiche e artigianato del legno di tuia...",
      pt: "Essaouira é um cruzamento cultural onde se misturam a música gnaoua, as artes plásticas e o artesanato da madeira de tuia...",
      ru: "Эс-Сувейра — это культурный перекрёсток, где переплетаются музыка гнауа, изобразительное искусство и ремесло резьбы по дереву туи...",
      zh: "埃萨维拉是一个文化交汇之地，格纳瓦音乐、造型艺术与崖柏木手工艺在此交融……",
      ko: "에사우이라는 그나와 음악, 조형 예술, 튜야 목공예가 어우러지는 문화의 교차로입니다...",
      tr: "Essaouira; gnaoua müziği, plastik sanatlar ve tuya ağacı el sanatlarının bir araya geldiği kültürel bir kavşaktır...",
      he: "אסווירה היא צומת תרבותי שבו מתמזגים מוזיקת גנאווה, אמנות פלסטית ומלאכת עץ התויה...",
    },
  },
  "cout-de-la-vie": {
    title: {
      es: "Coste de la vida en Essaouira", de: "Lebenshaltungskosten in Essaouira", it: "Costo della vita a Essaouira",
      pt: "Custo de vida em Essaouira", ru: "Стоимость жизни в Эс-Сувейре", zh: "埃萨维拉的生活成本",
      ko: "에사우이라의 생활비", tr: "Essaouira'da Yaşam Maliyeti", he: "עלות המחיה באסווירה",
    },
    body: {
      es: "El coste de la vida en Essaouira sigue siendo asequible comparado con Europa: vivienda, alimentación y transporte a precios razonables...",
      de: "Die Lebenshaltungskosten in Essaouira sind im Vergleich zu Europa nach wie vor erschwinglich: Wohnen, Essen und Transport zu vernünftigen Preisen...",
      it: "Il costo della vita a Essaouira resta accessibile rispetto all'Europa: alloggio, cibo e trasporti a prezzi ragionevoli...",
      pt: "O custo de vida em Essaouira mantém-se acessível em comparação com a Europa: habitação, alimentação e transporte a preços razoáveis...",
      ru: "Стоимость жизни в Эс-Сувейре остаётся доступной по сравнению с Европой: жильё, питание и транспорт по разумным ценам...",
      zh: "与欧洲相比，埃萨维拉的生活成本仍然十分实惠：住房、饮食和交通价格合理……",
      ko: "에사우이라의 생활비는 유럽에 비해 여전히 저렴합니다: 합리적인 가격의 주거, 식비, 교통비...",
      tr: "Essaouira'da yaşam maliyeti Avrupa'ya kıyasla uygun kalmaya devam ediyor: makul fiyatlarla konut, yemek ve ulaşım...",
      he: "עלות המחיה באסווירה נשארת נגישה בהשוואה לאירופה: דיור, מזון ותחבורה במחירים סבירים...",
    },
  },
  sante: {
    title: {
      es: "Salud en Essaouira", de: "Gesundheit in Essaouira", it: "Salute a Essaouira", pt: "Saúde em Essaouira",
      ru: "Здравоохранение в Эс-Сувейре", zh: "埃萨维拉的医疗", ko: "에사우이라의 의료", tr: "Essaouira'da Sağlık", he: "בריאות באסווירה",
    },
    body: {
      es: "Essaouira dispone de un hospital público, clínicas privadas y farmacias de guardia para residentes y expatriados...",
      de: "Essaouira verfügt über ein öffentliches Krankenhaus, private Kliniken und Notfallapotheken für Einwohner und Expats...",
      it: "Essaouira dispone di un ospedale pubblico, cliniche private e farmacie di turno per residenti ed espatriati...",
      pt: "Essaouira dispõe de um hospital público, clínicas privadas e farmácias de serviço para residentes e expatriados...",
      ru: "В Эс-Сувейре есть государственная больница, частные клиники и дежурные аптеки для местных жителей и иностранцев...",
      zh: "埃萨维拉设有公立医院、私人诊所和为居民及外籍人士提供服务的值班药房……",
      ko: "에사우이라에는 주민과 외국인 거주자를 위한 공립 병원, 개인 병원, 당직 약국이 있습니다...",
      tr: "Essaouira'da, yerleşikler ve yabancılar için kamu hastanesi, özel klinikler ve nöbetçi eczaneler bulunmaktadır...",
      he: "באסווירה יש בית חולים ציבורי, מרפאות פרטיות ובתי מרקחת תורנים לתושבים ולמהגרים...",
    },
  },
};

const EVENTS: Record<string, { title: Record<string, string>; description: Record<string, string> }> = {
  "festival-gnaoua-2026": {
    title: {
      es: "Festival Gnaoua y Músicas del Mundo", de: "Gnaoua World Music Festival", it: "Festival Gnaoua e Musiche del Mondo",
      pt: "Festival Gnaoua e Músicas do Mundo", ru: "Фестиваль Гнауа и мировой музыки", zh: "格纳瓦与世界音乐节",
      ko: "그나와 월드 뮤직 페스티벌", tr: "Gnaoua ve Dünya Müzikleri Festivali", he: "פסטיבל גנאווה ומוזיקת העולם",
    },
    description: {
      es: "El mayor festival de música de Marruecos, que mezcla gnaoua, jazz y músicas del mundo.",
      de: "Das größte Musikfestival Marokkos, das Gnaoua, Jazz und Weltmusik vereint.",
      it: "Il più grande festival musicale del Marocco, che unisce gnaoua, jazz e musiche del mondo.",
      pt: "O maior festival de música de Marrocos, que combina gnaoua, jazz e músicas do mundo.",
      ru: "Крупнейший музыкальный фестиваль Марокко, объединяющий гнауа, джаз и мировую музыку.",
      zh: "摩洛哥最大的音乐节，融合了格纳瓦音乐、爵士乐和世界音乐。",
      ko: "그나와, 재즈, 월드뮤직이 어우러진 모로코 최대의 음악 축제입니다.",
      tr: "Gnaoua, caz ve dünya müziklerini bir araya getiren Fas'ın en büyük müzik festivali.",
      he: "פסטיבל המוזיקה הגדול ביותר במרוקו, המשלב גנאווה, ג'אז ומוזיקת עולם.",
    },
  },
  "marche-hebdomadaire-souk-jdid": {
    title: {
      es: "Mercado semanal de Souk Jdid", de: "Wochenmarkt Souk Jdid", it: "Mercato settimanale del Souk Jdid",
      pt: "Mercado semanal do Souk Jdid", ru: "Еженедельный рынок Сук-Джадид", zh: "苏克贾迪德周市集",
      ko: "수크 즈디드 주간 시장", tr: "Souk Jdid Haftalık Pazarı", he: "השוק השבועי של סוק ג'דיד",
    },
    description: {
      es: "Mercado local semanal con productos frescos, especias y artesanía.",
      de: "Wöchentlicher lokaler Markt mit frischen Produkten, Gewürzen und Kunsthandwerk.",
      it: "Mercato locale settimanale con prodotti freschi, spezie e artigianato.",
      pt: "Mercado local semanal com produtos frescos, especiarias e artesanato.",
      ru: "Еженедельный местный рынок со свежими продуктами, специями и изделиями ремесленников.",
      zh: "每周举办的本地市集，出售新鲜农产品、香料和手工艺品。",
      ko: "신선한 농산물, 향신료, 수공예품을 만날 수 있는 주간 지역 시장입니다.",
      tr: "Taze ürünler, baharatlar ve el sanatlarının bulunduğu haftalık yerel pazar.",
      he: "שוק מקומי שבועי עם תוצרת טרייה, תבלינים ומלאכת יד.",
    },
  },
  "expo-peintres-essaouira": {
    title: {
      es: "Exposición de los pintores de Essaouira", de: "Ausstellung der Maler von Essaouira", it: "Mostra dei pittori di Essaouira",
      pt: "Exposição dos pintores de Essaouira", ru: "Выставка художников Эс-Сувейры", zh: "埃萨维拉画家作品展",
      ko: "에사우이라 화가들의 전시회", tr: "Essaouira Ressamları Sergisi", he: "תערוכת הציירים של אסווירה",
    },
    description: {
      es: "Exposición colectiva de artistas locales en una galería de la medina.",
      de: "Gruppenausstellung lokaler Künstler in einer Galerie der Medina.",
      it: "Mostra collettiva di artisti locali in una galleria della medina.",
      pt: "Exposição coletiva de artistas locais numa galeria da medina.",
      ru: "Групповая выставка местных художников в галерее медины.",
      zh: "本地艺术家在麦地那老城画廊举办的联合展览。",
      ko: "메디나의 한 갤러리에서 열리는 현지 예술가들의 단체전입니다.",
      tr: "Medine'deki bir galeride yerel sanatçıların ortak sergisi.",
      he: "תערוכה קבוצתית של אמנים מקומיים בגלריה במדינה העתיקה.",
    },
  },
  "concert-plage-essaouira": {
    title: {
      es: "Concierto en vivo en la playa", de: "Live-Konzert am Strand", it: "Concerto dal vivo sulla spiaggia",
      pt: "Concerto ao vivo na praia", ru: "Живой концерт на пляже", zh: "海滩现场音乐会",
      ko: "해변 라이브 콘서트", tr: "Plajda Canlı Konser", he: "הופעה חיה על החוף",
    },
    description: {
      es: "Velada musical al aire libre en la gran playa de Essaouira.",
      de: "Musikalischer Abend unter freiem Himmel am großen Strand von Essaouira.",
      it: "Serata musicale all'aperto sulla grande spiaggia di Essaouira.",
      pt: "Noite musical ao ar livre na grande praia de Essaouira.",
      ru: "Музыкальный вечер под открытым небом на большом пляже Эс-Сувейры.",
      zh: "在埃萨维拉大海滩举办的露天音乐之夜。",
      ko: "에사우이라의 넓은 해변에서 펼쳐지는 야외 음악 이브닝.",
      tr: "Essaouira'nın büyük plajında açık havada müzik gecesi.",
      he: "ערב מוזיקלי תחת כיפת השמיים בחוף הגדול של אסווירה.",
    },
  },
};

async function main() {
  console.log("Translating articles...");
  const allArticles = await db.select().from(articles);
  for (const a of allArticles) {
    const t = ARTICLES[a.slug];
    if (!t) continue;
    await db.update(articles).set({
      title: { ...a.title, ...t.title },
      excerpt: { ...a.excerpt, ...t.excerpt },
      body: { ...a.body, ...t.body },
    }).where(eq(articles.id, a.id));
    console.log(`  article ${a.slug} done`);
  }

  console.log("Translating content pages...");
  const allPages = await db.select().from(contentPages);
  for (const p of allPages) {
    const t = PAGES[p.slug];
    if (!t) continue;
    await db.update(contentPages).set({
      title: { ...p.title, ...t.title },
      body: { ...p.body, ...t.body },
    }).where(eq(contentPages.id, p.id));
    console.log(`  page ${p.slug} done`);
  }

  console.log("Translating events...");
  const allEvents = await db.select().from(events);
  for (const e of allEvents) {
    const t = EVENTS[e.slug];
    if (!t) continue;
    await db.update(events).set({
      title: { ...e.title, ...t.title },
      description: { ...e.description, ...t.description },
    }).where(eq(events.id, e.id));
    console.log(`  event ${e.slug} done`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
