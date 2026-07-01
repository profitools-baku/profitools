import { getDb } from "../api/queries/connection";
import { categories, brands, products, reviews } from "./schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = getDb();

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);

// Basic translation helper
function translateName(nameRu: string): { az: string; en: string } {
  let az = nameRu;
  let en = nameRu;

  // Replacements dictionary
  const dict = [
    { ru: /Шуруповерт аккумуляторный/g, az: "Akkumulyatorlu burğac-şurup buran", en: "Cordless drill-driver" },
    { ru: /Диск пильный для циркулярок/g, az: "Sirkulyar mişarlar üçün mişar diski", en: "Circular saw blade" },
    { ru: /Пилка для лобзика/g, az: "Mişar ucluğu (lobzik üçün)", en: "Jigsaw blade" },
    { ru: /Углошлифмашина/g, az: "Bucaqcil şlifləmə maşını (bolqarka)", en: "Angle grinder" },
    { ru: /Пила циркулярная/g, az: "Dairəvi mişar (sirkulyar)", en: "Circular saw" },
    { ru: /Отрезной круг/g, az: "Kəsmə diski", en: "Cutting wheel" },
    { ru: /Лобзик/g, az: "Elektrikli mişar (lobzik)", en: "Jigsaw" },
    { ru: /ударный/g, az: "zərbəli", en: "impact" },
    { ru: /чемодан/g, az: "çamadan", en: "case" },
    { ru: /Сверло по металлу/g, az: "Metal üçün qazma ucluğu", en: "Drill bit for metal" },
    { ru: /Сверло по керамограниту/g, az: "Keramoqranit üçün qazma ucluğu", en: "Drill bit for porcelain" },
    { ru: /Сверло по стеклу/g, az: "Şüşə üçün qazma ucluğu", en: "Drill bit for glass" },
    { ru: /Сверло по дереву/g, az: "Oduncaq üçün qazma ucluğu", en: "Drill bit for wood" },
    { ru: /Сверло/g, az: "Qazma ucluğu", en: "Drill bit" },
    { ru: /Набор сверл/g, az: "Qazma ucluqları dəsti", en: "Drill bit set" },
    { ru: /Буры/g, az: "Bur", en: "Hammer drill bit" },
    { ru: /Бур/g, az: "Bur", en: "Hammer drill bit" },
    { ru: /Съемник/g, az: "Çıxarıcı", en: "Puller" },
    { ru: /Бокорезы/g, az: "Yan kəsici", en: "Side cutters" },
    { ru: /Клещи/g, az: "Kəlbətin", en: "Pliers" },
    { ru: /Плоскогубцы/g, az: "Yastıağız kəlbətin", en: "Pliers" },
    { ru: /Щетка/g, az: "Fırça", en: "Brush" },
    { ru: /Напильник/g, az: "Yeyə", en: "File" },
    { ru: /Шарошка/g, az: "Şaroşka", en: "Rotary burr" },
    { ru: /Круг лепестковый/g, az: "Yarpaqlı disk", en: "Flap disc" },
    { ru: /Круг алмазный/g, az: "Almaz disk", en: "Diamond disc" },
    { ru: /Круг отрезной/g, az: "Kəsmə diski", en: "Cutting wheel" },
    { ru: /Круг зачистной/g, az: "Təmizləmə diski", en: "Grinding wheel" },
    { ru: /Круг/g, az: "Disk", en: "Wheel" },
    { ru: /Пилка для электролобзика/g, az: "Elektrikli mişar üçün ucluq", en: "Jigsaw blade" },
    { ru: /Пилка/g, az: "Mişar ucluğu", en: "Saw blade" },
    { ru: /Коронка/g, az: "Karot ucluğu", en: "Core drill bit" },
    { ru: /Отвертка/g, az: "Burğac", en: "Screwdriver" },
    { ru: /Отвертки/g, az: "Burğaclar", en: "Screwdrivers" },
    { ru: /Биты/g, az: "Bitlər", en: "Screwdriver bits" },
    { ru: /Бита/g, az: "Bit", en: "Screwdriver bit" },
    { ru: /Ключ/g, az: "Açar", en: "Wrench" },
    { ru: /Шлифмашина угловая \(болгарка\)/g, az: "Bucaqcil şlifləmə maşını (bolqarka)", en: "Angle grinder" },
    { ru: /Аккумулятор/g, az: "Akumulyator", en: "Battery" },
    { ru: /длинное/g, az: "uzun", en: "long" },
    { ru: /длинный/g, az: "uzun", en: "long" },
    { ru: /набор/g, az: "dəst", en: "set" },
    { ru: /Набор/g, az: "Dəst", en: "Set" },
    { ru: /для/g, az: "üçün", en: "for" },
    { ru: /по/g, az: "üçün", en: "for" },
    { ru: /металлу/g, az: "metal", en: "metal" },
    { ru: /бетону/g, az: "beton", en: "concrete" },
    { ru: /дереву/g, az: "oduncaq", en: "wood" },
    { ru: /нержавеющей стали/g, az: "paslanmaz polad", en: "stainless steel" },
  ];

  for (const item of dict) {
    az = az.replace(item.ru, item.az);
    en = en.replace(item.ru, item.en);
  }

  return { az, en };
}

function translateSpecs(specs: Record<string, string>): { az: Record<string, string>; en: Record<string, string> } {
  const az: Record<string, string> = {};
  const en: Record<string, string> = {};

  const keyDict: Record<string, { az: string; en: string }> = {
    "Бренд": { az: "Brend", en: "Brand" },
    "Страна бренда": { az: "Brend ölkəsi", en: "Brand country" },
    "Материал": { az: "Material", en: "Material" },
    "Тип": { az: "Tip", en: "Type" },
    "Диаметр": { az: "Diametr", en: "Diameter" },
    "Количество": { az: "Say", en: "Quantity" },
    "Хвостовик": { az: "Dəstək", en: "Shank" },
    "Длина": { az: "Uzunluq", en: "Length" },
    "Артикул": { az: "Artikul", en: "Article" },
    "Производитель": { az: "İstehsalçı", en: "Manufacturer" },
    "Назначение": { az: "Təyinatı", en: "Purpose" },
    "Сечение проводников": { az: "Naqil kəsiyi", en: "Wire cross-section" },
    "Особенности": { az: "Xüsusiyyətləri", en: "Features" },
    "Вес": { az: "Çəki", en: "Weight" },
    "Тип двигателя": { az: "Mühərrik tipi", en: "Motor type" },
    "Номинальное напряжение": { az: "Nominal gərginlik", en: "Rated voltage" },
    "Мощность": { az: "Güc", en: "Power" },
    "Электронная регулировка оборотов": { az: "Elektron dövriyyə tənzimlənməsi", en: "Electronic speed control" },
    "Поддержание постоянных оборотов под нагрузкой": { az: "Yük altında sabit dövrlərin saxlanması", en: "Constant speed under load" },
    "Защита от непреднамеренного пуска": { az: "Təsadüfi işə düşmədən qorunma", en: "Restart protection" },
    "Плавный пуск": { az: "Səlis işə düşmə", en: "Soft start" },
    "Число оборотов": { az: "Dövrlərin sayı", en: "No-load speed" },
    "В комплекте": { az: "Dəstdə", en: "Included" },
    "Страна происхождения": { az: "İstehsalçı ölkə", en: "Country of origin" },
    "Срок гарантии": { az: "Zəmanət müddəti", en: "Warranty period" },
    "Тип аккумулятора": { az: "Akumulyator tipi", en: "Battery type" },
    "Емкость": { az: "Tutumu", en: "Capacity" },
    "Максимальный крутящий момент": { az: "Maksimal fırlanma anı", en: "Max torque" },
    "Наличие подсветки": { az: "İşıqlandırmanın olması", en: "LED light" },
    "Наличие удара": { az: "Zərbə funksiyası", en: "Impact function" },
    "Количество аккумуляторов": { az: "Akumulyator sayı", en: "Battery quantity" },
    "Число скоростей": { az: "Sürətlərin sayı", en: "Number of speeds" },
    "Тип патрона": { az: "Patron tipi", en: "Chuck type" },
    "Размер патрона": { az: "Patron ölçüsü", en: "Chuck size" },
    "Максимальный диаметр сверления в древесине": { az: "Ağacda maksimal qazma diametri", en: "Max drilling diameter in wood" },
    "Максимальный диаметр сверления в металле": { az: "Metalda maksimal qazma diametri", en: "Max drilling diameter in metal" },
    "Число ходов": { az: "Vuruş sayı", en: "Stroke rate" },
    "Ход пилки": { az: "Mişar gedişi", en: "Stroke length" },
    "Толщина пропила в дереве": { az: "Ağacda kəsmə dərinliyi", en: "Cutting depth in wood" },
    "Толщина пропила в металле": { az: "Metalda kəsmə dərinliyi", en: "Cutting depth in metal" },
    "Диаметр посадочного отверстия": { az: "Daxili diametr", en: "Bore diameter" },
    "Число зубьев": { az: "Dişlərin sayı", en: "Number of teeth" },
    "Серия": { az: "Seriya", en: "Series" },
    "Толщина": { az: "Qalınlıq", en: "Thickness" },
    "Максимальная глубина реза": { az: "Maksimal kəsmə dərinliyi", en: "Max cutting depth" },
    "Глубина пропила под углом 45°": { az: "45° bucaq altında kəsmə dərinliyi", en: "Cutting depth at 45°" },
    "Возможность работы с направляющей шиной": { az: "İstiqamətləndirici şinlə işləmə imkanı", en: "Guide rail compatibility" },
    "Качество": { az: "Keyfiyyət", en: "Quality" },
    "Глубина реза": { az: "Kəsmə dərinliyi", en: "Cutting depth" },
    "Вид пропила": { az: "Kəsik növü", en: "Type of cut" },
    "Качество пропила": { az: "Kəsik keyfiyyəti", en: "Cut quality" },
    "Тип хвостовика": { az: "Dəstək tipi", en: "Shank type" },
    "Общая длина": { az: "Ümumi uzunluq", en: "Total length" },
  };

  const valDict: Record<string, { az: string; en: string }> = {
    "Германия": { az: "Almaniya", en: "Germany" },
    "Австрия": { az: "Avstriya", en: "Austria" },
    "Черный": { az: "Qara", en: "Black" },
    "Белый": { az: "Ağ", en: "White" },
    "Древесина": { az: "Oduncaq", en: "Wood" },
    "Овальная": { az: "Oval", en: "Oval" },
    "КИТАЙ": { az: "Çin", en: "China" },
    "МАЛАЙЗИЯ": { az: "Malayziya", en: "Malaysia" },
    "ВЕНГРИЯ": { az: "Macarıstan", en: "Hungary" },
    "ШВЕЙЦАРИЯ": { az: "İsveçrə", en: "Switzerland" },
    "СЛОВЕНИЯ": { az: "Sloveniya", en: "Slovenia" },
    "электрический": { az: "elektrik", en: "electric" },
    "аккумуляторный": { az: "akkumulyatorlu", en: "cordless" },
    "быстрозажимной": { az: "tezsıxılan", en: "keyless" },
    "древесина": { az: "oduncaq", en: "wood" },
    "Металл": { az: "Metal", en: "Metal" },
    "Да": { az: "Bəli", en: "Yes" },
    "Нет": { az: "Xeyr", en: "No" },
    "Щеточный": { az: "Fırçalı", en: "Brushed" },
    "Бесщеточный": { az: "Fırçasız", en: "Brushless" },
  };

  for (const [k, v] of Object.entries(specs)) {
    const keyTrans = keyDict[k] || { az: k, en: k };
    const valTrans = valDict[v] || { az: v, en: v };
    az[keyTrans.az] = valTrans.az;
    en[keyTrans.en] = valTrans.en;
  }

  return { az, en };
}

// Classifier for categories
function getCategorySlug(nameRu: string): string {
  const lower = nameRu.toLowerCase();
  if (
    lower.includes("шлифмашина") ||
    lower.includes("перфоратор") ||
    lower.includes("шуруповерт") ||
    lower.includes("дрель") ||
    lower.includes("лобзик") ||
    lower.includes("электролобзик") ||
    lower.includes("пылесос") ||
    lower.includes("аккумулятор")
  ) {
    return "elektroinstrumenty";
  }
  if (lower.includes("уровень") || lower.includes("рулетка") || lower.includes("линейка") || lower.includes("штатив") || lower.includes("лазерный")) {
    return "izmeritelnye-instrumenty";
  }
  if (lower.includes("маркер") || lower.includes("карандаш") || lower.includes("мелок") || lower.includes("чернила")) {
    return "markirovka";
  }
  if (lower.includes("съемник") || lower.includes("напильник") || lower.includes("шарошка") || lower.includes("отвертка") || lower.includes("биты") || lower.includes("ключ") || lower.includes("тиски")) {
    return "ruchnye-instrumenty";
  }
  if (lower.includes("съемник изоляции") || lower.includes("стриппер") || lower.includes("кабель") || lower.includes("провод")) {
    return "elektrika-kabel";
  }
  return "osnastka-rashodniki"; // default fallback for drills, discs, bits, etc.
}

async function seedAll() {
  console.log("Seeding categories...");
  const existingCats = await db.select().from(categories);
  if (existingCats.length === 0) {
    await db.insert(categories).values([
      { slug: "elektroinstrumenty", nameAz: "Elektroalətlər", nameRu: "Электроинструменты", nameEn: "Power Tools", image: null, sortOrder: 1 },
      { slug: "ruchnye-instrumenty", nameAz: "Əl alətləri", nameRu: "Ручные инструменты", nameEn: "Hand Tools", image: null, sortOrder: 2 },
      { slug: "izmeritelnye-instrumenty", nameAz: "Ölçü alətləri", nameRu: "Измерительные инструменты", nameEn: "Measuring Tools", image: null, sortOrder: 3 },
      { slug: "markirovka", nameAz: "Markerləşdirmə", nameRu: "Маркировка", nameEn: "Marking Tools", image: null, sortOrder: 4 },
      { slug: "elektrika-kabel", nameAz: "Elektrik və kabel alətləri", nameRu: "Электрика и кабель", nameEn: "Electrical & Cable Tools", image: null, sortOrder: 5 },
      { slug: "osnastka-rashodniki", nameAz: "Osnastka və sərf materialları", nameRu: "Оснастка и расходники", nameEn: "Accessories & Consumables", image: null, sortOrder: 6 },
    ]);
  }

  console.log("Seeding brands...");
  const brandData = [
    { slug: "proxxon", name: "PROXXON", logoUrl: "/images/brands/proxxon.jpg", sortOrder: 1 },
    { slug: "pica", name: "PicA", logoUrl: "/images/brands/pica.jpg", sortOrder: 2 },
    { slug: "hardy", name: "HARDY", logoUrl: "/images/brands/hardy.jpg", sortOrder: 3 },
    { slug: "jokari", name: "JOKARI", logoUrl: "/images/brands/jokari.jpg", sortOrder: 4 },
    { slug: "stabila", name: "STABILA", logoUrl: "/images/brands/stabila.png", sortOrder: 5 },
    { slug: "alpen", name: "Alpen", logoUrl: "/images/brands/alpen.png", sortOrder: 6 },
    { slug: "keil", name: "Keil", logoUrl: "/images/brands/keil.svg", sortOrder: 7 },
    { slug: "kukko", name: "KUKKO", logoUrl: "/images/brands/kukko.svg", sortOrder: 8 },
    { slug: "maykestag", name: "Maykestag", logoUrl: "/images/brands/maykestag.png", sortOrder: 9 },
    { slug: "nws", name: "NWS", logoUrl: "/images/brands/nws.png", sortOrder: 10 },
    { slug: "osborn", name: "OSBORN", logoUrl: "/images/brands/osborn.svg", sortOrder: 11 },
    { slug: "pferd", name: "PFERD", logoUrl: "/images/brands/pferd.png", sortOrder: 12 },
    { slug: "wilpu", name: "Wilpu", logoUrl: "/images/brands/wilpu.svg", sortOrder: 13 },
    { slug: "witte", name: "WITTE", logoUrl: "/images/brands/witte.svg", sortOrder: 14 },
    { slug: "bosch", name: "Bosch", logoUrl: "/images/brands/bosch.webp", sortOrder: 15 },
    { slug: "makita", name: "Makita", logoUrl: "/images/brands/makita.png", sortOrder: 16 },
  ];

  for (const b of brandData) {
    const existing = await db.select().from(brands).where(eq(brands.slug, b.slug));
    if (existing.length === 0) {
      await db.insert(brands).values(b);
    }
  }

  const cats = await db.select().from(categories);
  const brs = await db.select().from(brands);
  const catMap = new Map(cats.map(c => [c.slug, c.id]));
  const brandMap = new Map(brs.map(b => [b.slug, b.id]));

  const JOKARI_PRODUCTS = [
    {
      sku: "JK-20200",
      nameRu: "Автоматические клещи для снятия изоляции Super 4 PRO JOKARI",
      nameAz: "Super 4 PRO JOKARI avtomatik izolyasiya soyucu kəlbətin",
      nameEn: "Super 4 PRO JOKARI automatic wire stripping pliers",
      price: "174.60",
      images: [
        "https://www.profitools.by/upload/iblock/478/2y6dxopnzv3k1qlp0n7bsbfwjlj0ariz.png",
        "https://www.profitools.by/upload/resize_cache/iblock/fcf/500_500_140cd750bba9870f18aada2478b24840a/ya50zjpmp63ius4162okrpakuo8cb52s.png",
        "https://www.profitools.by/upload/resize_cache/iblock/076/500_500_140cd750bba9870f18aada2478b24840a/ei12427am1jvs1d8pseqtfnbxzwitdt6.png",
        "https://www.profitools.by/upload/resize_cache/iblock/197/500_500_140cd750bba9870f18aada2478b24840a/co47tavefv20zju5p52mwf0yq3igdk5e.png",
        "https://www.profitools.by/upload/resize_cache/iblock/fb5/500_500_140cd750bba9870f18aada2478b24840a/gcqtbxqpalp7xgth8jztceptuu5cc5zi.png"
      ],
      cat: "elektrika-kabel",
      stock: 12,
      pop: true,
      specsRu: {
        "Артикул": "20200",
        "Бренд": "JOKARI",
        "Страна бренда": "Германия",
        "Производитель": "JOKARI-Krampe GmbH",
        "Назначение": "Удаление изоляции с одножильных проводников",
        "Сечение проводников": "0,2 до 6 мм² (AWG 24 - 10)",
        "Особенности": "Автоматическая настройка, встроенные бокорезы (до 2,5 мм²)"
      },
      specsAz: {
        "Artikul": "20200",
        "Brend": "JOKARI",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "JOKARI-Krampe GmbH",
        "Təyinatı": "Birqütblü naqillərdən izolyasiyanın çıxarılması",
        "Naqil kəsiyi": "0,2 - 6 mm² (AWG 24 - 10)",
        "Xüsusiyyətləri": "Avtomatik tənzimləmə, daxili yan kəsicilər (2,5 mm²-ə qədər)"
      },
      specsEn: {
        "Article": "20200",
        "Brand": "JOKARI",
        "Brand country": "Germany",
        "Manufacturer": "JOKARI-Krampe GmbH",
        "Purpose": "Stripping insulation from single-core conductors",
        "Wire cross-section": "0.2 to 6 mm² (AWG 24 - 10)",
        "Features": "Automatic adjustment, built-in side cutters (up to 2.5 mm²)"
      }
    },
    {
      sku: "JK-30900",
      nameRu: "Съемник изоляции Allrounder JOKARI",
      nameAz: "Allrounder JOKARI izolyasiya soyucu",
      nameEn: "Allrounder JOKARI wire stripper",
      price: "55.00",
      images: [
        "https://www.profitools.by/upload/resize_cache/iblock/4d3/500_500_140cd750bba9870f18aada2478b24840a/sqnoub1ytrym8hcao2h1t7gebrya76gj.png",
        "https://www.profitools.by/upload/resize_cache/iblock/5e7/500_500_140cd750bba9870f18aada2478b24840a/fhmy1f5awmturwtq5ifnorkuf0h3c486.png",
        "https://www.profitools.by/upload/resize_cache/iblock/d7d/500_500_140cd750bba9870f18aada2478b24840a/0ckyg1kx19249nynh8ba36licq8fvhod.png",
        "https://www.profitools.by/upload/resize_cache/iblock/97a/500_500_140cd750bba9870f18aada2478b24840a/jd59ogv8lyw5zzeyr00o1jo5hynsvtm0.png",
        "https://www.profitools.by/upload/resize_cache/iblock/3df/500_500_140cd750bba9870f18aada2478b24840a/wwd344eblel3l7u7qy0knprxuj0ex33k.png",
        "https://www.profitools.by/upload/resize_cache/iblock/004/500_500_140cd750bba9870f18aada2478b24840a/9g9j2exo6hssucl1x6dg8t48y93wf0w8.png",
        "https://www.profitools.by/upload/resize_cache/iblock/feb/500_500_140cd750bba9870f18aada2478b24840a/2wt6vkgkxx1ww99a8bcd5qrxw3v1ifhx.png"
      ],
      cat: "elektrika-kabel",
      stock: 14,
      specsRu: {
        "Артикул": "30900",
        "Бренд": "JOKARI",
        "Страна бренда": "Германия",
        "Производитель": "JOKARI-Krampe GmbH",
        "Назначение": "Удаление изоляции с круглых и плоских кабелей",
        "Диаметр круглого кабеля": "от 4 до 15 мм",
        "Ширина плоского кабеля": "до 15 мм",
        "Особенности": "Не требует настройки глубины реза, дополнительные лезвия для зачистки жил 1,5 мм² и 2,5 мм²"
      },
      specsAz: {
        "Artikul": "30900",
        "Brend": "JOKARI",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "JOKARI-Krampe GmbH",
        "Təyinatı": "Dairəvi və yastı kabellərdən izolyasiyanın çıxarılması",
        "Dairəvi kabelin diametri": "4-dən 15 mm-ə qədər",
        "Yastı kabelin eni": "15 mm-ə qədər",
        "Xüsusiyyətləri": "Kəsmə dərinliyinin tənzimlənməsini tələb etmir, 1,5 mm² və 2,5 mm²-lik naqillərin təmizlənməsi üçün əlavə bıçaqlar"
      },
      specsEn: {
        "Article": "30900",
        "Brand": "JOKARI",
        "Brand country": "Germany",
        "Manufacturer": "JOKARI-Krampe GmbH",
        "Purpose": "Stripping insulation from round and flat cables",
        "Round cable diameter": "from 4 to 15 mm",
        "Flat cable width": "up to 15 mm",
        "Features": "Does not require adjustment of cutting depth, additional blades for stripping 1.5 mm² and 2.5 mm² conductors"
      }
    },
    {
      sku: "JK-10162",
      nameRu: "Нож для разделки кабеля Standart №16 JOKARI",
      nameAz: "Standart №16 JOKARI kabel kəsən bıçaq",
      nameEn: "Standart No. 16 JOKARI cable stripping knife",
      price: "26.00",
      images: [
        "https://www.profitools.by/upload/resize_cache/iblock/a84/500_500_140cd750bba9870f18aada2478b24840a/v8zi0mmd1lv69jud21ioyh3pcthpjm92.png",
        "https://www.profitools.by/upload/resize_cache/iblock/ba1/500_500_140cd750bba9870f18aada2478b24840a/gfc6ujcelrqx2do27ars3dvl6q5hcjwa.png",
        "https://www.profitools.by/upload/resize_cache/iblock/2dd/500_500_140cd750bba9870f18aada2478b24840a/u1gojh9da963alsnephrw89zn58ube15.png",
        "https://www.profitools.by/upload/resize_cache/iblock/c4a/500_500_140cd750bba9870f18aada2478b24840a/x0n0dkhautvy5tvo198l6hmgufahdx7p.png",
        "https://www.profitools.by/upload/resize_cache/iblock/e94/500_500_140cd750bba9870f18aada2478b24840a/rdk0fag0g2ypc2ilbbj2j1yiv3tfzaie.png"
      ],
      cat: "elektrika-kabel",
      stock: 16,
      specsRu: {
        "Артикул": "10162",
        "Бренд": "JOKARI",
        "Страна бренда": "Германия",
        "Производитель": "JOKARI-Krampe GmbH",
        "Назначение": "Удаление оболочки с круглого кабеля",
        "Диаметр кабеля": "от 4 до 16 мм",
        "Особенности": "Регулировка глубины реза винтом, лезвие с покрытием TiN, запасное лезвие в комплекте"
      },
      specsAz: {
        "Artikul": "10162",
        "Brend": "JOKARI",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "JOKARI-Krampe GmbH",
        "Təyinatı": "Dairəvi kabeldən qabığın çıxarılması",
        "Kabelin diametri": "4-dən 16 mm-ə qədər",
        "Xüsusiyyətləri": "Kəsmə dərinliyinin vintlə tənzimlənməsi, TiN örtüklü bıçaq, dəstdə ehtiyat bıçaq"
      },
      specsEn: {
        "Article": "10162",
        "Brand": "JOKARI",
        "Brand country": "Germany",
        "Manufacturer": "JOKARI-Krampe GmbH",
        "Purpose": "Removing sheath from round cable",
        "Cable diameter": "from 4 to 16 mm",
        "Features": "Screw-adjustable cutting depth, TiN coated blade, spare blade included"
      }
    },
    {
      sku: "JK-30140",
      nameRu: "Съемник изоляции Strip №14 JOKARI",
      nameAz: "Strip №14 JOKARI izolyasiya soyucu",
      nameEn: "Strip No. 14 JOKARI wire stripper",
      price: "63.00",
      images: [
        "https://www.profitools.by/upload/resize_cache/iblock/243/500_500_140cd750bba9870f18aada2478b24840a/jn5f5jawki8sqlbcp4wext23qzxarjuc.png",
        "https://www.profitools.by/upload/resize_cache/iblock/0dc/500_500_140cd750bba9870f18aada2478b24840a/i2qhv17js9vwpdpcqp23n1l7wjka1ec8.png",
        "https://www.profitools.by/upload/resize_cache/iblock/469/500_500_140cd750bba9870f18aada2478b24840a/bchkxhd6m52hpfolgaysayfyda7upg0a.png",
        "https://www.profitools.by/upload/resize_cache/iblock/e30/500_500_140cd750bba9870f18aada2478b24840a/ak65s6wg1o2r4mpkhjp118bo7tb1iqxk.png",
        "https://www.profitools.by/upload/resize_cache/iblock/cdf/500_500_140cd750bba9870f18aada2478b24840a/g9yl3akgrv5mh4p3gfyo32w6z6ht8wnj.png"
      ],
      cat: "elektrika-kabel",
      stock: 9,
      specsRu: {
        "Артикул": "30140",
        "Бренд": "JOKARI",
        "Страна бренда": "Германия",
        "Производитель": "JOKARI-Krampe GmbH",
        "Назначение": "Удаление изоляции с круглых и плоских кабелей",
        "Диаметр круглого кабеля": "от 4 до 13 мм",
        "Ширина плоского кабеля": "до 12 мм",
        "Особенности": "Не требует настройки глубины реза, дополнительные лезвия для зачистки жил 0,8 мм², 1,5 мм² и 2,5 мм²"
      },
      specsAz: {
        "Artikul": "30140",
        "Brend": "JOKARI",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "JOKARI-Krampe GmbH",
        "Təyinatı": "Dairəvi və yastı kabellərdən izolyasiyanın çıxarılması",
        "Dairəvi kabelin diametri": "4-dən 13 mm-ə qədər",
        "Yastı kabelin eni": "12 mm-ə qədər",
        "Xüsusiyyətləri": "Kəsmə dərinliyinin tənzimlənməsini tələb etmir, 0,8 mm², 1,5 mm² və 2,5 mm²-lik naqillərin təmizlənməsi üçün əlavə bıçaqlar"
      },
      specsEn: {
        "Article": "30140",
        "Brand": "JOKARI",
        "Brand country": "Germany",
        "Manufacturer": "JOKARI-Krampe GmbH",
        "Purpose": "Stripping insulation from round and flat cables",
        "Round cable diameter": "from 4 to 13 mm",
        "Flat cable width": "up to 12 mm",
        "Features": "Does not require adjustment of cutting depth, additional blades for stripping 0.8 mm², 1.5 mm² and 2.5 mm² conductors"
      }
    },
    {
      sku: "JK-20030",
      nameRu: "Автоматические клещи для снятия изоляции c плоского кабеля FKZ JOKARI",
      nameAz: "FKZ JOKARI yastı kabel üçün avtomatik izolyasiya soyucu kəlbətin",
      nameEn: "FKZ JOKARI flat cable automatic wire stripping pliers",
      price: "360.00",
      images: [
        "https://www.profitools.by/upload/resize_cache/iblock/e96/500_500_140cd750bba9870f18aada2478b24840a/n552hqeafjxe25hn20bxinijptj5v69c.png",
        "https://www.profitools.by/upload/resize_cache/iblock/4e5/500_500_140cd750bba9870f18aada2478b24840a/z1h7n0bh8nnglefflost5fzrvaks78oc.png",
        "https://www.profitools.by/upload/resize_cache/iblock/632/500_500_140cd750bba9870f18aada2478b24840a/g238bcuv5qaivxz99v9plan55hbtaet4.png",
        "https://www.profitools.by/upload/resize_cache/iblock/902/500_500_140cd750bba9870f18aada2478b24840a/eyeb8s201s24n6o81ayew9qx1dyfwprf.png",
        "https://www.profitools.by/upload/resize_cache/iblock/4d8/500_500_140cd750bba9870f18aada2478b24840a/irpfywo9pye8i7w4482mvsnq3fa91smr.png",
        "https://www.profitools.by/upload/resize_cache/iblock/710/500_500_140cd750bba9870f18aada2478b24840a/3moxbld7b8fzjt49rjut5q5bymz1oyyu.png"
      ],
      cat: "elektrika-kabel",
      stock: 5,
      specsRu: {
        "Артикул": "20030",
        "Бренд": "JOKARI",
        "Страна бренда": "Германия",
        "Производитель": "JOKARI-Krampe GmbH",
        "Назначение": "Удаление изоляции с плоских кабелей",
        "Ширина кабеля": "до 12 мм",
        "Сечение жилы": "от 0,75 до 2,5 мм²",
        "Особенности": "Автоматическая настройка, удаляет наружную и внутреннюю изоляцию, разметка продольной подачи 15–18–20 мм"
      },
      specsAz: {
        "Artikul": "20030",
        "Brend": "JOKARI",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "JOKARI-Krampe GmbH",
        "Təyinatı": "Yastı kabellərdən izolyasiyanın çıxarılması",
        "Kabelin eni": "12 mm-ə qədər",
        "Damar kəsiyi": "0,75-dən 2,5 mm²-ə qədər",
        "Xüsusiyyətləri": "Avtomatik tənzimləmə, xarici və daxili izolyasiyanı təmizləyir, 15–18–20 mm uzunluq məsafəsi nişanları"
      },
      specsEn: {
        "Article": "20030",
        "Brand": "JOKARI",
        "Brand country": "Germany",
        "Manufacturer": "JOKARI-Krampe GmbH",
        "Purpose": "Stripping insulation from flat cables",
        "Cable width": "up to 12 mm",
        "Conductor cross-section": "from 0.75 to 2.5 mm²",
        "Features": "Automatic adjustment, strips outer and inner insulation, longitudinal feed markings 15-18-20 mm"
      }
    },
    {
      sku: "JK-20100",
      nameRu: "Автоматические клещи для снятия изоляции Secura 2K JOKARI",
      nameAz: "Secura 2K JOKARI avtomatik izolyasiya soyucu kəlbətin",
      nameEn: "Secura 2K JOKARI automatic wire stripping pliers",
      price: "185.00",
      images: [
        "https://www.profitools.by/upload/resize_cache/iblock/2b9/500_500_140cd750bba9870f18aada2478b24840a/jycosxgbwsq8l4e77pmgn0xllpy02b04.png",
        "https://www.profitools.by/upload/resize_cache/iblock/44e/500_500_140cd750bba9870f18aada2478b24840a/fwl0tvuey62zqqzmzwxwn8zdyj9q0hq2.png",
        "https://www.profitools.by/upload/resize_cache/iblock/da1/500_500_140cd750bba9870f18aada2478b24840a/rdaarh47bkstbwj2441iywdpeluker92.png",
        "https://www.profitools.by/upload/resize_cache/iblock/2a7/500_500_140cd750bba9870f18aada2478b24840a/v7wx3mvgbycjbxknklkhsjo4u1o8m8mg.png",
        "https://www.profitools.by/upload/resize_cache/iblock/d61/500_500_140cd750bba9870f18aada2478b24840a/ar66yxf63m2yypa9v8xcj2xnzx9pwcxp.png",
        "https://www.profitools.by/upload/resize_cache/iblock/c1e/500_500_140cd750bba9870f18aada2478b24840a/dhief3rcjsjqnslm4wneehs7tmm0jlrv.png"
      ],
      cat: "elektrika-kabel",
      stock: 6,
      pop: true,
      specsRu: {
        "Артикул": "20100",
        "Бренд": "JOKARI",
        "Страна бренда": "Германия",
        "Производитель": "JOKARI-Krampe GmbH",
        "Назначение": "Удаление изоляции с одножильных проводников",
        "Сечение проводников": "от 0,2 до 6 мм² (AWG 24 - 10)",
        "Вес": "155 г",
        "Особенности": "Автоматическая настройка, встроенные бокорезы до 2,5 мм², регулируемый упор длины снятия изоляции (6–18 мм), двухкомпонентная рукоятка"
      },
      specsAz: {
        "Artikul": "20100",
        "Brend": "JOKARI",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "JOKARI-Krampe GmbH",
        "Təyinatı": "Birqütblü naqillərdən izolyasiyanın çıxarılması",
        "Naqil kəsiyi": "0,2-dən 6 mm²-ə qədər (AWG 24 - 10)",
        "Çəki": "155 q",
        "Xüsusiyyətləri": "Avtomatik tənzimləmə, 2,5 mm²-ə qədər daxili yan kəsicilər, tənzimlənən izolyasiya soyulma uzunluğu (6-18 mm), iki komponentli dəstək"
      },
      specsEn: {
        "Article": "20100",
        "Brand": "JOKARI",
        "Brand country": "Germany",
        "Manufacturer": "JOKARI-Krampe GmbH",
        "Purpose": "Stripping insulation from single-core conductors",
        "Wire cross-section": "from 0.2 to 6 mm² (AWG 24 - 10)",
        "Weight": "155 g",
        "Features": "Automatic adjustment, built-in wire cutters up to 2.5 mm², adjustable stripping length stop (6-18 mm), two-component handle"
      }
    }
  ];

  const PICA_PRODUCTS = [
    {
      sku: "PC-544",
      nameRu: "Карандаш разметочный двухсторонний для сухой и влажной древесины PICA CLASSIC Aniline 544",
      nameAz: "Quru və yaş oduncaq üçün ikitərəfli nişanlama karandaşı PICA CLASSIC Aniline 544",
      nameEn: "Double-sided marking pencil for dry and wet wood PICA CLASSIC Aniline 544",
      price: "3.90",
      images: [
        "https://profitools.by/upload/iblock/6fe/6fe8bedaa14d9a69e19d16a32bdb9a75.jpg",
        "https://profitools.by/upload/resize_cache/iblock/ed4/1200_1200_140cd750bba9870f18aada2478b24840a/ed4d88572b0c500660a3bebcf9afc6f6.jpg",
        "https://profitools.by/upload/resize_cache/iblock/767/1200_1200_140cd750bba9870f18aada2478b24840a/767330e9081cb785fbd6f31134803ca7.jpg",
        "https://profitools.by/upload/resize_cache/iblock/fa3/1200_1200_140cd750bba9870f18aada2478b24840a/fa38cff8fbb78849b8a7069c2feb9b60.jpg",
        "https://profitools.by/upload/resize_cache/iblock/f34/1200_1200_140cd750bba9870f18aada2478b24840a/f34a8048d3c94e4e90cfc54370bf307d.jpg",
        "https://profitools.by/upload/resize_cache/iblock/458/1200_1200_140cd750bba9870f18aada2478b24840a/4580f9c69fa8f75664acfccab73dac71.jpg"
      ],
      cat: "markirovka",
      stock: 40,
      specsRu: {
        "Бренд": "PICA",
        "Страна бренда": "Германия",
        "Производитель": "Pica-Marker GmbH",
        "Тип": "Разметочный карандаш",
        "Форма": "Овальная",
        "Материал": "Древесина",
        "Длина": "240 мм",
        "Особенности": "Двухсторонний: сторона 'WET' (фиолетовый) для влажной древесины, сторона 'DRY' (серый 2H) для сухой древесины"
      },
      specsAz: {
        "Brend": "PICA",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "Pica-Marker GmbH",
        "Tip": "Nişanlama karandaşı",
        "Forma": "Oval",
        "Material": "Oduncaq",
        "Dəyər": "240 mm",
        "Xüsusiyyətləri": "İkitərəfli: yaş oduncaq üçün 'WET' tərəfi (bənövşəyi), quru oduncaq üçün 'DRY' tərəfi (boz 2H)"
      },
      specsEn: {
        "Brand": "PICA",
        "Brand country": "Germany",
        "Manufacturer": "Pica-Marker GmbH",
        "Type": "Marking pencil",
        "Shape": "Oval",
        "Material": "Wood",
        "Length": "240 mm",
        "Features": "Double-sided: 'WET' side (violet) for wet wood, 'DRY' side (gray 2H) for dry wood"
      }
    },
    {
      sku: "PC-540",
      nameRu: "Карандаш разметочный для дерева PICA CLASSIC 540",
      nameAz: "Oduncaq üçün nişanlama karandaşı PICA CLASSIC 540",
      nameEn: "Wood marking pencil PICA CLASSIC 540",
      price: "3.50",
      images: [
        "https://profitools.by/upload/iblock/ead/eadb34b13328745190ce277f4a5cba56.jpg",
        "https://profitools.by/upload/resize_cache/iblock/832/1200_1200_140cd750bba9870f18aada2478b24840a/8325f2c9a024d6d5378936b1de93dec0.jpg"
      ],
      cat: "markirovka",
      stock: 25,
      specsRu: {
        "Бренд": "PICA",
        "Страна бренда": "Германия",
        "Производитель": "Pica-Marker GmbH",
        "Тип": "Разметочный карандаш",
        "Форма": "Овальная",
        "Материал": "Древесина",
        "Грифель": "Графит, жесткость 2H",
        "Длина": "240 мм",
        "Назначение": "Для дерева и ламината"
      },
      specsAz: {
        "Brend": "PICA",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "Pica-Marker GmbH",
        "Tip": "Nişanlama karandaşı",
        "Forma": "Oval",
        "Material": "Oduncaq",
        "Qrifel": "Qrafit, sərtlik 2H",
        "Uzunluq": "240 mm",
        "Təyinatı": "Oduncaq və laminat üçün"
      },
      specsEn: {
        "Brand": "PICA",
        "Brand country": "Germany",
        "Manufacturer": "Pica-Marker GmbH",
        "Type": "Marking pencil",
        "Shape": "Oval",
        "Material": "Wood",
        "Lead": "Graphite, hardness 2H",
        "Length": "240 mm",
        "Purpose": "For wood and laminate"
      }
    },
    {
      sku: "PC-533",
      nameRu: "Маркер ультратонкий перманентный PICA Classic 533 Fine",
      nameAz: "PICA Classic 533 Fine ultranazik daimi marker",
      nameEn: "PICA Classic 533 Fine ultra-fine permanent marker",
      price: "5.00",
      images: [
        "https://profitools.by/upload/iblock/594/594e38feae5b862c05ab44c95e5734eb.jpg",
        "https://profitools.by/upload/resize_cache/iblock/69f/1200_1200_140cd750bba9870f18aada2478b24840a/69f7700fd11b5f16d0568c8c20216c38.jpg",
        "https://profitools.by/upload/resize_cache/iblock/d14/1200_1200_140cd750bba9870f18aada2478b24840a/d149ddd2f70e12c3757d541161cb95f3.jpg"
      ],
      cat: "markirovka",
      stock: 30,
      specsRu: {
        "Бренд": "PICA",
        "Страна бренда": "Германия",
        "Производитель": "Pica-Marker GmbH",
        "Тип": "Перманентный маркер",
        "Цвет": "Черный",
        "Толщина линии": "0.7 мм",
        "Особенности": "Колпачок с клипсой, подходит для кабеля, металла, пластика, стекла, керамики"
      },
      specsAz: {
        "Brend": "PICA",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "Pica-Marker GmbH",
        "Tip": "Daimi marker",
        "Rəng": "Qara",
        "Xəttin qalınlığı": "0.7 mm",
        "Xüsusiyyətləri": "Klipsli qapaq, kabel, metal, plastik, şüşə, keramika üçün uyğundur"
      },
      specsEn: {
        "Brand": "PICA",
        "Brand country": "Germany",
        "Manufacturer": "Pica-Marker GmbH",
        "Type": "Permanent marker",
        "Color": "Black",
        "Line thickness": "0.7 mm",
        "Features": "Cap with clip, suitable for cable, metal, plastic, glass, ceramics"
      }
    },
    {
      sku: "PC-521",
      nameRu: "Маркер перманентный PICA Classic 521",
      nameAz: "PICA Classic 521 daimi marker",
      nameEn: "PICA Classic 521 permanent marker",
      price: "10.00",
      images: [
        "https://profitools.by/upload/resize_cache/iblock/aad/1200_1200_140cd750bba9870f18aada2478b24840a/aad2ff1949ad682847165b2793cfab45.jpg",
        "https://profitools.by/upload/resize_cache/iblock/8ad/1200_1200_140cd750bba9870f18aada2478b24840a/8ad7134890697ace43faf9bf55d89a43.jpg"
      ],
      cat: "markirovka",
      stock: 22,
      specsRu: {
        "Бренд": "PICA",
        "Страна бренда": "Германия",
        "Производитель": "Pica-Marker GmbH",
        "Тип": "Перманентный маркер",
        "Цвет": "Черный",
        "Основа": "Спиртовая",
        "Наконечник": "Клиновой",
        "Особенности": "Водонепроницаемый, чернила 'Dry Safe' (до 48 часов открытым)"
      },
      specsAz: {
        "Brend": "PICA",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "Pica-Marker GmbH",
        "Tip": "Daimi marker",
        "Rəng": "Qara",
        "Əsas": "Spirt əsaslı",
        "Ucluq": "Pazvari",
        "Xüsusiyyətləri": "Suya davamlı, 'Dry Safe' mürəkkəbi (48 saata qədər qapağı açıq qala bilər)"
      },
      specsEn: {
        "Brand": "PICA",
        "Brand country": "Germany",
        "Manufacturer": "Pica-Marker GmbH",
        "Type": "Permanent marker",
        "Color": "Black",
        "Base": "Alcohol-based",
        "Tip": "Chisel tip",
        "Features": "Waterproof, 'Dry Safe' ink (up to 48 hours uncapped)"
      }
    },
    {
      sku: "PC-6030",
      nameRu: "Набор влагостойких сменных грифелей-стержней (12 шт) для карандаша Pica Big Dry Longlife",
      nameAz: "Pica Big Dry Longlife karandaşı üçün suya davamlı əvəzedici qrifellər dəsti (12 ədəd)",
      nameEn: "Water-resistant replacement lead set (12 pcs) for Pica Big Dry Longlife pencil",
      price: "12.00",
      images: [
        "https://www.profitools.by/upload/resize_cache/iblock/164/1200_1200_140cd750bba9870f18aada2478b24840a/1643de346fa2f7c87314ddf6b405ea40.jpg",
        "https://www.profitools.by/upload/resize_cache/iblock/c45/1200_1200_140cd750bba9870f18aada2478b24840a/c45759164c5deb6d274e4de662a858c0.jpg",
        "https://www.profitools.by/upload/resize_cache/iblock/bbf/1200_1200_140cd750bba9870f18aada2478b24840a/bbf8e2fc0cb307febf2d0344a0ec53cd.jpg"
      ],
      cat: "markirovka",
      stock: 18,
      specsRu: {
        "Бренд": "PICA",
        "Страна бренда": "Германия",
        "Производитель": "Pica-Marker GmbH",
        "Тип": "Сменные грифели",
        "Количество": "12 шт (розовые, синие, белые по 4 шт)",
        "Профиль": "Прямоугольный, 2 x 5 мм",
        "Длина": "150 мм",
        "Особенности": "Влагостойкая серия, для камня, кирпича, металла, влажной древесины, пластика"
      },
      specsAz: {
        "Brend": "PICA",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "Pica-Marker GmbH",
        "Tip": "Əvəzedici qrifellər",
        "Say": "12 ədəd (hərəsindən 4 ədəd çəhrayı, göy, ağ)",
        "Profil": "Düzbucaqlı, 2 x 5 mm",
        "Uzunluq": "150 mm",
        "Xüsusiyyətləri": "Suya davamlı seriya, daş, kərpic, metal, nəm oduncaq, plastik üçün"
      },
      specsEn: {
        "Brand": "PICA",
        "Brand country": "Germany",
        "Manufacturer": "Pica-Marker GmbH",
        "Type": "Replacement leads",
        "Quantity": "12 pcs (pink, blue, white - 4 pcs each)",
        "Profile": "Rectangular, 2 x 5 mm",
        "Length": "150 mm",
        "Features": "Water-resistant series, for stone, brick, metal, wet wood, plastic"
      }
    },
    {
      sku: "PC-950",
      nameRu: "Чернила для маркеров PICA Ink Refill Set",
      nameAz: "PICA Ink Refill Set marker doldurma mürəkkəbi",
      nameEn: "PICA Ink Refill Set marker refill ink",
      price: "16.00",
      images: [
        "https://www.profitools.by/upload/resize_cache/iblock/ee7/1200_1200_140cd750bba9870f18aada2478b24840a/ee71ca78819d24b8b2475a736ea13119.jpg",
        "https://www.profitools.by/upload/resize_cache/iblock/b42/1200_1200_140cd750bba9870f18aada2478b24840a/b42076c7265d148f911ba239cf8b45fb.jpg",
        "https://www.profitools.by/upload/resize_cache/iblock/413/1200_1200_140cd750bba9870f18aada2478b24840a/4131a6e0c1c755040d2cfb66eaa561f2.jpg",
        "https://www.profitools.by/upload/resize_cache/iblock/581/1200_1200_140cd750bba9870f18aada2478b24840a/581d7b90664f5ad1c91ada7c19aaf91d.jpg"
      ],
      cat: "markirovka",
      stock: 14,
      specsRu: {
        "Бренд": "PICA",
        "Страна бренда": "Германия",
        "Производитель": "Pica-Marker GmbH",
        "Тип": "Чернила для заправки",
        "Цвет": "Черный",
        "Объем": "25 мл",
        "Ресурс": "До 15 и более заправок",
        "Комплектация": "Пипетка, 2 запасных стержня"
      },
      specsAz: {
        "Brend": "PICA",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "Pica-Marker GmbH",
        "Tip": "Doldurma mürəkkəbi",
        "Rəng": "Qara",
        "Həcm": "25 ml",
        "Resurs": "15 və daha çox doldurma",
        "Komplektasiya": "Pipet, 2 ədəd ehtiyat ucluq"
      },
      specsEn: {
        "Brand": "PICA",
        "Brand country": "Germany",
        "Manufacturer": "Pica-Marker GmbH",
        "Type": "Refill ink",
        "Color": "Black",
        "Volume": "25 ml",
        "Resource": "Up to 15 or more refills",
        "Kit contents": "Pipette, 2 spare tips"
      }
    },
    {
      sku: "PC-590",
      nameRu: "Мелок восковый PICA Classic Pro",
      nameAz: "PICA Classic Pro mum təbaşiri",
      nameEn: "PICA Classic Pro wax crayon",
      price: "17.00",
      images: [
        "https://profitools.by/upload/resize_cache/iblock/a24/500_500_140cd750bba9870f18aada2478b24840a/a243bff196bade0146a11248f7fae397.jpg",
        "https://profitools.by/upload/resize_cache/iblock/9cd/500_500_140cd750bba9870f18aada2478b24840a/9cd46aa93a91a175ed64a38222a7c6b8.jpg",
        "https://profitools.by/upload/resize_cache/iblock/8b0/500_500_140cd750bba9870f18aada2478b24840a/8b081af2940026a596c1af521cc94edd.jpg"
      ],
      cat: "markirovka",
      stock: 20,
      specsRu: {
        "Бренд": "PICA",
        "Страна бренда": "Германия",
        "Производитель": "Pica-Marker GmbH",
        "Тип": "Восковой мелок",
        "Цвет": "Белый",
        "Форма": "Шестигранная",
        "Длина": "120 мм",
        "Диаметр": "12 мм",
        "Особенности": "Для долговечной маркировки, бумажная обертка"
      },
      specsAz: {
        "Brend": "PICA",
        "Brend ölkəsi": "Almaniya",
        "İstehsalçı": "Pica-Marker GmbH",
        "Tip": "Mum təbaşiri",
        "Rəng": "Ağ",
        "Forma": "Altıbucaqlı",
        "Uzunluq": "120 mm",
        "Çap": "12 mm",
        "Xüsusiyyətləri": "Uzunmüddətli nişanlama üçün, kağız sarğılı"
      },
      specsEn: {
        "Brand": "PICA",
        "Brand country": "Germany",
        "Manufacturer": "Pica-Marker GmbH",
        "Type": "Wax crayon",
        "Color": "White",
        "Shape": "Hexagonal",
        "Length": "120 mm",
        "Diameter": "12 mm",
        "Features": "For long-lasting marking, paper wrapped"
      }
    }
  ];

  const dataFiles = [
    { brand: "alpen", file: "data/alpen.json" },
    { brand: "keil", file: "data/keil.json" },
    { brand: "kukko", file: "data/kukko.json" },
    { brand: "maykestag", file: "data/maykestag.json" },
    { brand: "nws", file: "data/nws.json" },
    { brand: "osborn", file: "data/osborn.json" },
    { brand: "pferd", file: "data/pferd.json" },
    { brand: "wilpu", file: "data/wilpu.json" },
    { brand: "witte", file: "data/witte.json" },
    { brand: "bosch", file: "../update/bosch.json" },
    { brand: "makita", file: "../update/makita.json" },
  ];

  const allInsertedProducts: any[] = [];
  const usedSlugs = new Set<string>();
  const usedSkus = new Set<string>();

  const getUniqueSlug = (name: string) => {
    let sl = slugify(name);
    if (!usedSlugs.has(sl)) {
      usedSlugs.add(sl);
      return sl;
    }
    let counter = 1;
    let candidate = `${sl}-${counter}`;
    while (usedSlugs.has(candidate)) {
      counter++;
      candidate = `${sl}-${counter}`;
    }
    usedSlugs.add(candidate);
    return candidate;
  };

  for (const p of [...JOKARI_PRODUCTS, ...PICA_PRODUCTS]) {
    const sl = getUniqueSlug(p.nameEn);
    usedSkus.add(p.sku);
    allInsertedProducts.push({
      slug: sl,
      sku: p.sku,
      nameAz: p.nameAz,
      nameRu: p.nameRu,
      nameEn: p.nameEn,
      descriptionAz: `${p.nameAz} - professional keyfiyyət, original ${p.specsRu.Бренд.toUpperCase()} brend. ProfiTools Azerbaijan rəsmi zəmanət.`,
      descriptionRu: `${p.nameRu} — профессиональное качество, оригинальный бренд ${p.specsRu.Бренд.toUpperCase()}. Официальная гарантия ProfiTools Azerbaijan.`,
      descriptionEn: `${p.nameEn} — professional quality, original ${p.specsRu.Бренд.toUpperCase()} brand. Official warranty from ProfiTools Azerbaijan.`,
      specsAz: p.specsAz || {},
      specsRu: p.specsRu || {},
      specsEn: p.specsEn || {},
      price: p.price,
      stock: p.stock || 10,
      isAvailable: "yes",
      rating: "4.5",
      reviewCount: 0,
      images: p.images || [],
      categoryId: catMap.get(p.cat)!,
      brandId: brandMap.get(p.specsRu.Бренд.toLowerCase())!,
      isPopular: p.pop ? "yes" : "no",
      isNew: "no",
    });
  }

  const PROXXON_PRODUCTS = [
    { sku: "PX-28472", nameAz: "Uzadılmış şlif maşını LHW", nameRu: "Удлиненная шлифмашина LHW", nameEn: "Long-neck grinder LHW", price: "307.53", cat: "elektroinstrumenty", stock: 12, pop: true, specs: { "Güc/Watt": "100W", "Sürət": "5000-20000 dəq" } },
    { sku: "PX-28481", nameAz: "Vibroyeyin dəzgah FBS 240/E (Qraver)", nameRu: "Виброизношенная фурнитура (гравер) FBS 240/E", nameEn: "Engraving machine FBS 240/E", price: "219.69", cat: "elektroinstrumenty", stock: 8, pop: true, specs: { "Güc/Watt": "100W", "Sürət": "5000-20000 dəq" } },
    { sku: "PX-28526", nameAz: "Vibroyeyin şlifaş maşını PS 13", nameRu: "Виброизношенная шлифовальная машинка PS 13", nameEn: "Vibrating sander PS 13", price: "86.41", cat: "elektroinstrumenty", stock: 15, specs: { "Güc/Watt": "80W", "Sürət": "7000-13000 dəq" } },
    { sku: "PX-28620", nameAz: "Micromot 110/BF fleksibil val patronla", nameRu: "Гибкий вал с патроном Micromot 110/BF", nameEn: "Flexible shaft Micromot 110/BF", price: "86.41", cat: "elektroinstrumenty", stock: 10, specs: { "Uzunluq": "100 cm", "Çap": "4 mm" } },
    { sku: "PX-28941", nameAz: "Micromot 110/P val problemi addımlı sıxac", nameRu: "Пробки вала с шаговым зажимом Micromot 110/P", nameEn: "Shaft collet set Micromot 110/P", price: "92.31", cat: "elektroinstrumenty", stock: 7, specs: { "Tiplər": "4 ədəd", "Çap": "1-3.2 mm" } },
    { sku: "PX-28600", nameAz: "MICROMOT MB200 dəlim stendi", nameRu: "Сверлильная стойка MICROMOT MB200", nameEn: "Drill stand MICROMOT MB200", price: "287.96", cat: "elektroinstrumenty", stock: 5, pop: true, specs: { "Hündürlük": "350 mm", "Xod": "200 mm" } },
    { sku: "PX-28140", nameAz: "MICRO-DRIVER elektronika üçün mikro dəstəvən dəsti, 13 əd.", nameRu: "Набор микроотверток для электроники MICRO-DRIVER, 13 пр.", nameEn: "MICRO-DRIVER micro screwdriver set 13 pcs", price: "106.21", cat: "osnastka-rashodniki", stock: 20, specs: { "Parçalar": "13 ədəd", "Material": "CrV polad" } },
    { sku: "PX-23110", nameAz: "TX başlıq və bit dəsti 24 əd. 1/4\" + 1/2\"", nameRu: "Набор головок и бит ТХ 24 пр. 1/4\" + 1/2\"", nameEn: "Socket and bit set TX 24 pcs 1/4\" + 1/2\"", price: "149.48", cat: "osnastka-rashodniki", stock: 9, pop: true, specs: { "Parçalar": "24 ədəd", "Ölçülər": "1/4\" + 1/2\"" } },
    { sku: "PX-23760", nameAz: "Adapter-adapter 3/8\" (F) - 1/4\" (M)", nameRu: "Адаптер-переходник 3/8\" (F) на 1/4\" (M)", nameEn: "Adapter 3/8\" (F) to 1/4\" (M)", price: "5.69", cat: "osnastka-rashodniki", stock: 30, specs: { "Giriş": "3/8\"", "Çıxış": "1/4\"" } },
    { sku: "PX-23762", nameAz: "Torcu başlıq uzadılmış 1/2\"", nameRu: "Торцевая головка удлиненная 1/2\"", nameEn: "Deep socket 1/2\"", price: "8.62", cat: "osnastka-rashodniki", stock: 25, specs: { "Ölçü": "1/2\"" } },
    { sku: "PX-28150", nameAz: "Xüsusi qarmaq dəsti 4 əd.", nameRu: "Набор специальных крючков 4 пр.", nameEn: "Special hook set 4 pcs", price: "25.26", cat: "osnastka-rashodniki", stock: 18, specs: { "Parçalar": "4 ədəd" } },
    { sku: "PX-23710", nameAz: "Torcu başlıqlar adapteri 1/4\"", nameRu: "Адаптер для торцевых головок 1/4\"", nameEn: "Socket adapter 1/4\"", price: "4.44", cat: "osnastka-rashodniki", stock: 35, specs: { "Ölçü": "1/4\"" } },
    { sku: "PX-23752", nameAz: "Uzatma 3/8\"", nameRu: "Удлинитель 3/8\"", nameEn: "Extension bar 3/8\"", price: "5.00", cat: "osnastka-rashodniki", stock: 28, specs: { "Ölçü": "3/8\"", "Uzunluq": "75 mm" } },
    { sku: "PX-23720", nameAz: "Uzatma 1/4\"", nameRu: "Удлинитель 1/4\"", nameEn: "Extension bar 1/4\"", price: "4.59", cat: "osnastka-rashodniki", stock: 32, specs: { "Ölçü": "1/4\"", "Uzunluq": "50 mm" } },
    { sku: "PX-23724", nameAz: "Fleksibil uzatma 1/4\" 150 mm", nameRu: "Гибкий удлинитель 1/4\" 150 мм", nameEn: "Flexible extension 1/4\" 150 mm", price: "9.74", cat: "osnastka-rashodniki", stock: 15, specs: { "Ölçü": "1/4\"", "Uzunluq": "150 mm" } },
    { sku: "PX-23040", nameAz: "Torcu başlıq dəsti 14 əd. raşetka ilə 3/4\"", nameRu: "Набор торцевых головок 14 пр. с трещоткой 3/4\"", nameEn: "Socket set 14 pcs with ratchet 3/4\"", price: "659.67", cat: "osnastka-rashodniki", stock: 4, pop: true, specs: { "Parçalar": "14 ədəd", "Ölçü": "3/4\"" } },
    { sku: "PX-28610", nameAz: "FMS tiske 75 mm vantuzla", nameRu: "Тиски 75 мм на присоске FMS", nameEn: "Vise 75 mm with suction cup FMS", price: "130.27", cat: "osnastka-rashodniki", stock: 6, specs: { "Ağız eni": "75 mm", "Bərkidilmə": "Vantuz" } },
    { sku: "PX-28612", nameAz: "FMZ tiske 75 mm strubçin ilə", nameRu: "Тиски 75 мм на струбцине FMZ", nameEn: "Vise 75 mm with clamp FMZ", price: "130.27", cat: "osnastka-rashodniki", stock: 6, specs: { "Ağız eni": "75 mm", "Bərkidilmə": "Strubçin" } },
    { sku: "PX-22400", nameAz: "TORX L-şəkilli dəstəvən dəsti 10 əd.", nameRu: "Набор отверток TORX с L-образной рукояткой 10 пр.", nameEn: "TORX screwdriver set L-handle 10 pcs", price: "124.87", cat: "ruchnye-instrumenty", stock: 11, pop: true, specs: { "Parçalar": "10 ədəd", "Material": "CrV polad" } },
  ];

  const HARDY_PRODUCTS = [
    { sku: "HD-8080", nameAz: "Çoxfunksiyalı spatula-skrebok 80 mm", nameRu: "Шпатель-скребок многофункциональный 80 мм", nameEn: "Multifunctional spatula-scraper 80 mm", price: "7.38", cat: "osnastka-rashodniki", stock: 60, specs: { "En": "80 mm", "Material": "Paslanmayan polad" } },
  ];

  const STABILA_PRODUCTS = [
    { sku: "ST-02190", nameAz: "Səviyyə Type 70 P-2-2 qeyri-bərabər elementlər üçün", nameRu: "Строительный уровень для неровных элементов Type 70 P-2-2", nameEn: "Level for uneven elements Type 70 P-2-2", price: "186.75", cat: "izmeritelnye-instrumenty", stock: 7, specs: { "Uzunluq": "300 mm" } },
    { sku: "ST-02870", nameAz: "Səviyyə Type 70 MAS 80 sm məsafə işarələmə üçün", nameRu: "Строительный уровень для разметки расстояний Type 70 MAS 80 см", nameEn: "Level for distance marking Type 70 MAS 80 cm", price: "65.89", cat: "izmeritelnye-instrumenty", stock: 12, specs: { "Uzunluq": "80 cm" } },
    { sku: "ST-02465", nameAz: "Elektrikçi səviyyəsi Type 70 electric", nameRu: "Строительный уровень электрика Type 70 electric", nameEn: "Electrician level Type 70 electric", price: "95.67", cat: "izmeritelnye-instrumenty", stock: 10, specs: { "Uzunluq": "250 mm" } },
    { sku: "ST-16050", nameAz: "Type 80 M Installation maqnitli santexnika səviyyəsi", nameRu: "Строительный магнитный уровень сантехника Type 80 M Installation", nameEn: "Magnetic plumber level Type 80 M Installation", price: "186.38", cat: "izmeritelnye-instrumenty", stock: 5, pop: true, specs: { "Uzunluq": "200 mm" } },
    { sku: "ST-19171", nameAz: "Daşçı səviyyəsi Type 96-2 K 81 sm", nameRu: "Строительный уровень каменщика Type 96-2 K 81 см", nameEn: "Mason level Type 96-2 K 81 cm", price: "160.16", cat: "izmeritelnye-instrumenty", stock: 6, specs: { "Uzunluq": "81 cm" } },
    { sku: "ST-19272", nameAz: "Daşçı səviyyəsi Type 196-2 K 122 sm", nameRu: "Строительный уровень каменщика Type 196-2 K 122 см", nameEn: "Mason level Type 196-2 K 122 cm", price: "293.37", cat: "izmeritelnye-instrumenty", stock: 4, pop: true, specs: { "Uzunluq": "122 cm" } },
    { sku: "ST-01180", nameAz: "Düzbucaqlı xətkeş Type AL (puzirkasiz)", nameRu: "Прямоугольное правило Type AL (без пузырьковой камеры)", nameEn: "Rectangular ruler Type AL (no bubble)", price: "37.39", cat: "izmeritelnye-instrumenty", stock: 15, specs: { "Uzunluq": "500 mm" } },
    { sku: "ST-07450", nameAz: "Lazer teleskopik stendi LT 30, 20-365 sm", nameRu: "Телескопическая стойка лазера LT 30, 20-365 см", nameEn: "Laser telescopic stand LT 30, 20-365 cm", price: "164.30", cat: "izmeritelnye-instrumenty", stock: 6, specs: { "Hündürlük": "20-365 cm" } },
    { sku: "ST-05043", nameAz: "TOOLBOX səviyyəsi 43 sm", nameRu: "Строительный уровень TOOLBOX 43 см", nameEn: "Level TOOLBOX 43 cm", price: "45.85", cat: "izmeritelnye-instrumenty", stock: 18, specs: { "Uzunluq": "43 cm" } },
    { sku: "ST-18810", nameAz: "LCC-6-200 (6 bölmə, 200 sm) səviyyə çantası", nameRu: "Сумка-чехол для уровней LCC-6-200 (6 отделений, 200 см)", nameEn: "Level bag LCC-6-200 (6 compartments, 200 cm)", price: "167.22", cat: "izmeritelnye-instrumenty", stock: 8, specs: { "Bölmələr": "6 ədəd", "Uzunluq": "200 cm" } },
    { sku: "ST-02090", nameAz: "Səviyyə Type 70", nameRu: "Строительный уровень Type 70", nameEn: "Level Type 70", price: "41.30", cat: "izmeritelnye-instrumenty", stock: 20, specs: { "Uzunluq": "250 mm" } },
    { sku: "ST-01290", nameAz: "Düzbucaqlı xətkeş Type AL-2L", nameRu: "Прямоугольное правило Type AL-2L", nameEn: "Rectangular ruler Type AL-2L", price: "92.11", cat: "izmeritelnye-instrumenty", stock: 10, specs: { "Uzunluq": "1000 mm" } },
    { sku: "ST-03360", nameAz: "BM 30 W (pəncərəli) cib ölçü lenti", nameRu: "Карманная измерительная рулетка BM 30 W (с окошком)", nameEn: "Pocket tape measure BM 30 W (with window)", price: "227.63", cat: "izmeritelnye-instrumenty", stock: 9, pop: true, specs: { "Uzunluq": "3 m" } },
    { sku: "ST-07400", nameAz: "BSTS tikinti ştativi, 100-160 sm", nameRu: "Строительный штатив BSTS, 100–160 см", nameEn: "Construction tripod BSTS, 100-160 cm", price: "36.02", cat: "izmeritelnye-instrumenty", stock: 14, specs: { "Hündürlük": "100-160 cm" } },
    { sku: "ST-19690", nameAz: "2 LED diod paketi (Type 196-2 LED səviyyəsi üçün)", nameRu: "Упаковка с двумя светодиодами (для уровня Type 196-2 LED)", nameEn: "Pack with two LEDs (for level Type 196-2 LED)", price: "157.45", cat: "izmeritelnye-instrumenty", stock: 10, specs: { "Say": "2 ədəd" } },
    { sku: "ST-01300", nameAz: "Düzbucaqlı xətkeş Type AL-2L-2G", nameRu: "Прямоугольное правило Type AL-2L-2G", nameEn: "Rectangular ruler Type AL-2L-2G", price: "345.98", cat: "izmeritelnye-instrumenty", stock: 3, specs: { "Uzunluq": "1200 mm" } },
  ];

  for (const p of [...PROXXON_PRODUCTS, ...HARDY_PRODUCTS, ...STABILA_PRODUCTS]) {
    const sl = getUniqueSlug(p.nameEn);
    const brandSlug = p.sku.startsWith("PX") ? "proxxon" : p.sku.startsWith("HD") ? "hardy" : "stabila";
    usedSkus.add(p.sku);
    allInsertedProducts.push({
      slug: sl,
      sku: p.sku,
      nameAz: p.nameAz,
      nameRu: p.nameRu,
      nameEn: p.nameEn,
      descriptionAz: `${p.nameAz} - professional keyfiyyət, original ${brandSlug.toUpperCase()} brend. ProfiTools Azerbaijan rəsmi zəmanət.`,
      descriptionRu: `${p.nameRu} — профессиональное качество, оригинальный бренд ${brandSlug.toUpperCase()}. Официальная гарантия ProfiTools Azerbaijan.`,
      descriptionEn: `${p.nameEn} — professional quality, original ${brandSlug.toUpperCase()} brand. Official warranty from ProfiTools Azerbaijan.`,
      specsAz: p.specs || {},
      specsRu: p.specs || {},
      specsEn: p.specs || {},
      price: p.price,
      stock: p.stock || 10,
      isAvailable: "yes",
      rating: "4.5",
      reviewCount: 0,
      images: [],
      categoryId: catMap.get(p.cat)!,
      brandId: brandMap.get(brandSlug)!,
      isPopular: p.pop ? "yes" : "no",
      isNew: "no",
    });
  }

  // Load other brands dynamically from files
  for (const source of dataFiles) {
    const brandSlug = source.brand;
    const jsonPath = path.resolve(__dirname, "..", source.file);
    if (!fs.existsSync(jsonPath)) {
      console.warn(`File not found: ${jsonPath}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    console.log(`Processing ${data.length} products for brand: ${brandSlug}...`);

    // Calculate average price
    const prices: number[] = [];
    for (const item of data) {
      const rawPriceStr = (item.price || "").toString().replace(/[^\d.]/g, "");
      const rawPrice = parseFloat(rawPriceStr);
      if (!isNaN(rawPrice) && rawPrice > 0) {
        const isAzn = brandSlug === "bosch" || brandSlug === "makita";
        const val = isAzn ? rawPrice : rawPrice * 0.55;
        prices.push(val);
      }
    }

    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 25.0;

    for (const item of data) {
      const nameRu = item.nameRu || item.name;
      if (!nameRu) continue;

      const article = item.article || "N/A";
      const sku = article !== "N/A" 
        ? `${brandSlug.toUpperCase()}-${article}`
        : `${brandSlug.toUpperCase()}-GEN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      if (usedSkus.has(sku)) {
        continue;
      }
      usedSkus.add(sku);
      
      const { az: nameAz, en: nameEn } = translateName(nameRu);

      let finalPrice = avgPrice;
      const rawPriceStr = (item.price || "").toString().replace(/[^\d.]/g, "");
      const rawPrice = parseFloat(rawPriceStr);
      if (!isNaN(rawPrice) && rawPrice > 0) {
        const isAzn = brandSlug === "bosch" || brandSlug === "makita";
        finalPrice = isAzn ? rawPrice : rawPrice * 0.55;
      } else {
        finalPrice = avgPrice * (0.88 + Math.random() * 0.22);
      }
      
      const originalSpecs = item.specs || {};
      delete originalSpecs["Импортер"];
      const { az: specsAz, en: specsEn } = translateSpecs(originalSpecs);

      const categorySlug = getCategorySlug(nameRu);
      const categoryId = catMap.get(categorySlug) || catMap.get("osnastka-rashodniki")!;
      const brandId = brandMap.get(brandSlug)!;

      let productImagesList: string[] = item.images || [];
      if (brandSlug === "bosch") {
        if (nameRu.toLowerCase().includes("алмазный")) {
          productImagesList = ["/images/products/bosch/diamond_disc.png"];
        } else if (nameRu.toLowerCase().includes("лепестковый")) {
          productImagesList = ["/images/products/bosch/flap_disc.jpg"];
        } else if (nameRu.toLowerCase().includes("пилка")) {
          productImagesList = ["/images/products/bosch/jigsaw_blades.jpg"];
        } else if (nameRu.toLowerCase().includes("бур") || nameRu.toLowerCase().includes("сверло")) {
          productImagesList = ["/images/products/bosch/sds_drill_bit.jpg"];
        }
      } else if (brandSlug === "makita") {
        if (nameRu.toLowerCase().includes("шлифмашина") || nameRu.toLowerCase().includes("болгарка")) {
          productImagesList = ["/images/products/makita/ga5030r.jpg", "/images/products/makita/grinder.png"];
        } else if (nameRu.toLowerCase().includes("набор")) {
          productImagesList = ["/images/products/makita/accessory_set.png"];
        } else if (nameRu.toLowerCase().includes("аккумулятор")) {
          productImagesList = ["/images/products/makita/bl1860b.jpg", "/images/products/makita/battery.png"];
        } else if (nameRu.toLowerCase().includes("круг")) {
          productImagesList = ["/images/products/makita/grinder.png"];
        } else if (nameRu.toLowerCase().includes("сверло") || nameRu.toLowerCase().includes("бур")) {
          productImagesList = ["/images/products/makita/accessory_set.png"];
        }
      }

      const sl = getUniqueSlug(nameEn);

      allInsertedProducts.push({
        slug: sl,
        sku,
        nameAz,
        nameRu,
        nameEn,
        descriptionAz: `${nameAz} - professional keyfiyyət, original ${brandSlug.toUpperCase()} brend. ProfiTools Azerbaijan rəsmi zəmanət.`,
        descriptionRu: `${nameRu} — профессиональное качество, оригинальный бренд ${brandSlug.toUpperCase()}. Официальная гарантия ProfiTools Azerbaijan.`,
        descriptionEn: `${nameEn} — professional quality, original ${brandSlug.toUpperCase()} brand. Official warranty from ProfiTools Azerbaijan.`,
        specsAz,
        specsRu: originalSpecs,
        specsEn,
        price: finalPrice.toFixed(2),
        stock: Math.floor(Math.random() * 25) + 5,
        isAvailable: "yes",
        rating: "4.5",
        reviewCount: 0,
        images: productImagesList,
        categoryId,
        brandId,
        isPopular: Math.random() > 0.85 ? "yes" : "no",
        isNew: "no",
      });
    }
  }

  console.log(`Inserting ${allInsertedProducts.length} products to database...`);
  const batchSize = 50;
  for (let i = 0; i < allInsertedProducts.length; i += batchSize) {
    const batch = allInsertedProducts.slice(i, i + batchSize);
    await db.insert(products).values(batch);
    console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(allInsertedProducts.length / batchSize)}`);
  }

  const existingReviews = await db.select().from(reviews);
  if (existingReviews.length === 0) {
    console.log("Seeding reviews...");
    const seededProducts = await db.select({ id: products.id }).from(products).limit(15);
    if (seededProducts.length > 0) {
      const reviewData = [
        { userName: "Eldar M.", rating: 5, comment: "блин эта штука ваще крутая я купил и не жалею работает кароч супер" },
        { userName: "Rashid K.", rating: 4, comment: "ну такое сибе но за свои деньги норм пойдет" },
        { userName: "Nigar A.", rating: 5, comment: "я не знаю че там пишут но мне зашло капец как удобно" },
      ];

      for (const prod of seededProducts) {
        for (const r of reviewData) {
          await db.insert(reviews).values({
            productId: prod.id,
            userId: 1,
            userName: r.userName,
            rating: r.rating,
            comment: r.comment
          });
        }
      }
    }
  }

  console.log("Database seeded successfully!");
  process.exit(0);
}

seedAll().catch(err => {
  console.error(err);
  process.exit(1);
});
