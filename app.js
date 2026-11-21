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
/* 路線マスターデータ（89路線）
 * [路線名, 英語名, 会社区分, 路線記号, ラインカラー, [事業者名, Operator], [路線図SVG内のグループID前方一致...], [振替・代替路線名...]]
 * 路線図SVGに描画が無い路線は svg を空配列にしてあります（一覧・検索・運行状況の表示には使えます） */
const MASTER_RAW = [
  /* ---- JR東日本（30路線） ---- */
  ['山手線', 'Yamanote Line', 'JR', 'JY', '#80c241', JR, ['jr-yamanote'], ['京浜東北線', '埼京線', '湘南新宿ライン', '中央線快速', '丸ノ内線', '銀座線']],
  ['京浜東北線', 'Keihin-Tohoku Line', 'JR', 'JK', '#00b2e5', JR, ['jr-keihintohoku'], ['山手線', '東海道線', '上野東京ライン', '京急本線']],
  ['根岸線', 'Negishi Line', 'JR', 'JK', '#00b2e5', JR, ['jr-negishi'], ['横浜線', '横浜市営地下鉄ブルーライン', '京浜東北線']],
  ['中央線快速', 'Chuo Line (Rapid)', 'JR', 'JC', '#f15a22', JR, ['jr-chuo'], ['中央・総武各駅停車', '丸ノ内線', '東西線', '京王線', '西武新宿線']],
  ['中央・総武各駅停車', 'Chuo-Sobu Line (Local)', 'JR', 'JB', '#ffd400', JR, ['jr-sobulocal'], ['中央線快速', '総武快速線', '東西線', '都営新宿線', '都営大江戸線']],
  ['中央本線', 'Chuo Main Line', 'JR', 'CO', '#007ac0', JR, [], ['中央線快速', '青梅線', '京王線', '横浜線']],
  ['東海道線', 'Tokaido Line', 'JR', 'JT', '#f68b1e', JR, ['jr-tokaido'], ['京浜東北線', '横須賀線', '上野東京ライン', '京急本線', '東急東横線', '相鉄本線']],
  ['横須賀線', 'Yokosuka Line', 'JR', 'JO', '#0068b7', JR, ['jr-yokosuka'], ['東海道線', '湘南新宿ライン', '京急本線', '横浜線']],
  ['総武快速線', 'Sobu Line (Rapid)', 'JR', 'JO', '#0068b7', JR, ['jr-soburapid'], ['中央・総武各駅停車', '京葉線', '京成本線', '都営新宿線', '東西線']],
  ['総武本線', 'Sobu Main Line', 'JR', 'JO', '#ffd400', JR, [], ['総武快速線', '京成本線', '京葉線', '外房線']],
  ['湘南新宿ライン', 'Shonan-Shinjuku Line', 'JR', 'JS', '#e21f26', JR, ['jr-shonanshinjuku'], ['山手線', '埼京線', '上野東京ライン', '東海道線', '横須賀線']],
  ['上野東京ライン', 'Ueno-Tokyo Line', 'JR', 'JU', '#f68b1e', JR, ['jr-uenotokyo'], ['東海道線', '京浜東北線', '宇都宮線', '高崎線', '山手線']],
  ['宇都宮線', 'Utsunomiya Line', 'JR', 'JU', '#f68b1e', JR, ['jr-utsunomiya'], ['高崎線', '京浜東北線', '埼京線', '東武アーバンパークライン', '埼玉高速鉄道線']],
  ['高崎線', 'Takasaki Line', 'JR', 'JU', '#f68b1e', JR, ['jr-takasaki'], ['宇都宮線', '埼京線', '京浜東北線', '東武東上線']],
  ['埼京線', 'Saikyo Line', 'JR', 'JA', '#00ac9a', JR, ['jr-saikyo'], ['山手線', '湘南新宿ライン', '有楽町線', '副都心線', '東武東上線', '川越線']],
  ['川越線', 'Kawagoe Line', 'JR', 'JA', '#00ac9a', JR, ['jr-kawagoe'], ['埼京線', '東武東上線', '西武池袋線', '高崎線']],
  ['常磐線快速', 'Joban Line (Rapid)', 'JR', 'JJ', '#00b261', JR, ['jr-joban_'], ['常磐線各駅停車', '千代田線', 'つくばエクスプレス', '山手線', '京浜東北線']],
  ['常磐線各駅停車', 'Joban Line (Local)', 'JR', 'JL', '#808080', JR, ['jr-jobanlocal'], ['常磐線快速', '千代田線', 'つくばエクスプレス', '武蔵野線']],
  ['常磐線', 'Joban Line', 'JR', 'JJ', '#0068b7', JR, [], ['常磐線快速', 'つくばエクスプレス', '東武アーバンパークライン']],
  ['京葉線', 'Keiyo Line', 'JR', 'JE', '#c9242f', JR, ['jr-keiyo'], ['総武快速線', '中央・総武各駅停車', '東西線', '武蔵野線', '東葉高速線']],
  ['武蔵野線', 'Musashino Line', 'JR', 'JM', '#f15a22', JR, ['jr-musashino'], ['京葉線', '南武線', '埼京線', '東武アーバンパークライン', '常磐線各駅停車']],
  ['南武線', 'Nambu Line', 'JR', 'JN', '#ffd400', JR, ['jr-nanbu'], ['東急田園都市線', '東急東横線', '京王線', '小田急小田原線', '横浜線']],
  ['横浜線', 'Yokohama Line', 'JR', 'JH', '#80c241', JR, ['jr-yokohama'], ['東急東横線', '相鉄本線', '小田急小田原線', '京王相模原線', '南武線']],
  ['相模線', 'Sagami Line', 'JR', 'JI', '#009793', JR, ['jr-sagami'], ['横浜線', '小田急小田原線', '小田急江ノ島線', '東海道線']],
  ['青梅線', 'Ome Line', 'JR', 'JC', '#f15a22', JR, ['jr-ome'], ['中央線快速', '西武池袋線', '西武新宿線', '五日市線']],
  ['五日市線', 'Itsukaichi Line', 'JR', 'JC', '#f15a22', JR, ['jr-itsukaichi'], ['青梅線', '中央線快速', '西武拝島線']],
  ['外房線', 'Sotobo Line', 'JR', 'JO', '#db4028', JR, ['jr-sotobo'], ['内房線', '総武本線', '京成千葉線', '京成本線']],
  ['内房線', 'Uchibo Line', 'JR', 'JO', '#00b2e5', JR, ['jr-uchibo'], ['外房線', '京葉線', '京成千葉線']],
  ['成田線', 'Narita Line', 'JR', 'JO', '#00b261', JR, ['jr-narita'], ['京成本線', '成田スカイアクセス線', '総武本線']],
  ['鶴見線', 'Tsurumi Line', 'JR', 'JI', '#ffd400', JR, ['jr-tsurumi'], ['京浜東北線', '京急本線', '京急空港線']],

  /* ---- 東京メトロ（9路線） ---- */
  ['銀座線', 'Ginza Line', 'Metro', 'G', '#ff9500', TM, ['tokyometro-ginza'], ['山手線', '丸ノ内線', '都営浅草線', '半蔵門線']],
  ['丸ノ内線', 'Marunouchi Line', 'Metro', 'M', '#f62e36', TM, ['tokyometro-marunouchi'], ['中央線快速', '山手線', '東西線', '都営新宿線']],
  ['日比谷線', 'Hibiya Line', 'Metro', 'H', '#b5b5ac', TM, ['tokyometro-hibiya'], ['山手線', '銀座線', '都営大江戸線', '京浜東北線']],
  ['東西線', 'Tozai Line', 'Metro', 'T', '#009bbf', TM, ['tokyometro-tozai'], ['中央・総武各駅停車', '中央線快速', '総武快速線', '都営新宿線', '京葉線']],
  ['千代田線', 'Chiyoda Line', 'Metro', 'C', '#00bb85', TM, ['tokyometro-chiyoda'], ['常磐線各駅停車', '小田急小田原線', '山手線', '半蔵門線']],
  ['有楽町線', 'Yurakucho Line', 'Metro', 'Y', '#c1a470', TM, ['tokyometro-yurakucho'], ['西武有楽町線', '副都心線', '東武東上線', '山手線']],
  ['半蔵門線', 'Hanzomon Line', 'Metro', 'Z', '#8f76d6', TM, ['tokyometro-hanzomon'], ['銀座線', '東急田園都市線', '都営新宿線', '都営大江戸線']],
  ['南北線', 'Namboku Line', 'Metro', 'N', '#00ac9b', TM, ['tokyometro-nanboku'], ['都営三田線', '埼玉高速鉄道線', '山手線', '東急目黒線']],
  ['副都心線', 'Fukutoshin Line', 'Metro', 'F', '#9c5e31', TM, ['tokyometro-fukutoshin'], ['山手線', '埼京線', '有楽町線', '東急東横線', '西武池袋線']],

  /* ---- 都営地下鉄・東京都交通局（5路線） ---- */
  ['都営浅草線', 'Toei Asakusa Line', 'Toei', 'A', '#ec6e65', TO, ['toei-asakusa'], ['銀座線', '京急本線', '京成押上線', '山手線']],
  ['都営三田線', 'Toei Mita Line', 'Toei', 'I', '#0067b0', TO, ['toei-mita'], ['南北線', '東急目黒線', '山手線', '東西線']],
  ['都営新宿線', 'Toei Shinjuku Line', 'Toei', 'S', '#b0bf1e', TO, ['toei-shinjuku'], ['中央・総武各駅停車', '京王線', '東西線', '丸ノ内線']],
  ['都営大江戸線', 'Toei Oedo Line', 'Toei', 'E', '#ce045b', TO, ['toei-oedo'], ['山手線', '中央・総武各駅停車', '丸ノ内線', '西武池袋線']],
  ['日暮里・舎人ライナー', 'Nippori-Toneri Liner', 'Toei', 'NT', '#ff69b4', TO, ['toei-nipporitoneriliner'], ['山手線', '京浜東北線', '常磐線各駅停車', '千代田線']],

  /* ---- 大手私鉄・準大手・新交通・モノレール（45路線） ---- */
  ['東急東横線', 'Tokyu Toyoko Line', 'Private', 'TY', '#da0442', TQ, ['tokyu-toyoko'], ['東急目黒線', '山手線', '副都心線', 'みなとみらい線', '東海道線']],
  ['東急目黒線', 'Tokyu Meguro Line', 'Private', 'MG', '#009cd2', TQ, ['tokyu-meguro'], ['東急東横線', '南北線', '都営三田線', '山手線']],
  ['東急田園都市線', 'Tokyu Den-en-toshi Line', 'Private', 'DT', '#20a288', TQ, ['tokyu-denentoshi'], ['東急大井町線', '半蔵門線', '南武線', '小田急小田原線']],
  ['東急大井町線', 'Tokyu Oimachi Line', 'Private', 'OM', '#f18c43', TQ, ['tokyu-oimachi'], ['東急田園都市線', '東急目黒線', '京浜東北線', '南武線']],
  ['東急池上線', 'Tokyu Ikegami Line', 'Private', 'IK', '#ee86a7', TQ, ['tokyu-ikegami'], ['東急多摩川線', '京浜東北線', '東急目黒線']],
  ['東急多摩川線', 'Tokyu Tamagawa Line', 'Private', 'TM', '#ae0378', TQ, ['tokyu-tamagawa'], ['東急池上線', '京浜東北線', '京急空港線']],
  ['東急新横浜線', 'Tokyu Shin-Yokohama Line', 'Private', 'SH', '#890d84', TQ, [], ['相鉄新横浜線', '横浜線', '横浜市営地下鉄ブルーライン', '東急東横線']],
  ['小田急小田原線', 'Odakyu Odawara Line', 'Private', 'OH', '#007ed5', OD, ['odakyu-odawara'], ['京王線', '中央線快速', '東急田園都市線', '千代田線', '東海道線']],
  ['小田急江ノ島線', 'Odakyu Enoshima Line', 'Private', 'OE', '#007ed5', OD, ['odakyu-enoshima'], ['小田急小田原線', '東海道線', '相鉄本線', '相模線']],
  ['小田急多摩線', 'Odakyu Tama Line', 'Private', 'OT', '#007ed5', OD, ['odakyu-tama'], ['小田急小田原線', '京王相模原線', '横浜線']],
  ['京王線', 'Keio Line', 'Private', 'KO', '#dd0077', KE, ['keio-keio', 'keio-new'], ['小田急小田原線', '中央線快速', '都営新宿線', '京王相模原線']],
  ['京王相模原線', 'Keio Sagamihara Line', 'Private', 'KO', '#dd0077', KE, ['keio-sagamihara'], ['京王線', '小田急多摩線', '横浜線', '多摩都市モノレール']],
  ['京王井の頭線', 'Keio Inokashira Line', 'Private', 'IN', '#1d2088', KE, ['keio-inokashira'], ['中央線快速', '小田急小田原線', '東急田園都市線', '山手線']],
  ['西武池袋線', 'Seibu Ikebukuro Line', 'Private', 'SI', '#ff6600', SE, ['seibu-ikebukuro'], ['東武東上線', '山手線', '都営大江戸線', '西武有楽町線', '中央線快速']],
  ['西武新宿線', 'Seibu Shinjuku Line', 'Private', 'SS', '#0099cc', SE, ['seibu-shinjuku'], ['中央線快速', '都営新宿線', '西武拝島線', '山手線']],
  ['西武拝島線', 'Seibu Haijima Line', 'Private', 'SS', '#0099cc', SE, ['seibu-haijima'], ['西武新宿線', '中央線快速', '青梅線']],
  ['西武有楽町線', 'Seibu Yurakucho Line', 'Private', 'SI', '#ff6600', SE, ['seibu-yurakucho'], ['西武池袋線', '有楽町線', '副都心線']],
  ['東武東上線', 'Tobu Tojo Line', 'Private', 'TJ', '#004098', TB, ['tobu-tojo'], ['西武池袋線', '川越線', '埼京線', '有楽町線', '副都心線']],
  ['東武スカイツリーライン', 'Tobu Skytree Line', 'Private', 'TS', '#0067c0', TB, ['tobu-skytree'], ['つくばエクスプレス', '日比谷線', '半蔵門線', '京成本線', '常磐線各駅停車']],
  ['東武伊勢崎線', 'Tobu Isesaki Line', 'Private', 'TI', '#e60012', TB, ['tobu-isezaki'], ['東武スカイツリーライン', '高崎線', '宇都宮線']],
  ['東武日光線', 'Tobu Nikko Line', 'Private', 'TN', '#f39800', TB, [], ['東武スカイツリーライン', '宇都宮線']],
  ['東武アーバンパークライン', 'Tobu Urban Park Line', 'Private', 'TD', '#00a7e3', TB, ['tobu-noda'], ['武蔵野線', '宇都宮線', '総武快速線', '京成本線']],
  ['京成本線', 'Keisei Main Line', 'Private', 'KS', '#005aaa', KS, ['keisei-keisei'], ['総武快速線', '中央・総武各駅停車', '東西線', '都営浅草線', '北総線']],
  ['京成押上線', 'Keisei Oshiage Line', 'Private', 'KS', '#005aaa', KS, ['keisei-oshiage'], ['都営浅草線', '京成本線', '半蔵門線']],
  ['京成千葉線', 'Keisei Chiba Line', 'Private', 'KS', '#005aaa', KS, ['keisei-chiba'], ['京成本線', '総武快速線', '京葉線']],
  ['成田スカイアクセス線', 'Narita Sky Access Line', 'Private', 'KS', '#ff6600', KS, ['keisei-naritaskyaccess'], ['京成本線', '成田線', '総武快速線']],
  ['新京成線', 'Shin-Keisei Line', 'Private', 'SL', '#ef59a1', ['新京成電鉄', 'Shin-Keisei'], ['shinkeisei-shinkeisei'], ['京成本線', '総武快速線', '中央・総武各駅停車', '京葉線', '武蔵野線']],
  ['北総線', 'Hokuso Line', 'Private', 'HS', '#00a0e9', ['北総鉄道', 'Hokuso Railway'], [], ['京成本線', '都営浅草線', '京成押上線', '総武快速線']],
  ['東葉高速線', 'Toyo Rapid Line', 'Private', 'TR', '#3fb035', ['東葉高速鉄道', 'Toyo Rapid Railway'], ['toyokosoku'], ['東西線', '総武快速線', '京葉線', '武蔵野線']],
  ['京急本線', 'Keikyu Main Line', 'Private', 'KK', '#e50012', KQ, ['keikyu-keikyu'], ['東海道線', '京浜東北線', '都営浅草線', '東急東横線', '横須賀線']],
  ['京急空港線', 'Keikyu Airport Line', 'Private', 'KK', '#e50012', KQ, ['keikyu-airport'], ['東京モノレール', 'りんかい線', '京急本線', '京浜東北線']],
  ['京急逗子線', 'Keikyu Zushi Line', 'Private', 'KK', '#e50012', KQ, ['keikyu-zushi'], ['京急本線', '横須賀線', '東海道線']],
  ['京急久里浜線', 'Keikyu Kurihama Line', 'Private', 'KK', '#e50012', KQ, ['keikyu-kurihama'], ['京急本線', '横須賀線', '東海道線']],
  ['相鉄本線', 'Sotetsu Main Line', 'Private', 'SO', '#003893', SO, ['soutetsu-main'], ['東海道線', '横須賀線', '湘南新宿ライン', '東急東横線', '横浜線']],
  ['相鉄いずみ野線', 'Sotetsu Izumino Line', 'Private', 'SO', '#003893', SO, ['soutetsu-izumino'], ['相鉄本線', '横浜市営地下鉄ブルーライン', '小田急江ノ島線']],
  ['相鉄新横浜線', 'Sotetsu Shin-Yokohama Line', 'Private', 'SO', '#003893', SO, ['soutetsu-shinyokohama'], ['相鉄本線', '東急新横浜線', '横浜線', '横浜市営地下鉄ブルーライン']],
  ['つくばエクスプレス', 'Tsukuba Express', 'Private', 'TX', '#003399', ['首都圏新都市鉄道', 'MIR'], ['tsukubaexpress'], ['東武スカイツリーライン', '常磐線快速', '常磐線各駅停車', '日比谷線', '山手線']],
  ['りんかい線', 'Rinkai Line', 'Private', 'R', '#00418e', ['東京臨海高速鉄道', 'TWR'], ['rinkai'], ['東京モノレール', '山手線', '埼京線', 'ゆりかもめ']],
  ['ゆりかもめ', 'Yurikamome', 'Private', 'U', '#0075c2', ['ゆりかもめ', 'Yurikamome'], ['yurikamome'], ['りんかい線', '山手線', '都営浅草線', '京葉線']],
  ['東京モノレール', 'Tokyo Monorail', 'Private', 'MO', '#00a0e9', ['東京モノレール', 'Tokyo Monorail'], ['jr-tokyomonorail'], ['京急空港線', '山手線', 'りんかい線', '京浜東北線']],
  ['多摩都市モノレール', 'Tama Toshi Monorail', 'Private', 'TT', '#ff6600', ['多摩都市モノレール', 'Tama Monorail'], ['tamatoshimonorail'], ['京王相模原線', '中央線快速', '西武拝島線', '青梅線']],
  ['みなとみらい線', 'Minatomirai Line', 'Private', 'MM', '#003e92', ['横浜高速鉄道', 'Yokohama Minatomirai Railway'], ['minatomirai'], ['東急東横線', '京浜東北線', '根岸線', '横浜市営地下鉄ブルーライン']],
  ['横浜市営地下鉄ブルーライン', 'Yokohama Subway Blue Line', 'Private', 'B', '#0068b7', ['横浜市交通局', 'Yokohama Municipal Subway'], ['yokohama-blue'], ['根岸線', '京急本線', '相鉄本線', '横浜市営地下鉄グリーンライン', '東急新横浜線']],
  ['横浜市営地下鉄グリーンライン', 'Yokohama Subway Green Line', 'Private', 'G', '#00a040', ['横浜市交通局', 'Yokohama Municipal Subway'], ['yokohama-green'], ['横浜線', '東急田園都市線', '横浜市営地下鉄ブルーライン']],
  ['埼玉高速鉄道線', 'Saitama Rapid Railway Line', 'Private', 'SR', '#0080c6', ['埼玉高速鉄道', 'Saitama Railway'], ['saitamakosoku'], ['南北線', '都営三田線', '京浜東北線', '宇都宮線']]
];
const LINES = MASTER_RAW.map(([ja, en, co, code, color, op, svg, alt]) =>
  ({ ja, en, co, code, color, op: { ja: op[0], en: op[1] }, svg, alt: alt || [] }));
const lineByName = name => LINES.find(l => l.ja === name);

/* ---------- 設定（localStorage） ---------- */
const Settings = {
  KEY: 'tokyo-lcd:settings',
  data: { demo: false, bilingual: true, autoLocate: false, chime: false, speech: false, autoCycle: false, ticker: true, tickerSpeed: 'normal',
          interval: 180000, lcdOverlay: false, carNo: 10, initFilter: 'all', beep: true, nightDim: false, topOffset: 42, chimeType: 'std', dual: false, hud: false, blink: true, focus: false }, // 保存値があればそちらを優先（load）
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

/* ---------- 運行状況ストア ---------- */
const Store = {
  data: {},
  of(name) { return this.data[name] || { status: 'normal', detail: '' }; },
  rank(name) { return STATUS[this.of(name).status].rank; }
};

/* ---------- 運行データ提供元 ----------
 * 共通IF: fetchStatus() → { 路線名: { status:'normal'|'delay'|'partial'|'suspend', detail?:string } }
 * Step 3 で YahooProvider を実装して LiveProvider と差し替える */
const DemoProvider = {
  async fetchStatus() {
    return {
      '山手線':     { status: 'delay',   detail: '山手線は、京浜東北線内での人身事故の影響で、内・外回り電車に遅れがでています。' },
      '中央線快速': { status: 'suspend', detail: '中央線快速は、新宿駅での人身事故の影響で、東京駅〜高尾駅間の上下線で運転を見合わせています。' },
      '東西線':     { status: 'delay',   detail: '東西線は、車両点検の影響で、上下線の一部列車に遅れがでています。' },
      '東急東横線': { status: 'delay',   detail: '東急東横線は、信号確認の影響で、上下線の一部列車に遅れがでています。' },
      '京急本線':   { status: 'partial', detail: '京急本線は、踏切安全確認の影響で、品川駅〜横浜駅間の一部列車を運休しています。' }
    };
  }
};

/* ---------- Yahoo!路線情報（関東エリア）の取得・解析 ----------
 * ・fetchViaProxy：自作Cloudflare Workersプロキシ経由で生のHTMLを取得（外部の無料CORSプロキシは使用しない）
 * ・parse：<table>の<tr>のうち /diainfo/ へのリンクを含む行を路線データとして抽出（クラス名に依存しない）
 * ・平常運転以外の路線は個別詳細ページ(#mdServiceStatus)を並列取得して詳細メッセージに反映
 * ・Yahoo側の表記ゆれ(canon + ALIAS + 会社名プレフィックス)を吸収してマスター路線に照合
 * ・一覧に載っていない路線は平常運転として扱う */
const YAHOO_ORIGIN = 'https://transit.yahoo.co.jp';
const YAHOO_URL = YAHOO_ORIGIN + '/diainfo/area/4';
const AUTO_REFRESH_MS = 180000;   // 自動更新間隔：3分
const FETCH_TIMEOUT_MS = 12000;
const PROXY_BASE = 'https://train-info-proxy.xiongdayiteng4.workers.dev/';
const proxyUrl = targetUrl => `${PROXY_BASE}?url=${encodeURIComponent(targetUrl)}`;
const clean = t => String(t || '').replace(/\s+/g, ' ').trim();

/* 自作Workersプロキシ経由で targetUrl のHTML文字列を取得。失敗時は原因入りのErrorを投げる */
async function fetchViaProxy(targetUrl, validate = html => /diainfo|運行情報/.test(html)) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(proxyUrl(targetUrl), { signal: ctl.signal, cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    if (html.length < 500 || !validate(html)) throw new Error('不正な応答（HTMLが短い/想定外の内容）');
    return { html, proxy: 'Cloudflare Workers' };
  } catch (e) {
    const why = e.name === 'AbortError' ? 'タイムアウト' : (e.message === 'Failed to fetch' ? '通信失敗(接続不可/CORS)' : e.message);
    console.warn('[Yahoo] proxy failed →', why);
    throw new Error('プロキシ取得失敗：' + why);
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
  /* 予備：テーブルでない構造（li/dl等）のとき */
  rowsFromLinks(doc) {
    const out = [], seen = new Set();
    doc.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!this.isLineHref(href)) return;
      const name = clean(a.textContent), url = this.toUrl(href);
      if (!name || seen.has(url)) return;
      let row = a.closest('li') || a.closest('dl') || a.parentElement;
      if (row.querySelectorAll('a[href*="/diainfo/"]').length > 1) row = a.parentElement;
      seen.add(url); out.push({ name, url, row });
    });
    return out;
  },

  /* HTML → [{ name, url, status, detail }] */
  parse(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let rows = this.rowsFromTables(doc);
    if (!rows.length) rows = this.rowsFromLinks(doc);
    const out = [];
    rows.forEach(({ name, url, row }) => {
      const text = clean(row.textContent);
      const cells = [...row.querySelectorAll('td,dd')].map(c => clean(c.textContent));
      const lab = row.querySelector('[class*="trouble" i],[class*="status" i],[class*="label" i]');
      const rest = clean(text.replace(name, ''));
      const status = this.statusOf(lab && lab.textContent) || this.statusOf(cells[1]) || this.statusOf(rest);
      if (!status) return; // 状況が読めない行（ナビ等）は無視
      let detail = cells.length >= 3 ? cells[cells.length - 1] : rest;
      detail = clean(detail.replace(/^(平常運転|遅延|運転見合わせ|見合わせ|運転状況|交通障害情報?|運転再開|一部運休|運休|その他)\s*/, ''));
      out.push({ name, url, status, detail });
    });
    return this.merge(out);
  },
  /* 上部「現在運行情報のある路線」と下部の会社別一覧で重複した路線を1件に統合（異常状態・詳細が長い方を優先） */
  merge(list) {
    const score = x => (x.status !== 'normal' ? 1000 : 0) + x.detail.length;
    const m = new Map();
    list.forEach(e => {
      const key = e.url.split(/[?#]/)[0], cur = m.get(key);
      if (!cur || score(e) > score(cur)) m.set(key, e);
    });
    return [...m.values()];
  },
  /* 個別詳細ページ → 運行情報本文（#mdServiceStatus 内の<p>） */
  parseDetail(html) {
    const box = new DOMParser().parseFromString(html, 'text/html').querySelector('#mdServiceStatus, [id*="ServiceStatus" i]');
    if (!box) return '';
    const ps = [...box.querySelectorAll('p')].map(p => clean(p.textContent)).filter(Boolean);
    const text = ps.length ? ps.join('　') : clean(box.textContent);
    return text.length > 240 ? text.slice(0, 239) + '…' : text;
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
      if (list[0].status === 'normal') return; // 平常運転は「情報なし」と同じ扱い
      const abn = list.filter(x => x.status !== 'normal');
      const details = [...new Set(abn.map(x => x.detail).filter(Boolean))];
      result[n] = { status: list[0].status, detail: details.join('　'), url: list[0].url };
    });
    return result;
  },

  async fetchStatus() {
    const { html, proxy } = await fetchViaProxy(YAHOO_URL);
    const entries = this.parse(html);
    if (!entries.length && !/情報はありません|平常/.test(html))
      throw new Error('解析エラー：路線の行が見つかりません（Yahoo!のページ構造が変わった可能性）');
    const result = this.toStatuses(entries);
    const matched = new Set(entries.flatMap(e => this.match(e.name))).size;

    /* 平常運転以外の路線は個別詳細ページを並列取得して、理由テキストを差し替える */
    let detailOk = 0, detailFail = 0;
    await Promise.all(Object.values(result).map(async r => {
      try {
        const { html: dh } = await fetchViaProxy(r.url, h => h.length > 500);
        const t = this.parseDetail(dh);
        if (t) { r.detail = t; detailOk++; } else detailFail++;
      } catch (e) { detailFail++; console.warn('[Yahoo] detail failed:', r.url, e.message); }
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
/* ---------- 固定レイヤー：上部ヘッダー／下部ティッカーの実寸をCSS変数とZoomに反映 ---------- */
const Layout = {
  init() {
    const top = document.getElementById('topStack'), tk = document.getElementById('ticker'), root = document.documentElement;
    const upd = () => {
      const t = top.getBoundingClientRect().height, b = tk.getBoundingClientRect().height;
      root.style.setProperty('--top-h', t + 'px'); root.style.setProperty('--bot-h', b + 'px');
      Zoom.insT = t; Zoom.insB = b;
    };
    if (window.ResizeObserver) { const ro = new ResizeObserver(upd); ro.observe(top); ro.observe(tk); }
    window.addEventListener('resize', upd); upd();
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
  BW: 3072, VW: 7300, VH: 5400, HI_RATIO: 1.3, SETTLE_MS: 180,
  stage: null, canvas: null, ctx: null, dpr: 1, W: 1, H: 1, ready: false,
  base: null, svgText: '',
  patch: null, patchCtx: null, patchView: null, patchValid: false,
  hiImg: null, hiUrl: null, hiGen: 0, hiTimer: 0, hiMs: 0, moving: false,
  state: { company: 'all', alert: false, detour: null },
  blinkOn: true, marker: null, lastDraw: 0, drawCount: 0, pin: null, raf: 0,

  init(stage, canvas) {
    this.stage = stage; this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.patch = document.createElement('canvas');           // 高精細バッファ：起動時の1回だけ作る
    this.patchCtx = this.patch.getContext('2d');
    this.hiImg = new Image();                                // 高精細描画用のImageも1つだけ
    this.resize();
    if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe(stage);
    window.addEventListener('resize', () => this.resize());
  },
  /* 表示Canvasと高精細バッファを、画面サイズ×DPR（上限2.0）に合わせる。サイズが変わったときだけ確保し直す */
  resize() {
    if (!this.stage || !this.canvas) return;
    const r = this.stage.getBoundingClientRect();
    this.W = Math.max(1, r.width); this.H = Math.max(1, r.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.0);
    const w = Math.round(this.W * this.dpr), h = Math.round(this.H * this.dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w; this.canvas.height = h;
      this.patch.width = w; this.patch.height = h;
      this.patchValid = false;                               // 大きさが変わったら高精細の結果は使わない
    }
    this.requestDraw();
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
    this.drawMarker(c, unit);
    this.lastDraw = performance.now() - t0; this.drawCount++;
  }
};

const MapView = {
  svg: null, rails: LINE_PATHS, boxes: {}, _all: null, _by: null, dom: null,
  /* 読み込み：SVG解析 → 一時的な実DOMで駅・路線の位置を取り出し破棄 → 基礎地図を1回だけ作る */
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
      Engine.svgText = Engine.svgText || txt.slice(txt.indexOf('<svg'));
      const vb = (root.getAttribute('viewBox') || '0 0 7300 5400').trim().split(/[\s,]+/).map(Number);
      Engine.VW = vb[2]; Engine.VH = vb[3];
      const holder = document.createElement('div');
      holder.style.cssText = 'position:absolute;left:-99999px;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden';
      const live = document.importNode(root, true);
      holder.appendChild(live); document.body.appendChild(holder);
      this.svg = live;
      this.tag(live);
      Stations.ensure(); LineGeo.ensure();
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
    const all = lineGroupsOf(live);
    this._all = []; this._by = new Map(); this.boxes = {}; LINE_PATHS.length = 0;
    all.forEach(g => {
      const id = g.getAttribute('id') || '';
      const L = LINES.find(x => x.svg.some(p => id.startsWith(p)));
      if (!L) return;
      g.dataset.line = L.ja; g.dataset.company = L.co;
      this.decorate(g);
      this._all.push(g);
      (this._by.get(L.ja) || this._by.set(L.ja, []).get(L.ja)).push(g);
      g.__rails.forEach(el => this.addRail(el, L));
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
  addRail(el, L) {
    const m = toRoot(el); if (!m) return;
    const d = pathD(el); if (!d) return;
    LINE_PATHS.push({
      line: L.ja, company: L.co, d, sw: parseFloat(el.getAttribute('stroke-width')) || 10,
      color: el.getAttribute('stroke') || '#999', m: { a: m.a, b: m.b, c: m.c, d: m.d, e: m.e, f: m.f },
      path: new Path2D(d)
    });
    try {
      const bb = el.getBBox();
      const pts = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]]
        .map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
      const box = this.boxes[L.ja] || (this.boxes[L.ja] = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
      pts.forEach(([x, y]) => { box.x0 = Math.min(box.x0, x); box.y0 = Math.min(box.y0, y); box.x1 = Math.max(box.x1, x); box.y1 = Math.max(box.y1, y); });
    } catch (_) {}
  },
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
    if (window.ResizeObserver) new ResizeObserver(() => this.onResize()).observe(stage);
    this.home();
  },
  measure() { const r = this.stage.getBoundingClientRect(); this.W = Math.max(1, r.width); this.H = Math.max(1, r.height); },
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
    this.vw = this.clampVw(this.maxVw() / this.HOME_DIV);
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
  onResize() {
    const c = this.visXY();
    this.measure();
    this.vw = this.clampVw(this.vw);
    this.centerOn(c.x, c.y); this.clampPos(); this.request();
  },
  beginInteract() {
    clearTimeout(this.endTimer);
    if (!this.stage.classList.contains('is-zooming')) this.stage.classList.add('is-zooming');
    Engine.beginMove();
  },
  endInteractLater() { clearTimeout(this.endTimer); this.endTimer = setTimeout(() => this.finish(), 150); },
  /* 操作終了：表示範囲を確定し、静止後の精細化を予約する */
  finish() {
    this.writeView();
    this.stage.classList.remove('is-zooming');
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
  /* 5px未満の移動のタップ：駅名ラベル → 駅ポップアップ、それ以外 → 最も近い路線の詳細 */
  tap(cx, cy) {
    const r = this.stage.getBoundingClientRect(), u = this.unit();
    const sx = this.vx + (cx - r.left) * u, sy = this.vy + (cy - r.top) * u;
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
const Chime = {
  ctx: null,
  init() { ['pointerdown', 'touchend', 'keydown'].forEach(t => document.addEventListener(t, () => this.unlock(), { once: true, passive: true })); },
  unlock() { // iOSはユーザー操作の中でAudioContextを開始する必要がある
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!this.ctx) this.ctx = new AC();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (_) {}
  },
  tone(f, t, dur = 1.1) {
    const c = this.ctx;
    [[1, .5], [2, .12], [3, .05]].forEach(([m, a]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f * m;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(a * 0.35, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
    });
  },
  /* 券売機風のタッチ音「ピッ」（2000Hz・約70ms）。連打は間引く */
  beep() {
    const nowMs = performance.now(); if (nowMs - (this._b || 0) < 80) return; this._b = nowMs;
    this.unlock();
    const c = this.ctx; if (!c || c.state !== 'running') return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = 'square'; o.frequency.value = 2000;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.08);
  },
  /* kind：std＝ミ→ド ／ jr＝4音アルペジオ ／ alarm＝見合わせ警報の反復。force＝間隔制限を外す（試聴用） */
  play(kind, force) {
    const nowMs = performance.now();
    if (!force && nowMs - (this._p || 0) < 500) return; this._p = nowMs;
    this.unlock();
    const c = this.ctx; if (!c || c.state !== 'running') return;
    const k = kind || Settings.get('chimeType') || 'std', t0 = c.currentTime + 0.05;
    if (k === 'jr') [[784, 0], [988, .22], [1175, .44], [1568, .66]].forEach(([f, d]) => this.tone(f, t0 + d, 0.9));
    else if (k === 'alarm') for (let i = 0; i < 3; i++) { this.tone(880, t0 + i * 0.5, 0.25); this.tone(660, t0 + i * 0.5 + 0.25, 0.22); }
    else { this.tone(659.25, t0); this.tone(523.25, t0 + 0.55); }
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
    return abn.length ? `<div class="board-list">${abn.map(({ L, s }) => `
        <button class="board-card" data-line="${L.ja}" style="--lc:${L.color}">
          <div class="bc-head"><span class="cbar"></span><span class="sym">${L.code}</span>
            <div class="lname"><b>${L.ja}</b>${on ? `<small>${L.en}</small>` : ''}</div>${statusBadge(s.status, 'car')}</div>
          <div class="bc-body"><p class="h">【${L.ja}　${STATUS[s.status].ja}】</p><p>${Detail.highlight(s.detail || '')}</p></div></button>`).join('')}</div>` : '';
  },
  okHtml() {
    return `<div class="board-ok"><span class="material-symbols-outlined">check_circle</span><b>現在、関東エリアの主要路線は平常通り運転しています。</b>${I18n.bi() ? '<small>All major lines are operating normally.</small>' : ''}</div>`;
  },
  render() {
    const el = document.getElementById('abnBoard'), on = I18n.bi(), d = new Date();
    el.innerHTML = `<div class="board-head"><span>運行情報${on ? '　Train Information' : ''}</span><time>${pad(d.getHours())}:${pad(d.getMinutes())}</time></div>` + (this.cards() || this.okHtml());
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
    const n = Board.abn().length;
    document.getElementById('abnMeta').textContent = n ? `現在 ${n}路線で運行に乱れがあります（運転見合わせ・遅延・一部運休）` : '';
    document.getElementById('abnList').innerHTML = Board.cards() || Board.okHtml();
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
const OPT_CHIME = [['std', '標準2音', 'Standard'], ['jr', 'JR車内案内風', 'JR style'], ['alarm', '見合わせ警報風', 'Alarm']];
const OPT_TOP = [[42, '標準 42px', 'Standard'], [56, '広め 56px', 'Wide'], [0, 'なし 0px', 'None']];
const SETTING_DEFS = [
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
    if (btn.dataset.armed !== '1') {
      btn.dataset.armed = '1'; btn.classList.add('armed');
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
    this.on = !!v; this.el.hidden = !this.on;
    clearInterval(this.timer); this.timer = 0;
    if (this.on) { this.lastCount = Engine.drawCount; this.timer = setInterval(() => this.render(), 1000); this.render(); }
  },
  render() {
    const n = Engine.drawCount, per = n - this.lastCount; this.lastCount = n;
    const mb = cv => (cv ? cv.width * cv.height * 4 / 1048576 : 0);
    const total = mb(Engine.base) + mb(Engine.canvas) + mb(Engine.patch);
    const hi = Engine.patchValid && Engine.viewMatches() ? '高精細ベクター描画済' : '標準描画';
    this.el.textContent = `${hi} ／ 固定メモリ 約${total.toFixed(1)}MB（基礎 ${mb(Engine.base).toFixed(1)}・表示 ${mb(Engine.canvas).toFixed(1)}・高精細 ${mb(Engine.patch).toFixed(1)}） ／ 描画 ${per}回/秒・直近 ${Engine.lastDraw.toFixed(2)}ms ／ 高精細 ${Engine.hiMs.toFixed(0)}ms ／ DOM ${document.getElementsByTagName('*').length}`;
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

/* ---------- マイルート（通勤・通学の経路）と迂回アラート ---------- */
const Routes = {
  KEY: 'tokyo-lcd:routes', list: [],
  load() {
    try {
      const a = JSON.parse(localStorage.getItem(this.KEY) || '[]');
      if (Array.isArray(a)) this.list = a.filter(r => r && r.name && Array.isArray(r.lines)).map(r => ({
        id: String(r.id || Date.now()), name: String(r.name).slice(0, 20),
        stations: Array.isArray(r.stations) ? r.stations.slice(0, 3).map(String) : [],
        lines: r.lines.filter(n => lineByName(n)).slice(0, 4)
      }));
    } catch (_) {}
  },
  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.list)); } catch (_) {}
    document.dispatchEvent(new CustomEvent('routes:change'));
  },
  add(r) { this.list = [...this.list, { id: Date.now().toString(36), ...r }]; this.save(); },
  remove(id) { this.list = this.list.filter(r => r.id !== id); this.save(); },
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
    const stations = ['routeFrom', 'routeVia', 'routeTo'].map(id => (document.getElementById(id).value || '').trim()).filter(Boolean);
    if (!name || !lines.length) { UI.toast('ルート名と利用路線（1本以上）を入力してください'); return; }
    Routes.add({ name, stations, lines: lines.slice(0, 4) });
    this.editing = false; this.render(); UI.toast('マイルートを登録しました');
  },
  render() {
    const el = document.getElementById('routeBody');
    if (this.editing) { el.innerHTML = this.formHtml(); return; }
    el.innerHTML = `<div class="route-top"><button class="btn-yahoo" data-route-add><span class="material-symbols-outlined">add</span>${bi('マイルートを追加', 'Add route')}</button></div>` +
      (Routes.list.length ? Routes.list.map(r => this.card(r)).join('')
        : '<div class="empty">まだマイルートがありません。通勤・通学の経路を登録すると、利用路線の遅延・見合わせをまとめて確認できます。</div>');
  },
  card(r) {
    const { bad, worst } = Routes.status(r);
    const alts = [...new Set(bad.flatMap(x => lineByName(x.n).alt))].filter(n => lineByName(n) && Store.of(n).status === 'normal').slice(0, 6);
    const head = worst === 'normal' ? '平常運転' : (worst === 'suspend' ? '運転見合わせの影響あり' : '遅延の影響あり');
    return `<div class="route-card s-${worst}">
      <div class="rc-head"><b>${esc(r.name)}</b><span class="rc-state ${worst}">${bad.length ? 'マイルート影響あり（代替ルート確認）' : '正常'}</span></div>
      ${r.stations.length ? `<div class="rc-path">${r.stations.map(s => `<span>${esc(s)}</span>`).join('<i class="material-symbols-outlined">arrow_forward</i>')}</div>` : ''}
      <div class="rc-lines">${r.lines.map(n => {
        const L = lineByName(n), st = Store.of(n).status;
        return `<button class="rc-line s-${st}" data-line="${L.ja}" style="--lc:${L.color}"><span class="badge sm">${L.code}</span><span>${L.ja}</span>${statusBadge(st)}</button>`;
      }).join('')}</div>
      ${bad.length ? `<div class="rc-alt"><small>代替ルート候補（平常運転）</small><div class="rc-lines">${alts.length ? alts.map(n => {
        const L = lineByName(n);
        return `<button class="rc-line s-normal" data-line="${L.ja}" style="--lc:${L.color}"><span class="badge sm">${L.code}</span><span>${L.ja}</span></button>`;
      }).join('') : '<span class="muted">該当なし</span>'}</div></div>` : ''}
      <div class="rc-foot"><span class="muted">${head}</span><button class="rc-del" data-del="${esc(r.id)}"><span class="material-symbols-outlined">delete</span>削除</button></div>
    </div>`;
  },
  formHtml() {
    return `<div class="route-form">
      <label class="rf-row"><span>ルート名</span><input id="routeName" maxlength="20" placeholder="例：通勤（自宅→会社）"></label>
      <div class="rf-row"><span>経路駅（任意）</span>
        <div class="rf-st"><input id="routeFrom" maxlength="12" placeholder="出発駅"><i class="material-symbols-outlined">arrow_forward</i><input id="routeVia" maxlength="12" placeholder="乗換駅"><i class="material-symbols-outlined">arrow_forward</i><input id="routeTo" maxlength="12" placeholder="目的駅"></div></div>
      <div class="rf-row"><span>利用路線（タップで選択・最大4本）</span>
        <div class="rf-picks">${LINES.map(L => `<button class="rf-pick" data-pick="${L.ja}" style="--lc:${L.color}"><span class="badge sm">${L.code}</span>${L.ja}</button>`).join('')}</div></div>
      <div class="route-top"><button class="mv-silver" data-route-cancel><span class="ms-lbl"><b>戻る</b></span></button><button class="btn-yahoo" data-route-save><span class="material-symbols-outlined">save</span>保存</button></div>
    </div>`;
  }
};

/* ---------- 情報案内LCD（2画面モードの右画面）：異常路線・マイ路線・マイルートを自動スライド ---------- */
const InfoLcd = {
  el: null, i: 0, timer: 0, slides: [],
  init() {
    this.el = document.getElementById('infoLcd');
    this.el.addEventListener('click', () => {
      const s = this.slides[this.i];
      if (s && (s.kind === 'line' || s.kind === 'fav')) { Detail.open(s.L.ja); return; }
      this.next();
    });
  },
  build() {
    const abn = LINES.filter(L => Store.of(L.ja).status !== 'normal')
      .sort((a, b) => STATUS[Store.of(a.ja).status].rank - STATUS[Store.of(b.ja).status].rank);
    const sl = abn.map(L => ({ kind: 'line', L }));
    if (!abn.length) sl.push({ kind: 'ok' });
    Favs.list.map(lineByName).filter(L => L && !abn.includes(L)).forEach(L => sl.push({ kind: 'fav', L }));
    Routes.affected().forEach(r => sl.push({ kind: 'route', r }));
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
    let body;
    if (s.kind === 'line' || s.kind === 'fav') {
      const L = s.L, st = Store.of(L.ja);
      body = `<div class="lcd e235" style="--lc:${L.color}">${Lcd.headHtml(L, st, {})}
        <div class="lcd-sub">${on ? '運行情報　Train Information' : '運行情報'}</div>
        <div class="lcd-screen" data-pager="info">${Lcd.pages(L, st).map((p, k) => `<div class="lcd-page${k ? '' : ' on'}">${p}</div>`).join('')}<span class="pg-badge">1/${Lcd.pages(L, st).length}</span></div></div>`;
    } else if (s.kind === 'route') {
      const { bad, worst } = Routes.status(s.r);
      body = `<div class="lcd e235">
        <div class="lcd-head plain"><div class="lh-name"><b>${esc(s.r.name)}</b>${on ? '<small>My Route</small>' : ''}</div><div class="lh-right">${statusBadge(worst, 'car')}</div></div>
        <div class="lcd-sub">${on ? 'マイルート　My Route' : 'マイルート'}</div>
        <div class="lcd-screen"><div class="lcd-page on">${bad.map(x => `<p class="jp-h">【${x.n}　${STATUS[x.st].ja}】</p><p class="jp-b">${Detail.highlight(Store.of(x.n).detail || '')}</p>`).join('')}</div></div></div>`;
    } else {
      body = `<div class="lcd e235"><div class="lcd-head plain"><div class="lh-name"><b>運行情報</b>${on ? '<small>Train Information</small>' : ''}</div></div>
        <div class="lcd-screen"><div class="lcd-page on"><p class="jp-h">現在の運行状況</p><p class="jp-b">現在、関東エリアの主要路線は平常通り運転しています。${on ? '<br><small>All major lines are operating normally.</small>' : ''}</p></div></div></div>`;
    }
    const n = this.slides.length || 1, p = x => String(x).padStart(2, '0'), d = new Date();
    this.el.innerHTML = `<div class="info-head"><b>情報案内${on ? '　Info' : ''}</b><span class="info-dots">${this.slides.map((_, k) => `<i class="${k === this.i ? 'on' : ''}"></i>`).join('')}</span><time>${p(d.getHours())}:${p(d.getMinutes())}</time></div>
      <div class="info-body">${body}</div>
      <div class="info-foot">${this.i + 1} / ${n}　<small>タップで次の情報${on ? ' / Tap for next' : ''}</small></div>`;
    Lcd.mount(this.el.querySelector('[data-pager="info"]'), 'info', 5000, false);
  },
  next() { if (!this.slides.length) return; this.i = (this.i + 1) % this.slides.length; this.draw(); },
  start() { clearInterval(this.timer); this.timer = setInterval(() => this.next(), 6000); },
  stop() { clearInterval(this.timer); this.timer = 0; },
  setOn(on) {
    document.body.classList.toggle('dual', !!on);
    if (on) { this.render(); this.start(); } else this.stop();
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
const Lcd = {
  timers: {},
  /* 遅延理由（日本語）→ 英語の原因。対応のない語は「調査中」にする */
  CAUSE: [
    [/人身事故|人身/, 'Person on tracks'], [/車両点検|施設点検|点検/, 'Inspection'], [/強風/, 'Strong winds'],
    [/大雨|豪雨|雨/, 'Heavy rain'], [/信号/, 'Signal trouble'], [/車両故障|故障/, 'Train breakdown'],
    [/線路内|立入/, 'Obstruction on tracks'], [/停電/, 'Power outage'], [/踏切/, 'Level crossing trouble'],
    [/架線/, 'Overhead line trouble'], [/火災|煙/, 'Smoke or fire'], [/救護/, 'Passenger assistance'],
    [/改良工事|工事/, 'Construction work'], [/事故/, 'Accident']
  ],
  causeEn(text) { const t = String(text || ''); const hit = this.CAUSE.find(([re]) => re.test(t)); return hit ? hit[1] : 'Under investigation'; },
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
    if (L.co === 'Metro') return 'TM';
    if (L.co === 'Toei') return 'TOEI';
    return String(L.op.en || '').split(/\s+/)[0].slice(0, 6).toUpperCase();
  },
  /* 1ページ目（日本語）と、異常時のみの2ページ目（英語の4行表） */
  pages(L, s) {
    const body = s.status === 'normal' ? esc(STRINGS.normalTxt.ja) : Detail.highlight(s.detail || `${L.ja}は、運行情報をお知らせします。`);
    const ja = `<p class="jp-h">【${esc(L.ja)}　${STATUS[s.status].ja}】</p><p class="jp-b">${body}</p>`;
    if (s.status === 'normal') return [ja];
    const rows = [['Line', L.en], ['Direction', this.dirEn(s.detail)], ['Status', this.statusEn(s.status)], ['Cause', this.causeEn(s.detail)]];
    const en = `<table class="en-tbl">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('')}</table>`;
    return [ja, en];
  },
  /* 上段ダークヘッダー：会社バッジ・路線カラー帯・路線記号・路線名・時刻・号車 */
  headHtml(L, s, o = {}) {
    const on = I18n.bi(), d = new Date(), p = n => String(n).padStart(2, '0');
    const fav = o.fav === undefined ? '' : `<button class="fav-btn${o.fav ? ' on' : ''}" data-fav="${esc(L.ja)}" aria-pressed="${!!o.fav}" aria-label="マイ路線に登録"><span class="material-symbols-outlined">star</span></button>`;
    const time = o.dtime ? '<time id="dTime">--:--</time>' : `<time>${p(d.getHours())}:${p(d.getMinutes())}</time>`;
    return `<div class="lcd-head">
      <div class="lh-left"><span class="co-pill">${esc(L.op.ja)}</span><span class="lh-dir">方面</span></div>
      <span class="cbar"></span>
      <div class="lh-sym"><span class="lh-status">運行状況</span><div class="sym-box"><span class="sym-co">${esc(this.companyCode(L))}</span><span class="sym-code">${esc(L.code)}</span></div></div>
      <div class="lh-name"><b>${esc(L.ja)}</b>${on ? `<small>${esc(L.en)}</small>` : ''}${fav}</div>
      <div class="lh-right">${time}<div class="carno"><b>${Settings.get('carNo')}</b><small>号車</small></div>${statusBadge(s.status, 'car')}</div>
    </div>`;
  },
  /* ページ送り：2ページ以上のときだけ、パネルのタップと5秒ごとに切り替える */
  mount(root, key, ms, tapToNext) {
    clearInterval(this.timers[key]); this.timers[key] = 0;
    if (!root) return;
    const pages = [...root.querySelectorAll('.lcd-page')], badge = root.querySelector('.pg-badge');
    let i = 0;
    const show = n => {
      i = n % pages.length;
      pages.forEach((pg, k) => pg.classList.toggle('on', k === i));
      if (badge) badge.textContent = `${i + 1}/${pages.length}`;
    };
    show(0);
    if (pages.length < 2) return;
    if (tapToNext) root.onclick = () => show(i + 1);
    this.timers[key] = setInterval(() => {
      if (!root.getClientRects().length) { clearInterval(this.timers[key]); this.timers[key] = 0; return; } // 画面から消えたら止める
      show(i + 1);
    }, ms);
  },
  /* 詳細ポップアップ本体（ページ送りつき） */
  bodyHtml(L, s, on, o = {}) {
    const pages = this.pages(L, s);
    return `<div class="lcd e235" style="--lc:${L.color}">
      ${this.headHtml(L, s, o)}
      <div class="lcd-sub">${on ? '運行情報　Train Information' : '運行情報'}</div>
      <div class="lcd-screen" data-pager="${o.key || 'x'}">${pages.map((p, k) => `<div class="lcd-page${k ? '' : ' on'}">${p}</div>`).join('')}<span class="pg-badge">1/${pages.length}</span></div>
      ${o.extra || ''}
    </div>`;
  }
};

const Detail = {
  el: null, name: null,
  open(name) { this.name = name; this.render(); this.el.hidden = false; this.tickTime(); },
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
    const s = Store.of(L.ja), on = I18n.bi();
    const url = /^https:\/\/transit\.yahoo\.co\.jp\//.test(s.url || '') ? s.url : YAHOO_URL;
    const rt = 'https://search.yahoo.co.jp/realtime/search?p=' + encodeURIComponent(L.ja + ' 遅延');
    const extra = `<div class="lcd-memo"><label for="memoText">${bi('マイメモ', 'My Memo')}</label>
          <textarea id="memoText" rows="2" maxlength="300" placeholder="例：西船橋から東西線に振替">${esc(Memos.get(L.ja))}</textarea></div>
        <div class="lcd-foot">
          <button class="btn-alt" data-act="detour"><span class="material-symbols-outlined">alt_route</span>${bi('振替・代替ルートを路線図で表示', 'Show alternative routes')}</button>
          <a class="btn-rt" href="${esc(rt)}" target="_blank" rel="noopener noreferrer"><span class="material-symbols-outlined">forum</span>${bi('現場のリアルタイム状況を検索', 'Realtime search')}</a>
          <a class="btn-yahoo" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span class="material-symbols-outlined">open_in_new</span>${I18n.label('official')}</a>
        </div>`;
    document.getElementById('detailBody').innerHTML = Lcd.bodyHtml(L, s, on, { fav: Favs.has(L.ja), dtime: true, key: 'detail', extra });
    Lcd.mount(document.querySelector('#detailBody .lcd-screen'), 'detail', 5000, true);
    this.tickTime();
  },
  tickTime() {
    const t = document.getElementById('dTime'); if (!t) return;
    const d = new Date(); t.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
  closeAll() { document.querySelectorAll('.modal').forEach(m => m.hidden = true); },
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
    Modals.init(); Search.init(); StationUI.init(); HistoryUI.init(); MV.init(); AbnUI.init(); ClockMode.init(); RouteUI.init(); StationPop.init();
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
      Frame.once('render', () => this.renderAll());
      if (k === 'demo') this.refresh();
      if (k === 'interval') this.schedule();
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
    this.renderSync(); this.applyFlags(); this.renderFavBar(); this.renderMeter(); Ticker.render(); MV.render();
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
    const ready = this.lastOk > 0 || Settings.get('demo');
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
    Ticker.render(); this.renderFavBar(); this.renderMeter(); InfoLcd.render();
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
  busy: false, again: false, timer: null, lastOk: 0, spinStart: 0,
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
      Store.data = data; this.lastOk = Date.now();
      lamp.classList.remove('err');
      this.setSync(true, provider === LiveProvider ? Yahoo.reportText() : 'デモモード：ダミーデータを表示中');
      MapView.applyStatuses(); this.afterData();
      if (Search.isOpen()) Search.render();
      if (Detail.isOpen()) Detail.render();
    } catch (e) {
      console.error('fetchStatus failed', e);
      lamp.classList.add('err');
      this.setSync(false, '取得エラー：' + (e && e.message ? e.message : e));
    } finally {
      this.busy = false;
      const wait = Math.max(0, 800 - (Date.now() - this.spinStart));
      setTimeout(() => btn.classList.remove('spin'), wait);
      if (this.again) { this.again = false; this.refresh(); } else this.schedule();
    }
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
  Locate.init(); LinksUI.init();
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
