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
  search:    { ja: '路線検索',     en: 'Search Lines' },
  settings:  { ja: '設定',         en: 'Settings' },
  bilingual: { ja: '日英併記',     en: 'Bilingual display' },
  demo:      { ja: 'デモモード',   en: 'Demo mode' },
  delay:     { ja: '遅延・一部運休', en: 'Delay / Partial' },
  suspend:   { ja: '運転見合わせ', en: 'Suspended' },
  ph:        { ja: '路線名・路線記号・会社名で検索', en: 'Line name, symbol or company' },
  none:      { ja: '該当する路線がありません。', en: 'No matching lines.' },
  normalTxt: { ja: '現在、平常通り運転しています。', en: '' },
  syncTime:  { ja: '最終同期時刻', en: 'Last sync' },
  syncState: { ja: '取得ステータス', en: 'Sync status' }
};

/* ---------- 路線マスターデータ（41路線） ----------
 * [路線名, 英語名, 会社区分, 路線記号, ラインカラー, [事業者名, Operator], [路線図SVG内のグループID前方一致...]] */
const JR = ['JR東日本', 'JR East'], TM = ['東京メトロ', 'Tokyo Metro'], TO = ['都営地下鉄', 'Toei Subway'];
const MASTER_RAW = [
  ['山手線',               'Yamanote Line',            'JR', 'JY', '#80c241', JR, ['jr-yamanote']],
  ['京浜東北線',           'Keihin-Tohoku Line',       'JR', 'JK', '#00b2e5', JR, ['jr-keihintohoku', 'jr-negishi']],
  ['中央線快速',           'Chuo Line (Rapid)',        'JR', 'JC', '#f15a22', JR, ['jr-chuo']],
  ['中央・総武各駅停車',   'Chuo-Sobu Line (Local)',   'JR', 'JB', '#ffd400', JR, ['jr-sobulocal']],
  ['東海道線',             'Tokaido Line',             'JR', 'JT', '#f68b1e', JR, ['jr-tokaido']],
  ['横須賀線',             'Yokosuka Line',            'JR', 'JO', '#0068b7', JR, ['jr-yokosuka']],
  ['総武快速線',           'Sobu Line (Rapid)',        'JR', 'JO', '#0068b7', JR, ['jr-soburapid']],
  ['湘南新宿ライン',       'Shonan-Shinjuku Line',     'JR', 'JS', '#e21f26', JR, ['jr-shonanshinjuku']],
  ['上野東京ライン',       'Ueno-Tokyo Line',          'JR', 'JU', '#f68b1e', JR, ['jr-uenotokyo']],
  ['埼京線',               'Saikyo Line',              'JR', 'JA', '#00ac9a', JR, ['jr-saikyo']],
  ['常磐線快速',           'Joban Line (Rapid)',       'JR', 'JJ', '#00b261', JR, ['jr-joban_']],
  ['常磐線各駅停車',       'Joban Line (Local)',       'JR', 'JL', '#808080', JR, ['jr-jobanlocal']],
  ['京葉線',               'Keiyo Line',               'JR', 'JE', '#c9242f', JR, ['jr-keiyo']],
  ['武蔵野線',             'Musashino Line',           'JR', 'JM', '#f15a22', JR, ['jr-musashino']],
  ['南武線',               'Nambu Line',               'JR', 'JN', '#ffd400', JR, ['jr-nanbu']],
  ['横浜線',               'Yokohama Line',            'JR', 'JH', '#80c241', JR, ['jr-yokohama']],

  ['銀座線',               'Ginza Line',               'Metro', 'G', '#ff9500', TM, ['tokyometro-ginza']],
  ['丸ノ内線',             'Marunouchi Line',          'Metro', 'M', '#f62e36', TM, ['tokyometro-marunouchi']],
  ['日比谷線',             'Hibiya Line',              'Metro', 'H', '#b5b5ac', TM, ['tokyometro-hibiya']],
  ['東西線',               'Tozai Line',               'Metro', 'T', '#009bbf', TM, ['tokyometro-tozai']],
  ['千代田線',             'Chiyoda Line',             'Metro', 'C', '#00bb85', TM, ['tokyometro-chiyoda']],
  ['有楽町線',             'Yurakucho Line',           'Metro', 'Y', '#c1a470', TM, ['tokyometro-yurakucho']],
  ['半蔵門線',             'Hanzomon Line',            'Metro', 'Z', '#8f76d6', TM, ['tokyometro-hanzomon']],
  ['南北線',               'Namboku Line',             'Metro', 'N', '#00ac9b', TM, ['tokyometro-nanboku']],
  ['副都心線',             'Fukutoshin Line',          'Metro', 'F', '#9c5e31', TM, ['tokyometro-fukutoshin']],

  ['浅草線',               'Asakusa Line',             'Toei', 'A', '#ec6e65', TO, ['toei-asakusa']],
  ['三田線',               'Mita Line',                'Toei', 'I', '#0067b0', TO, ['toei-mita']],
  ['新宿線',               'Shinjuku Line',            'Toei', 'S', '#b0bf1e', TO, ['toei-shinjuku']],
  ['大江戸線',             'Oedo Line',                'Toei', 'E', '#ce045b', TO, ['toei-oedo']],

  ['東急東横線',           'Tokyu Toyoko Line',        'Private', 'TY', '#da0442', ['東急電鉄', 'Tokyu'],        ['tokyu-toyoko']],
  ['東急田園都市線',       'Tokyu Den-en-toshi Line',  'Private', 'DT', '#20a288', ['東急電鉄', 'Tokyu'],        ['tokyu-denentoshi']],
  ['小田急小田原線',       'Odakyu Odawara Line',      'Private', 'OH', '#007ed5', ['小田急電鉄', 'Odakyu'],     ['odakyu-odawara']],
  ['京王線',               'Keio Line',                'Private', 'KO', '#dd0077', ['京王電鉄', 'Keio'],         ['keio-keio']],
  ['西武池袋線',           'Seibu Ikebukuro Line',     'Private', 'SI', '#ff6600', ['西武鉄道', 'Seibu'],        ['seibu-ikebukuro']],
  ['西武新宿線',           'Seibu Shinjuku Line',      'Private', 'SS', '#0099cc', ['西武鉄道', 'Seibu'],        ['seibu-shinjuku']],
  ['東武東上線',           'Tobu Tojo Line',           'Private', 'TJ', '#004098', ['東武鉄道', 'Tobu'],         ['tobu-tojo']],
  ['東武スカイツリーライン', 'Tobu Skytree Line',      'Private', 'TS', '#0067c0', ['東武鉄道', 'Tobu'],         ['tobu-skytree']],
  ['京成本線',             'Keisei Main Line',         'Private', 'KS', '#005aaa', ['京成電鉄', 'Keisei'],       ['keisei-keisei']],
  ['京急本線',             'Keikyu Main Line',         'Private', 'KK', '#e50012', ['京浜急行電鉄', 'Keikyu'],   ['keikyu-keikyu']],
  ['相鉄本線',             'Sotetsu Main Line',        'Private', 'SO', '#003893', ['相模鉄道', 'Sotetsu'],      ['soutetsu-main']],
  ['つくばエクスプレス',   'Tsukuba Express',          'Private', 'TX', '#003399', ['首都圏新都市鉄道', 'MIR'],  ['tsukubaexpress']]
];
const LINES = MASTER_RAW.map(([ja, en, co, code, color, op, svg]) =>
  ({ ja, en, co, code, color, op: { ja: op[0], en: op[1] }, svg }));
const lineByName = name => LINES.find(l => l.ja === name);

/* ---------- 設定（localStorage） ---------- */
const Settings = {
  KEY: 'tokyo-lcd:settings',
  data: { bilingual: true, demo: false }, // 保存値があればそちらを優先（load）
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
 * ・fetchWithFallback：3つのCORSプロキシを順に試し、最初に成功したHTMLを返す
 * ・parse：<table>の<tr>のうち /diainfo/ へのリンクを含む行を路線データとして抽出（クラス名に依存しない）
 * ・平常運転以外の路線は個別詳細ページ(#mdServiceStatus)を並列取得して詳細メッセージに反映
 * ・Yahoo側の表記ゆれ(canon + ALIAS + 会社名プレフィックス)を吸収してマスター路線に照合
 * ・一覧に載っていない路線は平常運転として扱う */
const YAHOO_ORIGIN = 'https://transit.yahoo.co.jp';
const YAHOO_URL = YAHOO_ORIGIN + '/diainfo/area/4';
const AUTO_REFRESH_MS = 180000;   // 自動更新間隔：3分
const FETCH_TIMEOUT_MS = 12000;
const PROXIES = [
  { name: 'allorigins', build: u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}` },
  { name: 'codetabs',   build: u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}` },
  { name: 'corsproxy',  build: u => `https://corsproxy.io/?${encodeURIComponent(u)}` }
];
const clean = t => String(t || '').replace(/\s+/g, ' ').trim();

/* プロキシを順番に試し、最初に成功したHTMLを返す。全滅したら原因を並べたErrorを投げる */
async function fetchWithFallback(targetUrl, validate = html => /diainfo|運行情報/.test(html)) {
  const errors = [];
  for (const p of PROXIES) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(p.build(targetUrl), { signal: ctl.signal, cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();
      if (html.length < 500 || !validate(html)) throw new Error('不正な応答');
      return { html, proxy: p.name };
    } catch (e) {
      const why = e.name === 'AbortError' ? 'タイムアウト' : (e.message === 'Failed to fetch' ? '通信失敗(ブロック/接続不可)' : e.message);
      errors.push(`${p.name}: ${why}`);
      console.warn('[Yahoo] proxy failed →', p.name, why);
    } finally { clearTimeout(timer); }
  }
  throw new Error('全プロキシ失敗（' + errors.join(' / ') + '）');
}

const Yahoo = {
  report: null,
  /* マスター路線名 → 追加の別表記（canon後に比較するので括弧・中黒・全半角の差は気にしなくてよい） */
  ALIAS_EXTRA: {
    '京浜東北線': ['京浜東北・根岸線', '根岸線'],
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
    '東武スカイツリーライン': ['東武スカイツリーライン(伊勢崎線)', '東武伊勢崎線', 'スカイツリーライン'],
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

  /* 正規化：全半角統一・区間表記の括弧を除去・「各停」→「各駅停車」・残りの括弧/中黒(・/･)/空白を除去 */
  canon(s) {
    return String(s).normalize('NFKC')
      .replace(/\([^)]*[~〜\-－間方面][^)]*\)/g, '')
      .replace(/各停/g, '各駅停車')
      .replace(/[()\[\]【】「」]/g, '')
      .replace(/[\s・･·]/g, '')
      .toLowerCase();
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
                    Toei: ['都営' + L.ja, '都営地下鉄' + L.ja], Private: [] }[L.co];
      [L.ja, ...gen, ...(this.ALIAS_EXTRA[L.ja] || [])].forEach(k => add(k, L.ja));
    });
  },
  /* Yahoo側の路線名 → マスター路線名の配列（該当なしは空配列） */
  match(name) {
    if (!this.lookup) this.buildLookup();
    const c = this.canon(name);
    if (this.lookup.has(c)) return this.lookup.get(c);
    const hit = this.PREFIX.find(([p]) => c.startsWith(this.canon(p)));
    if (hit) return hit[1];
    for (const [p, co] of this.PREFIXES) { // 会社名プレフィックスを外して、同じ会社区分の路線だけに絞って照合
      const cp = this.canon(p);
      if (!c.startsWith(cp)) continue;
      const names = (this.lookup.get(c.slice(cp.length)) || []).filter(n => lineByName(n).co === co);
      if (names.length) return names;
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
    const out = [], seen = new Set();
    doc.querySelectorAll('table tr').forEach(tr => {
      const a = [...tr.querySelectorAll('a[href]')].find(x => this.isLineHref(x.getAttribute('href')));
      if (!a) return;
      const name = clean(a.textContent), url = this.toUrl(a.getAttribute('href'));
      if (!name || seen.has(url)) return;
      seen.add(url); out.push({ name, url, row: tr });
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
    return out;
  },
  /* 個別詳細ページ → 運行情報本文（#mdServiceStatus 内の<p>） */
  parseDetail(html) {
    const box = new DOMParser().parseFromString(html, 'text/html').querySelector('#mdServiceStatus');
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
    const { html, proxy } = await fetchWithFallback(YAHOO_URL);
    const entries = this.parse(html);
    if (!entries.length && !/情報はありません|平常/.test(html))
      throw new Error('解析エラー：路線の行が見つかりません（Yahoo!のページ構造が変わった可能性）');
    const result = this.toStatuses(entries);
    const matched = new Set(entries.flatMap(e => this.match(e.name))).size;

    /* 平常運転以外の路線は個別詳細ページを並列取得して、理由テキストを差し替える */
    let detailOk = 0, detailFail = 0;
    await Promise.all(Object.values(result).map(async r => {
      try {
        const { html: dh } = await fetchWithFallback(r.url, h => h.length > 500);
        const t = this.parseDetail(dh);
        if (t) { r.detail = t; detailOk++; } else detailFail++;
      } catch (e) { detailFail++; console.warn('[Yahoo] detail failed:', r.url, e.message); }
    }));
    Object.values(result).forEach(r => delete r.url);
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
const MapView = {
  el: null, svg: null,
  async init() {
    this.el = document.getElementById('map');
    try {
      const res = await fetch('tokyo_ja.svg');
      if (!res.ok) throw new Error(res.status);
      const txt = await res.text();
      this.el.innerHTML = txt.slice(txt.indexOf('<svg')); // XML宣言・xml-stylesheetを除去
      this.svg = this.el.querySelector('svg');
      this.tag();
    } catch (e) {
      console.error(e);
      this.el.innerHTML = '<p style="padding:2em;color:#c00;font-weight:700">路線図(tokyo_ja.svg)を読み込めませんでした。ローカルでは簡易サーバー経由で開いてください。</p>';
    }
  },
  /* マスターのprefixとSVGのグループIDを突き合わせ、data-line / data-company を付与 */
  tag() {
    const groups = [...this.svg.querySelectorAll('#lines > g > g[id]')];
    LINES.forEach(L => {
      groups.filter(g => L.svg.some(p => g.id.startsWith(p))).forEach(g => {
        g.dataset.line = L.ja; g.dataset.company = L.co;
        this.decorate(g);
      });
    });
  },
  /* 路線の主線(.rail)・発光レイヤー(.fx)・タップ判定用の太い透明線(.hit)を追加 */
  decorate(g) {
    const direct = [...g.querySelectorAll(':scope > path, :scope > line')];
    const strokeOf = el => (el.getAttribute('stroke') || '').toUpperCase();
    const usable = el => strokeOf(el) && strokeOf(el) !== 'NONE' && strokeOf(el) !== '#FFFFFF' && !el.hasAttribute('stroke-dasharray');
    let rails = direct.filter(el => usable(el) && strokeOf(el) !== '#7C7B7C' && !el.hasAttribute('opacity'));
    if (!rails.length) rails = direct.filter(usable); // 私鉄など（灰色の線＋半透明の色）
    rails.forEach(r => r.classList.add('rail'));

    const fx = document.createElementNS(SVGNS, 'g'); fx.setAttribute('class', 'fx');
    rails.forEach(r => {
      const w = parseFloat(r.getAttribute('stroke-width')) || 10;
      [[5, .12], [3, .22], [1.8, .42]].forEach(([m, o]) => {
        const c = r.cloneNode(false);
        c.removeAttribute('class'); c.removeAttribute('opacity');
        c.setAttribute('stroke', 'currentColor'); c.setAttribute('stroke-width', w * m);
        c.setAttribute('stroke-opacity', o); c.setAttribute('stroke-linecap', 'round');
        fx.appendChild(c);
      });
    });
    g.insertBefore(fx, g.firstChild);

    const hit = document.createElementNS(SVGNS, 'g');
    rails.forEach(r => {
      const c = r.cloneNode(false);
      c.setAttribute('class', 'hit'); c.removeAttribute('opacity'); c.removeAttribute('stroke-dasharray');
      c.setAttribute('stroke', '#000'); c.setAttribute('stroke-opacity', 0);
      c.setAttribute('stroke-width', 70); c.setAttribute('stroke-linecap', 'round');
      hit.appendChild(c);
    });
    g.appendChild(hit);
  },
  setHitWidth(w) { if (this.svg) this.svg.style.setProperty('--hitw', w.toFixed(1) + 'px'); },
  lines() { return this.svg ? [...this.svg.querySelectorAll('[data-line]')] : []; },
  applyStatuses() {
    this.lines().forEach(g => {
      const st = Store.of(g.dataset.line).status;
      g.classList.remove('status-delay', 'status-suspend');
      if (st === 'suspend') g.classList.add('status-suspend');
      else if (st === 'delay' || st === 'partial') g.classList.add('status-delay');
    });
  },
  applyFilter(companyId) {
    this.lines().forEach(g => g.classList.toggle('dim', companyId !== 'all' && g.dataset.company !== companyId));
  }
};

/* ---------- ズーム・パン（SVGのviewBoxを直接書き換え → 常にベクターで再描画） ----------
 * 状態：x,y = viewBox左上(SVG座標) / k = 1SVG単位あたりの画面px
 * viewBoxの幅・高さは常に 画面サイズ ÷ k（画面と同じ縦横比なので余白が出ない） */
const Zoom = {
  x: 0, y: 0, k: 1, W: 1, H: 1, VW: 7300, VH: 5400,
  MAX_K: 2.6, HOME_RATIO: 2.4, HOME_PT: [0.507, 0.472],
  stage: null, svg: null, pts: new Map(), last: null, moved: 0, raf: 0,
  init(stage) {
    this.stage = stage; this.svg = MapView.svg;
    const vb = this.svg && this.svg.viewBox.baseVal;
    if (vb && vb.width) { this.VW = vb.width; this.VH = vb.height; }
    if (this.svg) this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    this.measure();
    stage.addEventListener('pointerdown', e => this.down(e));
    stage.addEventListener('pointermove', e => this.move(e));
    ['pointerup', 'pointercancel'].forEach(t => stage.addEventListener(t, e => this.up(e)));
    stage.addEventListener('wheel', e => {
      e.preventDefault();
      this.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015));
    }, { passive: false });
    const c = () => { const r = stage.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    document.getElementById('zoomIn').onclick = () => this.zoomAt(...c(), 1.4);
    document.getElementById('zoomOut').onclick = () => this.zoomAt(...c(), 1 / 1.4);
    document.getElementById('zoomReset').onclick = () => this.home();
    if (window.ResizeObserver) new ResizeObserver(() => this.onResize()).observe(stage);
    this.home();
  },
  measure() { const r = this.stage.getBoundingClientRect(); this.W = Math.max(1, r.width); this.H = Math.max(1, r.height); },
  fitK() { return Math.min(this.W / this.VW, this.H / this.VH); },
  clampK(k) { return Math.min(this.MAX_K, Math.max(this.fitK() * 0.9, k)); },
  /* 画面の中心が地図の外へ出ないように制限 */
  clampPos() {
    const cx = this.x + this.W / this.k / 2, cy = this.y + this.H / this.k / 2;
    this.x += Math.min(this.VW, Math.max(0, cx)) - cx;
    this.y += Math.min(this.VH, Math.max(0, cy)) - cy;
  },
  apply() {
    this.clampPos();
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => { this.raf = 0; this.write(); }); // 描画は1フレームに1回
  },
  write() {
    if (!this.svg) return;
    this.svg.setAttribute('viewBox', `${this.x} ${this.y} ${this.W / this.k} ${this.H / this.k}`);
    MapView.setHitWidth(Math.min(80, Math.max(12, 28 / this.k))); // タップ判定の太さは画面上でほぼ一定に
  },
  /* 初期表示：都心部を画面中央に拡大して表示 */
  home() {
    this.measure();
    this.k = this.clampK(this.fitK() * this.HOME_RATIO);
    this.x = this.HOME_PT[0] * this.VW - this.W / this.k / 2;
    this.y = this.HOME_PT[1] * this.VH - this.H / this.k / 2;
    this.apply();
  },
  /* ウインドウサイズ変更：画面中心を保ったままviewBoxを再計算 */
  onResize() {
    const cx = this.x + this.W / this.k / 2, cy = this.y + this.H / this.k / 2;
    this.measure();
    this.k = this.clampK(this.k);
    this.x = cx - this.W / this.k / 2; this.y = cy - this.H / this.k / 2;
    this.apply();
  },
  zoomAt(cx, cy, f) {
    const r = this.stage.getBoundingClientRect(), px = cx - r.left, py = cy - r.top;
    const sx = this.x + px / this.k, sy = this.y + py / this.k; // カーソル下のSVG座標を固定
    const nk = this.clampK(this.k * f);
    this.x = sx - px / nk; this.y = sy - py / nk; this.k = nk;
    this.apply();
  },
  dist() { const [a, b] = [...this.pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); },
  mid() { const [a, b] = [...this.pts.values()]; return [(a.x + b.x) / 2, (a.y + b.y) / 2]; },
  down(e) {
    if (e.target.closest('.zoom,.legend')) return;
    this.stage.setPointerCapture(e.pointerId);
    this.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pts.size === 1) this.moved = 0;
    if (this.pts.size === 2) { this.moved = 99; this.last = { d: this.dist(), m: this.mid() }; }
  },
  move(e) {
    const p = this.pts.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    this.moved += Math.abs(dx) + Math.abs(dy);
    if (this.pts.size === 1) {
      if (this.moved >= 8) { this.x -= dx / this.k; this.y -= dy / this.k; this.apply(); }
      p.x = e.clientX; p.y = e.clientY;
    } else if (this.pts.size === 2) {
      p.x = e.clientX; p.y = e.clientY;
      const d = this.dist(), m = this.mid();
      this.x -= (m[0] - this.last.m[0]) / this.k; this.y -= (m[1] - this.last.m[1]) / this.k;
      this.zoomAt(m[0], m[1], d / this.last.d);
      this.last = { d, m };
    }
  },
  up(e) {
    if (!this.pts.has(e.pointerId)) return;
    if (this.pts.size === 1 && this.moved < 8) { // ほぼ動かなければタップ → 路線詳細
      const g = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-line]');
      if (g) document.dispatchEvent(new CustomEvent('line:tap', { detail: { line: g.dataset.line } }));
    }
    this.pts.delete(e.pointerId); this.last = null;
    if (this.pts.size === 1) this.moved = 99; // ピンチ後の誤タップ防止
  }
};

/* ---------- 共通：HTML部品 ---------- */
const bi = (ja, en) => I18n.bi() && en ? `${ja}<small class="en">${en}</small>` : ja;
const statusBadge = (st, cls = 'st') => `<span class="${cls} ${st}">${bi(STATUS[st].ja, STATUS[st].en)}</span>`;
const pad = n => String(n).padStart(2, '0');

/* ---------- E235系 異常時案内風ポップアップ ---------- */
const Detail = {
  el: null, name: null,
  open(name) { this.name = name; this.render(); this.el.hidden = false; this.tickTime(); },
  isOpen() { return this.el && !this.el.hidden; },
  render() {
    const L = lineByName(this.name); if (!L) return;
    const s = Store.of(L.ja), st = STATUS[s.status], on = I18n.bi();
    const body = s.status === 'normal' ? STRINGS.normalTxt.ja : (s.detail || `${L.ja}は、運行情報をお知らせします。`);
    document.getElementById('detailBody').innerHTML = `
      <div class="lcd" style="--lc:${L.color}">
        <div class="lcd-head">
          <div class="co">${L.op.ja}${on ? `<small>${L.op.en}</small>` : ''}</div>
          <span class="cbar"></span>
          <span class="sym">${L.code}</span>
          <div class="lname"><b>${L.ja}</b>${on ? `<small>${L.en}</small>` : ''}</div>
          <div class="rside"><time id="dTime">--:--</time>${statusBadge(s.status, 'car')}</div>
        </div>
        <div class="lcd-sub">${on ? '運行情報　Train Information' : '運行情報'}</div>
        <div class="lcd-body"><p class="h">【${L.ja}　${st.ja}】</p><p>${body}</p></div>
      </div>`;
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
  open() { Modals.open('modalSearch'); this.render(); },
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
    const list = this.filtered(), el = document.getElementById('searchList');
    const comp = COMPANIES.find(c => c.id === UI.company);
    document.getElementById('searchMeta').textContent =
      `${list.length}路線` + (UI.company !== 'all' ? `　絞り込み：${comp.ja}` : '');
    document.getElementById('searchClear').hidden = !this.q;
    el.innerHTML = list.length ? list.map(L => {
      const s = Store.of(L.ja).status;
      return `<button class="line-row s-${s}" data-line="${L.ja}" style="--lc:${L.color}">
        <span class="badge">${L.code}</span>
        <span class="lr-name"><b>${L.ja}</b>${I18n.bi() ? `<small>${L.en}</small>` : ''}</span>
        <span class="co-tag">${L.op.ja}</span>
        ${statusBadge(s)}
      </button>`;
    }).join('') : `<div class="empty">${I18n.text('none')}</div>`;
  },
  init() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', () => { this.q = input.value; this.render(); });
    document.getElementById('searchClear').onclick = () => { this.q = ''; input.value = ''; this.render(); input.focus(); };
    document.getElementById('searchList').addEventListener('click', e => {
      const row = e.target.closest('.line-row'); if (!row) return;
      Modals.closeAll(); Detail.open(row.dataset.line);
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
    document.addEventListener('keydown', e => e.key === 'Escape' && this.closeAll());
  }
};

/* ---------- UI ---------- */
const UI = {
  company: 'all',
  init() {
    Modals.init(); Search.init(); Detail.el = document.getElementById('modalDetail');
    document.getElementById('btnRefresh').onclick = () => this.refresh(true);
    document.getElementById('btnSettings').onclick = () => Modals.open('modalSettings');
    document.getElementById('btnSearch').onclick = () => Search.open();
    const b = document.getElementById('optBilingual'), d = document.getElementById('optDemo');
    b.checked = Settings.get('bilingual'); d.checked = Settings.get('demo');
    b.onchange = () => Settings.set('bilingual', b.checked);
    d.onchange = () => Settings.set('demo', d.checked);
    document.addEventListener('settings:change', e => {
      if (e.detail.key === 'demo') { // デモ⇔実データで混在させない
        Store.data = {}; MapView.applyStatuses();
        this.sync.ok = true; this.sync.text = Settings.get('demo') ? 'デモモード：ダミーデータを表示します' : '実データを取得中…';
      }
      this.renderAll();
      if (e.detail.key === 'demo') this.refresh();
    });
    document.addEventListener('visibilitychange', () => { // iPadで復帰したとき、古ければすぐ更新
      if (!document.hidden && !Settings.get('demo') && Date.now() - UI.lastOk >= AUTO_REFRESH_MS) UI.refresh();
    });
    document.addEventListener('line:tap', e => Detail.open(e.detail.line));
    this.startClock(); this.renderAll();
  },
  renderAll() {
    I18n.apply(); this.buildTabs(); this.buildLegend();
    document.getElementById('demoChip').hidden = !Settings.get('demo');
    this.renderSync();
    if (Search.isOpen()) Search.render();
    if (Detail.isOpen()) Detail.render();
  },
  buildTabs() {
    const nav = document.getElementById('companyTabs');
    nav.innerHTML = COMPANIES.map(c =>
      `<button class="tab" data-id="${c.id}" aria-pressed="${c.id === this.company}">${c.ja}${I18n.bi() ? `<small>${c.en}</small>` : ''}</button>`).join('');
    nav.querySelectorAll('.tab').forEach(btn => btn.onclick = () => {
      this.company = btn.dataset.id; MapView.applyFilter(this.company); this.buildTabs();
      if (Search.isOpen()) Search.render();
    });
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
      Detail.tickTime();
    };
    tick(); setInterval(tick, 1000);
  },
  busy: false, again: false, timer: null, lastOk: 0, spinStart: 0,
  sync: { time: null, ok: true, text: '未同期' },
  /* 設定モーダルに「最終同期時刻」と「取得ステータス」を表示（ランプのツールチップにも反映） */
  setSync(ok, text) {
    if (ok) this.sync.time = new Date();   // 最終同期時刻は「成功した時刻」
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
  /* 自動更新：デモOFFのときだけ、前回の取得完了から3分後に次を予約（画面にカウントダウンは出さない） */
  schedule() {
    clearTimeout(this.timer);
    if (!Settings.get('demo')) this.timer = setTimeout(() => this.refresh(), AUTO_REFRESH_MS);
  },
  async refresh(spin = false) {
    const btn = document.getElementById('btnRefresh'), lamp = document.getElementById('lamp');
    if (spin && !btn.classList.contains('spin')) { btn.classList.add('spin'); this.spinStart = Date.now(); }
    if (this.busy) { this.again = true; return; } // 取得中なら完了後にもう一度
    this.busy = true; clearTimeout(this.timer);
    const provider = Providers.current;
    try {
      const data = await provider.fetchStatus();
      if (provider !== Providers.current) return; // 取得中にデモ設定が切り替わった場合は破棄
      Store.data = data; this.lastOk = Date.now();
      lamp.classList.remove('err');
      this.setSync(true, provider === LiveProvider ? Yahoo.reportText() : 'デモモード：ダミーデータを表示中');
      MapView.applyStatuses();
      if (Search.isOpen()) Search.render();
      if (Detail.isOpen()) Detail.render();
    } catch (e) {
      console.error('fetchStatus failed', e); // 失敗時は前回のデータを保持してランプを赤に
      lamp.classList.add('err');
      this.setSync(false, '取得エラー：' + (e && e.message ? e.message : e));
    } finally {
      this.busy = false;
      const wait = Math.max(0, 800 - (Date.now() - this.spinStart)); // 回転アニメを最低1周は見せる
      setTimeout(() => btn.classList.remove('spin'), wait);
      if (this.again) { this.again = false; this.refresh(); } else this.schedule();
    }
  }
};

/* ---------- 起動 ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  Settings.load();
  UI.init();
  await MapView.init();
  Zoom.init(document.getElementById('stage'), document.getElementById('map'));
  MapView.applyFilter(UI.company);
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
