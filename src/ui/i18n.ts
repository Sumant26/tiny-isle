export type Language = 'en' | 'es' | 'fr' | 'ja' | 'de';

export interface Translations {
  readonly title: string;
  readonly day: string;
  readonly coins: string;
  readonly spring: string;
  readonly summer: string;
  readonly autumn: string;
  readonly tillSoil: string;
  readonly plantSeeds: string;
  readonly waterCrops: string;
  readonly harvest: string;
  readonly sleep: string;
  readonly shop: string;
  readonly journal: string;
  readonly cottage: string;
  readonly fishing: string;
  readonly achievements: string;
  readonly photoMode: string;
  readonly settings: string;
  readonly highContrast: string;
  readonly largeText: string;
  readonly colorblindMode: string;
  readonly newGame: string;
  readonly language: string;
  readonly volume: string;
  readonly music: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    title: 'Tiny Isle',
    day: 'Day',
    coins: 'Coins',
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn',
    tillSoil: 'Till soil',
    plantSeeds: 'Plant seeds',
    waterCrops: 'Water crops',
    harvest: 'Harvest',
    sleep: 'Sleep (End Day)',
    shop: 'Market Stand',
    journal: 'Island Journal',
    cottage: 'Cottage Kitchen',
    fishing: 'Pond Fishing',
    achievements: 'Achievements',
    photoMode: 'Photo Mode',
    settings: 'Settings',
    highContrast: 'High Contrast',
    largeText: 'Large Text',
    colorblindMode: 'Colorblind Markers',
    newGame: 'New Island',
    language: 'Language',
    volume: 'Sound Effects',
    music: 'Music & Ambience',
  },
  es: {
    title: 'Isla Pequeña',
    day: 'Día',
    coins: 'Monedas',
    spring: 'Primavera',
    summer: 'Verano',
    autumn: 'Otoño',
    tillSoil: 'Arar tierra',
    plantSeeds: 'Plantar semillas',
    waterCrops: 'Regar cultivos',
    harvest: 'Cosechar',
    sleep: 'Dormir',
    shop: 'Mercado',
    journal: 'Diario de la Isla',
    cottage: 'Cocina de Cabaña',
    fishing: 'Pesca en Estanque',
    achievements: 'Logros',
    photoMode: 'Modo Foto',
    settings: 'Ajustes',
    highContrast: 'Alto Contraste',
    largeText: 'Texto Grande',
    colorblindMode: 'Modo Daltónico',
    newGame: 'Nueva Isla',
    language: 'Idioma',
    volume: 'Efectos de Sonido',
    music: 'Música y Ambiente',
  },
  fr: {
    title: 'Île Minuscule',
    day: 'Jour',
    coins: 'Pièces',
    spring: 'Printemps',
    summer: 'Été',
    autumn: 'Automne',
    tillSoil: 'Labourer',
    plantSeeds: 'Planter graines',
    waterCrops: 'Arroser',
    harvest: 'Récolter',
    sleep: 'Dormir',
    shop: 'Marché',
    journal: 'Journal de l’Île',
    cottage: 'Cuisine du Chalet',
    fishing: 'Pêche à l’Étang',
    achievements: 'Succès',
    photoMode: 'Mode Photo',
    settings: 'Paramètres',
    highContrast: 'Contraste Élevé',
    largeText: 'Grand Texte',
    colorblindMode: 'Mode Daltonien',
    newGame: 'Nouvelle Île',
    language: 'Langue',
    volume: 'Effets Sonores',
    music: 'Musique & Ambiance',
  },
  ja: {
    title: 'ちいさな島',
    day: '日目',
    coins: 'コイン',
    spring: '春',
    summer: '夏',
    autumn: '秋',
    tillSoil: '土を耕す',
    plantSeeds: '種をまく',
    waterCrops: '水をあげる',
    harvest: '収穫する',
    sleep: 'おやすみ',
    shop: '市場',
    journal: '島の航海日誌',
    cottage: 'コテージの台所',
    fishing: '池で釣り',
    achievements: '実績',
    photoMode: 'フォトモード',
    settings: '設定',
    highContrast: 'ハイコントラスト',
    largeText: '大きな文字',
    colorblindMode: '色覚サポート',
    newGame: '新しい島',
    language: '言語',
    volume: '効果音',
    music: 'BGMと環境音',
  },
  de: {
    title: 'Kleine Insel',
    day: 'Tag',
    coins: 'Münzen',
    spring: 'Frühling',
    summer: 'Sommer',
    autumn: 'Herbst',
    tillSoil: 'Boden pflügen',
    plantSeeds: 'Samen säen',
    waterCrops: 'Pflanzen gießen',
    harvest: 'Ernten',
    sleep: 'Schlafen',
    shop: 'Marktstand',
    journal: 'Insel-Tagebuch',
    cottage: 'Küche im Häuschen',
    fishing: 'Teichangeln',
    achievements: 'Erfolge',
    photoMode: 'Fotomodus',
    settings: 'Einstellungen',
    highContrast: 'Hoher Kontrast',
    largeText: 'Große Schrift',
    colorblindMode: 'Farbenblind-Hilfe',
    newGame: 'Neue Insel',
    language: 'Sprache',
    volume: 'Soundeffekte',
    music: 'Musik & Atmosphäre',
  },
};

export const t = (lang = 'en'): Translations => {
  return (TRANSLATIONS as Record<string, Translations>)[lang] ?? TRANSLATIONS.en;
};
