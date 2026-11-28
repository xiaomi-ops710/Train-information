'use strict';
/* ============================================================
 * 運行情報 / Service Information  —  Step 2
 * Settings / I18n / MASTER(路線マスター) / Providers / MapView /
 * Zoom / Detail(E235系ポップアップ) / Search / UI
 * ============================================================ */

/* ---------- 会社区分 ---------- */
const COMPANIES = [
  { id: 'all',     ja: 'すべて',     en: 'All' },
  { id: 'JR',      ja: 'JR東日本',   en: 'JR East' },
  { id: 'Metro',   ja: '東京メトロ', en: 'Tokyo Metro' },
  { id: 'Toei',    ja: '都営地下鉄', en: 'Toei Subway' },
  { id: 'Private', ja: '私鉄',       en: 'Private Railways' }
];

/* ---------- 運行状態（rank が小さいほど上位に固定表示） ---------- */
const STATUS = {
  suspend: { rank: 1, ja: '運転見合わせ', en: 'Suspended' },
  delay:   { rank: 2, ja: '遅延',         en: 'Delay' },
  partial: { rank: 2, ja: '一部運休',     en: 'Partial Suspension' },
  normal:  { rank: 3, ja: '平常運転',     en: 'Normal Service' }
};

/* ---------- 文言 ---------- */
const STRINGS = {
  title:     { ja: '運行情報',     en: 'Service Information' },
  search:    { ja: '路線・駅検索', en: 'Search Lines & Stations' },
  settings:  { ja: '設定',         en: 'Settings' },
  bilingual: { ja: '日英併記',     en: 'Bilingual display' },
  demo:      { ja: 'デモモード',   en: 'Demo mode' },
  delay:     { ja: '遅延・一部運休', en: 'Delay / Partial' },
  suspend:   { ja: '運転見合わせ', en: 'Suspended' },
  ph:        { ja: '路線名・路線記号・会社名で検索', en: 'Line name, symbol or company' },
  none:      { ja: '該当する路線がありません。', en: 'No matching lines.' },
  normalTxt: { ja: '現在、平常通り運転しています。', en: '' },
  syncTime:  { ja: '最終同期時刻', en: 'Last sync' },
  syncState: { ja: '取得ステータス', en: 'Sync status' },
  focus:     { ja: '異常のみ強調', en: 'Alerts Only' },
  autoLocate:{ ja: '起動時に現在地へ自動移動', en: 'Auto-locate on launch' },
  ticker:    { ja: '下部ニュースティッカー', en: 'News ticker' },
  chime:     { ja: '新規遅延発生時のチャイム通知', en: 'Chime on new delays' },
  official:  { ja: '公式詳細ページを開く', en: 'Open official page' },
  myLines:   { ja: 'マイ路線', en: 'My Lines' },
  myStation: { ja: 'マイ駅', en: 'My Stations' },
  cycle:     { ja: '自動切替', en: 'Auto Cycle' },
  history:   { ja: '履歴ログ', en: 'History' },
  uptime:    { ja: '正常稼働率', en: 'Uptime' },
  route:     { ja: 'マイルート', en: 'My Routes' },
  dual:      { ja: '2画面LCD', en: 'Dual LCD' }
};

/* ---------- 路線マスターデータ（41路線） ----------
 * [路線名, 英語名, 会社区分, 路線記号, ラインカラー, [事業者名, Operator], [路線図SVG内のグループID前方一致...]] */
const JR = ['JR東日本', 'JR East'], TM = ['東京メトロ', 'Tokyo Metro'], TO = ['都営地下鉄', 'Toei Subway'];
const TQ = ['東急電鉄', 'Tokyu'], OD = ['小田急電鉄', 'Odakyu'], KE = ['京王電鉄', 'Keio'], SE = ['西武鉄道', 'Seibu'], TB = ['東武鉄道', 'Tobu'],
      KS = ['京成電鉄', 'Keisei'], KQ = ['京浜急行電鉄', 'Keikyu'], SO = ['相模鉄道', 'Sotetsu'];
/* 路線マスターデータ（全89路線）
 * [路線名, 英語名, 会社区分, 路線記号, ラインカラー, [事業者名, Operator], [路線図SVG内のグループID前方一致...], [振替・代替路線名...], 主要経由駅・方面テキスト(directionText)]
 * 路線図SVGに描画が無い路線は svg を空配列にしてあります（一覧・検索・運行状況の表示には使えます） */
const MASTER_RAW = [
  /* ---- JR東日本（30路線） ---- */
  ['山手線', 'Yamanote Line', 'JR', 'JY', '#80c241', JR, ['jr-yamanote'], ['京浜東北線', '埼京線', '湘南新宿ライン', '中央線快速', '丸ノ内線', '銀座線'], '東京・品川・渋谷・新宿・上野'],
  ['京浜東北線', 'Keihin-Tohoku Line', 'JR', 'JK', '#00b2e5', JR, ['jr-keihintohoku'], ['山手線', '東海道線', '上野東京ライン', '京急本線'], '大宮・上野・東京・品川・横浜'],
  ['根岸線', 'Negishi Line', 'JR', 'JK', '#00b2e5', JR, ['jr-negishi'], ['横浜線', '横浜市営地下鉄ブルーライン', '京浜東北線'], '横浜・桜木町・関内・磯子・大船'],
  ['中央線快速', 'Chuo Line (Rapid)', 'JR', 'JC', '#f15a22', JR, ['jr-chuo'], ['中央・総武各駅停車', '丸ノ内線', '東西線', '京王線', '西武新宿線'], '東京・御茶ノ水・新宿・立川・高尾'],
  ['中央・総武各駅停車', 'Chuo-Sobu Line (Local)', 'JR', 'JB', '#ffd400', JR, ['jr-sobulocal'], ['中央線快速', '総武快速線', '東西線', '都営新宿線', '都営大江戸線'], '三鷹・新宿・秋葉原・錦糸町・千葉'],
  ['中央本線', 'Chuo Main Line', 'JR', 'CO', '#007ac0', JR, [], ['中央線快速', '青梅線', '京王線', '横浜線'], '立川・八王子・高尾・大月・甲府'],
  ['東海道線', 'Tokaido Line', 'JR', 'JT', '#f68b1e', JR, ['jr-tokaido'], ['京浜東北線', '横須賀線', '上野東京ライン', '京急本線', '東急東横線', '相鉄本線'], '東京・品川・横浜・大船・小田原'],
  ['横須賀線', 'Yokosuka Line', 'JR', 'JO', '#0068b7', JR, ['jr-yokosuka'], ['東海道線', '湘南新宿ライン', '京急本線', '横浜線'], '東京・品川・横浜・鎌倉・久里浜'],
  ['総武快速線', 'Sobu Line (Rapid)', 'JR', 'JO', '#0068b7', JR, ['jr-soburapid'], ['中央・総武各駅停車', '京葉線', '京成本線', '都営新宿線', '東西線'], '東京・錦糸町・船橋・津田沼・千葉'],
  ['総武本線', 'Sobu Main Line', 'JR', 'JO', '#ffd400', JR, [], ['総武快速線', '京成本線', '京葉線', '外房線'], '千葉・佐倉・成東・八日市場・銚子'],
  ['湘南新宿ライン', 'Shonan-Shinjuku Line', 'JR', 'JS', '#e21f26', JR, ['jr-shonanshinjuku'], ['山手線', '埼京線', '上野東京ライン', '東海道線', '横須賀線'], '大宮・池袋・新宿・渋谷・横浜'],
  ['上野東京ライン', 'Ueno-Tokyo Line', 'JR', 'JU', '#f68b1e', JR, ['jr-uenotokyo'], ['東海道線', '京浜東北線', '宇都宮線', '高崎線', '山手線'], '宇都宮・高崎・大宮・上野・東京'],
  ['宇都宮線', 'Utsunomiya Line', 'JR', 'JU', '#f68b1e', JR, ['jr-utsunomiya'], ['高崎線', '京浜東北線', '埼京線', '東武アーバンパークライン', '埼玉高速鉄道線'], '上野・赤羽・大宮・小山・宇都宮'],
  ['高崎線', 'Takasaki Line', 'JR', 'JU', '#f68b1e', JR, ['jr-takasaki'], ['宇都宮線', '埼京線', '京浜東北線', '東武東上線'], '上野・赤羽・大宮・熊谷・高崎'],
  ['埼京線', 'Saikyo Line', 'JR', 'JA', '#00ac9a', JR, ['jr-saikyo'], ['山手線', '湘南新宿ライン', '有楽町線', '副都心線', '東武東上線', '川越線'], '大宮・赤羽・池袋・新宿・大崎'],
  ['川越線', 'Kawagoe Line', 'JR', 'JA', '#00ac9a', JR, ['jr-kawagoe'], ['埼京線', '東武東上線', '西武池袋線', '高崎線'], '大宮・日進・川越・高麗川'],
  ['常磐線快速', 'Joban Line (Rapid)', 'JR', 'JJ', '#00b261', JR, ['jr-joban_'], ['常磐線各駅停車', '千代田線', 'つくばエクスプレス', '山手線', '京浜東北線'], '品川・上野・北千住・松戸・取手'],
  ['常磐線各駅停車', 'Joban Line (Local)', 'JR', 'JL', '#808080', JR, ['jr-jobanlocal'], ['常磐線快速', '千代田線', 'つくばエクスプレス', '武蔵野線'], '綾瀬・松戸・新松戸・柏・取手'],
  ['常磐線', 'Joban Line', 'JR', 'JJ', '#0068b7', JR, [], ['常磐線快速', 'つくばエクスプレス', '東武アーバンパークライン'], '上野・取手・土浦・水戸・いわき'],
  ['京葉線', 'Keiyo Line', 'JR', 'JE', '#c9242f', JR, ['jr-keiyo'], ['総武快速線', '中央・総武各駅停車', '東西線', '武蔵野線', '東葉高速線'], '東京・新木場・舞浜・海浜幕張・蘇我'],
  ['武蔵野線', 'Musashino Line', 'JR', 'JM', '#f15a22', JR, ['jr-musashino'], ['京葉線', '南武線', '埼京線', '東武アーバンパークライン', '常磐線各駅停車'], '府中本町・南浦和・新松戸・西船橋'],
  ['南武線', 'Nambu Line', 'JR', 'JN', '#ffd400', JR, ['jr-nanbu'], ['東急田園都市線', '東急東横線', '京王線', '小田急小田原線', '横浜線'], '川崎・武蔵小杉・登戸・府中本町・立川'],
  ['横浜線', 'Yokohama Line', 'JR', 'JH', '#80c241', JR, ['jr-yokohama'], ['東急東横線', '相鉄本線', '小田急小田原線', '京王相模原線', '南武線'], '東神奈川・新横浜・町田・橋本・八王子'],
  ['相模線', 'Sagami Line', 'JR', 'JI', '#009793', JR, ['jr-sagami'], ['横浜線', '小田急小田原線', '小田急江ノ島線', '東海道線'], '茅ヶ崎・寒川・厚木・海老名・橋本'],
  ['青梅線', 'Ome Line', 'JR', 'JC', '#f15a22', JR, ['jr-ome'], ['中央線快速', '西武池袋線', '西武新宿線', '五日市線'], '立川・拝島・河辺・青梅・奥多摩'],
  ['五日市線', 'Itsukaichi Line', 'JR', 'JC', '#f15a22', JR, ['jr-itsukaichi'], ['青梅線', '中央線快速', '西武拝島線'], '拝島・東秋留・秋川・武蔵五日市'],
  ['外房線', 'Sotobo Line', 'JR', 'JO', '#db4028', JR, ['jr-sotobo'], ['内房線', '総武本線', '京成千葉線', '京成本線'], '千葉・蘇我・茂原・勝浦・安房鴨川'],
  ['内房線', 'Uchibo Line', 'JR', 'JO', '#00b2e5', JR, ['jr-uchibo'], ['外房線', '京葉線', '京成千葉線'], '千葉・蘇我・木更津・君津・館山'],
  ['成田線', 'Narita Line', 'JR', 'JO', '#00b261', JR, ['jr-narita'], ['京成本線', '成田スカイアクセス線', '総武本線'], '佐倉・成田・成田空港・我孫子・銚子'],
  ['鶴見線', 'Tsurumi Line', 'JR', 'JI', '#ffd400', JR, ['jr-tsurumi'], ['京浜東北線', '京急本線', '京急空港線'], '鶴見・浅野・海芝浦・武蔵白石・扇町'],

  /* ---- 東京メトロ（9路線） ---- */
  ['銀座線', 'Ginza Line', 'Metro', 'G', '#ff9500', TM, ['tokyometro-ginza'], ['山手線', '丸ノ内線', '都営浅草線', '半蔵門線'], '渋谷・表参道・銀座・上野・浅草'],
  ['丸ノ内線', 'Marunouchi Line', 'Metro', 'M', '#f62e36', TM, ['tokyometro-marunouchi'], ['中央線快速', '山手線', '東西線', '都営新宿線'], '池袋・東京・銀座・新宿・荻窪'],
  ['日比谷線', 'Hibiya Line', 'Metro', 'H', '#b5b5ac', TM, ['tokyometro-hibiya'], ['山手線', '銀座線', '都営大江戸線', '京浜東北線'], '中目黒・六本木・銀座・上野・北千住'],
  ['東西線', 'Tozai Line', 'Metro', 'T', '#009bbf', TM, ['tokyometro-tozai'], ['中央・総武各駅停車', '中央線快速', '総武快速線', '都営新宿線', '京葉線'], '中野・飯田橋・大手町・浦安・西船橋'],
  ['千代田線', 'Chiyoda Line', 'Metro', 'C', '#00bb85', TM, ['tokyometro-chiyoda'], ['常磐線各駅停車', '小田急小田原線', '山手線', '半蔵門線'], '代々木上原・表参道・大手町・北千住・綾瀬'],
  ['有楽町線', 'Yurakucho Line', 'Metro', 'Y', '#c1a470', TM, ['tokyometro-yurakucho'], ['西武有楽町線', '副都心線', '東武東上線', '山手線'], '和光市・池袋・有楽町・豊洲・新木場'],
  ['半蔵門線', 'Hanzomon Line', 'Metro', 'Z', '#8f76d6', TM, ['tokyometro-hanzomon'], ['銀座線', '東急田園都市線', '都営新宿線', '都営大江戸線'], '渋谷・表参道・大手町・錦糸町・押上'],
  ['南北線', 'Namboku Line', 'Metro', 'N', '#00ac9b', TM, ['tokyometro-nanboku'], ['都営三田線', '埼玉高速鉄道線', '山手線', '東急目黒線'], '目黒・溜池山王・飯田橋・駒込・赤羽岩淵'],
  ['副都心線', 'Fukutoshin Line', 'Metro', 'F', '#9c5e31', TM, ['tokyometro-fukutoshin'], ['山手線', '埼京線', '有楽町線', '東急東横線', '西武池袋線'], '和光市・小竹向原・池袋・新宿三丁目・渋谷'],

  /* ---- 都営地下鉄・東京都交通局（5路線） ---- */
  ['都営浅草線', 'Toei Asakusa Line', 'Toei', 'A', '#ec6e65', TO, ['toei-asakusa'], ['銀座線', '京急本線', '京成押上線', '山手線'], '西馬込・泉岳寺・新橋・浅草・押上'],
  ['都営三田線', 'Toei Mita Line', 'Toei', 'I', '#0067b0', TO, ['toei-mita'], ['南北線', '東急目黒線', '山手線', '東西線'], '目黒・日比谷・大手町・巣鴨・西高島平'],
  ['都営新宿線', 'Toei Shinjuku Line', 'Toei', 'S', '#b0bf1e', TO, ['toei-shinjuku'], ['中央・総武各駅停車', '京王線', '東西線', '丸ノ内線'], '新宿・市ヶ谷・神保町・大島・本八幡'],
  ['都営大江戸線', 'Toei Oedo Line', 'Toei', 'E', '#ce045b', TO, ['toei-oedo'], ['山手線', '中央・総武各駅停車', '丸ノ内線', '西武池袋線'], '都庁前・六本木・大門・両国・光が丘'],
  ['日暮里・舎人ライナー', 'Nippori-Toneri Liner', 'Toei', 'NT', '#ff69b4', TO, ['toei-nipporitoneriliner'], ['山手線', '京浜東北線', '常磐線各駅停車', '千代田線'], '日暮里・西日暮里・江北・見沼代親水公園'],

  /* ---- 大手私鉄・準大手・新交通・モノレール（45路線） ---- */
  ['東急東横線', 'Tokyu Toyoko Line', 'Private', 'TY', '#da0442', TQ, ['tokyu-toyoko'], ['東急目黒線', '山手線', '副都心線', 'みなとみらい線', '東海道線'], '渋谷・自由が丘・武蔵小杉・横浜'],
  ['東急目黒線', 'Tokyu Meguro Line', 'Private', 'MG', '#009cd2', TQ, ['tokyu-meguro'], ['東急東横線', '南北線', '都営三田線', '山手線'], '目黒・大岡山・田園調布・武蔵小杉・日吉'],
  ['東急田園都市線', 'Tokyu Den-en-toshi Line', 'Private', 'DT', '#20a288', TQ, ['tokyu-denentoshi'], ['東急大井町線', '半蔵門線', '南武線', '小田急小田原線'], '渋谷・二子玉川・溝の口・長津田・中央林間'],
  ['東急大井町線', 'Tokyu Oimachi Line', 'Private', 'OM', '#f18c43', TQ, ['tokyu-oimachi'], ['東急田園都市線', '東急目黒線', '京浜東北線', '南武線'], '大井町・大岡山・自由が丘・二子玉川・溝の口'],
  ['東急池上線', 'Tokyu Ikegami Line', 'Private', 'IK', '#ee86a7', TQ, ['tokyu-ikegami'], ['東急多摩川線', '京浜東北線', '東急目黒線'], '五反田・旗の台・雪が谷大塚・池上・蒲田'],
  ['東急多摩川線', 'Tokyu Tamagawa Line', 'Private', 'TM', '#ae0378', TQ, ['tokyu-tamagawa'], ['東急池上線', '京浜東北線', '京急空港線'], '多摩川・下丸子・武蔵新田・蒲田'],
  ['東急新横浜線', 'Tokyu Shin-Yokohama Line', 'Private', 'SH', '#890d84', TQ, [], ['相鉄新横浜線', '横浜線', '横浜市営地下鉄ブルーライン', '東急東横線'], '日吉・新綱島・新横浜'],
  ['小田急小田原線', 'Odakyu Odawara Line', 'Private', 'OH', '#007ed5', OD, ['odakyu-odawara'], ['京王線', '中央線快速', '東急田園都市線', '千代田線', '東海道線'], '新宿・下北沢・登戸・町田・小田原'],
  ['小田急江ノ島線', 'Odakyu Enoshima Line', 'Private', 'OE', '#007ed5', OD, ['odakyu-enoshima'], ['小田急小田原線', '東海道線', '相鉄本線', '相模線'], '相模大野・大和・湘南台・藤沢・片瀬江ノ島'],
  ['小田急多摩線', 'Odakyu Tama Line', 'Private', 'OT', '#007ed5', OD, ['odakyu-tama'], ['小田急小田原線', '京王相模原線', '横浜線'], '新百合ヶ丘・小田急永山・多摩センター・唐木田'],
  ['京王線', 'Keio Line', 'Private', 'KO', '#dd0077', KE, ['keio-keio', 'keio-new'], ['小田急小田原線', '中央線快速', '都営新宿線', '京王相模原線'], '新宿・明大前・調布・府中・京王八王子'],
  ['京王相模原線', 'Keio Sagamihara Line', 'Private', 'KO', '#dd0077', KE, ['keio-sagamihara'], ['京王線', '小田急多摩線', '横浜線', '多摩都市モノレール'], '調布・京王永山・多摩センター・南大沢・橋本'],
  ['京王井の頭線', 'Keio Inokashira Line', 'Private', 'IN', '#1d2088', KE, ['keio-inokashira'], ['中央線快速', '小田急小田原線', '東急田園都市線', '山手線'], '渋谷・下北沢・明大前・永福町・吉祥寺'],
  ['西武池袋線', 'Seibu Ikebukuro Line', 'Private', 'SI', '#ff6600', SE, ['seibu-ikebukuro'], ['東武東上線', '山手線', '都営大江戸線', '西武有楽町線', '中央線快速'], '池袋・練馬・石神井公園・所沢・飯能'],
  ['西武新宿線', 'Seibu Shinjuku Line', 'Private', 'SS', '#0099cc', SE, ['seibu-shinjuku'], ['中央線快速', '都営新宿線', '西武拝島線', '山手線'], '西武新宿・高田馬場・田無・所沢・本川越'],
  ['西武拝島線', 'Seibu Haijima Line', 'Private', 'SS', '#0099cc', SE, ['seibu-haijima'], ['西武新宿線', '中央線快速', '青梅線'], '小平・萩山・東大和市・玉川上水・拝島'],
  ['西武有楽町線', 'Seibu Yurakucho Line', 'Private', 'SI', '#ff6600', SE, ['seibu-yurakucho'], ['西武池袋線', '有楽町線', '副都心線'], '小竹向原・新桜台・練馬'],
  ['東武東上線', 'Tobu Tojo Line', 'Private', 'TJ', '#004098', TB, ['tobu-tojo'], ['西武池袋線', '川越線', '埼京線', '有楽町線', '副都心線'], '池袋・和光市・朝霞台・川越・小川町'],
  ['東武スカイツリーライン', 'Tobu Skytree Line', 'Private', 'TS', '#0067c0', TB, ['tobu-skytree'], ['つくばエクスプレス', '日比谷線', '半蔵門線', '京成本線', '常磐線各駅停車'], '浅草・押上・北千住・新越谷・春日部'],
  ['東武伊勢崎線', 'Tobu Isesaki Line', 'Private', 'TI', '#e60012', TB, ['tobu-isezaki'], ['東武スカイツリーライン', '高崎線', '宇都宮線'], '東武動物公園・久喜・館林・太田・伊勢崎'],
  ['東武日光線', 'Tobu Nikko Line', 'Private', 'TN', '#f39800', TB, [], ['東武スカイツリーライン', '宇都宮線'], '東武動物公園・栗橋・栃木・下今市・東武日光'],
  ['東武アーバンパークライン', 'Tobu Urban Park Line', 'Private', 'TD', '#00a7e3', TB, ['tobu-noda'], ['武蔵野線', '宇都宮線', '総武快速線', '京成本線'], '大宮・春日部・柏・新鎌ヶ谷・船橋'],
  ['京成本線', 'Keisei Main Line', 'Private', 'KS', '#005aaa', KS, ['keisei-keisei'], ['総武快速線', '中央・総武各駅停車', '東西線', '都営浅草線', '北総線'], '京成上野・日暮里・青砥・京成津田沼・成田空港'],
  ['京成押上線', 'Keisei Oshiage Line', 'Private', 'KS', '#005aaa', KS, ['keisei-oshiage'], ['都営浅草線', '京成本線', '半蔵門線'], '押上・京成曳舟・八広・青砥・京成高砂'],
  ['京成千葉線', 'Keisei Chiba Line', 'Private', 'KS', '#005aaa', KS, ['keisei-chiba'], ['京成本線', '総武快速線', '京葉線'], '京成津田沼・幕張本郷・京成千葉・千葉中央'],
  ['成田スカイアクセス線', 'Narita Sky Access Line', 'Private', 'KS', '#ff6600', KS, ['keisei-naritaskyaccess'], ['京成本線', '成田線', '総武快速線'], '京成高砂・東松戸・新鎌ヶ谷・成田空港'],
  ['新京成線', 'Shin-Keisei Line', 'Private', 'SL', '#ef59a1', ['新京成電鉄', 'Shin-Keisei'], ['shinkeisei-shinkeisei'], ['京成本線', '総武快速線', '中央・総武各駅停車', '京葉線', '武蔵野線'], '松戸・新鎌ヶ谷・北習志野・京成津田沼'],
  ['北総線', 'Hokuso Line', 'Private', 'HS', '#00a0e9', ['北総鉄道', 'Hokuso Railway'], [], ['京成本線', '都営浅草線', '京成押上線', '総武快速線'], '京成高砂・東松戸・新鎌ヶ谷・印旛日本医大'],
  ['東葉高速線', 'Toyo Rapid Line', 'Private', 'TR', '#3fb035', ['東葉高速鉄道', 'Toyo Rapid Railway'], ['toyokosoku'], ['東西線', '総武快速線', '京葉線', '武蔵野線'], '西船橋・北習志野・八千代緑が丘・東葉勝田台'],
  ['京急本線', 'Keikyu Main Line', 'Private', 'KK', '#e50012', KQ, ['keikyu-keikyu'], ['東海道線', '京浜東北線', '都営浅草線', '東急東横線', '横須賀線'], '泉岳寺・品川・京急蒲田・横浜・金沢文庫・浦賀'],
  ['京急空港線', 'Keikyu Airport Line', 'Private', 'KK', '#e50012', KQ, ['keikyu-airport'], ['東京モノレール', 'りんかい線', '京急本線', '京浜東北線'], '京急蒲田・糀谷・穴守稲荷・羽田空港'],
  ['京急逗子線', 'Keikyu Zushi Line', 'Private', 'KK', '#e50012', KQ, ['keikyu-zushi'], ['京急本線', '横須賀線', '東海道線'], '金沢八景・六浦・神武寺・逗子・葉山'],
  ['京急久里浜線', 'Keikyu Kurihama Line', 'Private', 'KK', '#e50012', KQ, ['keikyu-kurihama'], ['京急本線', '横須賀線', '東海道線'], '堀ノ内・北久里浜・京急久里浜・三浦海岸・三崎口'],
  ['相鉄本線', 'Sotetsu Main Line', 'Private', 'SO', '#003893', SO, ['soutetsu-main'], ['東海道線', '横須賀線', '湘南新宿ライン', '東急東横線', '横浜線'], '横浜・西谷・二俣川・大和・海老名'],
  ['相鉄いずみ野線', 'Sotetsu Izumino Line', 'Private', 'SO', '#003893', SO, ['soutetsu-izumino'], ['相鉄本線', '横浜市営地下鉄ブルーライン', '小田急江ノ島線'], '二俣川・緑園都市・いずみ野・湘南台'],
  ['相鉄新横浜線', 'Sotetsu Shin-Yokohama Line', 'Private', 'SO', '#003893', SO, ['soutetsu-shinyokohama'], ['相鉄本線', '東急新横浜線', '横浜線', '横浜市営地下鉄ブルーライン'], '西谷・羽沢横浜国大・新横浜'],
  ['つくばエクスプレス', 'Tsukuba Express', 'Private', 'TX', '#003399', ['首都圏新都市鉄道', 'MIR'], ['tsukubaexpress'], ['東武スカイツリーライン', '常磐線快速', '常磐線各駅停車', '日比谷線', '山手線'], '秋葉原・北千住・流山おおたかの森・守谷・つくば'],
  ['りんかい線', 'Rinkai Line', 'Private', 'R', '#00418e', ['東京臨海高速鉄道', 'TWR'], ['rinkai'], ['東京モノレール', '山手線', '埼京線', 'ゆりかもめ'], '新木場・国際展示場・東京テレポート・大井町・大崎'],
  ['ゆりかもめ', 'Yurikamome', 'Private', 'U', '#0075c2', ['ゆりかもめ', 'Yurikamome'], ['yurikamome'], ['りんかい線', '山手線', '都営浅草線', '京葉線'], '新橋・お台場海浜公園・国際展示場・有明・豊洲'],
  ['東京モノレール', 'Tokyo Monorail', 'Private', 'MO', '#00a0e9', ['東京モノレール', 'Tokyo Monorail'], ['jr-tokyomonorail'], ['京急空港線', '山手線', 'りんかい線', '京浜東北線'], '浜松町・天王洲アイル・流通センター・羽田空港'],
  ['多摩都市モノレール', 'Tama Toshi Monorail', 'Private', 'TT', '#ff6600', ['多摩都市モノレール', 'Tama Monorail'], ['tamatoshimonorail'], ['京王相模原線', '中央線快速', '西武拝島線', '青梅線'], '上北台・玉川上水・立川北・高幡不動・多摩センター'],
  ['みなとみらい線', 'Minatomirai Line', 'Private', 'MM', '#003e92', ['横浜高速鉄道', 'Yokohama Minatomirai Railway'], ['minatomirai'], ['東急東横線', '京浜東北線', '根岸線', '横浜市営地下鉄ブルーライン'], '横浜・みなとみらい・馬車道・元町・中華街'],
  ['横浜市営地下鉄ブルーライン', 'Yokohama Subway Blue Line', 'Private', 'B', '#0068b7', ['横浜市交通局', 'Yokohama Municipal Subway'], ['yokohama-blue'], ['根岸線', '京急本線', '相鉄本線', '横浜市営地下鉄グリーンライン', '東急新横浜線'], 'あざみ野・新横浜・横浜・上大岡・戸塚・湘南台'],
  ['横浜市営地下鉄グリーンライン', 'Yokohama Subway Green Line', 'Private', 'G', '#00a040', ['横浜市交通局', 'Yokohama Municipal Subway'], ['yokohama-green'], ['横浜線', '東急田園都市線', '横浜市営地下鉄ブルーライン'], '中山・センター南・センター北・日吉'],
  ['埼玉高速鉄道線', 'Saitama Rapid Railway Line', 'Private', 'SR', '#0080c6', ['埼玉高速鉄道', 'Saitama Railway'], ['saitamakosoku'], ['南北線', '都営三田線', '京浜東北線', '宇都宮線'], '赤羽岩淵・川口元郷・鳩ヶ谷・東川口・浦和美園']
];
const LINES = MASTER_RAW.map(([ja, en, co, code, color, op, svg, alt, directionText]) => ({
  ja, en, co, code, color, op: { ja: op[0], en: op[1] }, svg, alt: alt || [],
  directionText: directionText || '', direction: directionText || ''
}));
const lineByName = name => LINES.find(l => l.ja === name);

/* ---------- 設定（localStorage） ---------- */
const Settings = {
  KEY: 'tokyo-lcd:settings',
  data: { demo: false, bilingual: true, autoLocate: false, chime: false, speech: false, autoCycle: false, ticker: true, tickerSpeed: 'normal',
          interval: 180000, lcdOverlay: false, carNo: 10, initFilter: 'all', beep: true, nightDim: false, topOffset: 42, chimeType: 'std', dual: false, hud: false, blink: true, miniTags: true, nightWatch: false, focus: false, lcdTheme: 'auto' }, // 保存値があればそちらを優先（load）
  load() { try { Object.assign(this.data, JSON.parse(localStorage.getItem(this.KEY) || '{}')); } catch (_) {} },
  set(k, v) {
    this.data[k] = v;
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (_) {}
    document.dispatchEvent(new CustomEvent('settings:change', { detail: { key: k, value: v } }));
  },
  get(k) { return this.data[k]; }
};

/* ---------- 日英表記 ---------- */
const I18n = {
  bi: () => Settings.get('bilingual'),
  label(key) {
    const s = STRINGS[key] || { ja: key, en: '' };
    return this.bi() && s.en ? `${s.ja}<small class="en">${s.en}</small>` : s.ja;
  },
  text(key) { const s = STRINGS[key]; return this.bi() && s.en ? `${s.ja} / ${s.en}` : s.ja; },
  apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n, s = STRINGS[k];
      if (k === 'title') el.innerHTML = this.bi() ? `${s.ja}<span class="en">/ ${s.en}</span>` : s.ja;
      else if (el.tagName === 'H2') el.innerHTML = this.bi() ? `${s.ja}<span class="en">${s.en}</span>` : s.ja;
      else el.innerHTML = this.label(k);
    });
    document.getElementById('searchInput').placeholder = this.text('ph');
  }
};

/* ---------- 運行状況ストア（異常データ防御＋オフライン用キャッシュ保持） ---------- */
const Store = {
  CACHE_KEY: 'tokyo-lcd:lastStatus',
  data: {},
  of(name) {
    const d = this.data && this.data[name];
    if (!d || typeof d !== 'object' || !STATUS[d.status]) return { status: 'normal', detail: '' };
    return { status: d.status, detail: typeof d.detail === 'string' ? d.detail : '', url: d.url || '' };
  },
  rank(name) { return STATUS[this.of(name).status].rank; },
  saveCache(data) {
    try { localStorage.setItem(this.CACHE_KEY, JSON.stringify({ time: Date.now(), data })); } catch (_) {}
  },
  loadCache() {
    try {
      const raw = JSON.parse(localStorage.getItem(this.CACHE_KEY) || 'null');
      if (!raw || typeof raw.data !== 'object' || !raw.time) return null;
      const safe = {};
      Object.entries(raw.data).forEach(([k, v]) => {
        if (lineByName(k) && v && STATUS[v.status]) safe[k] = { status: v.status, detail: String(v.detail || '').slice(0, 300), url: String(v.url || '') };
      });
      return { time: Number(raw.time) || Date.now(), data: safe };
    } catch (_) { return null; }
  }
};

/* ---------- 運行データ提供元 ----------
 * 共通IF: fetchStatus() → { 路線名: { status:'normal'|'delay'|'partial'|'suspend', detail?:string } } */
const DemoProvider = {
  async fetchStatus() {
    const d = new Date(Date.now() + 40 * 60000);
    const eta = `${String(d.getHours()).padStart(2, '0')}時${String(Math.ceil(d.getMinutes() / 5) * 5 % 60).padStart(2, '0')}分頃`;
    return {
      '山手線':     { status: 'delay',   detail: '山手線は、混雑および車内安全確認の影響で、内・外回り電車の一部列車に遅れがでています。' },
      '中央線快速': { status: 'suspend', detail: `中央線快速は、新宿駅での人身事故の影響で、東京〜高尾駅間の上下線で運転を見合わせています。運転再開は${eta}を見込んでいます。振替輸送を実施しています。` },
      '東西線':     { status: 'delay',   detail: '東西線は、信号確認の影響で、上下線の一部列車に遅れがでています。振替輸送を実施しています。' },
      '東急東横線': { status: 'delay',   detail: '東急東横線は、車両点検の影響で、上下線の一部列車に遅れがでています。' },
      '京急本線':   { status: 'partial', detail: '京急本線は、踏切安全確認の影響で、品川〜横浜駅間の一部列車を運休しています。振替輸送を実施しています。' }
    };
  }
};

/* ---------- Yahoo!路線情報（関東エリア）の取得・解析 ----------
 * ・fetchViaProxy：自作Cloudflare Workersプロキシ経由で生のHTMLを取得（10秒タイムアウト制御）
 * ・parse：<table>の<tr>・リスト構造・JSON埋め込みの複数経路で抽出し一部HTML構造変化にも耐える
 * ・平常運転以外の路線は個別詳細ページを並列取得（Promise.allSettledで一部失敗時も継続） */
const YAHOO_ORIGIN = 'https://transit.yahoo.co.jp';
const YAHOO_URL = YAHOO_ORIGIN + '/diainfo/area/4';
const AUTO_REFRESH_MS = 180000;   // 自動更新間隔：3分
const FETCH_TIMEOUT_MS = 10000;   // 通信タイムアウト：10秒
const DETAIL_TIMEOUT_MS = 6500;   // 個別詳細タイムアウト：6.5秒
const PROXY_BASE = 'https://train-info-proxy.xiongdayiteng4.workers.dev/';
const proxyUrl = targetUrl => `${PROXY_BASE}?url=${encodeURIComponent(targetUrl)}`;
const clean = t => String(t || '').replace(/\s+/g, ' ').trim();

/* 自作Workersプロキシ経由で targetUrl のHTML文字列を取得。10秒タイムアウト・オフライン時は明確なErrorを投げる */
async function fetchViaProxy(targetUrl, validate = html => /diainfo|運行情報|路線/.test(html), timeoutMs = FETCH_TIMEOUT_MS) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('オフライン状態です（ネットワーク未接続）');
  }
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(proxyUrl(targetUrl), { signal: ctl.signal, cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    if (!html || html.length < 300 || !validate(html)) throw new Error('不正な応答（HTML構造変化または空応答）');
    return { html, proxy: 'Cloudflare Workers' };
  } catch (e) {
    const why = e && e.name === 'AbortError' ? `タイムアウト(${Math.round(timeoutMs / 1000)}秒)`
      : (e && e.message === 'Failed to fetch' ? '通信失敗(接続不可/オフライン)' : (e && e.message ? e.message : String(e)));
    console.warn('[Yahoo] proxy failed →', why);
    throw new Error(why);
  } finally { clearTimeout(timer); }
}

const Yahoo = {
  report: null,
  /* マスター路線名 → 追加の別表記（canon後に比較するので括弧・中黒・全半角の差は気にしなくてよい） */
  ALIAS_EXTRA: {
    '京浜東北線': ['京浜東北・根岸線'],
    '根岸線': ['京浜東北・根岸線'],
    '中央線快速': ['中央本線快速', '中央線(快速電車)'],
    '中央・総武各駅停車': ['中央・総武線(各駅停車)', '中央･総武線(各停)', '総武線(各駅停車)', '中央線(各駅停車)', '中央・総武線'],
    '東海道線': ['東海道本線'],
    '総武快速線': ['総武線(快速)', '総武本線(快速)', '横須賀・総武快速線'],
    '埼京線': ['埼京・川越線', '埼京線・川越線'],
    '常磐線快速': ['常磐線(快速)'],
    '常磐線各駅停車': ['常磐線(各駅停車)', '常磐線(各停)', '常磐緩行線'],
    '丸ノ内線': ['丸の内線'],
    '東急東横線': ['東横線'],
    '東急田園都市線': ['田園都市線'],
    '小田急小田原線': ['小田急線', '小田急電鉄小田原線'],
    '京王線': ['京王電鉄京王線'],
    '東武東上線': ['東上線'],
    '東武スカイツリーライン': ['東武スカイツリーライン(伊勢崎線)', 'スカイツリーライン'],
    '多摩都市モノレール': ['多摩都市モノレール線'],
    '横浜市営地下鉄ブルーライン': ['ブルーライン', '横浜市営地下鉄1・3号線'],
    '横浜市営地下鉄グリーンライン': ['グリーンライン', '横浜市営地下鉄4号線'],
    'ゆりかもめ': ['東京臨海新交通臨海線'],
    '東京モノレール': ['東京モノレール羽田空港線'],
    '京成本線': ['京成電鉄京成本線'],
    '京急本線': ['京急線', '京浜急行本線', '京急電鉄本線'],
    '相鉄本線': ['相模鉄道本線', '相鉄線']
  },
  /* 「湘南新宿ライン高海」のように末尾が付く表記は前方一致で拾う */
  PREFIX: [
    ['湘南新宿ライン', ['湘南新宿ライン']],
    ['上野東京ライン', ['上野東京ライン']],
    ['東武スカイツリーライン', ['東武スカイツリーライン']]
  ],
  /* 会社名プレフィックス（長いものを先に）。外して会社区分つきで再照合する */
  PREFIXES: [['JR東日本', 'JR'], ['JR', 'JR'], ['東京メトロ', 'Metro'], ['東京地下鉄', 'Metro'], ['地下鉄', 'Metro'], ['都営地下鉄', 'Toei'], ['都営', 'Toei']],
  lookup: null,

  /* 正規化：全半角統一 → [..]の区間表記を削除 → 区間表記を含む(..)を削除 → 「各停」を「各駅停車」に
   *        → 「本線」を「線」に → 残りの括弧(種別:快速など)は中身を残して記号だけ除去 → 中黒(・/･)・空白を除去 */
  canon(s) {
    return String(s).normalize('NFKC')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\([^)]*[~〜\-－間方面][^)]*\)/g, '')
      .replace(/各停/g, '各駅停車')
      .replace(/本線/g, '線')
      .replace(/[()\[\]【】「」]/g, '')
      .replace(/[\s・･·]/g, '')
      .toLowerCase();
  },
  /* 予備の正規化：種別を含む括弧の中身も全部削除（例：「山手線(内回り)」→「山手線」） */
  canonLoose(s) {
    return this.canon(String(s).normalize('NFKC').replace(/\([^)]*\)/g, ''));
  },
  buildLookup() {
    this.lookup = new Map();
    const add = (key, name) => {
      const c = this.canon(key), arr = this.lookup.get(c) || [];
      if (!arr.includes(name)) arr.push(name);
      this.lookup.set(c, arr);
    };
    LINES.forEach(L => {
      const gen = { JR: ['JR' + L.ja, 'JR東日本' + L.ja], Metro: ['東京メトロ' + L.ja, '地下鉄' + L.ja],
                    Toei: [L.ja.replace(/^都営/, ''), '都営' + L.ja.replace(/^都営/, ''), '都営地下鉄' + L.ja.replace(/^都営/, '')], Private: [] }[L.co];
      [L.ja, ...gen, ...(this.ALIAS_EXTRA[L.ja] || [])].forEach(k => add(k, L.ja));
    });
  },
  /* Yahoo側の路線名 → マスター路線名の配列（該当なしは空配列） */
  match(name) {
    if (!this.lookup) this.buildLookup();
    for (const c of [this.canon(name), this.canonLoose(name)]) {
      if (this.lookup.has(c)) return this.lookup.get(c);
      const hit = this.PREFIX.find(([p]) => c.startsWith(this.canon(p)));
      if (hit) return hit[1];
      for (const [p, co] of this.PREFIXES) { // 会社名プレフィックスを外し、同じ会社区分の路線だけに絞って照合
        const cp = this.canon(p);
        if (!c.startsWith(cp)) continue;
        const names = (this.lookup.get(c.slice(cp.length)) || []).filter(n => lineByName(n).co === co);
        if (names.length) return names;
      }
    }
    return [];
  },
  /* 状況テキスト → 内部ステータス（判定不能は null） */
  statusOf(t) {
    t = String(t || '');
    if (/見合わせ|運転中止|不通/.test(t)) return 'suspend';
    if (/運休|運転取りやめ/.test(t)) return 'partial';
    if (/遅延|遅れ|運転状況|ダイヤ乱れ|運転変更|交通障害|運転再開|その他/.test(t)) return 'delay';
    if (/平常/.test(t)) return 'normal';
    return null;
  },

  isLineHref(h) { return /\/diainfo\/[^/?#]+/.test(h || '') && !/\/diainfo\/area/.test(h); },
  toUrl(h) { try { return new URL(h, YAHOO_ORIGIN).href; } catch (_) { return YAHOO_ORIGIN + h; } },
  /* 主：すべての<table>の<tr>から、/diainfo/ のリンクを含む行を拾う */
  rowsFromTables(doc) {
    const out = [];
    doc.querySelectorAll('table tr').forEach(tr => {
      const a = [...tr.querySelectorAll('a[href]')].find(x => this.isLineHref(x.getAttribute('href')));
      if (!a) return;
      const name = clean(a.textContent), url = this.toUrl(a.getAttribute('href'));
      if (name) out.push({ name, url, row: tr });
    });
    return out;
  },
  /* 予備：テーブルでない構造（li/dl/article/div等）のとき */
  rowsFromLinks(doc) {
    const out = [], seen = new Set();
    doc.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!this.isLineHref(href)) return;
      const name = clean(a.textContent), url = this.toUrl(href);
      if (!name || seen.has(url)) return;
      let row = a.closest('li,dl,article,section,div') || a.parentElement;
      if (row && row.querySelectorAll && row.querySelectorAll('a[href*="/diainfo/"]').length > 1) row = a.parentElement || a;
      if (!row) return;
      seen.add(url); out.push({ name, url, row });
    });
    return out;
  },
  /* さらに予備：Next.js等の埋め込みJSON（__NEXT_DATA__）から路線情報を抽出 */
  rowsFromJson(doc) {
    const out = [];
    const sc = doc.getElementById('__NEXT_DATA__');
    if (!sc || !sc.textContent) return out;
    try {
      const walk = node => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) { node.forEach(walk); return; }
        const name = clean(node.railName || node.lineName || node.name || '');
        const rawSt = clean(node.status || node.diainfo || node.trouble || '');
        const detail = clean(node.detail || node.message || node.summary || '');
        const status = this.statusOf(rawSt) || this.statusOf(detail);
        if (name && status && this.match(name).length) {
          out.push({ name, url: node.url ? this.toUrl(node.url) : YAHOO_URL, status, detail });
        }
        Object.values(node).forEach(walk);
      };
      walk(JSON.parse(sc.textContent));
    } catch (_) {}
    return out;
  },

  /* HTML → [{ name, url, status, detail }]（HTML一部変更時にも例外で止めない） */
  parse(html) {
    let doc;
    try { doc = new DOMParser().parseFromString(String(html || ''), 'text/html'); } catch (_) { return []; }
    let rows = this.rowsFromTables(doc);
    if (!rows.length) rows = this.rowsFromLinks(doc);
    const out = [];
    rows.forEach(({ name, url, row }) => {
      if (!row) return;
      const text = clean(row.textContent);
      const cells = [...row.querySelectorAll('td,dd,span,p')].map(c => clean(c.textContent)).filter(Boolean);
      const lab = row.querySelector('[class*="trouble" i],[class*="status" i],[class*="label" i],[class*="icn" i]');
      const rest = clean(text.replace(name, ''));
      const status = this.statusOf(lab && lab.textContent) || this.statusOf(cells[1]) || this.statusOf(rest);
      if (!status) return;
      let detail = cells.length >= 3 ? cells[cells.length - 1] : rest;
      detail = clean(detail.replace(/^(平常運転|遅延|運転見合わせ|見合わせ|運転状況|交通障害情報?|運転再開|一部運休|運休|その他)\s*/, ''));
      out.push({ name, url, status, detail });
    });
    if (!out.length) out.push(...this.rowsFromJson(doc));
    return this.merge(out);
  },
  /* 上部「現在運行情報のある路線」と下部の会社別一覧で重複した路線を1件に統合（異常状態・詳細が長い方を優先） */
  merge(list) {
    const score = x => (x.status !== 'normal' ? 1000 : 0) + (x.detail || '').length;
    const m = new Map();
    list.forEach(e => {
      const key = (e.url || e.name).split(/[?#]/)[0], cur = m.get(key);
      if (!cur || score(e) > score(cur)) m.set(key, e);
    });
    return [...m.values()];
  },
  /* 個別詳細ページ → 運行情報本文（複数セレクタ＋OGPメタのフォールバック対応） */
  parseDetail(html) {
    let doc;
    try { doc = new DOMParser().parseFromString(String(html || ''), 'text/html'); } catch (_) { return ''; }
    const box = doc.querySelector('#mdServiceStatus, [id*="ServiceStatus" i], [class*="ServiceStatus" i], [class*="serviceStatus" i]');
    if (box) {
      const ps = [...box.querySelectorAll('p,dd')].map(p => clean(p.textContent)).filter(Boolean);
      const text = ps.length ? ps.join('　') : clean(box.textContent);
      if (text) return text.length > 260 ? text.slice(0, 259) + '…' : text;
    }
    const og = doc.querySelector('meta[property="og:description"], meta[name="description"]');
    const desc = clean(og && og.getAttribute('content'));
    if (desc && /運転|遅れ|遅延|見合わせ|運休|平常/.test(desc)) return desc.slice(0, 260);
    return '';
  },

  /* [{name,url,status,detail}] → { マスター路線名: {status, detail, url} }（同一路線は最も重い状態を採用） */
  toStatuses(entries) {
    const byLine = {};
    entries.forEach(e => {
      const names = this.match(e.name);
      if (!names.length) console.debug('[Yahoo] unmatched:', e.name, e.status);
      names.forEach(n => (byLine[n] = byLine[n] || []).push(e));
    });
    const result = {};
    Object.entries(byLine).forEach(([n, list]) => {
      list.sort((a, b) => STATUS[a.status].rank - STATUS[b.status].rank);
      if (list[0].status === 'normal') return;
      const abn = list.filter(x => x.status !== 'normal');
      const details = [...new Set(abn.map(x => x.detail).filter(Boolean))];
      result[n] = { status: list[0].status, detail: details.join('　'), url: list[0].url };
    });
    return result;
  },

  async fetchStatus() {
    const { html, proxy } = await fetchViaProxy(YAHOO_URL, h => /diainfo|運行情報|路線/.test(h), FETCH_TIMEOUT_MS);
    const entries = this.parse(html);
    if (!entries.length && !/情報はありません|平常|運行情報/.test(html))
      throw new Error('解析エラー：路線データを抽出できませんでした');
    const result = this.toStatuses(entries);
    const matched = new Set(entries.flatMap(e => this.match(e.name))).size;

    /* 平常運転以外の路線は個別詳細ページを並列取得（一部がタイムアウト・失敗しても全体は止めない） */
    let detailOk = 0, detailFail = 0;
    await Promise.allSettled(Object.values(result).map(async r => {
      if (!r.url) return;
      try {
        const { html: dh } = await fetchViaProxy(r.url, h => h.length > 300, DETAIL_TIMEOUT_MS);
        const t = this.parseDetail(dh);
        if (t) { r.detail = t; detailOk++; } else detailFail++;
      } catch (e) { detailFail++; console.warn('[Yahoo] detail fallback:', r.url, e && e.message); }
    }));
    this.report = { rows: entries.length, matched, abnormal: Object.keys(result).length, proxy, detailOk, detailFail };
    return result;
  },
  reportText() {
    const r = this.report; if (!r) return '同期成功';
    return `同期成功：${r.rows}路線取得（アプリ対象${r.matched}路線・異常${r.abnormal}路線／経由 ${r.proxy}）` +
      (r.detailFail ? `／詳細本文の取得に失敗 ${r.detailFail}件（一覧の文言を表示）` : '');
  }
};
const LiveProvider = { fetchStatus: () => Yahoo.fetchStatus() };
const Providers = { get current() { return Settings.get('demo') ? DemoProvider : LiveProvider; } };

/* ---------- 路線図（SVG読込・タグ付け・状態反映・絞り込み） ---------- */
const SVGNS = 'http://www.w3.org/2000/svg';
/* ---------- 異常路線の発光レイヤー ----------
 * 巨大な路線図SVGに filter や SVG内アニメーションをかけるとデスクトップで毎フレーム再ラスタライズが走って激重になるため、
 * 異常路線の「太いストローク」を別の軽量SVG(オーバーレイ)に描き、そのSVG要素の opacity(0.35⇔1.0) だけをCSSで点滅させる
 * （opacityはGPUコンポジットだけで済み、路線図本体は再描画されない）。viewBoxは本体と常に同期する。 */
/* ---------- 描画の連打対策：同じ種類の更新要求は1フレームに1回だけ実行 ---------- */
const Frame = {
  q: new Map(), raf: 0,
  once(key, fn) {
    this.q.set(key, fn);
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0; const jobs = [...this.q.values()]; this.q.clear();
      jobs.forEach(f => { try { f(); } catch (e) { console.error(e); } });
    });
  }
};
/* ---------- 固定レイヤー＆2画面16:9レイアウト計測 ---------- */
const Layout = {
  top: null, tk: null,
  init() {
    this.top = document.getElementById('topStack');
    this.tk = document.getElementById('ticker');
    const onChg = () => { this.upd(); if (Engine.canvas) Engine.scheduleResize(200); };
    if (window.ResizeObserver) { const ro = new ResizeObserver(onChg); ro.observe(this.top); ro.observe(this.tk); }
    this.upd();
  },
  upd() {
    const root = document.documentElement;
    const t = this.top ? this.top.getBoundingClientRect().height : 0;
    const b = (this.tk && !document.body.classList.contains('no-ticker')) ? this.tk.getBoundingClientRect().height : 0;
    root.style.setProperty('--top-h', t + 'px');
    root.style.setProperty('--bot-h', b + 'px');
    const isPhone = document.body.classList.contains('is-phone');
    const navEl = document.getElementById('phoneNav');
    const navH = (isPhone && navEl) ? navEl.getBoundingClientRect().height : 0;
    const dualBot = b + navH;
    root.style.setProperty('--dual-bot', dualBot + 'px');
    const W = window.innerWidth || 1, H = window.innerHeight || 1;
    const availW = Math.max(120, W), availH = Math.max(120, H - t - dualBot);
    const portrait = availH >= availW;
    document.body.classList.toggle('is-portrait', portrait);
    const dual = document.body.classList.contains('dual');
    Zoom.insT = dual ? 0 : t;
    Zoom.insB = dual ? 0 : b;
    if (dual) {
      if (!portrait) {
        const pillarW = 14, padX = 8, padY = 8;
        const slotW = Math.max(120, (availW - pillarW) / 2 - padX * 2);
        const slotH = Math.max(90, availH - padY * 2);
        const monW = Math.floor(Math.min(slotW, slotH * 16 / 9));
        const monH = Math.floor(monW * 9 / 16);
        const monTop = Math.round(t + (availH - monH) / 2);
        const halfW = (availW - pillarW) / 2;
        const mLeft = Math.round((halfW - monW) / 2);
        const pLeft = Math.round(halfW);
        const iLeft = Math.round(halfW + pillarW + (halfW - monW) / 2);
        root.style.setProperty('--dm-w', monW + 'px');
        root.style.setProperty('--dm-h', monH + 'px');
        root.style.setProperty('--dm-m-left', mLeft + 'px');
        root.style.setProperty('--dm-m-top', monTop + 'px');
        root.style.setProperty('--dm-i-left', iLeft + 'px');
        root.style.setProperty('--dm-i-top', monTop + 'px');
        root.style.setProperty('--dm-p-left', pLeft + 'px');
        root.style.setProperty('--dm-p-top', Math.max(Math.round(t), monTop - 8) + 'px');
        root.style.setProperty('--dm-p-w', pillarW + 'px');
        root.style.setProperty('--dm-p-h', Math.min(availH, monH + 16) + 'px');
      } else {
        const pillarH = isPhone ? 8 : 12, padX = isPhone ? 8 : 16, padY = isPhone ? 6 : 12;
        const slotW = Math.max(120, availW - padX * 2);
        const slotH = Math.max(80, (availH - pillarH) / 2 - padY * 2);
        const monW = Math.floor(Math.min(slotW, slotH * 16 / 9));
        const monH = Math.floor(monW * 9 / 16);
        const halfH = (availH - pillarH) / 2;
        const mLeft = Math.round((availW - monW) / 2);
        const mTop = Math.round(t + (halfH - monH) / 2);
        const pTop = Math.round(t + halfH);
        const iTop = Math.round(t + halfH + pillarH + (halfH - monH) / 2);
        root.style.setProperty('--dm-w', monW + 'px');
        root.style.setProperty('--dm-h', monH + 'px');
        root.style.setProperty('--dm-m-left', mLeft + 'px');
        root.style.setProperty('--dm-m-top', mTop + 'px');
        root.style.setProperty('--dm-i-left', mLeft + 'px');
        root.style.setProperty('--dm-i-top', iTop + 'px');
        root.style.setProperty('--dm-p-left', Math.max(0, mLeft - 4) + 'px');
        root.style.setProperty('--dm-p-top', pTop + 'px');
        root.style.setProperty('--dm-p-w', Math.min(availW, monW + 8) + 'px');
        root.style.setProperty('--dm-p-h', pillarH + 'px');
      }
    }
  }
};

/* ---------- 描画エンジン（オフスクリーンCanvas方式）----------
 * 基礎地図：tokyo_ja.svg を一度だけ BW 幅のオフスクリーンCanvasへラスタライズする（会社・異常強調の状態が変わったときだけ作り直す）
 * 精細化：静止後に表示範囲の周辺だけを高解像度で作り直し、基礎地図の上に重ねる（操作中は基礎地図を切り出して滑らかに動かす）
 * 重ね描き：異常路線の発光・ターミナル警告・振替ルート・現在地ピンは、表示用Canvasへ2Dで直接描く（DOMのSVG要素は作らない）
 */
const FX_COLORS = { delay: '#ffd23a', suspend: '#ff3030', alt: '#2f9bff' };
const TERMINALS = ['東京', '新宿', '渋谷', '池袋', '上野', '品川', '秋葉原', '横浜', '大宮', '千葉', '北千住'];

/* 路線図の「#lines > g > g[id]」を、実DOM・XMLのどちらでも同じ順番で取り出す */
const lineGroupsOf = root => {
  const lg = [...root.getElementsByTagName('g')].find(g => g.getAttribute('id') === 'lines');
  if (!lg) return [];
  return [...lg.children].filter(c => c.localName === 'g')
    .flatMap(c => [...c.children].filter(x => x.localName === 'g' && x.getAttribute('id')));
};
/* 図形要素 → SVGパス文字列（path / line / polyline / polygon） */
const pathD = el => {
  const t = el.localName;
  if (t === 'path') return el.getAttribute('d') || '';
  if (t === 'line') return `M${el.getAttribute('x1')} ${el.getAttribute('y1')}L${el.getAttribute('x2')} ${el.getAttribute('y2')}`;
  if (t === 'polyline' || t === 'polygon') {
    const p = (el.getAttribute('points') || '').trim().split(/[\s,]+/);
    let s = '';
    for (let i = 0; i + 1 < p.length; i += 2) s += (i ? 'L' : 'M') + p[i] + ' ' + p[i + 1];
    return s + (t === 'polygon' ? 'Z' : '');
  }
  return '';
};

/* ---------- 描画エンジン（iPad 第10世代 / RAM 4GB 向け：メモリを起動後に一定に保つ構成） ----------
 * 基礎地図：tokyo_ja.svg を起動時に1回だけ長辺 3072px のCanvasへラスタライズする。以後は作り直さない。
 * 表示：画面と同じCanvas1枚だけを使う。解像度倍率は1.5まで（それ以上は使わない）。
 * 切り替え：会社絞り込み・異常強調は、基礎地図を薄く描いた上に、対象の路線だけを2Dで描き直す（新しいCanvasは作らない）。
 * 静止中：描画要求がない限り何も描かない（requestAnimationFrame を回し続けない）。 */
const LINE_PATHS = [];   // 起動時に作る路線パスの索引（Path2D付き）。描画のたびに作り直さない

/* ---------- 描画エンジン（iPad 第10世代 / RAM 4GB 向け：Canvas枚数を固定し、メモリを一定に保つ） ----------
 * 基礎地図   ：長辺 3072px のCanvas（起動時に1回だけ作る。以後は作り直さない）
 * 高精細バッファ：表示Canvasと同じ画素数のCanvasを1枚だけ作り、以後は描き直して再利用する（新しいCanvasは作らない）
 * 高精細描画  ：静止後、表示範囲だけを元のSVGのviewBoxで画素ぴったりに描き直す（ベクター品質）。操作中は使わない
 * 重ね描き    ：異常路線・振替・現在地ピンは、表示Canvasへ2Dベクターとして描く
 * 静止中      ：描画要求がなければ何も描かない（rAFを回し続けない） */

/* SVG文字列のルート要素の属性（viewBox・width・height）だけを書き換える（解析しない＝軽い） */
const setRootAttrs = (xml, attrs) => {
  const i = xml.indexOf('<svg'), j = xml.indexOf('>', i);
  let tag = xml.slice(i, j + 1);
  Object.entries(attrs).forEach(([k, v]) => {
    const re = new RegExp(`\\s${k}="[^"]*"`);
    tag = re.test(tag) ? tag.replace(re, ` ${k}="${v}"`) : tag.replace(/>$/, ` ${k}="${v}">`);
  });
  return xml.slice(0, i) + tag + xml.slice(j + 1);
};

const Engine = {
  BW: 3072, VW: 7300, VH: 5400, HI_RATIO: 1.3, SETTLE_MS: 180, RESIZE_DEBOUNCE_MS: 200,
  stage: null, canvas: null, ctx: null, dpr: 1, W: 1, H: 1, ready: false,
  base: null, svgText: '',
  patch: null, patchCtx: null, patchView: null, patchValid: false,
  hiImg: null, hiUrl: null, hiGen: 0, hiTimer: 0, hiMs: 0, moving: false, resizeTimer: 0,
  state: { company: 'all', alert: false, detour: null },
  blinkOn: true, marker: null, lastDraw: 0, drawCount: 0, pin: null, raf: 0, drawnTags: [],

  init(stage, canvas) {
    this.stage = stage; this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.patch = document.createElement('canvas');           // 高精細バッファ：起動時の1回だけ作る
    this.patchCtx = this.patch.getContext('2d');
    this.hiImg = new Image();                                // 高精細描画用のImageも1つだけ
    this.applyResize();
    if (window.ResizeObserver) new ResizeObserver(() => this.scheduleResize(this.RESIZE_DEBOUNCE_MS)).observe(stage);
    window.addEventListener('resize', () => this.scheduleResize(this.RESIZE_DEBOUNCE_MS), { passive: true });
    window.addEventListener('orientationchange', () => this.scheduleResize(this.RESIZE_DEBOUNCE_MS), { passive: true });
  },
  /* 高精細バッファと保留中Blob URLを安全に無効化する */
  invalidateHi() {
    clearTimeout(this.hiTimer); this.hiTimer = 0;
    this.patchValid = false; this.hiGen++;
    if (this.hiUrl) this.releaseHi(this.hiUrl);
  },
  /* 連続するリサイズ・画面回転・Split Viewを200msデバウンスして1回だけバッファ再確保する */
  scheduleResize(delayMs = this.RESIZE_DEBOUNCE_MS) {
    this.invalidateHi();
    Layout.upd();
    clearTimeout(this.resizeTimer);
    if (delayMs <= 0) { this.resizeTimer = 0; this.applyResize(); return; }
    this.resizeTimer = setTimeout(() => { this.resizeTimer = 0; this.applyResize(); }, delayMs);
  },
  resize() { this.scheduleResize(this.RESIZE_DEBOUNCE_MS); },
  /* 表示Canvasと高精細バッファを、内側実寸×DPR（上限2.0）に1回だけ安全に合わせる */
  applyResize() {
    if (!this.stage || !this.canvas) return;
    Layout.upd();
    const r = this.stage.getBoundingClientRect();
    const cw = this.stage.clientWidth || r.width, ch = this.stage.clientHeight || r.height;
    this.W = Math.max(1, cw); this.H = Math.max(1, ch);
    this.dpr = Math.min(window.devicePixelRatio || 1, document.body.classList.contains('is-phone') ? 1.5 : 2.0);
    const w = Math.max(1, Math.round(this.W * this.dpr)), h = Math.max(1, Math.round(this.H * this.dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w; this.canvas.height = h;
      this.patch.width = w; this.patch.height = h;
      this.patchValid = false;
    }
    if (Zoom.stage) Zoom.syncViewport();
    Hud.syncOffset();
    if (Detail.isOpen()) Fit.all(document.getElementById('detailBody'));
    if (Settings.get('dual') && InfoLcd.el) Fit.all(InfoLcd.el);
    if (Cycle.view === 'board') Fit.all(document.getElementById('abnBoard'));
    this.draw();
    if (this.ready && !this.moving) this.scheduleHi();
  },
  requestDraw() { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.draw(); }); },
  setState(p) { Object.assign(this.state, p); this.requestDraw(); },
  setBlink(on) { if (this.blinkOn === on) return; this.blinkOn = on; this.requestDraw(); },
  onStatus() { this.requestDraw(); },

  /* 起動時に1回だけ：元のSVG → 長辺3072pxの基礎地図。SVG文字列は高精細描画のために保持する */
  async buildBase() {
    if (!this.svgText) return;
    const BH = Math.round(this.BW * this.VH / this.VW);
    const cv = await this.rasterize(setRootAttrs(this.svgText, { viewBox: `0 0 ${this.VW} ${this.VH}`, width: String(this.BW), height: String(BH) }), this.BW, BH);
    if (cv) this.base = cv;
    this.requestDraw();
  },
  async rasterize(xml, pw, ph) {
    const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml' }));
    try {
      const img = new Image();
      img.src = url;
      await (img.decode ? img.decode() : new Promise((res, rej) => { img.onload = res; img.onerror = rej; }));
      const cv = document.createElement('canvas'); cv.width = pw; cv.height = ph;
      cv.getContext('2d').drawImage(img, 0, 0, pw, ph);
      return cv;
    } catch (e) {
      console.error('ラスタライズに失敗しました', e);
      return null;
    } finally { URL.revokeObjectURL(url); }
  },

  /* 操作の開始・終了：操作中は高精細結果を捨て、静止後に描き直す */
  beginMove() {
    this.moving = true; clearTimeout(this.hiTimer);
    this.patchValid = false; this.hiGen++;                   // 作成中の結果も無効にする
  },
  endMove() { this.moving = false; this.scheduleHi(); },
  scheduleHi() { clearTimeout(this.hiTimer); this.hiTimer = setTimeout(() => this.renderHi(), this.SETTLE_MS); },
  /* 表示範囲が、高精細バッファの描いた範囲と一致しているか */
  viewMatches() {
    const p = this.patchView; if (!p) return false;
    return Math.abs(Zoom.vx - p.vx) < 0.5 && Math.abs(Zoom.vy - p.vy) < 0.5 && Math.abs(Zoom.vw - p.vw) < 0.5;
  },
  /* 高精細描画：表示範囲だけを、表示と同じ画素数で元のSVGから描き直し、高精細バッファへ入れる */
  renderHi() {
    if (!this.svgText || this.moving || !this.patchCtx) return;
    if (Zoom.maxVw() / Zoom.vw < this.HI_RATIO) { this.patchValid = false; this.requestDraw(); return; }
    const v = { vx: Zoom.vx, vy: Zoom.vy, vw: Zoom.vw, vh: Zoom.vh() };
    const gen = ++this.hiGen, pw = this.patch.width, ph = this.patch.height, t0 = performance.now();
    const xml = setRootAttrs(this.svgText, { viewBox: `${v.vx} ${v.vy} ${v.vw} ${v.vh}`, width: String(pw), height: String(ph) });
    if (this.hiUrl) { URL.revokeObjectURL(this.hiUrl); this.hiUrl = null; }   // 前回の未使用URLは即解放
    const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml' }));
    this.hiUrl = url;
    const img = this.hiImg;
    img.onload = () => {
      if (gen !== this.hiGen) { this.releaseHi(url); return; }             // 操作が再開されていたら破棄
      this.patchCtx.clearRect(0, 0, pw, ph);
      this.patchCtx.drawImage(img, 0, 0, pw, ph);
      this.patchView = v; this.patchValid = true;
      this.hiMs = performance.now() - t0;
      this.releaseHi(url); this.requestDraw();
    };
    img.onerror = () => { this.releaseHi(url); console.error('高精細描画に失敗しました'); };
    img.src = url;
  },
  releaseHi(url) { URL.revokeObjectURL(url); if (this.hiUrl === url) this.hiUrl = null; },

  pathOf(r) { return r.path || (r.path = new Path2D(r.d)); },
  strokeSolid(c, r, color) {
    const m = r.m;
    c.save();
    c.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.globalAlpha = 1; c.strokeStyle = color || r.color; c.lineWidth = r.sw; c.setLineDash([]);
    c.stroke(this.pathOf(r));
    c.restore();
  },
  /* 異常路線の発光（にじみ＋芯）。filterは使わず、太さと不透明度だけで表現する */
  strokeRail(c, r, color, alpha, dash) {
    const m = r.m;
    c.save();
    c.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.globalAlpha = alpha * 0.35; c.strokeStyle = color; c.lineWidth = r.sw * 3.2; c.setLineDash([]); c.stroke(this.pathOf(r));
    c.globalAlpha = alpha; c.lineWidth = r.sw * 1.15; c.setLineDash(dash ? [28, 16] : []); c.stroke(this.pathOf(r));
    c.restore();
  },
  drawCompanyLines(c) {
    const co = this.state.company; if (co === 'all') return;
    LINE_PATHS.forEach(r => { if (r.company === co) this.strokeSolid(c, r); });
  },
  drawDetour(c, det) {
    const L = lineByName(det), alts = new Set(L ? L.alt : []);
    c.save(); c.fillStyle = 'rgba(244,245,248,0.86)'; c.fillRect(0, 0, this.VW, this.VH); c.restore();
    LINE_PATHS.forEach(r => { if (r.line === det || alts.has(r.line)) this.strokeSolid(c, r); });
  },
  drawGlow(c, det) {
    const s = this.state, alts = det ? new Set((lineByName(det) || { alt: [] }).alt) : null;
    const a = this.blinkOn ? 1 : 0.3, emph = s.alert || s.company !== 'all';
    LINE_PATHS.forEach(r => {
      if (s.company !== 'all' && r.company !== s.company) return;
      const st = Store.of(r.line).status;
      if (det) {
        if (r.line === det) this.strokeRail(c, r, (st === 'delay' || st === 'partial') ? FX_COLORS.delay : FX_COLORS.suspend, a, false);
        else if (alts.has(r.line)) this.strokeRail(c, r, FX_COLORS.alt, 1, true);
        return;
      }
      let color = null;
      if (st === 'suspend') color = FX_COLORS.suspend;
      else if (st === 'delay' || st === 'partial') color = FX_COLORS.delay;
      if (!color) return;
      if (emph) this.strokeSolid(c, r);
      this.strokeRail(c, r, color, a, false);
    });
  },
  drawPulses(c, unit) {
    if (!LINES.some(L => Store.of(L.ja).status === 'suspend')) return;
    c.save(); c.globalAlpha = this.blinkOn ? 1 : 0.3;
    TERMINALS.forEach(name => {
      const e = Stations.get(name); if (!e) return;
      if (!Stations.lines(name).some(n => Store.of(n).status === 'suspend')) return;
      c.beginPath(); c.arc(e.x, e.y, 10 * unit, 0, Math.PI * 2); c.strokeStyle = '#ff3030'; c.lineWidth = 3 * unit; c.stroke();
      c.beginPath(); c.arc(e.x, e.y, 5 * unit, 0, Math.PI * 2); c.fillStyle = '#ff3030'; c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 1.5 * unit; c.stroke();
    });
    c.restore();
  },
  drawMarker(c, unit) {
    const m = this.marker; if (!m) return;
    if (!this.pin) this.pin = new Path2D('M0 0 C-4 -12 -17 -22 -17 -34 A17 17 0 1 1 17 -34 C17 -22 4 -12 0 0Z');
    c.save(); c.translate(m.x, m.y); c.scale(unit, unit);
    c.globalAlpha = this.blinkOn ? 1 : 0.3;
    c.beginPath(); c.arc(0, 0, 26, 0, Math.PI * 2); c.strokeStyle = '#2f6df0'; c.lineWidth = 3; c.stroke();
    c.globalAlpha = 1;
    c.fillStyle = '#2f6df0'; c.strokeStyle = '#fff'; c.lineWidth = 3; c.fill(this.pin); c.stroke(this.pin);
    c.beginPath(); c.arc(0, -34, 6.5, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
    c.restore();
  },
  /* 異常路線のミニタグ：路線の代表位置に「記号＋状態」を小さく描く。重なるものは省く（地図の拡大率に依らず読める） */
  /* 異常ステータスミニラベル（吹き出しタグ）：主要拠点付近に「[JY] 遅延」「[JC] 見合わせ」等を描画（タップで詳細起動） */
  drawTags(c) {
    this.drawnTags.length = 0;
    if (!Settings.get('miniTags')) return;
    const rows = LINES.filter(L => Store.of(L.ja).status !== 'normal' && (this.state.company === 'all' || L.co === this.state.company))
      .sort((a, b) => Store.rank(a.ja) - Store.rank(b.ja)).slice(0, 14);
    if (!rows.length) return;
    const k = this.W / Zoom.vw;
    c.save(); c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.textBaseline = 'middle';
    const OFFSETS = [[0, -16], [0, 22], [44, -14], [-44, -14], [44, 20], [-44, 20]];
    const SHORT_ST = { suspend: '見合わせ', delay: '遅延', partial: '一部運休' };
    const placed = [];
    rows.forEach(L => {
      const anc = MapView.anchorOf(L.ja); if (!anc) return;
      const ax = (anc.x - Zoom.vx) * k, ay = (anc.y - Zoom.vy) * k;
      if (ax < 6 || ay < 6 || ax > this.W - 6 || ay > this.H - 6) return;
      const st = Store.of(L.ja).status;
      const codeStr = `[${L.code}]`, stStr = SHORT_ST[st] || STATUS[st].ja;
      c.font = '700 11px "Roboto Condensed", "Inter", sans-serif';
      const cw = c.measureText(codeStr).width;
      c.font = '700 11.5px "Zen Kaku Gothic New", "Noto Sans JP", sans-serif';
      const sw = c.measureText(stStr).width;
      const w = Math.ceil(cw + sw + 18), h = 22;
      let chosen = null;
      for (const [ox, oy] of OFFSETS) {
        const rx = Math.min(this.W - w - 4, Math.max(4, ax + ox - w / 2));
        const ry = Math.min(this.H - h - 6, Math.max(4, ay + oy - h / 2));
        if (!placed.some(p => rx < p.x + p.w + 4 && rx + w + 4 > p.x && ry < p.y + p.h + 4 && ry + h + 4 > p.y)) {
          chosen = { rx, ry }; break;
        }
      }
      if (!chosen) return;
      const { rx, ry } = chosen;
      placed.push({ x: rx, y: ry, w, h });
      this.drawnTags.push({ line: L.ja, x0: rx - 2, y0: ry - 2, x1: rx + w + 2, y1: ry + h + 4 });
      const bg = st === 'suspend' ? '#c81912' : '#d96b00';
      const tipX = Math.min(rx + w - 7, Math.max(rx + 7, ax));
      const tipDown = ay >= ry + h / 2;
      /* 影オフセット（filter不使用で高速） */
      c.fillStyle = 'rgba(0,0,0,0.34)';
      c.beginPath();
      if (c.roundRect) c.roundRect(rx, ry + 2, w, h, 5); else c.rect(rx, ry + 2, w, h);
      c.fill();
      /* 吹き出しのしっぽ（拠点方向を指す小三角） */
      c.beginPath();
      if (tipDown) { c.moveTo(tipX - 5, ry + h - 1); c.lineTo(tipX + 5, ry + h - 1); c.lineTo(tipX, ry + h + 5); }
      else { c.moveTo(tipX - 5, ry + 1); c.lineTo(tipX + 5, ry + 1); c.lineTo(tipX, ry - 5); }
      c.closePath();
      c.fillStyle = bg; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#fff'; c.stroke();
      /* ラベル本体 */
      c.beginPath();
      if (c.roundRect) c.roundRect(rx, ry, w, h, 5); else c.rect(rx, ry, w, h);
      c.fillStyle = bg; c.fill();
      c.lineWidth = 1.6; c.strokeStyle = '#ffffff'; c.stroke();
      /* 路線カラーアクセント帯 */
      c.fillStyle = L.color || '#fff';
      c.fillRect(rx + 3, ry + 4, 3.5, h - 8);
      /* テキスト描画：[JY] 遅延 */
      c.fillStyle = '#fff';
      c.font = '700 11px "Roboto Condensed", "Inter", sans-serif';
      c.fillText(codeStr, rx + 9, ry + h / 2 + 0.5);
      c.font = '700 11.5px "Zen Kaku Gothic New", "Noto Sans JP", sans-serif';
      c.fillText(stStr, rx + 12 + cw, ry + h / 2 + 0.5);
    });
    c.restore();
  },
  tagAt(px, py) {
    for (let i = this.drawnTags.length - 1; i >= 0; i--) {
      const t = this.drawnTags[i];
      if (px >= t.x0 && px <= t.x1 && py >= t.y0 && py <= t.y1) return t.line;
    }
    return null;
  },
  /* 1回の描画：背景 → 地図（高精細バッファ or 基礎地図）→ 会社・強調・振替 → 発光 → 警告 → 現在地 */
  draw() {
    if (!this.ctx || !this.ready || !this.canvas.width) return;
    const t0 = performance.now(), c = this.ctx, vw = Zoom.vw, unit = vw / this.W, s = this.state, det = s.detour;
    const scale = this.dpr * this.W / vw;
    const alpha = det ? 1 : (s.company !== 'all' ? 0.18 : (s.alert ? 0.16 : 1));
    const usePatch = !this.moving && this.patchValid && this.viewMatches();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1; c.fillStyle = '#f4f5f8'; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (usePatch) {                                           // 高精細バッファは表示と画素が一致するので、そのまま描く
      c.globalAlpha = alpha; c.drawImage(this.patch, 0, 0); c.globalAlpha = 1;
    }
    c.setTransform(scale, 0, 0, scale, -Zoom.vx * scale, -Zoom.vy * scale);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    if (!usePatch && this.base) {                             // 操作中・高精細なし：基礎地図を切り出して描く
      c.globalAlpha = alpha;
      c.drawImage(this.base, 0, 0, this.base.width, this.base.height, 0, 0, this.VW, this.VH);
      c.globalAlpha = 1;
    }
    if (det) this.drawDetour(c, det); else this.drawCompanyLines(c);
    this.drawGlow(c, det);
    this.drawPulses(c, unit);
    this.drawTags(c);
    this.drawMarker(c, unit);
    this.lastDraw = performance.now() - t0; this.drawCount++;
  }
};

const MapView = {
  svg: null, rails: LINE_PATHS, boxes: {}, anchors: {}, railMid: {}, _all: null, _by: null, dom: null,
  /* 読み込み：SVG解析 → 一時的な実DOMで駅・路線の位置を取り出し即破棄 → 基礎地図を1回だけ作る */
  async init() {
    const msg = document.getElementById('mapLoading');
    try {
      const res = await fetch('tokyo_ja.svg');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const txt = await res.text();
      Engine.svgText = txt.slice(txt.indexOf('<svg'));
      const doc = new DOMParser().parseFromString(Engine.svgText, 'image/svg+xml');
      if (doc.getElementsByTagName('parsererror').length) throw new Error('SVGの解析に失敗しました');
      const root = doc.documentElement;
      this.dom = { before: root.getElementsByTagName('*').length };
      this.dom.removed = Sanitize.run(root);
      this.dom.after = root.getElementsByTagName('*').length;
      const vb = (root.getAttribute('viewBox') || '0 0 7300 5400').trim().split(/[\s,]+/).map(Number);
      Engine.VW = vb[2]; Engine.VH = vb[3];
      const holder = document.createElement('div');
      holder.style.cssText = 'position:absolute;left:-99999px;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden';
      const live = document.importNode(root, true);
      holder.appendChild(live); document.body.appendChild(holder);
      this.svg = live;
      this.tag(live);
      Stations.ensure(); LineGeo.ensure();
      this.buildAnchors();
      holder.remove(); this.svg = null;
      await Engine.buildBase();
      if (msg) msg.hidden = true;
    } catch (e) {
      console.error(e);
      if (msg) msg.textContent = '路線図を読み込めませんでした。ローカルでは簡易サーバー経由で開いてください。';
    }
  },
  /* 路線グループに路線名・会社を付け、路線パスの索引（LINE_PATHS）を作る */
  tag(live) {
    const all = lineGroupsOf(live), pt = live.createSVGPoint();
    this._all = []; this._by = new Map(); this.boxes = {}; this.railMid = {}; LINE_PATHS.length = 0;
    all.forEach(g => {
      const id = g.getAttribute('id') || '';
      const L = LINES.find(x => x.svg.some(p => id.startsWith(p)));
      if (!L) return;
      g.dataset.line = L.ja; g.dataset.company = L.co;
      this.decorate(g);
      this._all.push(g);
      (this._by.get(L.ja) || this._by.set(L.ja, []).get(L.ja)).push(g);
      g.__rails.forEach(el => this.addRail(el, L, pt));
    });
  },
  decorate(g) {
    const direct = [...g.querySelectorAll(':scope > path, :scope > line')];
    const strokeOf = el => (el.getAttribute('stroke') || '').toUpperCase();
    const usable = el => strokeOf(el) && strokeOf(el) !== 'NONE' && strokeOf(el) !== '#FFFFFF' && !el.hasAttribute('stroke-dasharray');
    let rails = direct.filter(el => usable(el) && strokeOf(el) !== '#7C7B7C' && !el.hasAttribute('opacity'));
    if (!rails.length) rails = direct.filter(usable);
    g.__rails = rails;
  },
  /* 路線パス1本を、地図座標の記録として保存する（Path2Dは起動時に1回だけ作る） */
  addRail(el, L, pt) {
    const m = toRoot(el); if (!m) return;
    const d = pathD(el); if (!d) return;
    LINE_PATHS.push({
      line: L.ja, company: L.co, d, sw: parseFloat(el.getAttribute('stroke-width')) || 10,
      color: el.getAttribute('stroke') || '#999', m: { a: m.a, b: m.b, c: m.c, d: m.d, e: m.e, f: m.f },
      path: new Path2D(d)
    });
    try {
      const len = el.getTotalLength ? el.getTotalLength() : 0;
      if (len > (this.railMid[L.ja]?.len || 0) && pt) {
        const mp = el.getPointAtLength(len * 0.5);
        pt.x = mp.x; pt.y = mp.y;
        const q = pt.matrixTransform(m);
        this.railMid[L.ja] = { x: q.x, y: q.y, len };
      }
    } catch (_) {}
    try {
      const bb = el.getBBox();
      const pts = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]]
        .map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
      const box = this.boxes[L.ja] || (this.boxes[L.ja] = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
      pts.forEach(([x, y]) => { box.x0 = Math.min(box.x0, x); box.y0 = Math.min(box.y0, y); box.x1 = Math.max(box.x1, x); box.y1 = Math.max(box.y1, y); });
    } catch (_) {}
  },
  /* 各路線の主要拠点アンカーを起動時に1回算出（環状線や湾岸線でも必ず実路線・主要駅付近に配置） */
  buildAnchors() {
    this.anchors = {};
    LINES.forEach(L => {
      const mid = this.railMid[L.ja], cen = this.lineCenter(L.ja);
      const stNames = (L.directionText || '').split('・').map(s => s.trim()).filter(Boolean);
      const midIdx = Math.floor(stNames.length / 2);
      const ordered = stNames.map((n, i) => ({ n, d: Math.abs(i - midIdx) })).sort((a, b) => a.d - b.d);
      for (const { n } of ordered) {
        const st = Stations.get(n);
        if (st && (!mid || LineGeo.lines(st.x, st.y, 160).includes(L.ja))) {
          this.anchors[L.ja] = { x: st.x, y: st.y }; return;
        }
      }
      if (mid) { this.anchors[L.ja] = { x: mid.x, y: mid.y }; return; }
      if (cen) this.anchors[L.ja] = cen;
    });
  },
  anchorOf(name) { return this.anchors[name] || this.lineCenter(name); },
  lineCenter(name) {
    const b = this.boxes[name];
    return b && isFinite(b.x0) ? { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 } : null;
  },
  lines() { return this._all || []; },
  applyStatuses() { Engine.onStatus(); },
  applyFilter(companyId) { Engine.setState({ company: companyId }); }
};

/* ---------- ズーム・パン（表示範囲だけを持ち、描画はEngineが行う） ----------
 * 状態：vx,vy＝表示範囲の左上（地図座標）、vw＝表示範囲の幅（地図座標）。高さは画面の縦横比から求める。
 * 上限：全体表示の 1/5 まで拡大。全体表示より縮小はしない。 */
const Zoom = {
  vx: 0, vy: 0, vw: 1, VW: 7300, VH: 5400, W: 1, H: 1, insT: 0, insB: 0,
  HOME_PT: [0.507, 0.472], HOME_DIV: 2.4,
  stage: null, pts: new Map(), last: null, moved: 0, anim: 0, endTimer: 0, lastWrite: 0,
  wheel: { f: 1, x: 0, y: 0, raf: 0 },
  init(stage) {
    this.stage = stage; this.VW = Engine.VW; this.VH = Engine.VH;
    this.measure();
    stage.addEventListener('pointerdown', e => this.down(e));
    stage.addEventListener('pointermove', e => this.move(e));
    ['pointerup', 'pointercancel'].forEach(t => stage.addEventListener(t, e => this.up(e)));
    stage.addEventListener('wheel', e => this.onWheel(e), { passive: false });
    document.getElementById('zoomIn').onclick = () => this.step(1.4);
    document.getElementById('zoomOut').onclick = () => this.step(1 / 1.4);
    document.getElementById('zoomReset').onclick = () => this.home();
    this.home();
  },
  measure() {
    const r = this.stage.getBoundingClientRect();
    this.W = Math.max(1, this.stage.clientWidth || r.width);
    this.H = Math.max(1, this.stage.clientHeight || r.height);
  },
  off() { return (this.insT - this.insB) / 2; },
  maxVw() { return Math.min(this.VW, this.VH * this.W / this.H); },
  clampVw(v) { const hi = this.maxVw(); return Math.min(hi, Math.max(hi / 5, v)); },
  unit() { return this.vw / this.W; },
  vh() { return this.vw * this.H / this.W; },
  clampPos() {
    const vh = this.vh(), cl = (v, lo, hi) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));
    this.vx = cl(this.vx, Math.min(0, this.VW - this.vw), Math.max(0, this.VW - this.vw));
    this.vy = cl(this.vy, Math.min(0, this.VH - vh), Math.max(0, this.VH - vh));
  },
  /* 表示範囲が変わったことを知らせる（描画は1フレームに1回） */
  writeView() { Engine.requestDraw(); },
  request() { Engine.requestDraw(); },
  centerOn(tx, ty) {
    this.vx = tx - this.vw / 2;
    this.vy = ty - (this.H / 2 + this.off()) * this.unit();
  },
  visXY() { return { x: this.vx + this.vw / 2, y: this.vy + (this.H / 2 + this.off()) * this.unit() }; },
  home() {
    this.stopAnim(); this.measure();
    this.vw = this.clampVw(this.maxVw() / (document.body.classList.contains('is-phone') ? 1.8 : this.HOME_DIV));
    this.centerOn(this.HOME_PT[0] * this.VW, this.HOME_PT[1] * this.VH);
    this.clampPos(); this.finish();
  },
  animateTo(tx, ty, targetVw, ms = 700) {
    this.stopAnim(); this.measure();
    const ev = this.clampVw(targetVw), sv = this.vw, from = this.visXY();
    const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const t0 = performance.now();
    const step = now => {
      const t = Math.min(1, (now - t0) / ms), e = ease(t);
      this.vw = Math.exp(Math.log(sv) + (Math.log(ev) - Math.log(sv)) * e);
      this.centerOn(from.x + (tx - from.x) * e, from.y + (ty - from.y) * e);
      this.clampPos(); this.writeView();
      if (t < 1) this.anim = requestAnimationFrame(step); else { this.anim = 0; this.finish(); }
    };
    this.anim = requestAnimationFrame(step);
  },
  stopAnim() { if (this.anim) { cancelAnimationFrame(this.anim); this.anim = 0; } },
  focusOn(x, y) { this.animateTo(x, y, this.maxVw() / 4); },
  /* 指定した画面上の点を動かさずに倍率だけ変える */
  zoomAt(px, py, f) {
    const u = this.unit(), sx = this.vx + px * u, sy = this.vy + py * u;
    const nvw = this.clampVw(this.vw / f), nu = nvw / this.W;
    this.vw = nvw; this.vx = sx - px * nu; this.vy = sy - py * nu;
    this.clampPos(); this.request();
  },
  panBy(dx, dy) { const u = this.unit(); this.vx -= dx * u; this.vy -= dy * u; this.clampPos(); this.request(); },
  step(f) {
    this.stopAnim(); this.beginInteract();
    this.zoomAt(this.W / 2, this.H / 2 + this.off(), f);
    this.endInteractLater();
  },
  syncViewport() {
    const c = this.visXY();
    this.measure();
    this.vw = this.clampVw(this.vw);
    this.centerOn(c.x, c.y); this.clampPos();
  },
  onResize() { this.syncViewport(); this.request(); },
  beginInteract() {
    clearTimeout(this.endTimer);
    if (!this.stage.classList.contains('is-zooming')) this.stage.classList.add('is-zooming');
    document.body.classList.add('map-busy');
    Engine.beginMove();
  },
  endInteractLater() { clearTimeout(this.endTimer); this.endTimer = setTimeout(() => this.finish(), 150); },
  /* 操作終了：表示範囲を確定し、静止後の精細化を予約する */
  finish() {
    this.writeView();
    this.stage.classList.remove('is-zooming');
    document.body.classList.remove('map-busy');
    Engine.endMove();
  },
  dist() { const [a, b] = [...this.pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); },
  mid() { const [a, b] = [...this.pts.values()]; return [(a.x + b.x) / 2, (a.y + b.y) / 2]; },
  down(e) {
    if (e.target.closest('.zoom,.legend,.loc-chip,.board,.detour-bar,.stn-pop,.toast,.info-lcd')) return;
    this.stopAnim(); clearTimeout(this.endTimer);
    this.stage.setPointerCapture(e.pointerId);
    this.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pts.size === 1) this.moved = 0;
    if (this.pts.size === 2) { this.moved = 99; this.last = { d: this.dist(), m: this.mid() }; this.beginInteract(); }
  },
  move(e) {
    const p = this.pts.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    this.moved += Math.abs(dx) + Math.abs(dy);
    if (this.pts.size === 1) {
      if (this.moved >= 5) { this.beginInteract(); this.panBy(dx, dy); }
      p.x = e.clientX; p.y = e.clientY;
    } else if (this.pts.size === 2) {
      p.x = e.clientX; p.y = e.clientY;
      const d = this.dist(), m = this.mid(), r = this.stage.getBoundingClientRect();
      this.panBy(m[0] - this.last.m[0], m[1] - this.last.m[1]);
      this.zoomAt(m[0] - r.left, m[1] - r.top, d / this.last.d);
      this.last = { d, m };
    }
  },
  up(e) {
    if (!this.pts.has(e.pointerId)) return;
    if (this.pts.size === 1 && this.moved < 5) this.tap(e.clientX, e.clientY);
    this.pts.delete(e.pointerId); this.last = null;
    if (this.pts.size === 1) this.moved = 99;
    if (this.pts.size === 0) this.endInteractLater();
  },
  /* 5px未満の移動のタップ：異常ミニタグ → 駅名ラベル → 最も近い路線の詳細 */
  tap(cx, cy) {
    const r = this.stage.getBoundingClientRect(), u = this.unit();
    const px = cx - r.left - (this.stage.clientLeft || 0), py = cy - r.top - (this.stage.clientTop || 0);
    const tagged = Engine.tagAt(px, py);
    if (tagged) { StationPop.close(); Detail.open(tagged); return; }
    const sx = this.vx + px * u, sy = this.vy + py * u;
    const st = Stations.at(sx, sy, 4 * u);
    if (st) { StationPop.open(st.name, cx, cy); return; }
    StationPop.close();
    const line = LineGeo.nearest(sx, sy, Math.min(90, 14 * u));
    if (line) document.dispatchEvent(new CustomEvent('line:tap', { detail: { line } }));
  },
  onWheel(e) {
    e.preventDefault(); this.stopAnim(); this.beginInteract();
    const w = this.wheel, r = this.stage.getBoundingClientRect();
    w.f *= Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0015));
    w.x = e.clientX - r.left; w.y = e.clientY - r.top;
    if (!w.raf) w.raf = requestAnimationFrame(() => { w.raf = 0; const f = w.f; w.f = 1; this.zoomAt(w.x, w.y, f); });
    this.endInteractLater();
  }
};

/* ---------- マイ路線（お気に入り） ---------- */
const Favs = {
  KEY: 'tokyo-lcd:favs', list: [],
  load() {
    try { const a = JSON.parse(localStorage.getItem(this.KEY) || '[]'); if (Array.isArray(a)) this.list = a.filter(n => lineByName(n)); } catch (_) {}
  },
  has(n) { return this.list.includes(n); },
  toggle(n) {
    this.list = this.has(n) ? this.list.filter(x => x !== n) : [...this.list, n];
    try { localStorage.setItem(this.KEY, JSON.stringify(this.list)); } catch (_) {}
    document.dispatchEvent(new CustomEvent('favs:change'));
  }
};

/* ---------- 現在地：関東の主要50駅（駅名・緯度・経度）と、最寄り駅の路線図座標へのマッピング ---------- */
/* ---------- 現在地・マイ駅：関東の主要60駅（駅名・緯度・経度・乗り入れ路線） ---------- */
const STATIONS = [
  ['東京', 35.6812, 139.7671, ['山手線', '京浜東北線', '中央線快速', '東海道線', '横須賀線', '総武快速線', '上野東京ライン', '京葉線', '丸ノ内線']],
  ['新宿', 35.6896, 139.7006, ['山手線', '中央線快速', '中央・総武各駅停車', '埼京線', '湘南新宿ライン', '丸ノ内線', '副都心線', '都営新宿線', '都営大江戸線', '京王線', '小田急小田原線']],
  ['渋谷', 35.6580, 139.7016, ['山手線', '埼京線', '湘南新宿ライン', '銀座線', '半蔵門線', '副都心線', '東急東横線', '東急田園都市線', '京王井の頭線']],
  ['池袋', 35.7295, 139.7109, ['山手線', '埼京線', '湘南新宿ライン', '丸ノ内線', '有楽町線', '副都心線', '西武池袋線', '東武東上線']],
  ['上野', 35.7141, 139.7774, ['山手線', '京浜東北線', '上野東京ライン', '宇都宮線', '高崎線', '常磐線快速', '銀座線', '日比谷線']],
  ['品川', 35.6285, 139.7387, ['山手線', '京浜東北線', '東海道線', '横須賀線', '上野東京ライン', '京急本線']],
  ['秋葉原', 35.6984, 139.7731, ['山手線', '京浜東北線', '中央・総武各駅停車', '日比谷線', 'つくばエクスプレス']],
  ['横浜', 35.4658, 139.6226, ['京浜東北線', '東海道線', '横須賀線', '湘南新宿ライン', '横浜線', '東急東横線', '京急本線', '相鉄本線', 'みなとみらい線', '横浜市営地下鉄ブルーライン']],
  ['川崎', 35.5308, 139.6970, ['京浜東北線', '東海道線', '南武線', '京急本線']],
  ['武蔵小杉', 35.5763, 139.6596, ['南武線', '横須賀線', '湘南新宿ライン', '東急東横線', '東急目黒線', '東急新横浜線']],
  ['大宮', 35.9065, 139.6240, ['京浜東北線', '埼京線', '川越線', '宇都宮線', '高崎線', '東武アーバンパークライン']],
  ['浦和', 35.8589, 139.6573, ['京浜東北線', '宇都宮線', '高崎線', '湘南新宿ライン']],
  ['赤羽', 35.7779, 139.7209, ['京浜東北線', '埼京線', '宇都宮線', '高崎線', '湘南新宿ライン']],
  ['北千住', 35.7497, 139.8049, ['常磐線快速', '常磐線各駅停車', '千代田線', '日比谷線', '東武スカイツリーライン', 'つくばエクスプレス']],
  ['日暮里', 35.7278, 139.7708, ['山手線', '京浜東北線', '常磐線快速', '常磐線各駅停車', '京成本線', '日暮里・舎人ライナー']],
  ['錦糸町', 35.6968, 139.8140, ['中央・総武各駅停車', '総武快速線', '半蔵門線']],
  ['新小岩', 35.7166, 139.8575, ['中央・総武各駅停車', '総武快速線']],
  ['市川', 35.7287, 139.9087, ['中央・総武各駅停車', '総武快速線']],
  ['船橋', 35.7014, 139.9855, ['中央・総武各駅停車', '総武快速線', '東武アーバンパークライン', '京成本線']],
  ['津田沼', 35.6914, 140.0210, ['中央・総武各駅停車', '総武快速線', '新京成線']],
  ['千葉', 35.6131, 140.1133, ['総武快速線', '総武本線', '外房線', '内房線', '京成千葉線']],
  ['西船橋', 35.7072, 139.9593, ['中央・総武各駅停車', '東西線', '京葉線', '武蔵野線', '東葉高速線']],
  ['柏', 35.8620, 139.9710, ['常磐線快速', '常磐線各駅停車', '東武アーバンパークライン']],
  ['松戸', 35.7843, 139.9013, ['常磐線快速', '常磐線各駅停車', '千代田線']],
  ['立川', 35.6980, 139.4138, ['中央線快速', '青梅線', '南武線', '多摩都市モノレール']],
  ['八王子', 35.6555, 139.3389, ['中央線快速', '中央本線', '横浜線']],
  ['吉祥寺', 35.7030, 139.5798, ['中央線快速', '中央・総武各駅停車', '京王井の頭線']],
  ['町田', 35.5426, 139.4453, ['横浜線', '小田急小田原線']],
  ['所沢', 35.7870, 139.4693, ['西武池袋線', '西武新宿線']],
  ['大船', 35.3541, 139.5313, ['東海道線', '横須賀線']],
  ['藤沢', 35.3387, 139.4875, ['東海道線', '小田急江ノ島線']],
  ['戸塚', 35.4005, 139.5337, ['東海道線', '横須賀線', '湘南新宿ライン', '横浜市営地下鉄ブルーライン']],
  ['中野', 35.7058, 139.6658, ['中央線快速', '中央・総武各駅停車', '東西線']],
  ['荻窪', 35.7048, 139.6200, ['中央線快速', '中央・総武各駅停車', '丸ノ内線']],
  ['三鷹', 35.7027, 139.5611, ['中央線快速', '中央・総武各駅停車', '東西線']],
  ['蒲田', 35.5625, 139.7160, ['京浜東北線', '東急池上線', '東急多摩川線']],
  ['自由が丘', 35.6076, 139.6700, ['東急東横線', '東急大井町線']],
  ['二子玉川', 35.6117, 139.6269, ['東急田園都市線', '東急大井町線']],
  ['溝の口', 35.6003, 139.6106, ['東急田園都市線', '東急大井町線', '南武線']],
  ['調布', 35.6513, 139.5444, ['京王線', '京王相模原線']],
  ['府中', 35.6720, 139.4780, ['京王線']],
  ['国分寺', 35.7001, 139.4800, ['中央線快速', '西武新宿線']],
  ['川口', 35.8019, 139.7241, ['京浜東北線']],
  ['蕨', 35.8279, 139.6799, ['京浜東北線']],
  ['南浦和', 35.8423, 139.6694, ['京浜東北線', '武蔵野線']],
  ['新越谷', 35.8756, 139.7915, ['東武スカイツリーライン', '武蔵野線']],
  ['春日部', 35.9753, 139.7527, ['東武スカイツリーライン', '東武アーバンパークライン']],
  ['草加', 35.8318, 139.8055, ['東武スカイツリーライン']],
  ['新松戸', 35.8001, 139.9215, ['常磐線各駅停車', '武蔵野線']],
  ['海浜幕張', 35.6483, 140.0422, ['京葉線']],
  ['新橋', 35.6666, 139.7584, ['山手線', '京浜東北線', '東海道線', '上野東京ライン', '横須賀線', '銀座線', '都営浅草線', 'ゆりかもめ']],
  ['御茶ノ水', 35.6993, 139.7654, ['中央線快速', '中央・総武各駅停車', '丸ノ内線']],
  ['目黒', 35.6337, 139.7157, ['山手線', '東急目黒線', '南北線', '都営三田線']],
  ['恵比寿', 35.6467, 139.7101, ['山手線', '埼京線', '湘南新宿ライン', '日比谷線']],
  ['高田馬場', 35.7126, 139.7038, ['山手線', '西武新宿線', '東西線']],
  ['大手町', 35.6867, 139.7633, ['丸ノ内線', '東西線', '千代田線', '半蔵門線', '都営三田線']],
  ['押上', 35.7107, 139.8130, ['半蔵門線', '都営浅草線', '京成押上線', '東武スカイツリーライン']],
  ['綾瀬', 35.7430, 139.8250, ['千代田線', '常磐線各駅停車']],
  ['練馬', 35.7377, 139.6540, ['西武池袋線', '都営大江戸線']],
  ['西日暮里', 35.7320, 139.7668, ['山手線', '京浜東北線', '千代田線', '日暮里・舎人ライナー']]
];
const stationByName = n => STATIONS.find(s => s[0] === n);
const Locate = {
  marker: null, point: null,
  init() { document.getElementById('btnLocate').onclick = () => this.locate(); },
  km(lat1, lng1, lat2, lng2) {
    const R = 6371, r = d => d * Math.PI / 180, dLat = r(lat2 - lat1), dLng = r(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  },
  stationPoint(name) { const e = Stations.get(name); return e ? { x: e.x, y: e.y } : null; },
  locate() {
    if (!navigator.geolocation) { UI.toast('この端末では位置情報を利用できません'); return; }
    const btn = document.getElementById('btnLocate'); btn.classList.add('spin');
    navigator.geolocation.getCurrentPosition(pos => {
      btn.classList.remove('spin');
      const { latitude: la, longitude: lo } = pos.coords;
      const ranked = STATIONS.map(([n, a, b]) => ({ n, d: this.km(la, lo, a, b) })).sort((p, q) => p.d - q.d);
      if (ranked[0].d > 40) { UI.toast('現在地は関東の路線図の範囲外のようです'); return; }
      for (const st of ranked) {
        if (st.d > 40) break;
        const p = this.stationPoint(st.n);
        if (p) { this.show(p.x, p.y, st.n); return; }
      }
      UI.toast('現在地付近の駅を路線図上で見つけられませんでした');
    }, err => {
      btn.classList.remove('spin');
      UI.toast({ 1: '位置情報の利用が許可されていません（設定 > プライバシー > 位置情報サービス）',
                 2: '現在地を取得できませんでした', 3: '現在地の取得がタイムアウトしました' }[err.code] || '現在地を取得できませんでした');
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  },
  /* 現在地ピン：描画はEngineが行う（座標だけを渡す） */
  show(x, y, name, kind) {
    this.point = { x, y };
    Engine.marker = { x, y };
    Engine.requestDraw();
    const chip = document.getElementById('locChip');
    chip.innerHTML = kind === 'jump'
      ? `<span class="material-symbols-outlined">place</span><span>${esc(name)}駅</span><button class="chip-act" data-stnview="${esc(name)}">周辺路線</button><span class="material-symbols-outlined x">close</span>`
      : `<span class="material-symbols-outlined">my_location</span><span>現在地（最寄り：${esc(name)}駅周辺）${I18n.bi() ? '<small class="en">Current location</small>' : ''}</span><span class="material-symbols-outlined x">close</span>`;
    chip.hidden = false;
    chip.onclick = e => { const v = e.target.closest('[data-stnview]'); if (v) StationUI.open(v.dataset.stnview); else this.clear(); };
    Zoom.focusOn(x, y);
  },
  /* 旧API互換（描画の拡大率補正はEngineが行うため不要） */
  rescale() {},
  /* 全駅インデックスから駅名で路線図上へジャンプし、駅ポップアップを開く */
  jumpTo(name) {
    const e = Stations.get(name);
    if (!e) { UI.toast('路線図上でこの駅を見つけられませんでした'); return; }
    this.show(e.x, e.y, name, 'jump');
    StationPop.open(name);
  },
  clear(keepChip) {
    this.point = null; Engine.marker = null; Engine.requestDraw();
    if (!keepChip) document.getElementById('locChip').hidden = true;
  }
};

/* ---------- 車内チャイム風の通知音（Web Audio API）：音色は設定で選択 ---------- */
/* ---------- 効果音（Web Audio API による合成。すべてオリジナルの音色・旋律） ---------- */
const Chime = {
  ctx: null, verb: null, _b: 0, _p: 0,
  init() { ['pointerdown', 'touchend', 'keydown'].forEach(t => document.addEventListener(t, () => this.unlock(), { once: true, passive: true })); },
  unlock() { // iOSはユーザー操作の中でAudioContextを開始する必要がある
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!this.ctx) this.ctx = new AC();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (_) {}
  },
  /* 残響：短いノイズの減衰から作る1枚のインパルス応答（起動後に一度だけ作る） */
  reverb() {
    if (this.verb || !this.ctx) return this.verb;
    const c = this.ctx, len = Math.floor(c.sampleRate * 1.3), buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    const conv = c.createConvolver(); conv.buffer = buf;
    const wet = c.createGain(); wet.gain.value = 0.3;
    conv.connect(wet); wet.connect(c.destination);
    this.verb = conv; return conv;
  },
  /* 金属的な非整数倍音を重ねたベル音（倍音ごとに減衰を変える） */
  bell(f, t, vol = 0.32, dur = 1.6) {
    const c = this.ctx, out = c.createGain(); out.gain.value = vol; out.connect(c.destination);
    const rv = this.reverb();
    if (rv) { const send = c.createGain(); send.gain.value = 0.55; out.connect(send); send.connect(rv); }
    [[1, 1, 1], [2.02, 0.42, 0.6], [2.76, 0.2, 0.35], [5.4, 0.08, 0.2]].forEach(([m, a, k]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f * m;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(a, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur * k);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.1);
    });
  },
  /* 券売機のタッチ音：2040Hzの短い電子音（60ms）。連打は間引く */
  beep() {
    const nowMs = performance.now(); if (nowMs - this._b < 80) return; this._b = nowMs;
    this.unlock();
    const c = this.ctx; if (!c || c.state !== 'running') return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = 'square'; o.frequency.value = 2040;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.07);
  },
  /* 操作の確認音（初期化など）：低く短い警告音 */
  warn() {
    this.unlock();
    const c = this.ctx; if (!c || c.state !== 'running') return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = 'square'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.3);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.34);
  },
  /* 音色：std＝3音のベル（上昇）／alert＝警報ベル（4音）／soft＝やわらかな4音（下降）。旧い設定値も読み替える */
  KINDS: {
    std: [[659.25, 0], [783.99, 0.42], [987.77, 0.84]],
    alert: [[880, 0], [1046.5, 0.16], [1318.5, 0.32], [1046.5, 0.5]],
    soft: [[1046.5, 0], [880, 0.5], [783.99, 1.0], [659.25, 1.5]]
  },
  play(kind, force) {
    const nowMs = performance.now();
    if (!force && nowMs - this._p < 500) return; this._p = nowMs;
    this.unlock();
    const c = this.ctx; if (!c || c.state !== 'running') return;
    const alias = { alarm: 'alert', jr: 'soft' };
    let k = kind || Settings.get('chimeType') || 'std';
    k = alias[k] || k; if (!this.KINDS[k]) k = 'std';
    const t0 = c.currentTime + 0.05;
    this.KINDS[k].forEach(([f, d]) => this.bell(f, t0 + d, k === 'alert' ? 0.26 : 0.32, k === 'alert' ? 1.1 : 1.6));
  }
};

/* ---------- 下部ニュースティッカー ---------- */
const Ticker = {
  last: '',
  text() {
    const bi = I18n.bi();
    const abn = LINES.map(L => ({ L, s: Store.of(L.ja) })).filter(x => x.s.status !== 'normal')
      .sort((a, b) => STATUS[a.s.status].rank - STATUS[b.s.status].rank);
    if (!abn.length) return '現在、関東エリアの主要路線は平常通り運転しています。' + (bi ? ' / All major lines are operating normally.' : '');
    return abn.map(({ L, s }) => `【${L.ja}　${STATUS[s.status].ja}】${s.detail || ''}`).join('　／　');
  },
  render() {
    const track = document.getElementById('tickerTrack'); if (!track) return;
    const pps = { slow: 60, normal: 90, fast: 140 }[Settings.get('tickerSpeed')] || 90;
    const t = this.text(), key = t + '|' + pps;
    if (key === this.last && track.textContent) return; // 内容・速度が同じなら流れを途切れさせない
    track.textContent = t;
    const w = track.scrollWidth;
    if (!w) { this.last = ''; return; } // 非表示中は計測できないので次回に
    this.last = key;
    track.style.animationDuration = Math.max(12, w / pps) + 's'; // 速度設定に応じたスクロール
  }
};

/* ---------- 車内放送風の音声読み上げ（Web Speech API） ---------- */
const Speech = {
  say(text, cancel = true) {
    if (!('speechSynthesis' in window)) return;
    if (cancel) { const nowMs = Date.now(); if (nowMs - (this._t || 0) < 400) return; this._t = nowMs; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP'; u.rate = 0.95;
    const v = (speechSynthesis.getVoices() || []).find(x => x.lang && x.lang.replace('_', '-').startsWith('ja'));
    if (v) u.voice = v;
    if (cancel) speechSynthesis.cancel();
    speechSynthesis.speak(u);
  },
  /* 「〇〇線は、△△の影響で遅れが出ています。」 */
  textFor(name) {
    const s = Store.of(name), m = (s.detail || '').match(/は[、,]?\s*(.{2,40}?)の影響/);
    const reason = m ? `${m[1]}の影響で、` : '';
    if (s.status === 'suspend') return `${name}は、${reason}運転を見合わせています。`;
    if (s.status === 'partial') return `${name}は、${reason}一部の列車を運休しています。`;
    return `${name}は、${reason}遅れが出ています。`;
  },
  announce(names) { names.forEach((n, i) => this.say(this.textFor(n), i === 0)); }
};

/* ---------- ステータス変化の履歴ログ（最新50件） ---------- */
const History = {
  KEY: 'tokyo-lcd:history', list: [],
  load() { try { const a = JSON.parse(localStorage.getItem(this.KEY) || '[]'); if (Array.isArray(a)) this.list = a.slice(0, 50); } catch (_) {} },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.list)); } catch (_) {} },
  record(prev, now) {
    const t = Date.now(), add = [];
    Object.keys(now).forEach(n => { const from = prev[n] || 'normal'; if (from !== now[n]) add.push({ t, line: n, from, to: now[n] }); });
    if (!add.length) return;
    this.list = [...add, ...this.list].slice(0, 50); this.save();
    if (HistoryUI.isOpen()) HistoryUI.render();
  },
  clear() { this.list = []; this.save(); }
};
const HistoryUI = {
  init() { document.getElementById('btnHistory').onclick = () => this.open(); },
  open() { Modals.open('modalHistory'); this.render(); },
  isOpen() { return !document.getElementById('modalHistory').hidden; },
  render() {
    const p = n => String(n).padStart(2, '0'), el = document.getElementById('histList');
    el.innerHTML = History.list.length ? History.list.map(h => {
      const L = lineByName(h.line); if (!L) return '';
      const d = new Date(h.t), to = h.to === 'normal' ? '復旧' : STATUS[h.to].ja;
      return `<div class="tl-row"><time>${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}</time>
        <span class="badge sm" style="--lc:${L.color}">${L.code}</span><b>${L.ja}</b>
        <span class="tl-chg ${h.to}">${STATUS[h.from].ja} → ${to}</span></div>`;
    }).join('') : '<div class="empty">まだ記録がありません。運行状況が変化すると自動で記録されます。</div>';
  }
};

/* ---------- 路線ごとのマイメモ ---------- */
const Memos = {
  KEY: 'tokyo-lcd:memos', data: {},
  load() { try { this.data = JSON.parse(localStorage.getItem(this.KEY) || '{}') || {}; } catch (_) { this.data = {}; } },
  get(n) { return this.data[n] || ''; },
  set(n, v) {
    if (v) this.data[n] = v; else delete this.data[n];
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (_) {}
  },
  clear() { this.data = {}; try { localStorage.removeItem(this.KEY); } catch (_) {} }
};

/* ---------- マイ駅（よく使う駅）＋乗り換え案内風モーダル ---------- */
const Stn = {
  KEY: 'tokyo-lcd:mystations', list: [],
  load() { try { const a = JSON.parse(localStorage.getItem(this.KEY) || '[]'); if (Array.isArray(a)) this.list = a.filter(n => typeof n === 'string' && n.length > 0); } catch (_) {} },
  has(n) { return this.list.includes(n); },
  toggle(n) {
    this.list = this.has(n) ? this.list.filter(x => x !== n) : [...this.list, n];
    try { localStorage.setItem(this.KEY, JSON.stringify(this.list)); } catch (_) {}
    document.dispatchEvent(new CustomEvent('stn:change'));
  }
};
const StationUI = {
  cur: null, q: '',
  init() {
    const inp = document.getElementById('stnInput'), clr = document.getElementById('stnClear');
    document.getElementById('btnStation').onclick = () => this.open();
    inp.addEventListener('input', () => { this.q = inp.value; this.render(); });
    clr.onclick = () => { this.q = ''; inp.value = ''; this.render(); };
    document.getElementById('stnList').addEventListener('click', e => {
      const star = e.target.closest('.star'); if (star) { Stn.toggle(star.dataset.stn); return; }
      if (e.target.closest('[data-back]')) { this.cur = null; this.render(); return; }
      if (e.target.closest('[data-zoomstn]')) { const n = this.cur; Modals.closeAll(); Locate.jumpTo(n); return; }
      const line = e.target.closest('.lr-main[data-line]'); if (line) { Modals.closeAll(); Detail.open(line.dataset.line); return; }
      const row = e.target.closest('[data-stn]'); if (row) { this.cur = row.dataset.stn; this.render(); }
    });
    document.addEventListener('stn:change', () => { if (this.isOpen()) this.render(); });
  },
  open(name) { Modals.open('modalStation'); this.cur = name || null; this.q = ''; document.getElementById('stnInput').value = ''; this.render(); },
  isOpen() { return !document.getElementById('modalStation').hidden; },
  worst(names) { return (names || []).map(n => Store.of(n).status).sort((a, b) => STATUS[a].rank - STATUS[b].rank)[0] || 'normal'; },
  render() {
    const sheet = document.getElementById('stnSheet'), el = document.getElementById('stnList'), on = I18n.bi();
    sheet.classList.toggle('stn-detail', !!this.cur);
    document.getElementById('stnClear').hidden = !this.q;
    if (this.cur) {
      const lines = Stations.lines(this.cur).slice().sort((a, b) => Store.rank(a) - Store.rank(b));
      const w = this.worst(lines), fav = Stn.has(this.cur);
      el.innerHTML = `<button class="stn-back" data-back><span class="material-symbols-outlined">arrow_back</span>${bi('駅一覧へ戻る', 'Back')}</button>
        <div class="tr-card">
          <div class="tr-head"><div class="tr-name"><b>${esc(this.cur)}</b><span>駅</span></div>
            <div class="tr-meta">${on ? '<small>Transfer Information</small>' : ''}${statusBadge(w, 'car')}</div>
            <button class="star${fav ? ' on' : ''}" data-stn="${esc(this.cur)}" aria-pressed="${fav}" aria-label="マイ駅に登録"><span class="material-symbols-outlined">star</span></button></div>
          <div class="lcd-sub">${on ? '乗り換え案内　Transfer Information' : '乗り換え案内'}</div>
          <div class="tr-lines">${lines.length ? lines.map(n => {
            const L = lineByName(n), s = Store.of(n).status;
            return `<div class="line-row s-${s}" style="--lc:${L.color}"><button class="lr-main" data-line="${L.ja}"><span class="badge">${L.code}</span>
              <span class="lr-name"><b>${L.ja}</b>${on ? `<small>${L.en}</small>` : ''}</span>${statusBadge(s)}</button></div>`;
          }).join('') : '<div class="empty">この駅の路線情報は推定できませんでした。路線図上の位置は表示できます。</div>'}</div>
          <div class="tr-act"><button class="sp-btn" data-zoomstn><span class="material-symbols-outlined">zoom_in_map</span>路線図でこの駅へ移動</button></div>
        </div>`;
      return;
    }
    const row = name => {
      const ls = Stations.lines(name), w = this.worst(ls), fav = Stn.has(name);
      return `<div class="line-row s-${w}"><button class="lr-main" data-stn="${esc(name)}"><span class="badge stn-ic"><span class="material-symbols-outlined">train</span></span>
          <span class="lr-name"><b>${esc(name)}駅</b><small>${ls.length}路線</small></span>${statusBadge(w)}</button>
        <button class="star${fav ? ' on' : ''}" data-stn="${esc(name)}" aria-pressed="${fav}" aria-label="マイ駅に登録"><span class="material-symbols-outlined">star</span></button></div>`;
    };
    const q = Search.norm(this.q);
    const chips = (!q && Stn.list.length) ? `<div class="stn-chips"><span class="fav-title"><span class="material-symbols-outlined">star</span>${I18n.label('myStation')}</span>` +
      Stn.list.map(n => `<button class="fav-chip s-${this.worst(Stations.lines(n))}" data-stn="${esc(n)}"><b>${esc(n)}</b></button>`).join('') + '</div>' : '';
    const names = q ? Stations.search(q).map(e => e.name) : STATIONS.map(S => S[0]).sort((a, b) => Stn.has(b) - Stn.has(a));
    el.innerHTML = chips + (names.length ? names.map(row).join('') : `<div class="empty">${I18n.text('none')}</div>`);
  }
};

/* ---------- 公式遅延証明書リンク集（※URLは各社サイトの変更で変わることがあります） ---------- */
const DELAY_LINKS = [
  ['JR東日本', 'JR East', 'https://traininfo.jreast.co.jp/delay_certificate/', 'https://www.jreast.co.jp/'],
  ['東京メトロ', 'Tokyo Metro', 'https://www.tokyometro.jp/delay/', 'https://www.tokyometro.jp/'],
  ['都営地下鉄', 'Toei Subway', 'https://www.kotsu.metro.tokyo.jp/subway/delay/', 'https://www.kotsu.metro.tokyo.jp/'],
  ['東急電鉄', 'Tokyu', 'https://www.tokyu.co.jp/railway/delay/', 'https://www.tokyu.co.jp/railway/'],
  ['小田急電鉄', 'Odakyu', 'https://www.odakyu.jp/delay/', 'https://www.odakyu.jp/'],
  ['京王電鉄', 'Keio', 'https://www.keio.co.jp/delay/', 'https://www.keio.co.jp/'],
  ['西武鉄道', 'Seibu', 'https://www.seiburailway.jp/railway/delay/', 'https://www.seiburailway.jp/'],
  ['東武鉄道', 'Tobu', 'https://www.tobu.co.jp/delay/', 'https://www.tobu.co.jp/'],
  ['京成電鉄', 'Keisei', 'https://www.keisei.co.jp/keisei/tetudou/delay/', 'https://www.keisei.co.jp/'],
  ['京浜急行電鉄', 'Keikyu', 'https://www.keikyu.co.jp/delay/', 'https://www.keikyu.co.jp/'],
  ['相模鉄道', 'Sotetsu', 'https://www.sotetsu.co.jp/delay/', 'https://www.sotetsu.co.jp/'],
  ['つくばエクスプレス', 'Tsukuba Express', 'https://www.mir.co.jp/delay/', 'https://www.mir.co.jp/']
];
const LinksUI = {
  init() { document.getElementById('modalLinks').addEventListener('click', () => {}); },
  open() {
    Modals.open('modalLinks');
    document.getElementById('linksList').innerHTML = DELAY_LINKS.map(([ja, en, cert, top]) =>
      `<div class="link-row"><span class="lr-name"><b>${ja}</b>${I18n.bi() ? `<small>${en}</small>` : ''}</span>
        <a class="btn-yahoo" href="${cert}" target="_blank" rel="noopener noreferrer"><span class="material-symbols-outlined">receipt_long</span>${bi('遅延証明書', 'Delay certificate')}</a>
        <a class="btn-yahoo plain" href="${top}" target="_blank" rel="noopener noreferrer"><span class="material-symbols-outlined">open_in_new</span>${bi('公式サイト', 'Site')}</a></div>`).join('');
  }
};

/* ---------- 振替・代替ルートの路線図ハイライト ---------- */
const Detour = {
  active: null,
  show(name) {
    const L = lineByName(name); if (!L) return;
    Cycle.toMap();
    const alts = L.alt.map(lineByName).filter(Boolean);
    this.active = name;
    Engine.setState({ detour: name });
    const bar = document.getElementById('detourBar');
    bar.innerHTML = `<span class="material-symbols-outlined">alt_route</span><span><b>${esc(name)}</b>　振替・代替ルート：${esc(alts.map(a => a.ja).join('・'))}</span><button id="detourOff">解除</button>`;
    bar.hidden = false; document.getElementById('detourOff').onclick = () => this.clear();
    const c = MapView.lineCenter(name);
    if (c) Zoom.animateTo(c.x, c.y, Zoom.maxVw() / 2.2);
    else UI.toast('この路線は路線図上に描画がありません（代替路線のみ強調します）');
  },
  clear(keepBar) {
    this.active = null;
    Engine.setState({ detour: null });
    if (!keepBar) document.getElementById('detourBar').hidden = true;
  }
};

/* ---------- 異常路線LCDボード（E235系 異常時案内レイアウトの一覧） ---------- */
const Board = {
  abn() {
    return LINES.map(L => ({ L, s: Store.of(L.ja) })).filter(x => x.s.status !== 'normal')
      .sort((a, b) => STATUS[a.s.status].rank - STATUS[b.s.status].rank);
  },
  cards() {
    const on = I18n.bi(), abn = this.abn();
    return abn.length ? `<div class="board-list">${abn.map(({ L, s }) => {
      const th = Lcd.resolveTheme(L);
      return `<button class="board-card bc-th-${th}" data-line="${esc(L.ja)}" style="--lc:${L.color}">
          <div class="bc-head"><span class="bc-edge" aria-hidden="true"></span><span class="cbar"></span><span class="sym">${esc(L.code)}</span>
            <div class="lname"><b class="fit ${Lcd.lsClass(L.ja)}">${esc(L.ja)}</b>${on ? `<small>${esc(L.en)}</small>` : `<span class="bc-dir">${esc(L.directionText)} 方面</span>`}</div>${statusBadge(s.status, 'car')}</div>
          <div class="bc-sub"><span>${esc(Lcd.themeBadge(th, L))}</span><span class="lcd-chev" aria-hidden="true"><i>›</i><i>›</i><i>›</i></span></div>
          <div class="bc-body"><p class="h">【${esc(L.ja)}　${STATUS[s.status].ja}】</p><p>${Detail.highlight(s.detail || '')}</p>
            <div class="bc-meta">${Cause.chipHtml(s.detail)}${Insight.chipsHtml(s)}</div></div></button>`;
    }).join('')}</div>` : '';
  },
  okHtml() {
    return `<div class="board-ok"><span class="material-symbols-outlined">check_circle</span><b>現在、関東エリアの主要路線は平常通り運転しています。</b>${I18n.bi() ? '<small>All major lines are operating normally.</small>' : ''}</div>`;
  },
  render() {
    const el = document.getElementById('abnBoard'), on = I18n.bi(), d = new Date();
    el.innerHTML = `<div class="board-head"><span>運行情報${on ? '　Train Information' : ''}</span><time>${pad(d.getHours())}:${pad(d.getMinutes())}</time></div>` + (this.cards() || this.okHtml());
    Fit.all(el);
  }
};

/* ---------- 異常路線クイック一覧（ヘッダーの異常件数バッジから開く） ---------- */
const AbnUI = {
  init() {
    document.getElementById('abnBadge').onclick = () => this.open();
    document.getElementById('abnList').addEventListener('click', e => {
      const c = e.target.closest('.board-card'); if (c) { Modals.closeAll(); Detail.open(c.dataset.line); }
    });
  },
  open() { Modals.open('modalAbn'); this.render(); },
  isOpen() { return !document.getElementById('modalAbn').hidden; },
  render() {
    const n = Board.abn().length, listEl = document.getElementById('abnList');
    document.getElementById('abnMeta').textContent = n ? `現在 ${n}路線で運行に乱れがあります（運転見合わせ・遅延・一部運休）` : '';
    listEl.innerHTML = Board.cards() || Board.okHtml();
    Fit.all(listEl);
  }
};

/* ---------- E235系風 LCD大画面時計モード（タップで路線図へ戻る） ---------- */
const ClockMode = {
  el: null,
  init() {
    this.el = document.getElementById('clockMode');
    document.getElementById('btnClock').onclick = () => (this.isOpen() ? this.close() : this.open());
    this.el.addEventListener('click', () => this.close());
  },
  isOpen() { return !!this.el && !this.el.hidden; },
  open() {
    Modals.closeAll();
    const on = I18n.bi();
    this.el.innerHTML = `<div class="ck-head"><b>運行情報${on ? '　Train Information' : ''}</b><span class="ck-car"><b id="ckCar"></b>号車</span></div>
      <div class="ck-main"><div class="ck-time" id="ckTime">--:--:--</div><div class="ck-date" id="ckDate"></div></div>
      <div class="ck-foot"><div class="ck-meter"><small>正常稼働率${on ? ' / Uptime' : ''}</small><b id="ckPct">--</b></div><div class="ck-abn" id="ckAbn"></div></div>
      <div class="ck-hint">画面タップで路線図に戻ります</div>`;
    this.el.hidden = false;
    document.getElementById('btnClock').setAttribute('aria-pressed', 'true');
    this.tick(); this.data();
  },
  close() {
    if (!this.isOpen()) return;
    this.el.hidden = true;
    document.getElementById('btnClock').setAttribute('aria-pressed', 'false');
  },
  tick() {
    if (!this.isOpen()) return;
    const d = new Date(), w = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
    document.getElementById('ckTime').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    document.getElementById('ckDate').textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${w}）`;
    document.getElementById('ckCar').textContent = Settings.get('carNo');
  },
  data() {
    if (!this.isOpen()) return;
    const ready = UI.lastOk > 0 || Settings.get('demo'), abn = Board.abn();
    document.getElementById('ckPct').textContent = ready ? ((LINES.length - abn.length) / LINES.length * 100).toFixed(1) + '%' : '--';
    document.getElementById('ckAbn').innerHTML = !ready ? '<span class="ck-ok">運行情報を取得中…</span>'
      : abn.length ? abn.slice(0, 5).map(({ L, s }) => `<span class="ck-chip ${s.status}">【${L.ja}　${STATUS[s.status].ja}】</span>`).join('') +
          (abn.length > 5 ? `<span class="ck-chip more">ほか${abn.length - 5}路線</span>` : '')
      : '<span class="ck-ok">現在、関東エリアの主要路線は平常通り運転しています。</span>';
  }
};

/* ---------- 自動画面サイクル（路線図 ⇔ 異常路線ボードを8秒ごとに切替） ---------- */
const Cycle = {
  timer: null, view: 'map', paused: false, idle: null,
  start() { this.stop(true); if (Settings.get('autoCycle')) this.timer = setInterval(() => this.tick(), 8000); },
  stop(silent) { clearInterval(this.timer); this.timer = null; clearTimeout(this.idle); this.paused = false; if (!silent) this.toMap(); },
  tick() { if (this.paused || document.querySelector('.modal:not([hidden])')) return; this.view = this.view === 'map' ? 'board' : 'map'; this.apply(); },
  toMap() { this.view = 'map'; this.apply(); },
  apply() { const b = document.getElementById('abnBoard'); b.hidden = this.view !== 'board'; if (!b.hidden) Board.render(); },
  /* 触ったら一時停止し、20秒操作が無ければ再開 */
  pause() {
    if (!Settings.get('autoCycle')) return;
    this.paused = true; clearTimeout(this.idle); this.idle = setTimeout(() => { this.paused = false; }, 20000);
  }
};

/* ---------- 券売機（MV50系）風 設定画面 ---------- */
const OPT_INTERVAL = [[60000, '1分ごと', 'Every 1 min'], [180000, '3分ごと', 'Every 3 min'], [300000, '5分ごと', 'Every 5 min'], [0, '手動のみ', 'Manual only']];
const OPT_SPEED = [['slow', '遅い', 'Slow'], ['normal', '標準', 'Normal'], ['fast', '速い', 'Fast']];
const OPT_FILTER = COMPANIES.map(c => [c.id, c.ja, c.en]);
const OPT_CHIME = [['std', '標準ベル', 'Bell'], ['alert', '警報ベル', 'Alert'], ['soft', 'やわらか4音', 'Soft']];
const OPT_TOP = [[42, '標準 42px', 'Standard'], [56, '広め 56px', 'Wide'], [0, 'なし 0px', 'None']];
const OPT_LCD_THEME = [
  ['auto', '路線別自動切替（実車再現）', 'Auto by railway'],
  ['jr', 'JR東日本（E235系セサミクロ）固定', 'JR East E235'],
  ['metro', '東京メトロ（Tokyo Metro Vision）固定', 'Tokyo Metro Vision'],
  ['toei', '都営地下鉄（ワイドLCD）固定', 'Toei Wide LCD'],
  ['tokyu', '東急（TOQビジョン）固定', 'Tokyu TOQ Vision'],
  ['private', '私鉄各社（TVOS / スマイルビジョン）固定', 'Private Railways']
];
const SETTING_DEFS = [
  { key: 'lcdTheme', cat: 'display', ja: '車内LCD表示テーマ', en: 'In-car LCD theme', type: 'cycle', opts: OPT_LCD_THEME },
  { key: 'bilingual', cat: 'display', ja: '日英バイリンガル表記', en: 'Bilingual display', type: 'bool' },
  { key: 'ticker', cat: 'display', ja: '下部ニュースティッカー', en: 'News ticker', type: 'bool' },
  { key: 'tickerSpeed', cat: 'display', ja: 'ティッカー速度', en: 'Ticker speed', type: 'cycle', opts: OPT_SPEED },
  { key: 'lcdOverlay', cat: 'display', ja: '液晶ピクセル質感', en: 'LCD pixel texture', type: 'bool' },
  { key: 'carNo', cat: 'display', ja: '号車表示番号', en: 'Car number', type: 'car' },
  { key: 'initFilter', cat: 'display', ja: '起動時の会社フィルター', en: 'Initial company filter', type: 'cycle', opts: OPT_FILTER },
  { key: 'nightDim', cat: 'display', ja: '画面の明るさ（夜間減光）', en: 'Night dimming', type: 'bool' },
  { key: 'topOffset', cat: 'display', ja: '上部余白（PWAバー回避）', en: 'Top offset (PWA bar)', type: 'cycle', opts: OPT_TOP },
  { key: 'chime', cat: 'audio', ja: '新規遅延のチャイム通知', en: 'Chime on new delays', type: 'bool' },
  { key: 'chimeType', cat: 'audio', ja: 'チャイム音色（タップで試聴）', en: 'Chime tone (tap to preview)', type: 'cycle', opts: OPT_CHIME },
  { key: 'speech', cat: 'audio', ja: '車内放送風の音声読み上げ', en: 'Voice announcement', type: 'bool' },
  { key: 'beep', cat: 'audio', ja: '券売機タッチ音（ピッ）', en: 'Touch beep', type: 'bool' },
  { key: 'autoLocate', cat: 'comm', ja: '起動時に現在地へ自動移動', en: 'Auto-locate on launch', type: 'bool' },
  { key: 'autoCycle', cat: 'comm', ja: '自動画面サイクル（8秒）', en: 'Auto screen cycle', type: 'bool' },
  { key: 'hud', cat: 'comm', ja: '性能診断HUD（FPS・DOM数）', en: 'Performance HUD', type: 'bool' },
  { key: 'miniTags', cat: 'display', ja: '路線図の異常ミニタグ', en: 'Map status tags', type: 'bool' },
  { key: 'nightWatch', cat: 'comm', ja: '深夜・終電ウォッチ（常時ON）', en: 'Late-night watch', type: 'bool' },
  { key: 'blink', cat: 'display', ja: '異常路線の点滅（省電力ならOFF）', en: 'Blinking alerts (off saves power)', type: 'bool' },
  { key: 'interval', cat: 'comm', ja: '自動更新間隔', en: 'Auto refresh interval', type: 'cycle', opts: OPT_INTERVAL }
];
const MV_CATS = [['display', '表示・LCD', 'Display'], ['audio', '音声・通知', 'Sound'], ['comm', '通信・動作', 'System'], ['all', 'すべて表示', 'Show all']];
const MV_DEFAULT_MSG = 'ご希望の設定項目をタッチしてください';
const MV = {
  cat: 'display', armTimer: null,
  init() {
    document.getElementById('btnSettings').onclick = () => this.open();
    document.getElementById('modalSettings').addEventListener('click', e => {
      if (e.target.closest('#mvHelp')) { HelpUI.open(); Chime.beep(); return; }
      const t = e.target.closest('.mv-screen button, .mv-cancel'); if (!t) return;
      const cat = e.target.closest('[data-cat]'), key = e.target.closest('[data-key]'), act = e.target.closest('[data-act]');
      if (cat) { this.cat = cat.dataset.cat; this.render(); }
      else if (key) this.activate(key.dataset.key);
      else if (act) this.act(act.dataset.act, act);
      else if (e.target.closest('#mvBright')) {
        Settings.set('nightDim', !Settings.get('nightDim'));
        this.say(`設定を変更しました：夜間減光 ${Settings.get('nightDim') ? 'ON' : 'OFF'}`);
      }
      if (Settings.get('beep')) Chime.beep(); // 券売機タッチ音
    });
  },
  open() { Modals.open('modalSettings'); this.say(MV_DEFAULT_MSG); this.render(); this.tickTime(); },
  isOpen() { return !document.getElementById('modalSettings').hidden; },
  /* 案内メッセージバー：変更のたびに文言を差し替え、点滅で知らせる */
  say(t) {
    const el = document.getElementById('mvMsg'); if (!el) return;
    el.textContent = t; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  },
  valText(d) {
    const v = Settings.get(d.key);
    if (d.type === 'bool') return v ? 'ON' : 'OFF';
    if (d.type === 'car') return v + '号車';
    const o = d.opts.find(x => x[0] === v); return o ? o[1] : String(v);
  },
  def(key) { return SETTING_DEFS.find(d => d.key === key); },
  activate(key) {
    if (key === 'demo') {
      Settings.set('demo', !Settings.get('demo'));
      this.say(`設定を変更しました：デモモード ${Settings.get('demo') ? 'ON' : 'OFF'}`); return;
    }
    const d = this.def(key); if (!d) return;
    const v = Settings.get(key);
    if (d.type === 'bool') {
      Settings.set(key, !v);
      if (!v && key === 'chime') Chime.play(null, true);
      if (!v && key === 'speech') Speech.say('音声案内をオンにしました。');
    } else if (d.type === 'cycle') {
      const i = d.opts.findIndex(o => o[0] === v), nv = d.opts[(i + 1) % d.opts.length][0];
      Settings.set(key, nv);
      if (key === 'chimeType') Chime.play(nv, true); // 切り替えた音色を試聴
    } else if (d.type === 'car') Settings.set(key, (Number(v) % 15) + 1);
    this.say(`設定を変更しました：${d.ja}　${this.valText(d)}`);
  },
  /* 破壊的な操作は「もう一度タップで実行」の2段階確認 */
  act(name, btn) {
    if (name === 'links') { LinksUI.open(); return; }
    if (name === 'backup') { Backup.open(); return; }
    if (btn.dataset.armed !== '1') {
      btn.dataset.armed = '1'; btn.classList.add('armed'); Chime.warn();
      this.say('もう一度タップで実行します');
      clearTimeout(this.armTimer);
      this.armTimer = setTimeout(() => { btn.dataset.armed = ''; btn.classList.remove('armed'); this.say(MV_DEFAULT_MSG); }, 3000);
      return;
    }
    btn.dataset.armed = ''; btn.classList.remove('armed');
    if (name === 'resetLog') { History.clear(); Memos.clear(); Routes.list = []; Routes.save(); UI.toast('履歴ログ・メモ・マイルートを初期化しました'); this.say('履歴ログを初期化しました'); }
    if (name === 'clearCache') this.clearCache();
  },
  async clearCache() {
    try {
      const regs = (navigator.serviceWorker && await navigator.serviceWorker.getRegistrations()) || [];
      await Promise.all(regs.map(r => r.unregister()));
      if (window.caches) await Promise.all((await caches.keys()).map(k => caches.delete(k)));
    } catch (e) { console.warn(e); }
    location.reload();
  },
  tile(d) {
    const v = Settings.get(d.key), on = I18n.bi();
    let badge;
    if (d.type === 'bool') badge = `<span class="st-badge ${v ? 'on' : 'off'}">${v ? 'ON' : 'OFF'}</span>`;
    else if (d.type === 'car') badge = `<span class="st-badge val">${v}号車</span>`;
    else { const o = d.opts.find(x => x[0] === v) || d.opts[0]; badge = `<span class="st-badge val">${o[1]}${on ? `<small>${o[2]}</small>` : ''}</span>`; }
    return `<button class="mv-btn tile" data-key="${d.key}"><span class="t-lbl"><b>${d.ja}</b>${on ? `<small>${d.en}</small>` : ''}</span>${badge}</button>`;
  },
  render() {
    const on = I18n.bi(), demo = !!Settings.get('demo');
    document.getElementById('mvCats').innerHTML = MV_CATS.map(([id, ja, en]) =>
      `<button class="mv-tab" data-cat="${id}" aria-pressed="${id === this.cat}">${ja}${on ? `<small>${en}</small>` : ''}</button>`).join('');
    document.getElementById('mvMain').innerHTML = `<button class="mv-main-btn" data-key="demo"><b>デモモード切替（現在：${demo ? 'ON' : 'OFF'}）</b>
      <small>${demo ? 'ダミーデータを表示中です。タップで実際の運行情報に切り替えます' : 'タップでダミーデータ表示に切り替えます（路線図の発光テスト用）'}${on ? ' / Demo mode' : ''}</small></button>`;
    document.getElementById('mvGrid').innerHTML = SETTING_DEFS.filter(d => this.cat === 'all' || d.cat === this.cat).map(d => this.tile(d)).join('');
    const bright = document.getElementById('mvBright'); if (bright) bright.classList.toggle('on', !!Settings.get('nightDim'));
    const bs = document.getElementById('mvBrightState'); if (bs) bs.textContent = Settings.get('nightDim') ? 'ON' : 'OFF';
  },
  tickTime() {
    const el = document.getElementById('mvTime'); if (!el) return;
    const d = new Date(); el.textContent = `${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 ${pad(d.getHours())}時${pad(d.getMinutes())}分`;
  }
};

/* ---------- 全駅インデックス：路線図SVG内の駅名テキストを自動抽出（路線名・凡例などは除外） ---------- */
const NOISE_NAMES = new Set(['皇居', '国際', '国内', '東京都', '本線', '車庫']);
const Stations = {
  list: null, byName: null, grid: null,
  BAD: /線|ライン|ライナー|モノレール|ゆりかもめ|行|方面|号車|大学|公園|空港|ターミナル|ディズニー|病院|球場|競馬|JR|メトロ|都営|東急|小田急|京王|西武|東武|京成|京急|相鉄|つくば|ＪＲ/,
  /* 初回のみ走査（以後はメモリ上の辞書を使う）。日本語のみ・2〜8文字の駅名だけを採用 */
  ensure() {
    if (this.list) return this.list;
    const svg = MapView.svg; if (!svg) return [];
    this.list = []; this.byName = new Map();
    const seen = new Map(), pt = svg.createSVGPoint();
    const add = (raw, b, m) => {
      const name = raw.replace(/駅$/, '');
      if (name.length < 2 || name.length > 8 || this.BAD.test(name) || NOISE_NAMES.has(name) || lineByName(name)) return;
      if (!/[\u3040-\u30ff\u4e00-\u9fff]/.test(name) || /[A-Za-z0-9]/.test(name)) return;
      const c = [[b.x, b.y], [b.x + b.width, b.y + b.height]].map(([x, y]) => { pt.x = x; pt.y = y; return pt.matrixTransform(m); });
      const x0 = Math.min(c[0].x, c[1].x), x1 = Math.max(c[0].x, c[1].x), y0 = Math.min(c[0].y, c[1].y), y1 = Math.max(c[0].y, c[1].y);
      const area = (x1 - x0) * (y1 - y0);
      let e = seen.get(name);
      if (!e) { e = { name, x: (x0 + x1) / 2, y: (y0 + y1) / 2, area: 0, parts: [], lines: null }; seen.set(name, e); }
      e.parts.push({ x0, y0, x1, y1 });
      if (area > e.area) { e.area = area; e.x = (x0 + x1) / 2; e.y = (y0 + y1) / 2; }
    };
    svg.querySelectorAll('text').forEach(t => {
      let b, m;
      try { b = t.getBBox(); m = toRoot(t); } catch (_) { return; }
      if (!m || !b || !b.width) return;
      const tsp = [...t.querySelectorAll('tspan')];
      const names = tsp.length ? tsp.map(p => p.textContent.replace(/\s+/g, '')) : [t.textContent.replace(/\s+/g, '')];
      names.forEach(raw => { if (raw) add(raw, b, m); });
    });
    this.list = [...seen.values()];
    this.list.forEach(e => this.byName.set(e.name, e));
    return this.list;
  },
  get(name) { this.ensure(); return this.byName ? (this.byName.get(name) || null) : null; },
  /* 指定の路線図座標（SVG単位）が駅名ラベルの上にあれば、その駅を返す */
  at(x, y, pad) {
    let best = null, bd = Infinity;
    for (const e of (this.ensure() || [])) for (const p of e.parts) {
      if (x >= p.x0 - pad && x <= p.x1 + pad && y >= p.y0 - pad && y <= p.y1 + pad) {
        const d = Math.hypot(e.x - x, e.y - y); // ラベルが重なるときは中心が最も近い駅を選ぶ
        if (d < bd) { bd = d; best = e; }
      }
    }
    return best;
  },
  /* 部分一致（前方一致を優先）。q は正規化済みの文字列 */
  search(q) {
    const hits = [];
    (this.ensure() || []).forEach(e => { const n = Search.norm(e.name); if (n.includes(q)) hits.push({ e, r: n.startsWith(q) ? 0 : 1 }); });
    return hits.sort((a, b) => a.r - b.r || a.e.name.length - b.e.name.length).slice(0, 60).map(h => h.e);
  },
  /* 駅の乗り入れ路線：主要駅はマスターを使い、それ以外は路線図上の位置から推定 */
  lines(name) {
    const M = stationByName(name); if (M) return M[3].filter(lineByName);
    const e = this.get(name); if (!e) return [];
    if (!e.lines) e.lines = this.nearLines(e.x, e.y);
    return e.lines;
  },
  /* 駅ラベル付近を通る路線の推定（路線索引 LineGeo を使う） */
  nearLines(x, y) { return LineGeo.lines(x, y, Math.max(40, Zoom.VW * 0.009)); }
};

/* 要素の座標 → ルートSVGのユーザー座標（viewBoxの拡大・位置の影響を打ち消す。getCTM() は表示状態に依存するので使わない） */
const toRoot = el => {
  const root = MapView.svg && MapView.svg.getScreenCTM(), m = el.getScreenCTM();
  return root && m ? root.inverse().multiply(m) : null;
};

/* ---------- SVGのDOMダイエット：描画に影響しない要素だけを取り除く ---------- */
const Sanitize = {
  run(svg) {
    let removed = 0;
    const DROP = new Set(['metadata', 'title', 'desc']);
    const kill = n => { n.parentNode.removeChild(n); removed++; };
    const walk = el => {
      [...el.childNodes].forEach(n => {
        if (n.nodeType === 8) { kill(n); return; }                  // コメント
        if (n.nodeType !== 1) return;
        const tag = n.localName, st = n.getAttribute('style') || '';
        if (DROP.has(tag) || n.getAttribute('display') === 'none' || n.getAttribute('visibility') === 'hidden' ||
            /display\s*:\s*none|visibility\s*:\s*hidden/.test(st)) { kill(n); return; }
        walk(n);
        if (tag === 'g' && !n.id && n.children.length === 0) kill(n); // 中身が空の無名グループ
      });
    };
    walk(svg);
    return removed;
  }
};

/* ---------- 路線の描画線の位置索引（タップ判定用。描画要素は一切増やさない） ---------- */
const LineGeo = {
  grid: null, CELL: 100,
  ensure() {
    if (this.grid) return this.grid;
    const svg = MapView.svg; if (!svg) return new Map();
    const grid = new Map(), pt = svg.createSVGPoint();
    MapView.lines().forEach(g => {
      (g.__rails || []).forEach(el => {
        let len = 0, m = null;
        try { len = el.getTotalLength(); m = toRoot(el); } catch (_) { return; }
        if (!m || !len) return;
        const n = Math.min(500, Math.max(8, Math.ceil(len / 12)));
        for (let i = 0; i <= n; i++) {
          let p; try { p = el.getPointAtLength(len * i / n); } catch (_) { break; }
          pt.x = p.x; pt.y = p.y; const q = pt.matrixTransform(m);
          const k = Math.floor(q.x / this.CELL) + ',' + Math.floor(q.y / this.CELL);
          if (!grid.has(k)) grid.set(k, []);
          grid.get(k).push({ x: q.x, y: q.y, l: g.dataset.line });
        }
      });
    });
    this.grid = grid; return grid;
  },
  /* 指定点から thr 以内を通る路線の集合 */
  lines(x, y, thr) {
    const g = this.ensure(), out = new Set(), cx = Math.floor(x / this.CELL), cy = Math.floor(y / this.CELL), reach = Math.ceil(thr / this.CELL);
    for (let i = -reach; i <= reach; i++) for (let j = -reach; j <= reach; j++) {
      (g.get((cx + i) + ',' + (cy + j)) || []).forEach(s => { if (Math.hypot(s.x - x, s.y - y) <= thr) out.add(s.l); });
    }
    return [...out];
  },
  /* 最も近い路線（thr 以内のみ）。タップ判定に使う */
  nearest(x, y, thr) {
    const g = this.ensure(), cx = Math.floor(x / this.CELL), cy = Math.floor(y / this.CELL), reach = Math.ceil(thr / this.CELL);
    let best = null, bd = thr;
    for (let i = -reach; i <= reach; i++) for (let j = -reach; j <= reach; j++) {
      (g.get((cx + i) + ',' + (cy + j)) || []).forEach(s => { const d = Math.hypot(s.x - x, s.y - y); if (d <= bd) { bd = d; best = s.l; } });
    }
    return best;
  }
};

/* ---------- 点滅：約1.8秒ごとに描画の明るさだけを切り替える（DOMもCSSアニメーションも使わない） ---------- */
const Blink = {
  timer: 0,
  sync() {
    const want = !!Settings.get('blink');
    if (want && !this.timer) this.timer = setInterval(() => this.tick(), 1800);
    if (!want && this.timer) { clearInterval(this.timer); this.timer = 0; }
    Engine.setBlink(true); // 停止時は点灯のまま
  },
  tick() { if (document.hidden) return; Engine.setBlink(!Engine.blinkOn); }
};

/* ---------- 連打防止（350msのロック）：表示状態を切り替えるボタンの多重処理を防ぐ ---------- */
const Guard = {
  MS: 350, until: {},
  locked(key) { return (this.until[key] || 0) > performance.now(); },
  run(key, fn) {
    if (this.locked(key)) return false;
    this.until[key] = performance.now() + this.MS;
    fn();                                                        // 先に処理してから見た目を変える（再描画で要素が作り直されても対応）
    document.querySelectorAll(`[data-guard="${key}"]`).forEach(e => e.classList.add('cool'));
    setTimeout(() => document.querySelectorAll(`[data-guard="${key}"]`).forEach(e => e.classList.remove('cool')), this.MS);
    return true;
  }
};

/* ---------- 性能診断HUD：画質の状態・固定メモリ・描画回数・描画時間（1秒ごとに更新、rAFは使わない） ---------- */
const Hud = {
  el: null, on: false, timer: 0, lastCount: 0,
  setOn(v) {
    this.el = this.el || document.getElementById('hud');
    if (!this.el || this.on === !!v) return;
    this.on = !!v; this.el.hidden = !this.on; document.body.classList.toggle('hud-on', this.on);
    clearInterval(this.timer); this.timer = 0;
    if (this.on) { this.lastCount = Engine.drawCount; this.timer = setInterval(() => this.render(), 1000); this.render(); }
    else this.syncOffset();
  },
  syncOffset() {
    const root = document.documentElement;
    if (!this.on || !this.el || this.el.hidden) { root.style.removeProperty('--hud-offset'); return; }
    const h = this.el.offsetHeight || 32;
    root.style.setProperty('--hud-offset', (h + 18) + 'px');
  },
  render() {
    const n = Engine.drawCount, per = n - this.lastCount; this.lastCount = n;
    const mb = cv => (cv ? cv.width * cv.height * 4 / 1048576 : 0);
    const total = mb(Engine.base) + mb(Engine.canvas) + mb(Engine.patch);
    const hi = Engine.patchValid && Engine.viewMatches() ? '高精細ベクター描画済' : '標準描画';
    this.el.textContent = `${hi} ／ 固定メモリ 約${total.toFixed(1)}MB（基礎 ${mb(Engine.base).toFixed(1)}・表示 ${mb(Engine.canvas).toFixed(1)}・高精細 ${mb(Engine.patch).toFixed(1)}） ／ 描画 ${per}回/秒・直近 ${Engine.lastDraw.toFixed(2)}ms ／ 高精細 ${Engine.hiMs.toFixed(0)}ms ／ DOM ${document.getElementsByTagName('*').length}`;
    this.syncOffset();
  }
};

/* ---------- 駅ポップアップ：路線図の駅名タップ/* ---------- 駅ポップアップ：路線図の駅名タップ／駅検索からの移動時に表示 ---------- */
const StationPop = {
  el: null, name: null,
  init() {
    this.el = document.getElementById('stnPop');
    this.el.addEventListener('click', e => {
      if (e.target.closest('[data-pop-close]')) { this.close(); return; }
      if (e.target.closest('[data-pop-fav]')) { Stn.toggle(this.name); return; }
      if (e.target.closest('[data-pop-zoom]')) { Locate.jumpTo(this.name); return; }
      if (e.target.closest('[data-pop-detail]')) { const n = this.name; this.close(); StationUI.open(n); return; }
      const l = e.target.closest('[data-line]'); if (l) Detail.open(l.dataset.line);
    });
    document.addEventListener('stn:change', () => { if (this.isOpen()) this.render(); });
  },
  isOpen() { return !!this.el && !this.el.hidden; },
  open(name, cx, cy) {
    this.name = name; this.render();
    const W = window.innerWidth, H = window.innerHeight, pw = 300;
    let left = cx != null ? cx - pw / 2 : 16, top = cy != null ? cy - 60 : H * 0.3;
    const topH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--top-h')) || 0;
    left = Math.min(W - pw - 12, Math.max(12, left));
    top = Math.min(H - 260, Math.max(topH + 12, top));
    this.el.style.left = left + 'px'; this.el.style.top = top + 'px';
    this.el.hidden = false;
  },
  close() { if (this.el) this.el.hidden = true; this.name = null; },
  render() {
    if (!this.name) return;
    const lines = Stations.lines(this.name), on = I18n.bi(), fav = Stn.has(this.name), w = StationUI.worst(lines);
    this.el.innerHTML = `<div class="sp-head"><span class="material-symbols-outlined">place</span><b>${esc(this.name)}駅</b>
        <button class="sp-x" data-pop-close aria-label="閉じる"><span class="material-symbols-outlined">close</span></button></div>
      <div class="sp-st">${statusBadge(w)}<small>${lines.length}路線${on ? ' / lines' : ''}</small></div>
      <div class="sp-lines">${lines.length ? lines.slice(0, 10).map(n => {
        const L = lineByName(n), st = Store.of(n).status;
        return `<button class="sp-line s-${st}" data-line="${L.ja}" style="--lc:${L.color}"><span class="badge sm">${L.code}</span><span>${L.ja}</span>${statusBadge(st)}</button>`;
      }).join('') : '<span class="muted">路線情報を推定できませんでした</span>'}</div>
      <div class="sp-act">
        <button class="sp-btn${fav ? ' on' : ''}" data-pop-fav aria-pressed="${fav}"><span class="material-symbols-outlined">star</span>${fav ? 'マイ駅を解除' : 'マイ駅に登録'}</button>
        <button class="sp-btn" data-pop-zoom><span class="material-symbols-outlined">zoom_in_map</span>この駅にズーム</button>
        <button class="sp-btn" data-pop-detail><span class="material-symbols-outlined">list</span>詳細</button>
      </div>`;
  }
};

/* ---------- マイルート（通勤・通学の経路）と縦型乗換タイムライン診断 ---------- */
const Routes = {
  KEY: 'tokyo-lcd:routes', list: [],
  PRESETS: {
    commute: { name: '都心通勤（渋谷→新宿→東京）', from: '渋谷', vias: ['新宿'], to: '東京', lines: ['山手線', '中央線快速'] },
    through: { name: '横浜〜池袋（東横・副都心直通）', from: '横浜', vias: ['渋谷'], to: '池袋', lines: ['東急東横線', '副都心線'] }
  },
  normalize(r) {
    const lines = (Array.isArray(r.lines) ? r.lines : []).filter(n => lineByName(n)).slice(0, 4);
    const st = Array.isArray(r.stations) ? r.stations.map(s => String(s || '').trim()) : [];
    const from = r.from !== undefined ? String(r.from || '').trim().slice(0, 12) : (st[0] || '');
    const to = r.to !== undefined ? String(r.to || '').trim().slice(0, 12) : (st.length >= 2 ? st[st.length - 1] : '');
    let vias = Array.isArray(r.vias) ? r.vias.map(s => String(s || '').trim().slice(0, 12))
      : (st.length >= 3 ? st.slice(1, st.length - 1) : []);
    return {
      id: String(r.id || Date.now().toString(36)),
      name: String(r.name || 'マイルート').slice(0, 24),
      from, vias: vias.slice(0, 3), to,
      stations: [from, ...vias.filter(Boolean), to].filter(Boolean).slice(0, 5),
      lines
    };
  },
  load() {
    try {
      const a = JSON.parse(localStorage.getItem(this.KEY) || '[]');
      if (Array.isArray(a)) this.list = a.filter(r => r && r.name && Array.isArray(r.lines)).map(r => this.normalize(r)).filter(r => r.lines.length > 0);
    } catch (_) {}
  },
  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.list)); } catch (_) {}
    document.dispatchEvent(new CustomEvent('routes:change'));
  },
  add(r) { this.list = [...this.list, this.normalize({ id: Date.now().toString(36), ...r })]; this.save(); },
  remove(id) { this.list = this.list.filter(r => r.id !== id); this.save(); },
  inferTransfer(lineA, lineB) {
    const hit = STATIONS.find(([, , , ls]) => ls.includes(lineA) && ls.includes(lineB));
    return hit ? hit[0] : '';
  },
  status(r) {
    const bad = r.lines.map(n => ({ n, st: Store.of(n).status })).filter(x => x.st !== 'normal')
      .sort((a, b) => STATUS[a.st].rank - STATUS[b.st].rank);
    return { bad, worst: bad.length ? bad[0].st : 'normal' };
  },
  affected() { return this.list.filter(r => this.status(r).bad.length); }
};
const RouteUI = {
  editing: false,
  init() {
    document.getElementById('routeBody').addEventListener('click', e => {
      const srt = e.target.closest('[data-share-route]');
      if (srt) { const rr = Routes.list.find(x => x.id === srt.dataset.shareRoute); if (rr) Share.send(Share.route(rr)); return; }
      const det = e.target.closest('[data-detour]');
      if (det) { const ln = det.dataset.detour; Modals.closeAll(); Detour.show(ln); return; }
      const pre = e.target.closest('[data-route-preset]');
      if (pre) {
        const p = Routes.PRESETS[pre.dataset.routePreset];
        if (p) { Routes.add(p); this.render(); UI.toast(`「${p.name}」を追加しました`); }
        return;
      }
      const del = e.target.closest('[data-del]');
      if (del) { if (confirm('このマイルートを削除しますか？')) Routes.remove(del.dataset.del); return; }
      if (e.target.closest('[data-route-add]')) { this.editing = true; this.render(); return; }
      if (e.target.closest('[data-route-cancel]')) { this.editing = false; this.render(); return; }
      if (e.target.closest('[data-route-save]')) { this.save(); return; }
      const pick = e.target.closest('[data-pick]');
      if (pick) {
        const n = document.querySelectorAll('#routeBody [data-pick].on').length;
        if (!pick.classList.contains('on') && n >= 4) { UI.toast('利用路線は最大4本までです'); return; }
        pick.classList.toggle('on'); return;
      }
      const line = e.target.closest('[data-line]');
      if (line) { Modals.closeAll(); Detail.open(line.dataset.line); }
    });
    document.addEventListener('routes:change', () => { if (this.isOpen()) this.render(); UI.renderFavBar(); });
  },
  open() { Modals.open('modalRoute'); this.editing = false; this.render(); },
  isOpen() { return !document.getElementById('modalRoute').hidden; },
  save() {
    const name = (document.getElementById('routeName').value || '').trim();
    const lines = [...document.querySelectorAll('#routeBody [data-pick].on')].map(b => b.dataset.pick);
    const from = (document.getElementById('routeFrom').value || '').trim();
    const via = (document.getElementById('routeVia').value || '').trim();
    const to = (document.getElementById('routeTo').value || '').trim();
    if (!name || !lines.length) { UI.toast('ルート名と利用路線（1本以上）を入力してください'); return; }
    Routes.add({ name, from, vias: via ? [via] : [], to, lines: lines.slice(0, 4) });
    this.editing = false; this.render(); UI.toast('マイルートを登録しました');
  },
  render() {
    const el = document.getElementById('routeBody');
    if (this.editing) { el.innerHTML = this.formHtml(); return; }
    el.innerHTML = `<div class="route-top">
        <div class="route-presets">
          <button class="btn-yahoo plain btn-sm" data-route-preset="commute"><span class="material-symbols-outlined">bolt</span>都心通勤サンプル追加</button>
          <button class="btn-yahoo plain btn-sm" data-route-preset="through"><span class="material-symbols-outlined">bolt</span>直通通勤サンプル追加</button>
        </div>
        <button class="btn-yahoo" data-route-add><span class="material-symbols-outlined">add</span>${bi('マイルートを追加', 'Add route')}</button>
      </div>` +
      (Routes.list.length ? Routes.list.map(r => this.card(r)).join('')
        : '<div class="empty">まだマイルートがありません。上の「マイルートを追加」または「サンプル追加」から通勤・通学経路を登録すると、縦型乗換タイムラインで遅延・再開見込み・推奨振替路線を自動診断します。</div>');
    Fit.all(el);
  },
  card(r) {
    const { bad, worst } = Routes.status(r);
    const lines = r.lines.map(n => lineByName(n)).filter(Boolean);
    const fromLbl = r.from || (r.stations && r.stations[0]) || '出発駅';
    const toLbl = r.to || (r.stations && r.stations.length >= 2 ? r.stations[r.stations.length - 1] : '') || '目的駅';
    const vias = Array.isArray(r.vias) ? r.vias : [];
    const nodes = [];
    nodes.push(`<div class="tl-node tl-stop"><span class="tl-dot"></span><b>${esc(fromLbl)}</b><small>出発</small></div>`);
    lines.forEach((L, i) => {
      const s = Store.of(L.ja), abn = s.status !== 'normal';
      nodes.push(`<div class="tl-node tl-line s-${s.status}" data-line="${esc(L.ja)}" style="--lc:${L.color}"><span class="tl-bar"></span>
        <span class="badge sm">${esc(L.code)}</span>
        <span class="tl-name"><b>${esc(L.ja)}</b><small>${esc(L.directionText)} 方面</small></span>
        ${statusBadge(s.status)}</div>`);
      if (abn) {
        const rs = Insight.resume(s.detail);
        const normalAlts = (L.alt || []).map(lineByName).filter(a => a && Store.of(a.ja).status === 'normal').slice(0, 4);
        const fallbackAlts = normalAlts.length ? normalAlts : (L.alt || []).map(lineByName).filter(Boolean).slice(0, 3);
        const summary = s.detail ? `<p class="tl-detail">${Detail.highlight(s.detail)}</p>` : '';
        nodes.push(`<div class="tl-alert s-${s.status}">
          <div class="tl-meta">
            ${Cause.chipHtml(s.detail)}
            ${rs ? `<span class="res-chip"><span class="material-symbols-outlined">schedule</span>再開見込み ${esc(rs)}頃</span>` : '<span class="res-chip"><span class="material-symbols-outlined">schedule</span>再開見込み 確認中</span>'}
            ${Insight.impactChipHtml(s)}
          </div>
          ${summary}
          <div class="tl-alt">
            <small>推奨される振替・代替路線（タップで路線詳細）</small>
            ${fallbackAlts.length ? fallbackAlts.map(a => {
              const ast = Store.of(a.ja).status;
              return `<button class="rc-line s-${ast}" data-line="${esc(a.ja)}" style="--lc:${a.color}"><span class="badge sm">${esc(a.code)}</span><span>${esc(a.ja)}</span><span class="fc-st ${ast}">${STATUS[ast].ja}</span></button>`;
            }).join('') : '<span class="muted">代替路線データなし</span>'}
            <button class="rc-line s-normal" data-detour="${esc(L.ja)}"><span class="material-symbols-outlined" style="font-size:18px;color:#2f6df0">alt_route</span><span>路線図で振替表示</span></button>
          </div>
        </div>`);
      }
      if (i < lines.length - 1) {
        const xfer = vias[i] || Routes.inferTransfer(L.ja, lines[i + 1].ja);
        nodes.push(`<div class="tl-node tl-stop is-xfer"><span class="tl-dot"></span><b>${esc(xfer ? `${xfer}駅` : '乗換駅')}</b><small>乗換</small></div>`);
      }
    });
    if (lines.length) nodes.push(`<div class="tl-node tl-stop"><span class="tl-dot"></span><b>${esc(toLbl)}</b><small>到着</small></div>`);
    return `<div class="route-card s-${worst}">
      <div class="rc-head"><b class="fit ls-m">${esc(r.name)}</b><span class="rc-state ${worst}">${bad.length ? `要確認（${bad.length}路線に乱れ）` : '平常通り通行可能'}</span></div>
      <div class="rt-timeline">${nodes.join('')}</div>
      <div class="rc-foot"><span class="muted">${bad.length ? bad.map(x => esc(x.n)).join('・') + ' で振替・再開見込みを表示中' : '全区間で平常運転しています'}</span>
        <div class="rc-actions"><button class="rc-share" data-share-route="${esc(r.id)}"><span class="material-symbols-outlined">ios_share</span>状況を共有・コピー</button>
        <button class="rc-del" data-del="${esc(r.id)}"><span class="material-symbols-outlined">delete</span>削除</button></div></div>
    </div>`;
  },
  formHtml() {
    return `<div class="route-form">
      <label class="rf-row"><span>ルート名</span><input id="routeName" maxlength="24" placeholder="例：通勤（渋谷→東京）"></label>
      <div class="rf-row"><span>経路駅（任意・空欄でも乗換駅を自動補完します）</span>
        <div class="rf-st"><input id="routeFrom" maxlength="12" placeholder="出発駅"><i class="material-symbols-outlined">arrow_forward</i><input id="routeVia" maxlength="12" placeholder="乗換駅"><i class="material-symbols-outlined">arrow_forward</i><input id="routeTo" maxlength="12" placeholder="目的駅"></div></div>
      <div class="rf-row"><span>利用路線（乗換順にタップで選択・最大4本）</span>
        <div class="rf-picks">${LINES.map(L => `<button class="rf-pick" data-pick="${esc(L.ja)}" style="--lc:${L.color}"><span class="badge sm">${esc(L.code)}</span>${esc(L.ja)}</button>`).join('')}</div></div>
      <div class="route-top"><button class="mv-silver" data-route-cancel><span class="ms-lbl"><b>戻る</b></span></button><button class="btn-yahoo" data-route-save><span class="material-symbols-outlined">save</span>保存</button></div>
    </div>`;
  }
};

/* ---------- 情報案内LCD（2画面モードの右/下16:9モニター）：選択路線・異常路線・マイ路線・マイルートを実車LCDテーマで案内 ---------- */
const InfoLcd = {
  el: null, i: 0, timer: 0, slides: [], activeOn: false, pinned: null,
  init() {
    this.el = document.getElementById('infoLcd');
    this.el.addEventListener('click', e => {
      const dot = e.target.closest('[data-dot]');
      if (dot) { this.i = Number(dot.dataset.dot) || 0; this.draw(); this.start(); return; }
      if (e.target.closest('.info-head, .info-foot')) { this.next(); this.start(); return; }
      const net = e.target.closest('[data-net-line]');
      if (net) { Detail.open(net.dataset.netLine); return; }
      const s = this.slides[this.i];
      if (s && (s.kind === 'line' || s.kind === 'fav' || s.kind === 'pinned')) { Detail.open(s.L.ja); return; }
      if (s && s.kind === 'route') { RouteUI.open(); return; }
      this.next();
    });
  },
  pin(name) {
    if (!lineByName(name)) return;
    this.pinned = name;
    this.i = 0;
    if (Settings.get('dual')) { this.render(); this.start(); }
  },
  build() {
    const sl = [];
    const pinL = this.pinned ? lineByName(this.pinned) : null;
    if (pinL) sl.push({ kind: 'pinned', L: pinL });
    const abn = LINES.filter(L => Store.of(L.ja).status !== 'normal' && L !== pinL)
      .sort((a, b) => STATUS[Store.of(a.ja).status].rank - STATUS[Store.of(b.ja).status].rank);
    abn.forEach(L => sl.push({ kind: 'line', L }));
    Favs.list.map(lineByName).filter(L => L && L !== pinL && !abn.includes(L)).forEach(L => sl.push({ kind: 'fav', L }));
    Routes.affected().forEach(r => sl.push({ kind: 'route', r }));
    if (!sl.length) sl.push({ kind: 'ok' });
    return sl;
  },
  render() {
    if (!this.el || !Settings.get('dual')) return;
    this.slides = this.build();
    if (this.i >= this.slides.length) this.i = 0;
    this.draw();
  },
  draw() {
    const s = this.slides[this.i] || { kind: 'ok' }, on = I18n.bi();
    const defTh = Lcd.defaultTheme();
    let body, curLabel = '情報案内';
    if (s.kind === 'line' || s.kind === 'fav' || s.kind === 'pinned') {
      const L = s.L, st = Store.of(L.ja), th = Lcd.resolveTheme(L);
      curLabel = Lcd.themeBadge(th, L);
      body = Lcd.bodyHtml(L, st, on, { key: 'info' });
    } else if (s.kind === 'route') {
      const { bad, worst } = Routes.status(s.r);
      body = `<div class="lcd e235 th-${defTh} st-${worst}" style="--lc:#2f6df0">
        <div class="lcd-head plain"><div class="lh-name"><b class="fit ${Lcd.lsClass(s.r.name)}">${esc(s.r.name)}</b>${on ? '<small class="lh-en">My Route</small>' : ''}</div><div class="lh-right">${statusBadge(worst, 'car')}</div></div>
        <div class="lcd-sub"><span class="sub-tag">MY ROUTE</span><span class="sub-txt">${on ? 'マイルート　My Route' : 'マイルート'}</span><span class="lcd-chev" aria-hidden="true"><i>›</i><i>›</i><i>›</i></span></div>
        <div class="lcd-screen"><div class="lcd-pages"><div class="lcd-page on">${bad.map(x => `<p class="jp-h">【${esc(x.n)}　${STATUS[x.st].ja}】</p><p class="jp-b">${Detail.highlight(Store.of(x.n).detail || '')}</p>`).join('')}</div></div></div></div>`;
    } else {
      body = `<div class="lcd e235 th-${defTh} st-normal" style="--lc:#008b38">
        <div class="lcd-head plain"><div class="lh-name"><b class="fit ls-m">運行情報</b>${on ? '<small class="lh-en">Train Information</small>' : ''}</div><div class="lh-right">${statusBadge('normal', 'car')}</div></div>
        <div class="lcd-sub"><span class="sub-tag">STATUS</span><span class="sub-txt">${on ? '平常運転　Normal Service' : '平常運転'}</span><span class="lcd-chev" aria-hidden="true"><i>›</i><i>›</i><i>›</i></span></div>
        <div class="lcd-screen"><div class="lcd-pages"><div class="lcd-page on"><p class="jp-h">現在の運行状況</p><p class="jp-b">現在、関東エリアの主要路線は平常通り運転しています。路線をタップまたは検索すると、その路線の実車LCDデザインでここに表示されます。${on ? '<br><small>All major lines are operating normally.</small>' : ''}</p></div></div></div></div>`;
    }
    const n = this.slides.length || 1, p = x => String(x).padStart(2, '0'), d = new Date();
    this.el.innerHTML = `<div class="info-head"><b>${esc(curLabel)}</b><span class="info-dots">${this.slides.map((_, k) => `<i data-dot="${k}" class="${k === this.i ? 'on' : ''}"></i>`).join('')}</span><time>${p(d.getHours())}:${p(d.getMinutes())}</time></div>
      <div class="info-body">${body}</div>
      <div class="info-foot">${this.i + 1} / ${n}　<small>端タップで次へ・中央タップで詳細</small></div>`;
    Lcd.mount(this.el.querySelector('[data-pager="info"]'), 'info', 5000, false);
    Fit.all(this.el);
  },
  next() { if (!this.slides.length) return; this.i = (this.i + 1) % this.slides.length; this.draw(); },
  start() { clearInterval(this.timer); this.timer = setInterval(() => this.next(), 6000); },
  stop() { clearInterval(this.timer); this.timer = 0; },
  setOn(on) {
    const next = !!on, changed = this.activeOn !== next;
    this.activeOn = next;
    document.body.classList.toggle('dual', next);
    if (changed) { Layout.upd(); if (Engine.canvas) Engine.scheduleResize(0); }
    if (next) { this.render(); this.start(); } else this.stop();
  }
};

/* ---------- 係員呼出（操作ガイド）：券売機の下部ボタンから開く。内容は index.html に記載 ---------- */
const HelpUI = {
  open() { const m = document.getElementById('modalHelp'); if (m) m.hidden = false; }
};

/* ---------- 共通：HTML部品 ---------- */
const bi = (ja, en) => I18n.bi() && en ? `${ja}<small class="en">${en}</small>` : ja;
const statusBadge = (st, cls = 'st') => `<span class="${cls} ${st}">${bi(STATUS[st].ja, STATUS[st].en)}</span>`;
const pad = n => String(n).padStart(2, '0');

/* ---------- E235系 車内LCD風の共通部品（詳細ポップアップ・2画面LCD・異常ボードで共通） ---------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* 遅延理由の分類：アイコン・日本語・英語（英語テーブルの Cause にも使う） */
const Cause = {
  TABLE: [
    { re: /人身事故|人身/, ja: '人身事故', en: 'Person on tracks', icon: 'emergency' },
    { re: /車両故障|故障/, ja: '車両故障', en: 'Train breakdown', icon: 'build' },
    { re: /信号/, ja: '信号トラブル', en: 'Signal trouble', icon: 'traffic' },
    { re: /車両点検|施設点検|点検/, ja: '点検', en: 'Inspection', icon: 'build' },
    { re: /強風/, ja: '強風', en: 'Strong winds', icon: 'air' },
    { re: /大雨|豪雨|台風|雨/, ja: '大雨・台風', en: 'Heavy rain or typhoon', icon: 'rainy' },
    { re: /大雪|雪/, ja: '雪', en: 'Snow', icon: 'ac_unit' },
    { re: /地震/, ja: '地震', en: 'Earthquake', icon: 'vibration' },
    { re: /停電|き電|饋電/, ja: '停電', en: 'Power outage', icon: 'bolt' },
    { re: /火災|煙/, ja: '火災・煙', en: 'Fire or smoke', icon: 'local_fire_department' },
    { re: /工事|改良/, ja: '工事', en: 'Construction work', icon: 'construction' },
    { re: /事故/, ja: '事故', en: 'Accident', icon: 'warning' }
  ],
  classify(text) {
    const t = String(text || '');
    return this.TABLE.find(c => c.re.test(t)) || { ja: '原因調査中', en: 'Under investigation', icon: 'help' };
  },
  chipHtml(text) {
    const c = this.classify(text);
    return `<span class="cause-chip"><span class="material-symbols-outlined">${c.icon}</span>${esc(c.ja)}</span>`;
  }
};

/* 異常になってからの経過時間（履歴ログから算出。履歴の範囲内のみ） */
const Elapsed = {
  since(name) {
    let start = null;
    for (const h of History.list) {                 // 新しい順に遡る
      if (h.line !== name) continue;
      if (h.to === 'normal') break;                  // 平常に戻った直前で止める
      start = h.t;
    }
    return start;
  },
  text(name) {
    const t = this.since(name); if (!t) return '';
    const min = Math.max(0, Math.floor((Date.now() - t) / 60000)), d = new Date(t), p = n => String(n).padStart(2, '0');
    const span = min < 1 ? '1分未満' : min < 60 ? `約${min}分` : `約${Math.floor(min / 60)}時間${min % 60}分`;
    return `発生から${span}経過（${p(d.getHours())}:${p(d.getMinutes())}検知）`;
  }
};

/* 長体（横幅の自動圧縮）：内側有効幅（padding除外）に収まるよう scaleX で綺麗に圧縮。文字の高さは変えない */
const Fit = {
  all(root) {
    if (!root) return;
    root.querySelectorAll('.fit').forEach(el => {
      const box = el.parentElement; if (!box) return;
      el.style.transform = 'none';
      const cs = getComputedStyle(box);
      const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const avail = Math.max(0, box.clientWidth - padX), need = el.scrollWidth;
      if (!avail || !need) return;
      const isDir = el.classList.contains('fit-dir');
      const base = isDir ? 0.96 : 0.9;
      const ratio = need > avail ? Math.max(0.42, Math.min(base, avail / need)) : base;
      el.style.transform = `scaleX(${ratio.toFixed(3)})`;
    });
  }
};

/* ---------- マルチLCDデザインエンジン（JR E235系 / 東京メトロ / 都営 / 東急 / 小田急 / 京王 / 西武 / 京急 / 東武 / 京成 / 相鉄 / TX） ---------- */
const THROUGH_NET = {
  '東急東横線': ['みなとみらい線', '副都心線', '西武池袋線', '東武東上線', '東急新横浜線', '相鉄新横浜線'],
  'みなとみらい線': ['東急東横線', '副都心線', '西武池袋線', '東武東上線'],
  '東急目黒線': ['南北線', '埼玉高速鉄道線', '都営三田線', '東急新横浜線', '相鉄新横浜線'],
  '東急新横浜線': ['東急東横線', '東急目黒線', '相鉄新横浜線', '相鉄本線', '相鉄いずみ野線'],
  '東急田園都市線': ['半蔵門線', '東武スカイツリーライン', '東武伊勢崎線', '東武日光線'],
  '東急大井町線': ['東急田園都市線', '東急目黒線', '東急東横線'],
  '東急池上線': ['東急多摩川線', '都営浅草線', '京浜東北線'],
  '東急多摩川線': ['東急池上線', '東急東横線', '東急目黒線']
};

const Lcd = {
  timers: {},
  PRIVATE_SET: new Set(['odakyu', 'keio', 'seibu', 'keikyu', 'tobu', 'keisei', 'sotetsu', 'tx', 'transit']),
  /* 路線本来の実車LCDテーマ判定 */
  nativeTheme(L) {
    if (!L) return 'jr';
    if (L.co === 'JR') return 'jr';
    if (L.co === 'Metro') return 'metro';
    if (L.co === 'Toei') return 'toei';
    const op = L.op && L.op.ja;
    if (op === '東急電鉄' || L.ja === 'みなとみらい線') return 'tokyu';
    if (op === '小田急電鉄') return 'odakyu';
    if (op === '京王電鉄') return 'keio';
    if (op === '西武鉄道') return 'seibu';
    if (op === '京浜急行電鉄') return 'keikyu';
    if (op === '東武鉄道') return 'tobu';
    if (op === '京成電鉄' || op === '新京成電鉄' || op === '北総鉄道' || op === '東葉高速鉄道') return 'keisei';
    if (op === '相模鉄道') return 'sotetsu';
    if (L.ja === 'つくばエクスプレス') return 'tx';
    return 'transit';
  },
  defaultTheme() {
    const mode = Settings.get('lcdTheme') || 'auto';
    if (mode === 'auto' || mode === 'jr') return 'jr';
    if (mode === 'private') return 'odakyu';
    return mode;
  },
  /* 設定（自動切替 or 固定モード）を加味した最終テーマ */
  resolveTheme(L) {
    const mode = Settings.get('lcdTheme') || 'auto';
    const nat = this.nativeTheme(L);
    if (mode === 'auto') return nat;
    if (mode === 'private') return this.PRIVATE_SET.has(nat) ? nat : 'odakyu';
    return mode;
  },
  themeBadge(th, L) {
    const map = {
      jr: 'E235系 トレインチャンネル風',
      metro: 'Tokyo Metro Vision',
      toei: '都営 ワイドLCD',
      tokyu: 'TOQビジョン',
      odakyu: '小田急 TVOS',
      keio: '京王 K-DGビジョン',
      seibu: '西武 スマイルビジョン',
      keikyu: '京急 車内LCD',
      tobu: '東武 車内ビジョン',
      keisei: '京成 車内LCD',
      sotetsu: '相鉄 ネイビーブルーLCD',
      tx: 'TX 車内ワイドLCD',
      transit: (L && L.op ? L.op.ja : '都市鉄道') + ' 車内LCD'
    };
    return map[th] || '車内LCD';
  },
  subTitle(th, on) {
    if (th === 'toei') return on ? '運行情報のご案内　Service Information' : '運行情報のご案内';
    if (th === 'metro') return on ? '東京メトロ運行情報　Tokyo Metro Information' : '東京メトロ運行情報';
    if (th === 'tokyu') return on ? '東急線・直通各線 運行情報　Train Information' : '東急線・直通各線 運行情報';
    return on ? '運行情報　Train Information' : '運行情報';
  },
  /* 字間：短い路線名は広く、長い路線名は詰める（JR流の組み方） */
  lsClass(name) {
    const n = [...String(name)].length;
    return n <= 3 ? 'ls-s' : n <= 5 ? 'ls-m' : 'ls-l';
  },
  dirEn(text) {
    const t = String(text || '');
    if (/内回り/.test(t)) return 'Inbound';
    if (/外回り/.test(t)) return 'Outbound';
    if (/上り/.test(t)) return 'Up direction';
    if (/下り/.test(t)) return 'Down direction';
    return 'Both directions';
  },
  statusEn(st) { return { normal: 'Normal service', delay: 'Delay', partial: 'Partial suspension', suspend: 'Suspended' }[st] || 'Unknown'; },
  companyCode(L) {
    if (L.co === 'JR') return 'JRE';
    if (L.co === 'Metro') return 'METRO';
    if (L.co === 'Toei') return 'TOEI';
    return String(L.op.en || '').split(/\s+/)[0].slice(0, 6).toUpperCase();
  },
  /* メトロ・都営・私鉄特有の液晶上部ステータス見出しバー */
  screenBannerHtml(th, L, s, on) {
    if (th === 'jr') return '';
    const stJa = {
      normal: '現在、平常通り運転しています',
      delay: '列車に遅れ・ダイヤ乱れが出ています',
      partial: '一部列車に運休が出ています',
      suspend: '運転を見合わせています'
    }[s.status] || STATUS[s.status].ja;
    const stEn = {
      normal: 'Normal Service — Operating on schedule',
      delay: 'Delays — Trains are running behind schedule',
      partial: 'Partial Suspension — Some trains are canceled',
      suspend: 'Service Suspended — Operations temporarily halted'
    }[s.status] || '';
    if (th === 'toei') {
      return `<div class="lcd-banner toei-ban s-${s.status}">
        <span class="tb-lead">運行情報のご案内</span>
        <b class="tb-state">${esc(STATUS[s.status].ja)}${on ? `<small>${esc(this.statusEn(s.status))}</small>` : ''}</b>
      </div>`;
    }
    return `<div class="lcd-banner s-${s.status}">
      <span class="lb-dot"></span>
      <b>${esc(stJa)}</b>
      ${on && stEn ? `<small>${esc(stEn)}</small>` : ''}
    </div>`;
  },
  /* 東急TOQビジョン特有：直通運転ネットワーク連動ステータスバー */
  throughBarHtml(L) {
    const partners = (THROUGH_NET[L.ja] || L.alt || []).map(lineByName).filter(Boolean).slice(0, 5);
    if (!partners.length) return '';
    return `<div class="tokyu-net">
      <span class="tn-lbl"><span class="material-symbols-outlined">swap_horiz</span>直通・連絡各線</span>
      <div class="tn-chips">${partners.map(P => {
        const pst = Store.of(P.ja).status;
        const shortSt = { normal: '平常', delay: '遅延', partial: '一部運休', suspend: '見合わせ' }[pst] || '平常';
        return `<button type="button" class="tn-chip s-${pst}" data-net-line="${esc(P.ja)}" style="--plc:${P.color}">
          <i class="tn-code">${esc(P.code)}</i><span class="tn-name">${esc(P.ja)}</span><em class="tn-st ${pst}">${shortSt}</em>
        </button>`;
      }).join('')}</div>
    </div>`;
  },
  /* 1ページ目（日本語）と 2ページ目（英語4行表 / バイリンガル案内）を全テーマ・平常/異常の両方で提供 */
  pages(L, s, th) {
    if (s.status === 'normal') {
      const ja = `<p class="jp-h">【${esc(L.ja)}　${STATUS.normal.ja}】</p>
        <p class="jp-b">${esc(STRINGS.normalTxt.ja)}（${esc(L.directionText)} 方面）</p>`;
      const rows = [
        ['Line', `${L.en} (${L.code})`],
        ['Section', `${L.directionText}`],
        ['Status', 'Normal Service (Operating on schedule)'],
        ['Operator', L.op.en]
      ];
      const en = `<table class="en-tbl">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('')}</table>`;
      return [ja, en];
    }
    const detail = s.detail || `${L.ja}は、運行情報をお知らせします。`;
    const body = Detail.highlight(detail);
    const rs = Insight.resume(s.detail);
    const meta = `<p class="jp-meta">${Cause.chipHtml(s.detail)}${Insight.chipsHtml(s)}<span class="elapsed" data-elapsed="${esc(L.ja)}">${esc(Elapsed.text(L.ja))}</span></p>`;
    const toeiBox = th === 'toei' ? `<div class="toei-focus"><span>影響路線：<b>${esc(L.ja)}（${esc(L.directionText)} 方面）</b></span><span>振替輸送：<b>${/振替輸送/.test(detail) ? '実施中' : '案内なし'}</b></span></div>` : '';
    const ja = `<p class="jp-h">【${esc(L.ja)}　${STATUS[s.status].ja}】</p><p class="jp-b">${body}</p>${toeiBox}${meta}`;
    const causeEn = Cause.classify(s.detail).en + (rs ? ` (Est. resume: around ${rs})` : '');
    const rows = [['Line', `${L.en} (${L.code})`], ['Direction', this.dirEn(s.detail)], ['Status', this.statusEn(s.status)], ['Cause', causeEn]];
    const en = `<table class="en-tbl">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('')}</table>`;
    return [ja, en];
  },
  /* 上段ヘッダー：全テーマ共通の要素を持ち、CSSテーマ(.th-*)で各社固有の配置・バッジ形状・配色へ変換 */
  headHtml(L, s, th, o = {}) {
    const on = I18n.bi(), d = new Date(), p = n => String(n).padStart(2, '0');
    const fav = o.fav === undefined ? '' : `<button class="fav-btn${o.fav ? ' on' : ''}" data-fav="${esc(L.ja)}" aria-pressed="${!!o.fav}" aria-label="マイ路線に登録"><span class="material-symbols-outlined">star</span></button>`;
    const time = o.dtime ? '<time id="dTime">--:--</time>' : `<time>${p(d.getHours())}:${p(d.getMinutes())}</time>`;
    const showEn = on || th === 'metro' || th === 'toei' || th === 'tokyu';
    return `<div class="lcd-head">
      <span class="lh-edge" aria-hidden="true"></span>
      <div class="lh-left"><span class="co-pill">${esc(L.op.ja)}</span><div class="lh-dir-box"><span class="lh-route fit fit-dir">${esc(L.directionText || L.direction || '')}</span></div><span class="lh-dir">方面</span></div>
      <span class="cbar" aria-hidden="true"></span>
      <div class="lh-sym"><span class="lh-status">運行状況</span><div class="sym-box"><span class="sym-co">${esc(this.companyCode(L))}</span><span class="sym-code">${esc(L.code)}</span></div></div>
      <div class="lh-name"><b class="fit ${this.lsClass(L.ja)}">${esc(L.ja)}</b>${showEn ? `<small class="lh-en">${esc(L.en)}</small>` : ''}${fav}</div>
      <div class="lh-right">${time}<div class="carno"><b>${Settings.get('carNo')}</b><small>号車</small></div>${statusBadge(s.status, 'car')}</div>
    </div>`;
  },
  /* ページ送り：日本語 1/2 ⇔ 英語 2/2 をタップおよび5秒ごとにスライド切替 */
  mount(root, key, ms, tapToNext) {
    clearInterval(this.timers[key]); this.timers[key] = 0;
    if (!root) return;
    const pages = [...root.querySelectorAll('.lcd-page')], badge = root.querySelector('.pg-badge');
    let i = 0;
    const show = n => {
      const prev = i; i = n % pages.length;
      pages.forEach((pg, k) => {
        pg.classList.toggle('on', k === i);
        pg.classList.toggle('prev', k === prev && prev !== i);
      });
      if (badge) badge.textContent = `${i + 1}/${pages.length}`;
    };
    show(0);
    if (pages.length < 2) return;
    if (tapToNext) root.onclick = e => {
      if (e.target.closest('[data-net-line]')) return;
      show(i + 1);
    };
    this.timers[key] = setInterval(() => {
      if (!root.getClientRects().length) { clearInterval(this.timers[key]); this.timers[key] = 0; return; }
      show(i + 1);
    }, ms);
  },
  bodyHtml(L, s, on, o = {}) {
    const th = this.resolveTheme(L);
    const pages = this.pages(L, s, th);
    return `<div class="lcd e235 th-${th} st-${s.status}" data-lcd-theme="${th}" style="--lc:${L.color}">
      ${this.headHtml(L, s, th, o)}
      <div class="lcd-sub"><span class="sub-tag">${esc(this.themeBadge(th, L))}</span><span class="sub-txt">${this.subTitle(th, on)}</span><span class="lcd-chev" aria-hidden="true"><i>›</i><i>›</i><i>›</i></span></div>
      <div class="lcd-screen" data-pager="${o.key || 'x'}">
        ${this.screenBannerHtml(th, L, s, on)}
        <div class="lcd-pages">${pages.map((p, k) => `<div class="lcd-page${k ? '' : ' on'}">${p}</div>`).join('')}<span class="pg-badge">1/${pages.length}</span></div>
        ${th === 'tokyu' ? this.throughBarHtml(L) : ''}
      </div>
      ${o.extra || ''}
    </div>`;
  }
};

const Detail = {
  el: null, name: null,
  open(name) {
    if (!lineByName(name)) return;
    this.name = name;
    InfoLcd.pin(name);
    this.el.hidden = false;
    this.render();
    this.tickTime();
  },
  isOpen() { return this.el && !this.el.hidden; },
  /* 取得テキストはHTMLエスケープし、「振替輸送」を含む文は強調表示 */
  highlight(text) {
    return (String(text).match(/[^。]*。?/g) || []).filter(Boolean).map(p => {
      const e = esc(p);
      return p.includes('振替輸送') ? `<mark class="furikae">${e.replace(/振替輸送/g, '<b>振替輸送</b>')}</mark>` : e;
    }).join('');
  },
  render() {
    const memoEl = document.getElementById('memoText');
    if (memoEl && document.activeElement === memoEl) return; // メモ入力中は再描画しない
    const L = lineByName(this.name); if (!L) return;
    const s = Store.of(L.ja), on = I18n.bi(), fv = Favs.has(L.ja);
    const url = /^https:\/\/transit\.yahoo\.co\.jp\//.test(s.url || '') ? s.url : YAHOO_URL;
    const rt = 'https://search.yahoo.co.jp/realtime/search?p=' + encodeURIComponent(L.ja + ' 遅延');
    const extra = `<div class="lcd-memo"><label for="memoText">${bi('マイメモ', 'My Memo')}</label>
          <textarea id="memoText" rows="2" maxlength="300" placeholder="例：西船橋から東西線に振替">${esc(Memos.get(L.ja))}</textarea></div>
        <div class="lcd-actions">
          <button class="act-btn fav-btn${fv ? ' on' : ''}" data-fav="${esc(L.ja)}" aria-pressed="${fv}"><span class="material-symbols-outlined">star</span><span>${fv ? 'マイ路線から外す' : 'マイ路線に登録'}</span></button>
          <button class="act-btn" data-act="detour"><span class="material-symbols-outlined">alt_route</span><span>振替ルート表示</span></button>
          <button class="act-btn" data-share="${esc(L.ja)}"><span class="material-symbols-outlined">ios_share</span><span>状況を共有・コピー</span></button>
          <a class="act-btn" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span class="material-symbols-outlined">open_in_new</span><span>${on ? '公式詳細' : '公式詳細'}</span></a>
        </div>
        <div class="lcd-foot"><a class="rt-link" href="${esc(rt)}" target="_blank" rel="noopener noreferrer"><span class="material-symbols-outlined">forum</span>現場のリアルタイム状況を検索</a></div>`;
    document.getElementById('detailBody').innerHTML = Lcd.bodyHtml(L, s, on, { dtime: true, key: 'detail', extra });
    Lcd.mount(document.querySelector('#detailBody .lcd-screen'), 'detail', 5000, true);
    Fit.all(document.getElementById('detailBody'));
    this.tickTime();
  },
  tickTime() {
    const t = document.getElementById('dTime');
    if (t) { const d = new Date(); t.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
    document.querySelectorAll('[data-elapsed]').forEach(el => { el.textContent = Elapsed.text(el.dataset.elapsed); });
  }
};

/* ---------- データの書き出し・復元（マイ路線・マイ駅・マイルート・メモ・設定） ---------- */
const Backup = {
  open() {
    Modals.open('modalBackup');
    document.getElementById('backupMsg').textContent = '';
  },
  payload() {
    return { app: 'train-info-lcd', version: 1, exportedAt: new Date().toISOString(),
      favs: Favs.list, stations: Stn.list, routes: Routes.list, memos: Memos.data, settings: Settings.data };
  },
  exportNow() {
    const ta = document.getElementById('backupText'), msg = document.getElementById('backupMsg');
    ta.value = JSON.stringify(this.payload(), null, 2);
    ta.select();
    try { navigator.clipboard && navigator.clipboard.writeText(ta.value).then(() => { msg.textContent = '書き出しました（クリップボードにもコピーしました）'; }, () => { msg.textContent = '書き出しました。内容を選択してコピーしてください'; }); }
    catch (_) { msg.textContent = '書き出しました。内容を選択してコピーしてください'; }
    if (!msg.textContent) msg.textContent = '書き出しました。内容を選択してコピーしてください';
  },
  /* 取り込み時は形式を一つずつ確認し、不正な値は捨てる */
  sanitize(obj) {
    const isStr = a => Array.isArray(a) && a.every(x => typeof x === 'string');
    const out = {};
    if (!obj || obj.app !== 'train-info-lcd' || obj.version !== 1) throw new Error('この端末の書き出しデータではありません');
    out.favs = isStr(obj.favs) ? obj.favs.filter(n => lineByName(n)).slice(0, 40) : [];
    out.stations = isStr(obj.stations) ? obj.stations.map(s => s.slice(0, 12)).slice(0, 80) : [];
    out.routes = Array.isArray(obj.routes) ? obj.routes.filter(r => r && typeof r.name === 'string' && Array.isArray(r.lines)).slice(0, 30).map(r => ({
      id: String(r.id || Date.now().toString(36)), name: String(r.name).slice(0, 20),
      stations: Array.isArray(r.stations) ? r.stations.filter(x => typeof x === 'string').slice(0, 3) : [],
      lines: r.lines.filter(n => typeof n === 'string' && lineByName(n)).slice(0, 4)
    })) : [];
    out.memos = {};
    if (obj.memos && typeof obj.memos === 'object') Object.keys(obj.memos).forEach(k => { if (lineByName(k) && typeof obj.memos[k] === 'string') out.memos[k] = obj.memos[k].slice(0, 300); });
    out.settings = {};
    if (obj.settings && typeof obj.settings === 'object') Object.keys(Settings.data).forEach(k => {
      if (k in obj.settings && typeof obj.settings[k] === typeof Settings.data[k]) out.settings[k] = obj.settings[k];
    });
    return out;
  },
  importNow() {
    const msg = document.getElementById('backupMsg'), text = document.getElementById('backupText').value.trim();
    try {
      const data = this.sanitize(JSON.parse(text));
      localStorage.setItem(Favs.KEY, JSON.stringify(data.favs));
      localStorage.setItem(Stn.KEY, JSON.stringify(data.stations));
      localStorage.setItem(Routes.KEY, JSON.stringify(data.routes));
      localStorage.setItem(Memos.KEY, JSON.stringify(data.memos));
      localStorage.setItem(Settings.KEY, JSON.stringify({ ...Settings.data, ...data.settings }));
      msg.textContent = '復元しました。画面を読み込み直します';
      setTimeout(() => location.reload(), 900);
    } catch (e) {
      msg.textContent = '復元できませんでした：' + (e && e.message ? e.message : '形式が正しくありません');
    }
  },
  init() {
    document.getElementById('backupExport').onclick = () => this.exportNow();
    document.getElementById('backupImport').onclick = () => this.importNow();
  }
};

/* ---------- 路線検索（異常路線を最上部にピン留め） ---------- */
const Search = {
  q: '',
  norm: s => String(s).toLowerCase().replace(/[\s　・]/g, ''),
  open(focus) {
    Modals.open('modalSearch'); this.render();
    if (focus) setTimeout(() => document.getElementById('searchInput').focus(), 30);
  },
  isOpen() { return !document.getElementById('modalSearch').hidden; },
  filtered() {
    const q = this.norm(this.q);
    return LINES.map((L, i) => ({ L, i }))
      .filter(({ L }) => UI.company === 'all' || L.co === UI.company)
      .filter(({ L }) => {
        if (!q) return true;
        const comp = COMPANIES.find(c => c.id === L.co);
        return this.norm([L.ja, L.en, L.code, L.op.ja, L.op.en, comp.ja, comp.en].join(' ')).includes(q);
      })
      .sort((a, b) => Store.rank(a.L.ja) - Store.rank(b.L.ja) || a.i - b.i)
      .map(x => x.L);
  },
  render() {
    const q = this.norm(this.q), list = this.filtered(), el = document.getElementById('searchList');
    const stns = q ? Stations.search(q) : [];
    const comp = COMPANIES.find(c => c.id === UI.company);
    document.getElementById('searchMeta').textContent =
      `${list.length}路線` + (q ? `・${stns.length}駅（路線図の全駅から検索）` : '') + (UI.company !== 'all' ? `　絞り込み：${comp.ja}` : '');
    document.getElementById('searchClear').hidden = !this.q;
    const lines = list.map(L => {
      const s = Store.of(L.ja).status, fav = Favs.has(L.ja);
      return `<div class="line-row s-${s}" style="--lc:${L.color}">
        <button class="lr-main" data-line="${L.ja}">
          <span class="badge">${L.code}</span>
          <span class="lr-name"><b>${L.ja}</b>${I18n.bi() ? `<small>${L.en}</small>` : ''}</span>
          <span class="co-tag">${L.op.ja}</span>
          ${statusBadge(s)}
        </button>
        <button class="star${fav ? ' on' : ''}" data-fav="${L.ja}" aria-pressed="${fav}" aria-label="マイ路線に登録"><span class="material-symbols-outlined">star</span></button>
      </div>`;
    }).join('');
    const stations = stns.length ? `<div class="sec-title">駅<small>タップで路線図の駅へジャンプ</small></div>` + stns.map(e => {
      const ls = Stations.lines(e.name), w = StationUI.worst(ls), fav = Stn.has(e.name);
      return `<div class="line-row s-${w}">
        <button class="lr-main" data-jump="${esc(e.name)}"><span class="badge stn-ic"><span class="material-symbols-outlined">train</span></span>
          <span class="lr-name"><b>${esc(e.name)}駅</b><small>${ls.length ? ls.length + '路線が乗り入れ' : '路線図上の駅'}</small></span>
          <span class="co-tag">路線図で表示</span>${ls.length ? statusBadge(w) : ''}</button>
        <button class="star${fav ? ' on' : ''}" data-stnfav="${esc(e.name)}" aria-pressed="${fav}" aria-label="マイ駅に登録"><span class="material-symbols-outlined">star</span></button>
      </div>`;
    }).join('') : '';
    el.innerHTML = (lines || stations) ? lines + stations : `<div class="empty">${I18n.text('none')}</div>`;
  },
  init() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', () => { this.q = input.value; this.render(); });
    document.getElementById('searchClear').onclick = () => { this.q = ''; input.value = ''; this.render(); input.focus(); };
    document.getElementById('searchList').addEventListener('click', e => {
      const star = e.target.closest('.star');
      if (star) {
        if (star.dataset.stnfav) Stn.toggle(star.dataset.stnfav);
        else if (star.dataset.fav) Favs.toggle(star.dataset.fav);
        return;
      }
      const main = e.target.closest('.lr-main'); if (!main) return;
      Modals.closeAll();
      if (main.dataset.jump) Locate.jumpTo(main.dataset.jump); else Detail.open(main.dataset.line);
    });
  }
};

/* ---------- モーダル管理 ---------- */
const Modals = {
  open(id) { this.closeAll(); document.getElementById(id).hidden = false; },
  closeAll() { document.querySelectorAll('.modal').forEach(m => m.hidden = true); if (typeof Phone !== 'undefined' && Phone.on()) Phone.sync(); },
  init() {
    document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => {
      if (e.target === m || e.target.closest('[data-close]')) this.closeAll();
    }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { this.closeAll(); ClockMode.close(); } });
  }
};

/* ---------- UI ---------- */
const UI = {
  company: 'all',
  init() {
    this.company = Settings.get('initFilter') || 'all';
    InfoLcd.init();
    this.applyFlags(); Layout.init();
    Favs.load(); Memos.load(); History.load(); Stn.load(); Routes.load(); Chime.init();
    Backup.init(); Menus.init(); Sim.init(); Jump.init(); Modals.init(); Search.init(); StationUI.init(); HistoryUI.init(); MV.init(); AbnUI.init(); ClockMode.init(); RouteUI.init(); StationPop.init();
    Detail.el = document.getElementById('modalDetail');
    document.getElementById('btnRefresh').onclick = () => this.refresh(true);
    document.getElementById('btnSearch').onclick = () => Search.open();
    document.getElementById('btnRoute').onclick = () => RouteUI.open();
    document.getElementById('btnDual').onclick = () => Guard.run('dual', () => Settings.set('dual', !Settings.get('dual')));
    document.getElementById('btnFocus').onclick = () => Guard.run('focus', () => Settings.set('focus', !Settings.get('focus')));
    document.getElementById('btnCycle').onclick = () => Guard.run('cycle', () => Settings.set('autoCycle', !Settings.get('autoCycle')));
    /* PC向けキーボードショートカット（入力欄にフォーカスが無いときのみ） */
    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key === 'Escape') return;
      const t = e.target, tag = (t && t.tagName) || '';
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (t && t.isContentEditable)) return;
      if (document.querySelector('.modal:not([hidden])') || ClockMode.isOpen()) return;
      const k = e.key;
      if (k === '/' || k === 'f' || k === 'F') { e.preventDefault(); Search.open(true); }
      else if (k === 'r' || k === 'R') { e.preventDefault(); this.refresh(true); }
      else if (k === '+' || k === '=') { e.preventDefault(); Zoom.step(1.4); }
      else if (k === '-' || k === '_') { e.preventDefault(); Zoom.step(1 / 1.4); }
      else if (k === '0') { e.preventDefault(); Zoom.home(); }
      else if (k === '?') { e.preventDefault(); HelpUI.open(); }
    });
    document.getElementById('favBar').addEventListener('click', e => {
      if (e.target.closest('#routeAlert')) { RouteUI.open(); return; }
      const c = e.target.closest('.fav-chip'); if (c) Detail.open(c.dataset.line);
    });
    const body = document.getElementById('detailBody');
    body.addEventListener('click', e => {
      const f = e.target.closest('.fav-btn'); if (f) { Favs.toggle(f.dataset.fav); return; }
      const net = e.target.closest('[data-net-line]'); if (net) { Detail.open(net.dataset.netLine); return; }
      const sh = e.target.closest('[data-share]'); if (sh) { Share.send(Share.line(sh.dataset.share)); return; }
      if (e.target.closest('[data-act="detour"]')) { const n = Detail.name; Modals.closeAll(); Detour.show(n); }
    });
    body.addEventListener('input', e => { if (e.target.id === 'memoText') Memos.set(Detail.name, e.target.value); });
    document.getElementById('abnBoard').addEventListener('click', e => { const c = e.target.closest('.board-card'); if (c) Detail.open(c.dataset.line); });
    ['pointerdown', 'wheel'].forEach(t => document.getElementById('map-viewport').addEventListener(t, () => Cycle.pause(), { capture: true, passive: true }));
    document.addEventListener('favs:change', () => {
      this.renderFavBar();
      if (Search.isOpen()) Search.render();
      if (Detail.isOpen()) Detail.render();
    });
    document.addEventListener('settings:change', e => {
      const k = e.detail.key;
      if (k === 'demo') { // デモ⇔実データで混在させない
        Store.data = {}; MapView.applyStatuses(); this.prevAbn = null; this.prevSt = null; this.lastOk = 0;
        this.sync.ok = true; this.sync.text = Settings.get('demo') ? 'デモモード：ダミーデータを表示します' : '実データを取得中…';
      }
      if (k === 'initFilter') { this.company = e.detail.value; MapView.applyFilter(this.company); }
      if (k === 'autoCycle') Cycle.start();
      if (k === 'miniTags') Engine.requestDraw();
      if (k === 'ticker' || k === 'topOffset') { Layout.upd(); if (Engine.canvas) Engine.scheduleResize(200); }
      Frame.once('render', () => this.renderAll());
      if (k === 'demo') this.refresh();
      if (k === 'interval') this.schedule();
    });
    window.addEventListener('online', () => { if (!Settings.get('demo')) this.refresh(); });
    window.addEventListener('offline', () => {
      if (!Settings.get('demo')) {
        document.getElementById('lamp').classList.add('err');
        this.setSync(false, 'オフライン：保持中の最新データを表示しています');
      }
    });
    document.addEventListener('visibilitychange', () => { // iPadで復帰したとき、古ければすぐ更新
      const ms = Settings.get('interval');
      if (!document.hidden && !Settings.get('demo') && ms > 0 && Date.now() - UI.lastOk >= ms) UI.refresh();
    });
    document.addEventListener('line:tap', e => Detail.open(e.detail.line));
    this.startClock(); this.renderAll(); Cycle.start();
  },
  renderAll() {
    I18n.apply(); this.buildTabs(); this.buildLegend();
    document.getElementById('demoChip').hidden = !Settings.get('demo');
    this.renderSync(); this.applyFlags(); this.renderFavBar(); this.renderMeter(); Ticker.render(); MV.render(); Insight.nightCheck();
    InfoLcd.render();
    if (Cycle.view === 'board') Board.render();
    if (Search.isOpen()) Search.render();
    if (StationUI.isOpen()) StationUI.render();
    if (HistoryUI.isOpen()) HistoryUI.render();
    if (Detail.isOpen()) Detail.render();
    if (RouteUI.isOpen()) RouteUI.render();
  },
  /* 設定に応じた表示状態 */
  applyFlags() {
    document.body.classList.toggle('no-ticker', !Settings.get('ticker'));
    document.body.classList.toggle('night', !!Settings.get('nightDim'));
    document.body.classList.toggle('lcd-on', !!Settings.get('lcdOverlay'));
    document.body.classList.toggle('no-anim', !Settings.get('blink'));
    Engine.setState({ alert: !!Settings.get('focus') }); // 異常のみ強調：基礎地図の状態として反映
    /* iPadOS PWAのシステムバー/ぼかし領域を避ける上部余白（PWA表示のときのみ有効） */
    const standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    document.documentElement.style.setProperty('--top-offset', (standalone ? Number(Settings.get('topOffset')) || 0 : 0) + 'px');
    document.getElementById('btnFocus').setAttribute('aria-pressed', String(!!Settings.get('focus')));
    document.getElementById('btnCycle').setAttribute('aria-pressed', String(!!Settings.get('autoCycle')));
    document.getElementById('btnDual').setAttribute('aria-pressed', String(!!Settings.get('dual')));
    InfoLcd.setOn(!!Settings.get('dual'));
    Hud.setOn(!!Settings.get('hud'));
    Blink.sync();
  },
  /* マイ路線クイックバー＋マイルートの迂回アラート（どちらも未登録なら非表示） */
  renderFavBar() {
    const bar = document.getElementById('favBar'), list = Favs.list.map(lineByName).filter(Boolean), aff = Routes.affected();
    bar.hidden = !list.length && !Routes.list.length;
    const chips = list.length ? `<span class="fav-title"><span class="material-symbols-outlined">star</span>${I18n.label('myLines')}</span>` + list.map(L => {
      const st = Store.of(L.ja).status;
      return `<button class="fav-chip s-${st}" data-line="${L.ja}" style="--lc:${L.color}"><span class="badge sm">${L.code}</span><span class="fc-name">${L.ja}</span><span class="fc-st ${st}">${STATUS[st].ja}</span></button>`;
    }).join('') : '';
    const alertBtn = Routes.list.length ? `<button class="route-alert ${aff.length ? 'warn' : 'ok'}" id="routeAlert"><span class="material-symbols-outlined">alt_route</span>${aff.length ? 'マイルート影響あり（代替ルート確認）' : 'マイルート 正常'}</button>` : '';
    bar.innerHTML = chips + '<span class="fav-spacer"></span>' + alertBtn;
  },
  counts() {
    let s = 0, d = 0;
    LINES.forEach(L => { const st = Store.of(L.ja).status; if (st === 'suspend') s++; else if (st !== 'normal') d++; });
    return { s, d };
  },
  /* 正常稼働率バッジ＋異常件数バッジ（見合わせ N / 遅延 M） */
  renderMeter() {
    const el = document.getElementById('meter'), txt = document.getElementById('meterTxt'); if (!el) return;
    const ready = this.lastOk > 0 || this.fallbackReady || Settings.get('demo');
    const { s, d } = this.counts(), abn = s + d;
    const pct = (LINES.length - abn) / LINES.length * 100;
    el.className = 'meter ' + (!ready ? '' : pct >= 95 ? 'good' : pct >= 85 ? 'warn' : 'bad');
    txt.innerHTML = `<span class="mt-l">${I18n.label('uptime')}</span><b>${ready ? pct.toFixed(1) + '%' : '--'}</b>`;
    el.title = ready ? `全${LINES.length}路線中、平常運転 ${LINES.length - abn}路線` : '運行情報を取得中';
    const b = document.getElementById('abnBadge'), t = document.getElementById('abnTxt');
    if (b) {
      b.className = 'abn-badge ' + (!ready ? '' : s ? 'bad' : d ? 'warn' : 'good');
      t.textContent = !ready ? '--' : abn ? `見合わせ ${s} / 遅延 ${d}` : '異常なし';
    }
    if (AbnUI.isOpen()) AbnUI.render();
    ClockMode.data();
  },
  toast(msg) {
    const t = document.getElementById('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => { t.hidden = true; }, 4000);
  },
  /* データ更新後：履歴ログ・チャイム・音声読み上げ・ティッカー・稼働率・ボード・情報案内を更新 */
  afterData() {
    const cur = new Set(LINES.filter(L => Store.of(L.ja).status !== 'normal').map(L => L.ja));
    const now = {}; LINES.forEach(L => { now[L.ja] = Store.of(L.ja).status; });
    if (this.prevSt) History.record(this.prevSt, now);
    if (this.prevAbn) {
      const fresh = [...cur].filter(n => !this.prevAbn.has(n)); // 新たに遅延・見合わせになった路線
      if (fresh.length) {
        let wait = 0;
        if (Settings.get('chime')) { Chime.play(); wait = 1700; }
        if (Settings.get('speech')) setTimeout(() => Speech.announce(fresh), wait);
      }
    }
    this.prevAbn = cur; this.prevSt = now;
    Ticker.render(); this.renderFavBar(); this.renderMeter(); InfoLcd.render(); Insight.nightCheck();
    if (Cycle.view === 'board') Board.render();
    if (StationUI.isOpen()) StationUI.render();
    if (RouteUI.isOpen()) RouteUI.render();
    if (StationPop.isOpen()) StationPop.render();
  },
  prevAbn: null, prevSt: null, toastTimer: null,
  buildTabs() {
    const nav = document.getElementById('companyTabs');
    nav.innerHTML = COMPANIES.map(c =>
      `<button class="tab" data-guard="tab" data-id="${c.id}" aria-pressed="${c.id === this.company}">${c.ja}${I18n.bi() ? `<small>${c.en}</small>` : ''}</button>`).join('');
    nav.querySelectorAll('.tab').forEach(btn => btn.onclick = () => Guard.run('tab', () => {
      this.company = btn.dataset.id; MapView.applyFilter(this.company); this.buildTabs();
      if (Search.isOpen()) Search.render();
    }));
  },
  buildLegend() {
    document.getElementById('legend').innerHTML =
      `<span><i style="background:var(--delay);color:var(--delay)"></i>${I18n.label('delay')}</span>` +
      `<span><i style="background:var(--suspend);color:var(--suspend)"></i>${I18n.label('suspend')}</span>`;
  },
  startClock() {
    const el = document.getElementById('clock');
    const tick = () => {
      const d = new Date();
      el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      Detail.tickTime(); if (MV.isOpen()) MV.tickTime(); ClockMode.tick();
    };
    tick(); setInterval(tick, 1000);
  },
  busy: false, again: false, timer: null, lastOk: 0, fallbackReady: false, spinStart: 0,
  sync: { time: null, ok: true, text: '未同期' },
  setSync(ok, text) {
    if (ok) this.sync.time = new Date();
    this.sync.ok = ok; this.sync.text = text;
    this.renderSync();
  },
  renderSync() {
    const t = this.sync.time, p = n => String(n).padStart(2, '0');
    const timeEl = document.getElementById('syncTime'), stEl = document.getElementById('syncState');
    if (timeEl) timeEl.textContent = t ? `${t.getFullYear()}/${p(t.getMonth() + 1)}/${p(t.getDate())} ${p(t.getHours())}:${p(t.getMinutes())}:${p(t.getSeconds())}` : '--';
    if (stEl) { stEl.textContent = this.sync.text; stEl.className = 'sync-val ' + (this.sync.ok ? 'ok' : 'err'); }
    const lamp = document.getElementById('lamp'); if (lamp) lamp.title = this.sync.text;
  },
  /* 自動更新：デモOFFかつ間隔が「手動のみ」でないとき、前回の取得完了から設定間隔後に次を予約 */
  schedule() {
    clearTimeout(this.timer);
    const ms = Settings.get('interval');
    if (!Settings.get('demo') && ms > 0) this.timer = setTimeout(() => this.refresh(), ms);
  },
  async refresh(spin = false) {
    const btn = document.getElementById('btnRefresh'), lamp = document.getElementById('lamp');
    if (spin && !btn.classList.contains('spin')) { btn.classList.add('spin'); this.spinStart = Date.now(); }
    if (this.busy) { this.again = true; return; }
    this.busy = true; clearTimeout(this.timer);
    const provider = Providers.current;
    try {
      const data = await provider.fetchStatus();
      if (provider !== Providers.current) return;
      Store.data = data || {};
      this.lastOk = Date.now();
      this.fallbackReady = true;
      if (provider === LiveProvider) Store.saveCache(Store.data);
      lamp.classList.remove('err');
      this.setSync(true, provider === LiveProvider ? Yahoo.reportText() : 'デモモード：ダミーデータを表示中');
      MapView.applyStatuses(); this.afterData();
      if (Search.isOpen()) Search.render();
      if (Detail.isOpen()) Detail.render();
    } catch (e) {
      console.error('fetchStatus failed', e);
      lamp.classList.add('err');
      const reason = e && e.message ? e.message : String(e);
      if (!this.lastOk && !Settings.get('demo')) {
        const cached = Store.loadCache();
        if (cached) {
          Store.data = cached.data;
          this.lastOk = cached.time;
          const cd = new Date(cached.time);
          this.setSync(false, `通信失敗（前回 ${pad(cd.getHours())}:${pad(cd.getMinutes())} 取得データを表示中）：${reason}`);
        } else {
          this.fallbackReady = true;
          this.setSync(false, `通信失敗（フォールバック表示中）：${reason}`);
        }
        MapView.applyStatuses(); this.afterData();
      } else {
        this.setSync(false, `取得エラー（直前のデータを維持中）：${reason}`);
      }
      if (spin) UI.toast(`運行情報の更新に失敗しました（${reason}）。表示中のデータを維持します`);
    } finally {
      this.busy = false;
      const wait = Math.max(0, 800 - (Date.now() - this.spinStart));
      setTimeout(() => btn.classList.remove('spin'), wait);
      if (this.again) { this.again = false; this.refresh(); } else this.schedule();
    }
  }
};

/* ---------- 上部メニュー（表示切替・マイメニュー）：外側を押すと閉じる ---------- */
const Menus = {
  init() {
    document.getElementById('btnDisplayMenu').onclick = () => this.toggle('displayMenu');
    document.getElementById('btnMyMenu').onclick = () => this.toggle('myMenu');
    document.addEventListener('click', e => {
      if (e.target.closest('#btnDisplayMenu,#btnMyMenu')) return;
      if (!e.target.closest('.drop') || e.target.closest('.drop button')) this.close();
    });
  },
  toggle(id) { const el = document.getElementById(id), open = el.hidden; this.close(); el.hidden = !open; },
  close() { ['displayMenu', 'myMenu'].forEach(id => { const el = document.getElementById(id); if (el) el.hidden = true; }); }
};

/* ---------- 異常時運行シミュレーター：単一路線模擬 ＋ 広域トラブル一括シナリオ4種 ---------- */
const Sim = {
  eta(mins = 35) {
    const d = new Date(Date.now() + mins * 60000);
    const m5 = Math.min(55, Math.ceil(d.getMinutes() / 5) * 5);
    return `${pad(d.getHours())}時${pad(m5)}分頃`;
  },
  TEXT: {
    delay: name => `（模擬）${name}は、車両点検の影響で、上下線の一部列車に遅れが出ています。`,
    suspend: name => `（模擬）${name}は、駅構内での安全確認および車両故障の影響で、一部区間で運転を見合わせています。運転再開は${Sim.eta(40)}を見込んでいます。振替輸送を実施しています。`
  },
  /* 広域トラブルの一括シナリオ4種 */
  buildScenario(key) {
    if (key === 'core') {
      const e1 = this.eta(45), e2 = this.eta(35);
      return {
        label: '都心ターミナル大規模障害',
        data: {
          '山手線': { status: 'suspend', detail: `（模擬）山手線は、新宿駅での人身事故の影響で、内・外回り電車で運転を見合わせています。運転再開は${e1}を見込んでいます。振替輸送を実施しています。` },
          '中央線快速': { status: 'suspend', detail: `（模擬）中央線快速は、新宿駅での人身事故の影響で、東京〜高尾駅間の上下線で運転を見合わせています。運転再開は${e1}を見込んでいます。振替輸送を実施しています。` },
          '京浜東北線': { status: 'suspend', detail: `（模擬）京浜東北線は、東京駅付近での停電の影響で、大宮〜大船駅間で運転を見合わせています。運転再開は${e2}を見込んでいます。振替輸送を実施しています。` },
          '埼京線': { status: 'delay', detail: '（模擬）埼京線は、新宿駅での信号確認および混雑の影響で、上下線に大幅な遅れが出ています。振替輸送を実施しています。' },
          '丸ノ内線': { status: 'delay', detail: '（模擬）丸ノ内線は、JR線からの振替輸送による混雑の影響で、上下線の一部列車に遅れが出ています。' },
          '総武快速線': { status: 'delay', detail: '（模擬）総武快速線は、東京駅での接続調整および乗降混雑の影響で、一部列車に遅れが出ています。' }
        }
      };
    }
    if (key === 'typhoon') {
      const e1 = this.eta(60), e2 = this.eta(50);
      return {
        label: '台風・強風による湾岸・郊外線遅延',
        data: {
          '京葉線': { status: 'suspend', detail: `（模擬）京葉線は、台風接近に伴う強風の影響で、東京〜蘇我駅間の全線で運転を見合わせています。運転再開は${e1}を見込んでいます。振替輸送を実施しています。` },
          'ゆりかもめ': { status: 'suspend', detail: `（模擬）ゆりかもめは、強風の影響で、新橋〜豊洲駅間の全線で運転を見合わせています。運転再開は${e2}を見込んでいます。振替輸送を実施しています。` },
          '外房線': { status: 'suspend', detail: `（模擬）外房線は、大雨および強風の影響で、千葉〜安房鴨川駅間で運転を見合わせています。運転再開は${e1}を見込んでいます。` },
          '東海道線': { status: 'partial', detail: '（模擬）東海道線は、強風および大雨の影響で、東京〜小田原駅間の一部列車を運休しています。振替輸送を実施しています。' },
          '武蔵野線': { status: 'delay', detail: '（模擬）武蔵野線は、強風に伴う速度規制の影響で、上下線に遅れが出ています。' },
          '常磐線快速': { status: 'delay', detail: '（模擬）常磐線快速は、強風に伴う速度規制の影響で、上野〜取手駅間の上下線に遅れが出ています。' },
          '東京モノレール': { status: 'delay', detail: '（模擬）東京モノレールは、強風の影響で、浜松町〜羽田空港駅間の一部列車に遅れが出ています。' }
        }
      };
    }
    if (key === 'through') {
      const e1 = this.eta(30);
      return {
        label: '東急・メトロ直通ネットワーク乱れ',
        data: {
          '東急東横線': { status: 'suspend', detail: `（模擬）東急東横線は、武蔵小杉駅での信号トラブルの影響で、渋谷〜横浜駅間で運転を見合わせています。運転再開は${e1}を見込んでいます。東京メトロ副都心線との直通運転を中止し、振替輸送を実施しています。` },
          '東急新横浜線': { status: 'partial', detail: '（模擬）東急新横浜線は、東急東横線内での信号トラブルの影響で、一部列車を運休しています。振替輸送を実施しています。' },
          '副都心線': { status: 'delay', detail: '（模擬）副都心線は、東急東横線との直通運転中止の影響で、和光市〜渋谷駅間の上下線に遅れが出ています。振替輸送を実施しています。' },
          'みなとみらい線': { status: 'delay', detail: '（模擬）みなとみらい線は、東急東横線内での信号トラブルの影響で、上下線に遅れが出ています。' },
          '東急目黒線': { status: 'delay', detail: '（模擬）東急目黒線は、武蔵小杉駅での安全確認の影響で、一部列車に遅れが出ています。' },
          '西武池袋線': { status: 'delay', detail: '（模擬）西武池袋線は、直通先でのダイヤ乱れに伴い、一部列車に遅れが出ています。' },
          '東武東上線': { status: 'delay', detail: '（模擬）東武東上線は、直通運転区間の列車遅れの影響で、一部列車に遅れが出ています。' }
        }
      };
    }
    if (key === 'reset') return { label: '全線一括復旧リセット', data: {}, reset: true };
    return null;
  },
  init() {
    document.getElementById('simLine').innerHTML = LINES.map(L => `<option value="${esc(L.ja)}">[${esc(L.code)}] ${esc(L.ja)}</option>`).join('');
    document.getElementById('btnSim').onclick = () => Modals.open('modalSim');
    document.getElementById('modalSim').addEventListener('click', e => {
      const b = e.target.closest('[data-sim]'); if (b) this.run(b.dataset.sim);
      const c = e.target.closest('[data-scn]'); if (c) this.scenario(c.dataset.scn);
    });
  },
  apply(next, msg, afterFn) {
    Store.data = next;
    UI.fallbackReady = true;
    UI.schedule();
    MapView.applyStatuses();
    UI.afterData();
    if (Search.isOpen()) Search.render();
    if (Detail.isOpen()) Detail.render();
    document.getElementById('simMsg').textContent = msg;
    if (afterFn) afterFn();
  },
  run(kind) {
    if (kind === 'refresh') { UI.refresh(true); document.getElementById('simMsg').textContent = '実データを再取得しています…'; return; }
    const name = document.getElementById('simLine').value;
    const next = { ...Store.data };
    if (kind === 'resume') delete next[name];
    else next[name] = { status: kind === 'delay' ? 'delay' : 'suspend', detail: this.TEXT[kind](name) };
    this.apply(next, kind === 'resume' ? `${name}を平常運転に復旧しました` : `${name}に模擬の運行情報を発生させました`,
      kind === 'resume' ? () => UI.toast(`${name}を平常運転に戻しました`) : () => { Modals.closeAll(); Detail.open(name); });
  },
  scenario(key) {
    const sc = this.buildScenario(key); if (!sc) return;
    if (sc.reset) Detour.clear();
    const count = Object.keys(sc.data).length;
    const msg = sc.reset ? '全89路線を平常運転へ一括復旧リセットしました' : `シナリオ「${sc.label}」（${count}路線連動）を適用しました`;
    this.apply(sc.data, msg, () => {
      Modals.closeAll();
      UI.toast(msg);
    });
  }
};

/* ---------- 主要駅クイックジャンプ：押すと主要駅の一覧を開き、選ぶとその駅へズームする ---------- */
const Jump = {
  STATIONS: ['東京', '新宿', '渋谷', '池袋', '上野', '横浜', '大宮', '千葉'],
  init() {
    const list = document.getElementById('jumpList');
    list.innerHTML = this.STATIONS.map(n => `<button class="jump-btn" data-jump-st="${esc(n)}">${esc(n)}</button>`).join('');
    document.getElementById('jumpToggle').onclick = () => { list.hidden = !list.hidden; };
    list.addEventListener('click', e => {
      const b = e.target.closest('[data-jump-st]'); if (!b) return;
      const p = Stations.get(b.dataset.jumpSt);
      if (p) Zoom.focusOn(p.x, p.y); else UI.toast('路線図上でこの駅を見つけられませんでした');
      list.hidden = true;
    });
  }
};

/* ---------- 運行の読み取り：運転再開見込み時刻の自動抽出 ＆ 3段階影響度判定 ＆ 深夜ウォッチ ---------- */
const Insight = {
  fmtHm(ampm, hRaw, mRaw) {
    let h = Number(hRaw), mi = mRaw !== undefined && mRaw !== '' ? Number(mRaw) : 0;
    if (!Number.isFinite(h) || !Number.isFinite(mi) || mi < 0 || mi > 59) return null;
    if (ampm === '午後' && h >= 1 && h <= 11) h += 12;
    if (ampm === '午前' && h === 12) h = 0;
    if (h < 0 || h > 27) return null;
    return `${pad(h % 24)}:${pad(mi)}`;
  },
  /* 本文から運転再開見込み時刻（14時30分頃 / 15:00頃 / 全角数字 / 午後表記）を誤爆なく抽出 */
  resume(text) {
    const t = String(text || '').normalize('NFKC');
    if (!t || /再開(?:見込み|予定|時刻)?は?未定/.test(t)) return null;
    const p1 = /(?:運転再開|再開見込[み]?|再開予定|再開は|復旧は|復旧見込[み]?)[^。0-9]{0,24}?(午前|午後)?\s*(\d{1,2})\s*(?:時|:|：)\s*(\d{1,2})?\s*分?\s*(?:頃|ごろ|予定|見込|めど|目処)?/.exec(t);
    if (p1) { const v = this.fmtHm(p1[1], p1[2], p1[3]); if (v) return v; }
    const p2 = /(午前|午後)?\s*(\d{1,2})\s*(?:時|:|：)\s*(\d{1,2})?\s*分?\s*(?:頃|ごろ|予定|めど|目処)?[^。]{0,18}?(?:運転再開|再開見込|再開予定|再開を見込|復旧見込)/.exec(t);
    if (p2) { const v = this.fmtHm(p2[1], p2[2], p2[3]); if (v) return v; }
    const re = /(午前|午後)?\s*(\d{1,2})\s*(?:時|:|：)\s*(\d{1,2})?\s*分?\s*(頃|ごろ)/g;
    let m;
    while ((m = re.exec(t))) {
      const tail = t.slice(m.index + m[0].length, m.index + m[0].length + 14);
      if (/^[、,\s]*(?:[^\s。]{1,10}で)?(?:発生|確認|現在)/.test(tail)) continue;
      const v = this.fmtHm(m[1], m[2], m[3]);
      if (v) return v;
    }
    return null;
  },
  /* 影響度：原因キーワードと運行状態から3段階（軽微 / 注意 / 深刻・混雑警戒）を自動判定 */
  impact(s) {
    const t = String((s && s.detail) || '').normalize('NFKC');
    if (!s || s.status === 'normal') return { level: 0, ja: '平常', cls: 'sev1', icon: 'check_circle' };
    if (s.status === 'suspend' || /人身事故|脱線|火災|停電|き電|饋電|架線|大規模|全線|終日|台風|地震|倒木|土砂|冠水/.test(t)) {
      return { level: 3, ja: '深刻・混雑警戒', cls: 'sev3', icon: 'crisis_alert' };
    }
    if (s.status === 'partial' || /車両故障|故障|信号|踏切|強風|大雨|豪雨|大雪|大幅|直通運転.*中止|振替輸送|急病人.*複数/.test(t)) {
      return { level: 2, ja: '注意', cls: 'sev2', icon: 'error' };
    }
    return { level: 1, ja: '軽微', cls: 'sev1', icon: 'info' };
  },
  impactChipHtml(s) {
    if (!s || s.status === 'normal') return '';
    const im = this.impact(s);
    return `<span class="imp-chip ${im.cls}"><span class="material-symbols-outlined">${im.icon}</span>影響度：${im.ja}</span>`;
  },
  chipsHtml(s) {
    if (!s || s.status === 'normal') return '';
    const r = this.resume(s.detail);
    return `${r ? `<span class="res-chip"><span class="material-symbols-outlined">schedule</span>再開見込み ${esc(r)}頃</span>` : ''}${this.impactChipHtml(s)}`;
  },
  /* 深夜・終電ウォッチ：22:30〜01:30、または設定でONのとき */
  nightActive() { const d = new Date(), m = d.getHours() * 60 + d.getMinutes(); return m >= 1350 || m < 90; },
  alertKey: '',
  nightCheck() {
    const on = !!Settings.get('nightWatch') || this.nightActive();
    const chip = document.getElementById('nightBadge');
    if (chip) chip.hidden = !on;
    if (!on) { this.alertKey = ''; return; }
    const mine = [...new Set([...Favs.list, ...Routes.list.flatMap(r => r.lines)])];
    const bad = mine.filter(n => Store.of(n).status !== 'normal');
    const key = bad.join(',');
    if (bad.length && key !== this.alertKey) {
      this.alertKey = key;
      UI.toast(`深夜ウォッチ：${bad.slice(0, 3).join('・')}に影響が出ています。終電への接続に注意してください`);
    }
  }
};

/* ---------- ワンタップ運行状況共有（報告テキスト自動生成・navigator.share / クリップボードコピー） ---------- */
const Share = {
  line(name) {
    const L = lineByName(name); if (!L) return '';
    const s = Store.of(name), now = new Date();
    if (s.status === 'normal') return `【鉄道運行情報】${L.ja}は、現在平常通り運転しています（${pad(now.getHours())}:${pad(now.getMinutes())}時点）。`;
    let first = String(s.detail || '').replace(/^（模擬）\s*/, '').split('。')[0].trim();
    if (!first) first = `${L.ja}は、${STATUS[s.status].ja}となっています`;
    else if (!first.startsWith(L.ja)) first = `${L.ja}は、${first}`;
    const meta = [];
    const r = Insight.resume(s.detail);
    if (r) meta.push(`再開見込み ${r}頃`);
    if (/振替輸送/.test(s.detail || '')) meta.push('振替輸送あり');
    const im = Insight.impact(s);
    if (!meta.length) meta.push(`影響度：${im.ja}`);
    return `【鉄道運行情報】${first}（${meta.join(' / ')}）。`;
  },
  route(r) {
    const bad = r.lines.map(n => ({ n, L: lineByName(n), s: Store.of(n) })).filter(x => x.s.status !== 'normal');
    const now = new Date(), ts = `${pad(now.getHours())}:${pad(now.getMinutes())}時点`;
    if (!bad.length) return `【鉄道運行情報｜マイルート：${r.name}】利用路線（${r.lines.join('・')}）はすべて平常通り運転しています（${ts}）。`;
    const items = bad.map(({ n, L, s }) => {
      const rs = Insight.resume(s.detail);
      const furikae = /振替輸送/.test(s.detail || '');
      const alts = L ? (L.alt || []).filter(a => Store.of(a).status === 'normal').slice(0, 2) : [];
      const tags = [STATUS[s.status].ja];
      if (rs) tags.push(`再開見込み ${rs}頃`);
      if (furikae) tags.push('振替輸送あり');
      if (alts.length) tags.push(`代替候補：${alts.join('・')}`);
      return `${n}は${Cause.classify(s.detail).ja}の影響で${STATUS[s.status].ja}（${tags.slice(1).join(' / ') || `影響度：${Insight.impact(s).ja}`}）`;
    });
    return `【鉄道運行情報｜${r.name}】${items.join('／')}。`;
  },
  copyFallback(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) {}
    ta.remove();
    return ok;
  },
  async send(text) {
    if (!text) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: '鉄道運行情報', text });
        UI.toast('運行状況を共有しました');
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return; // ユーザーによるキャンセル時のみ終了し、それ以外はコピーへフォールバック
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        UI.toast(`報告文をコピーしました：${text}`);
        return;
      }
    } catch (_) {}
    if (this.copyFallback(text)) UI.toast(`報告文をコピーしました：${text}`);
    else UI.toast('コピーできませんでした：' + text);
  }
};

/* ---------- スマホ版：下部バー（ホーム・検索・メニュー・設定）とメニューシート ---------- */
const Phone = {
  mq: null, sheetOpen: false,
  ITEMS: [
    { sec: '表示', items: [
      { id: 'lcdtheme', ja: '車内LCDテーマ切替', icon: 'tv', state: () => { const o = OPT_LCD_THEME.find(x => x[0] === Settings.get('lcdTheme')); return o ? o[0].toUpperCase() : 'AUTO'; }, act: () => MV.activate('lcdTheme') },
      { id: 'dual', ja: '2画面LCD（16:9）', icon: 'view_sidebar', state: () => !!Settings.get('dual'), act: () => document.getElementById('btnDual').click() },
      { id: 'minitags', ja: '路線図の異常ミニラベル', icon: 'label', state: () => !!Settings.get('miniTags'), act: () => Settings.set('miniTags', !Settings.get('miniTags')) },
      { id: 'cycle', ja: '自動切替', icon: 'autorenew', state: () => !!Settings.get('autoCycle'), act: () => document.getElementById('btnCycle').click() },
      { id: 'focus', ja: '異常のみ強調', icon: 'warning', state: () => !!Settings.get('focus'), act: () => document.getElementById('btnFocus').click() },
      { id: 'clock', ja: 'LCD時計', icon: 'schedule', state: () => ClockMode.isOpen(), act: () => document.getElementById('btnClock').click() },
      { id: 'night', ja: '深夜・終電ウォッチ', icon: 'dark_mode', state: () => !!Settings.get('nightWatch'), act: () => Settings.set('nightWatch', !Settings.get('nightWatch')) }
    ] },
    { sec: '情報', items: [
      { id: 'abn', ja: '異常路線一覧', icon: 'warning', act: () => AbnUI.open() },
      { id: 'station', ja: 'マイ駅', icon: 'pin_drop', act: () => StationUI.open() },
      { id: 'route', ja: 'マイルート', icon: 'alt_route', act: () => RouteUI.open() },
      { id: 'history', ja: '履歴ログ', icon: 'history', act: () => HistoryUI.open() }
    ] },
    { sec: 'ツール', items: [
      { id: 'sim', ja: '異常時シミュレーター', icon: 'science', act: () => Modals.open('modalSim') },
      { id: 'backup', ja: 'データ保存・復元', icon: 'swap_horiz', act: () => Backup.open() },
      { id: 'links', ja: '公式遅延証明書', icon: 'receipt_long', act: () => LinksUI.open() },
      { id: 'help', ja: '係員呼出（操作ガイド）', icon: 'support_agent', act: () => HelpUI.open() }
    ] }
  ],
  on() { return document.body.classList.contains('is-phone'); },
  init() {
    this.mq = window.matchMedia('(max-width: 640px)');
    const upd = () => this.apply();
    if (this.mq.addEventListener) this.mq.addEventListener('change', upd); else this.mq.addListener(upd);
    document.querySelectorAll('#phoneNav [data-pn]').forEach(b => b.addEventListener('click', () => this.nav(b.dataset.pn)));
    document.getElementById('pnScrim').addEventListener('click', () => this.closeSheet(true));
    document.getElementById('pnList').addEventListener('click', e => {
      const it = e.target.closest('[data-pn-id]'); if (it) this.item(it.dataset.pnId);
    });
    this.apply();
  },
  /* 画面幅に応じて切り替える（スマホ：640px以下） */
  apply() {
    document.body.classList.toggle('is-phone', this.mq.matches);
    if (!this.mq.matches) this.closeSheet(false);
    this.sync();
    if (Engine.canvas) Engine.scheduleResize(200);
  },
  setActive(key) {
    document.querySelectorAll('#phoneNav [data-pn]').forEach(b => {
      const on = b.dataset.pn === key;
      b.classList.toggle('on', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
  },
  /* 画面に何も出ていないときは「ホーム」を選んだ状態にする */
  sync() {
    if (!this.on()) return;
    const open = document.querySelector('.modal:not([hidden])');
    if (!open && !this.sheetOpen) this.setActive('home');
  },
  openSheet() {
    this.renderSheet();
    document.getElementById('pnSheet').hidden = false;
    document.getElementById('pnScrim').hidden = false;
    this.sheetOpen = true; this.setActive('menu');
  },
  closeSheet(reset) {
    document.getElementById('pnSheet').hidden = true;
    document.getElementById('pnScrim').hidden = true;
    this.sheetOpen = false;
    if (reset) this.sync();
  },
  nav(key) {
    if (key === 'home') {
      Modals.closeAll(); ClockMode.close(); this.closeSheet(false);
      Zoom.home(); this.setActive('home'); return;
    }
    if (key === 'search') { this.closeSheet(false); Search.open(true); this.setActive('search'); return; }
    if (key === 'menu') { if (this.sheetOpen) this.closeSheet(true); else this.openSheet(); return; }
    if (key === 'settings') { this.closeSheet(false); document.getElementById('btnSettings').click(); this.setActive('settings'); }
  },
  renderSheet() {
    document.getElementById('pnList').innerHTML = this.ITEMS.map(sec =>
      `<div class="pn-sec">${esc(sec.sec)}</div>` + sec.items.map(it => {
        const st = it.state ? it.state() : null;
        const badge = st === null ? '' : typeof st === 'string' ? `<span class="pn-state on">${esc(st)}</span>` : `<span class="pn-state${st ? ' on' : ''}">${st ? 'ON' : 'OFF'}</span>`;
        return `<button class="pn-row" data-pn-id="${it.id}"><span class="material-symbols-outlined">${it.icon}</span><span class="pn-row-lbl">${esc(it.ja)}</span>${badge}</button>`;
      }).join('')).join('');
  },
  item(id) {
    const it = this.ITEMS.flatMap(s => s.items).find(x => x.id === id); if (!it) return;
    this.closeSheet(false);
    it.act();
    setTimeout(() => this.sync(), 0);
  }
};

/* ---------- 起動 ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  Settings.load();
  UI.init();
  Engine.init(document.getElementById('map-viewport'), document.getElementById('map-canvas'));
  await MapView.init();
  Zoom.init(document.getElementById('map-viewport'));
  Engine.ready = true;
  Engine.setState({ company: UI.company, alert: !!Settings.get('focus') });
  Engine.requestDraw();
  Blink.sync();
  Locate.init(); LinksUI.init(); Phone.init();
  if (Settings.get('autoLocate')) Locate.locate();
  await UI.refresh();
});

/* ---------- PWA：Service Worker 登録（HTTPS または localhost でのみ有効） ---------- */
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  // 更新版のService Workerが有効になったら、古いJS/CSSを使い続けないよう1回だけ再読み込み
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true; location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('Service Worker registration failed:', err));
  });
}
