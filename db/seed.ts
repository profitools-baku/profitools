import { getDb } from "../api/queries/connection";
import {
  categories,
  brands,
  products,
  reviews,
} from "./schema";

const db = getDb();

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);

const productImages = (slug: string, sku: string) => {
  return [];
};

async function seed() {
  const existingCats = await db.select().from(categories);
  const existingBrands = await db.select().from(brands);
  const existingProducts = await db.select().from(products);



  if (existingCats.length === 0) {
    console.log("Seeding categories...");
    await db.insert(categories).values([
      { slug: "elektroinstrumenty", nameAz: "Elektroalətlər", nameRu: "Электроинструменты", nameEn: "Power Tools", image: null, sortOrder: 1 },
      { slug: "ruchnye-instrumenty", nameAz: "Əl alətləri", nameRu: "Ручные инструменты", nameEn: "Hand Tools", image: null, sortOrder: 2 },
      { slug: "izmeritelnye-instrumenty", nameAz: "Ölçü alətləri", nameRu: "Измерительные инструменты", nameEn: "Measuring Tools", image: null, sortOrder: 3 },
      { slug: "markirovka", nameAz: "Markerləşdirmə", nameRu: "Маркировка", nameEn: "Marking Tools", image: null, sortOrder: 4 },
      { slug: "elektrika-kabel", nameAz: "Elektrik və kabel alətləri", nameRu: "Электрика и кабель", nameEn: "Electrical & Cable Tools", image: null, sortOrder: 5 },
      { slug: "osnastka-rashodniki", nameAz: "Osnastka və sərf materialları", nameRu: "Оснастка и расходники", nameEn: "Accessories & Consumables", image: null, sortOrder: 6 },
    ]);
  }

  if (existingBrands.length === 0) {
    console.log("Seeding brands...");
    await db.insert(brands).values([
      { slug: "proxxon", name: "PROXXON", logoUrl: "/images/brands/proxxon.png", sortOrder: 1 },
      { slug: "pica", name: "PicA", logoUrl: "/images/brands/pica.png", sortOrder: 2 },
      { slug: "hardy", name: "HARDY", logoUrl: "/images/brands/hardy.png", sortOrder: 3 },
      { slug: "jokari", name: "JOKARI", logoUrl: "/images/brands/jokari.png", sortOrder: 4 },
      { slug: "stabila", name: "STABILA", logoUrl: "/images/brands/stabila.png", sortOrder: 5 },
    ]);
  }

  if (existingProducts.length === 0) {
    const cats = await db.select().from(categories);
    const brs = await db.select().from(brands);
    const catMap = new Map(cats.map(c => [c.slug, c.id]));
    const brandMap = new Map(brs.map(b => [b.slug, b.id]));

    const PROXXON_PRODUCTS = [
      { sku: "PX-28472", nameAz: "Uzadılmış şlif maşını LHW", nameRu: "Удлиненная шлифмашина LHW", nameEn: "Long-neck grinder LHW", price: "307.53", oldPrice: "345.00", cat: "elektroinstrumenty", stock: 12, pop: true, specs: { "Güc/Watt": "100W", "Sürət": "5000-20000 dəq" } },
      { sku: "PX-28481", nameAz: "Vibroyeyin dəzgah FBS 240/E (Qraver)", nameRu: "Виброизношенная фурнитура (гравер) FBS 240/E", nameEn: "Engraving machine FBS 240/E", price: "219.69", oldPrice: "249.90", cat: "elektroinstrumenty", stock: 8, pop: true, specs: { "Güc/Watt": "100W", "Sürət": "5000-20000 dəq" } },
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

    const PICA_PRODUCTS = [
      { sku: "PC-4040", nameAz: "Pica Fine Dry Longlife üçün boz qələm dəsti, sərtlik H", nameRu: "Набор серых грифелей для Pica Fine Dry Longlife, твердость H", nameEn: "Gray refill set Pica Fine Dry Longlife hardness H", price: "11.27", cat: "markirovka", stock: 40, specs: { "Sərtlik": "H", "Rəng": "Boz" } },
      { sku: "PC-53440", nameAz: "PICAClassic 534 MEDIUM incə daimi marker dəsti", nameRu: "Набор тонких перманентных маркеров PICAClassic 534 MEDIUM", nameEn: "PICAClassic 534 MEDIUM fine permanent marker set", price: "15.22", cat: "markirovka", stock: 25, specs: { "Ucluğu": "MEDIUM", "Rəng": "Qara" } },
      { sku: "PC-99044", nameAz: "Picavior Permanent marker üçün əvəzetmə stərjni", nameRu: "Сменные грифели для маркера Picavior Permanent", nameEn: "Refill leads for Picavior Permanent marker", price: "11.06", cat: "markirovka", stock: 30, specs: { "Rəng": "Qara" } },
      { sku: "PC-15046", nameAz: "Picain Ink Deep Hole Marker dərin dəlik markeri", nameRu: "Маркер для глубоких отверстий Picain Ink Deep Hole Marker", nameEn: "Deep hole marker Picain Ink", price: "16.68", cat: "markirovka", stock: 20, pop: true, specs: { "Ucluğu": "Uzun ucluq", "Rəng": "Qara" } },
      { sku: "PC-30407", nameAz: "Picay Longlife tikinti karandaşı dəsti stərjni ilə 30407", nameRu: "Набор строительный карандаш Pica Longlife с грифелями 30407", nameEn: "Pica Longlife construction pencil set with refills 30407", price: "45.22", cat: "markirovka", stock: 15, specs: { "Rəng": "Göy/Sarı", "Stərjni sayı": "4 ədəd" } },
      { sku: "PC-30405", nameAz: "Picay Longlife tikinti karandaşı dəsti stərjni ilə 30405", nameRu: "Набор строительный карандаш Pica Longlife с грифелями 30405", nameEn: "Pica Longlife construction pencil set with refills 30405", price: "46.54", cat: "markirovka", stock: 12, specs: { "Rəng": "Qırmızı/Boz", "Stərjni sayı": "4 ədəd" } },
      { sku: "PC-52240", nameAz: "PICAClassic Classic 522 Instant-White daimi marker", nameRu: "Маркер перманентный PICAClassic Classic 522 Instant-White", nameEn: "PICAClassic 522 Instant-White permanent marker", price: "4.49", cat: "markirovka", stock: 50, specs: { "Rəng": "Ağ" } },
      { sku: "PC-52840", nameAz: "PICAClassic Classic 528 XXL daimi marker", nameRu: "Маркер перманентный PICAClassic Classic 528 XXL", nameEn: "PICAClassic 528 XXL permanent marker", price: "11.21", cat: "markirovka", stock: 22, specs: { "Rəng": "Qara", "Ucluğu": "XXL" } },
      { sku: "PC-28044", nameAz: "PICAClassic Eco mumlu işarələmə kreydası", nameRu: "Мелок разметочный восковый PICAClassic Eco", nameEn: "PICAClassic Eco wax marking chalk", price: "18.50", cat: "markirovka", stock: 18, specs: { "Rəng": "Yaşıl/Sarı", "Material": "Mumlu" } },
      { sku: "PC-30404", nameAz: "Picay Longlife tikinti karandaşı dəsti stərjni ilə 30404", nameRu: "Набор строительный карандаш Pica Longlife с грифелями 30404", nameEn: "Pica Longlife construction pencil set with refills 30404", price: "45.63", cat: "markirovka", stock: 14, specs: { "Rəng": "Qara/Sarı", "Stərjni sayı": "4 ədəd" } },
      { sku: "PC-30403", nameAz: "Picay Longlife tikinti karandaşı dəsti stərjni ilə 30403", nameRu: "Набор строительный карандаш Pica Longlife с грифелями 30403", nameEn: "Pica Longlife construction pencil set with refills 30403", price: "49.80", cat: "markirovka", stock: 10, specs: { "Rəng": "Ağ/Mavi", "Stərjni sayı": "4 ədəd" } },
    ];

    const HARDY_PRODUCTS = [
      { sku: "HD-8080", nameAz: "Çoxfunksiyalı spatula-skrebok 80 mm", nameRu: "Шпатель-скребок многофункциональный 80 мм", nameEn: "Multifunctional spatula-scraper 80 mm", price: "7.38", cat: "osnastka-rashodniki", stock: 60, specs: { "En": "80 mm", "Material": "Paslanmayan polad" } },
    ];

    const JOKARI_PRODUCTS = [
      { sku: "JK-62000", nameAz: "ESD-PLUS mikro izolyasiya soyucu", nameRu: "Микроприспособление для снятия изоляции ESD-PLUS", nameEn: "ESD-PLUS micro wire stripper", price: "118.70", cat: "elektrika-kabel", stock: 8, pop: true, specs: { "Diaqon": "0.1-0.8 mm" } },
      { sku: "JK-62001", nameAz: "PWS-PLUS mikro izolyasiya soyucu", nameRu: "Микроприспособление для снятия изоляции PWS-PLUS", nameEn: "PWS-PLUS micro wire stripper", price: "66.07", cat: "elektrika-kabel", stock: 10, specs: { "Diaqon": "0.5-1.2 mm" } },
      { sku: "JK-61900", nameAz: "Allrounder izolyasiya soyucu", nameRu: "Съемник изоляции Allrounder", nameEn: "Allrounder wire stripper", price: "52.35", cat: "elektrika-kabel", stock: 14, specs: { "Diaqon": "0.2-6 mm²" } },
      { sku: "JK-61600", nameAz: "Super 4 PLUS / PRO izolyasiya soyucu üçün əvəzetmə bıçaqlar", nameRu: "Сменные ножи для съемника изоляции Super 4 PLUS / PRO", nameEn: "Replacement blades for Super 4 PLUS / PRO", price: "32.82", cat: "elektrika-kabel", stock: 20, specs: { "Say": "2 ədəd" } },
      { sku: "JK-61670", nameAz: "System 4-70 kabel bıçağı üçün qarmaq əvəzetmə bıçağı", nameRu: "Запасное крючкообразное лезвие для ножа System 4-70", nameEn: "Spare hook blade for System 4-70", price: "32.72", cat: "elektrika-kabel", stock: 18, specs: { "Tip": "Qarmaq bıçaq" } },
      { sku: "JK-61680", nameAz: "Kabel bıçağı üçün TIN örtüklü əvəzetmə bıçaq", nameRu: "Сменное лезвие с TIN-покрытием для ножа для разделки кабеля", nameEn: "TIN-coated replacement blade for cable knife", price: "6.17", cat: "elektrika-kabel", stock: 45, specs: { "Örtük": "TIN" } },
      { sku: "JK-61160", nameAz: "Standart №16 kabel bıçağı", nameRu: "Нож для разделки кабеля Standart №16", nameEn: "Cable knife Standart №16", price: "24.71", cat: "elektrika-kabel", stock: 16, specs: { "Ölçü": "№16" } },
      { sku: "JK-20050", nameAz: "Super 4 Plus avtomatik izolyasiya soyucu kəlbətin", nameRu: "Автоматические клещи для снятия изоляции Super 4 Plus", nameEn: "Super 4 Plus automatic wire stripping pliers", price: "46.18", oldPrice: "55.00", cat: "elektrika-kabel", stock: 12, pop: true, specs: { "Diaqon": "0.2-6 mm²" } },
      { sku: "JK-62005", nameAz: "Bütün mikro alətlər üçün əvəzetmə bıçaq", nameRu: "Запасной сменной нож для всех видов микроприспособлений", nameEn: "Spare blade for all micro tools", price: "32.82", cat: "elektrika-kabel", stock: 22, specs: {} },
      { sku: "JK-61400", nameAz: "Strip №14 izolyasiya soyucu", nameRu: "Съемник изоляции Strip №14", nameEn: "Wire stripper Strip №14", price: "60.02", cat: "elektrika-kabel", stock: 9, specs: { "Diaqon": "0.5-4 mm²" } },
      { sku: "JK-20150", nameAz: "Super 4 PRO avtomatik izolyasiya soyucu kəlbətin", nameRu: "Автоматические клещи для снятия изоляции Super 4 PRO", nameEn: "Super 4 PRO automatic wire stripping pliers", price: "55.56", oldPrice: "65.00", cat: "elektrika-kabel", stock: 8, specs: { "Diaqon": "0.08-6 mm²" } },
      { sku: "JK-64000", nameAz: "Locator Box vstavka dəsti", nameRu: "Набор вставок Locator Box", nameEn: "Locator Box insert set", price: "30.51", cat: "elektrika-kabel", stock: 15, specs: { "Parçalar": "7 ədəd" } },
      { sku: "JK-64001", nameAz: "SW11 açar (TOP-Coax Plus üçün)", nameRu: "Ключ SW11 (для TOP-Coax Plus)", nameEn: "Key SW11 (for TOP-Coax Plus)", price: "5.67", cat: "elektrika-kabel", stock: 30, specs: { "Ölçü": "SW11" } },
      { sku: "JK-61640", nameAz: "Secura 2K izolyasiya soyucu üçün əvəzetmə bıçaqlar", nameRu: "Сменные ножи для съемника изоляции Secura 2K", nameEn: "Replacement blades for Secura 2K", price: "39.64", cat: "elektrika-kabel", stock: 14, specs: { "Say": "2 ədəd" } },
      { sku: "JK-61150", nameAz: "Secura №16 kabel bıçağı", nameRu: "Нож для разделки кабеля Secura №16", nameEn: "Cable knife Secura №16", price: "28.19", cat: "elektrika-kabel", stock: 13, specs: { "Ölçü": "№16" } },
      { sku: "JK-61681", nameAz: "Kabel bıçağı üçün TIN örtüklü əvəzetmə bıçaq dəsti (3 əd.)", nameRu: "Набор сменных лезвий (3 шт) с TIN-покрытием для ножа", nameEn: "TIN-coated replacement blade set (3 pcs)", price: "18.54", cat: "elektrika-kabel", stock: 20, specs: { "Say": "3 ədəd", "Örtük": "TIN" } },
      { sku: "JK-61500", nameAz: "Secura №15 izolyasiya soyucu", nameRu: "Съемник изоляции Secura №15", nameEn: "Wire stripper Secura №15", price: "64.89", cat: "elektrika-kabel", stock: 7, specs: { "Diaqon": "0.2-10 mm²" } },
      { sku: "JK-20350", nameAz: "Secura 2K avtomatik izolyasiya soyucu kəlbətin", nameRu: "Автоматические клещи для снятия изоляции Secura 2K", nameEn: "Secura 2K automatic wire stripping pliers", price: "82.23", cat: "elektrika-kabel", stock: 6, pop: true, specs: { "Diaqon": "0.08-10 mm²" } },
      { sku: "JK-61620", nameAz: "FKZ izolyasiya soyucu üçün əvəzetmə bıçaqlar", nameRu: "Сменные ножи для съемника изоляции FKZ", nameEn: "Replacement blades for FKZ stripper", price: "90.81", cat: "elektrika-kabel", stock: 5, specs: {} },
      { sku: "JK-61690", nameAz: "Kabel bıçağı üçün xarici bıçaq qoruyucu başlıq", nameRu: "Защитный колпачок для наружного лезвия ножа", nameEn: "Protective cap for cable knife blade", price: "3.71", cat: "elektrika-kabel", stock: 60, specs: { "Material": "Plastik" } },
    ];

    const STABILA_PRODUCTS = [
      { sku: "ST-02190", nameAz: "Səviyyə Type 70 P-2-2 qeyri-bərabər elementlər üçün", nameRu: "Строительный уровень для неровных элементов Type 70 P-2-2", nameEn: "Level for uneven elements Type 70 P-2-2", price: "186.75", cat: "izmeritelnye-instrumenty", stock: 7, specs: { "Uzunluq": "300 mm" } },
      { sku: "ST-02870", nameAz: "Səviyyə Type 70 MAS 80 sm məsafə işarələmə üçün", nameRu: "Строительный уровень для разметки расстояний Type 70 MAS 80 см", nameEn: "Level for distance marking Type 70 MAS 80 cm", price: "65.89", cat: "izmeritelnye-instrumenty", stock: 12, specs: { "Uzunluq": "80 cm" } },
      { sku: "ST-02465", nameAz: "Elektrikçi səviyyəsi Type 70 electric", nameRu: "Строительный уровень электрика Type 70 electric", nameEn: "Electrician level Type 70 electric", price: "95.67", cat: "izmeritelnye-instrumenty", stock: 10, specs: { "Uzunluq": "250 mm" } },
      { sku: "ST-16050", nameAz: "Type 80 M Installation maqnitli santexnika səviyyəsi", nameRu: "Строительный магнитный уровень сантехника Type 80 M Installation", nameEn: "Magnetic plumber level Type 80 M Installation", price: "186.38", cat: "izmeritelnye-instrumenty", stock: 5, pop: true, specs: { "Uzunluq": "200 mm" } },
      { sku: "ST-19171", nameAz: "Daşçı səviyyəsi Type 96-2 K 81 sm", nameRu: "Строительный уровень каменщика Type 96-2 K 81 см", nameEn: "Mason level Type 96-2 K 81 cm", price: "160.16", cat: "izmeritelnye-instrumenty", stock: 6, specs: { "Uzunluq": "81 cm" } },
      { sku: "ST-19272", nameAz: "Daşçı səviyyəsi Type 196-2 K 122 sm", nameRu: "Строительный уровень каменщика Type 196-2 K 122 см", nameEn: "Mason level Type 196-2 K 122 cm", price: "293.37", oldPrice: "349.99", cat: "izmeritelnye-instrumenty", stock: 4, pop: true, specs: { "Uzunluq": "122 cm" } },
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

    const ALL_PRODUCTS = [...PROXXON_PRODUCTS, ...PICA_PRODUCTS, ...HARDY_PRODUCTS, ...JOKARI_PRODUCTS, ...STABILA_PRODUCTS];
    console.log(`Seeding ${ALL_PRODUCTS.length} products...`);

    for (const p of ALL_PRODUCTS as any[]) {
      const sl = slugify(p.nameEn);
      const brandSlug = p.sku.startsWith("PX") ? "proxxon" : p.sku.startsWith("PC") ? "pica" : p.sku.startsWith("HD") ? "hardy" : p.sku.startsWith("JK") ? "jokari" : "stabila";
      await db.insert(products).values({
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
        oldPrice: p.oldPrice,
        stock: p.stock,
        isAvailable: "yes",
        rating: "4.5",
        reviewCount: 0,
        images: productImages(sl, p.sku),
        categoryId: catMap.get(p.cat)!,
        brandId: brandMap.get(brandSlug)!,
        isPopular: p.pop ? "yes" : "no",
        isNew: "no",
      });
    }

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

  console.log("Seed complete!");
}

seed().catch(console.error);
