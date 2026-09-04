const pptxgen = require("pptxgenjs");

// ============ palette (Ocean Gradient + functional accents) ============
const NAVY   = "0B2B45"; // dark background
const NAVY2  = "102A43";
const DEEP   = "065A82"; // primary deep blue
const TEAL   = "1C7293"; // secondary teal
const SKY     = "9FD3E0"; // light accent on dark
const AMBER  = "E08A1E"; // caution accent
const GREEN  = "2E9E6B"; // safe / ok
const INK    = "1E293B"; // body text
const MUTED  = "64748B"; // muted text
const PANEL  = "F1F5F9"; // light panel
const PANEL2 = "E8EEF3";
const WHITE  = "FFFFFF";
const CODEBG = "0E2233"; // code block bg
const CODEFG = "DCE7EF";
const CODEAC = "7FE0C0"; // code accent (green-ish)

const JP = "Hiragino Kaku Gothic ProN"; // body / heading
const MONO = "Menlo";

const pres = new pptxgen();
pres.defineLayout({ name: "W", width: 13.333, height: 7.5 });
pres.layout = "W";
pres.author = "billing-role-sync";
pres.title = "請求先IAM権限同期ツール 利用ガイド";

const W = 13.333, H = 7.5, M = 0.7;
const shadow = () => ({ type: "outer", color: "0B2B45", blur: 9, offset: 3, angle: 90, opacity: 0.16 });

// ---------- helpers ----------
function kicker(slide, label) {
  // small teal badge motif + kicker label
  slide.addShape(pres.shapes.RECTANGLE, { x: M, y: 0.62, w: 0.22, h: 0.42, fill: { color: TEAL }, line: { type: "none" } });
  slide.addText(label, { x: M + 0.34, y: 0.6, w: 9, h: 0.46, fontFace: JP, fontSize: 13, bold: true, color: TEAL, charSpacing: 2, valign: "middle", margin: 0 });
}
function title(slide, t) {
  slide.addText(t, { x: M, y: 1.04, w: W - 2 * M, h: 0.8, fontFace: JP, fontSize: 30, bold: true, color: INK, valign: "middle", margin: 0 });
}
function pageNo(slide, n) {
  slide.addText(`${n}`, { x: W - 0.9, y: H - 0.55, w: 0.5, h: 0.35, fontFace: MONO, fontSize: 11, color: MUTED, align: "right" });
  slide.addText("billing-role-sync 利用ガイド", { x: M, y: H - 0.55, w: 6, h: 0.35, fontFace: JP, fontSize: 9, color: MUTED, align: "left" });
}
function contentBase(label, t, n) {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  kicker(s, label);
  title(s, t);
  pageNo(s, n);
  return s;
}
// code block
function code(slide, x, y, w, lines, opt = {}) {
  const lh = opt.lh || 0.34;
  const padTop = 0.22, padBot = 0.2;
  const h = padTop + padBot + lines.length * lh;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: CODEBG }, line: { type: "none" }, rectRadius: 0.07, shadow: shadow() });
  const runs = [];
  lines.forEach((ln, i) => {
    const isComment = ln.trim().startsWith("#");
    runs.push({ text: ln === "" ? " " : ln, options: { color: isComment ? "6FA8C7" : (opt.accent && ln.trim().startsWith("$") ? CODEAC : CODEFG), breakLine: i < lines.length - 1 } });
  });
  slide.addText(runs, { x: x + 0.28, y: y + padTop - 0.04, w: w - 0.56, h: h - padTop, fontFace: MONO, fontSize: opt.fs || 13, valign: "top", margin: 0, lineSpacingMultiple: 1.0 });
  return h;
}
// pill / chip
function chip(slide, x, y, w, h, text, fill, fg) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { type: "none" }, rectRadius: h / 2 });
  slide.addText(text, { x, y, w, h, fontFace: JP, fontSize: 12, bold: true, color: fg, align: "center", valign: "middle", margin: 0 });
}
// numbered step badge
function badge(slide, x, y, n, color = DEEP, d = 0.5) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { type: "none" } });
  slide.addText(String(n), { x, y, w: d, h: d, fontFace: JP, fontSize: 18, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
}

// =====================================================================
// 1. TITLE
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  // soft accent rectangles (motif, not a full bar)
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: TEAL }, line: { type: "none" } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.28, y: 0, w: 0.1, h: H, fill: { color: DEEP }, line: { type: "none" } });

  s.addText("UTILIZATION GUIDE", { x: 1.1, y: 1.55, w: 10, h: 0.4, fontFace: JP, fontSize: 14, bold: true, color: SKY, charSpacing: 4, margin: 0 });
  s.addText("請求先IAM権限 同期ツール", { x: 1.1, y: 2.0, w: 11.4, h: 1.1, fontFace: JP, fontSize: 46, bold: true, color: WHITE, margin: 0 });
  s.addText("利用ガイド ― 迷わず使うための操作マニュアル", { x: 1.12, y: 3.15, w: 11.4, h: 0.7, fontFace: JP, fontSize: 22, color: SKY, margin: 0 });

  // chips
  chip(s, 1.12, 4.2, 2.5, 0.5, "対象: 利用者・担当者", "13344B", SKY);
  chip(s, 3.78, 4.2, 3.0, 0.5, "Cloud Shell / Cloud Console", "13344B", SKY);
  chip(s, 6.94, 4.2, 2.2, 0.5, "コマンド任意", "13344B", SKY);

  s.addText("billing-role-sync", { x: 1.1, y: 6.4, w: 6, h: 0.4, fontFace: MONO, fontSize: 13, color: "5E86A0", margin: 0 });
}

// =====================================================================
// 2. このツールでできること
// =====================================================================
{
  const s = contentBase("OVERVIEW ・ 概要", "このツールでできること", 2);
  s.addText("顧客に付与されている過剰な権限 roles/billing.admin を、必要十分な最小権限へ自動で置き換えます。", { x: M, y: 1.95, w: W - 2 * M, h: 0.5, fontFace: JP, fontSize: 15, color: MUTED, margin: 0 });

  const cy = 2.75, ch = 1.55;
  // before card
  const bx = M, bw = 3.5;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: cy, w: bw, h: ch, fill: { color: PANEL }, line: { color: "E7C3BD", width: 1 }, rectRadius: 0.08 });
  s.addText("変更前（過剰）", { x: bx, y: cy + 0.18, w: bw, h: 0.4, fontFace: JP, fontSize: 14, bold: true, color: "B23B2E", align: "center", margin: 0 });
  s.addText("roles/billing.admin", { x: bx + 0.2, y: cy + 0.7, w: bw - 0.4, h: 0.5, fontFace: MONO, fontSize: 15, bold: true, color: INK, align: "center", valign: "middle", margin: 0 });
  s.addText("請求先アカウント管理者", { x: bx, y: cy + 1.15, w: bw, h: 0.3, fontFace: JP, fontSize: 11, color: MUTED, align: "center", margin: 0 });

  // arrow
  s.addShape(pres.shapes.RIGHT_ARROW, { x: bx + bw + 0.15, y: cy + ch / 2 - 0.28, w: 0.85, h: 0.56, fill: { color: TEAL }, line: { type: "none" } });

  // after card
  const ax = bx + bw + 1.15, aw = W - M - ax;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ax, y: cy, w: aw, h: ch, fill: { color: "EAF6F0" }, line: { color: "C2E3D2", width: 1 }, rectRadius: 0.08 });
  s.addText("変更後（最小権限）", { x: ax, y: cy + 0.18, w: aw, h: 0.4, fontFace: JP, fontSize: 14, bold: true, color: GREEN, align: "center", margin: 0 });
  const roles = ["roles/billing.user", "roles/billing.viewer", "roles/billing.costsManager"];
  const rw = (aw - 0.8) / 3;
  roles.forEach((r, i) => {
    const rx = ax + 0.3 + i * (rw + 0.1);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: cy + 0.72, w: rw, h: 0.62, fill: { color: WHITE }, line: { color: "BFE0CF", width: 1 }, rectRadius: 0.06 });
    s.addText(r.replace("roles/billing.", ""), { x: rx, y: cy + 0.72, w: rw, h: 0.62, fontFace: MONO, fontSize: 12, bold: true, color: DEEP, align: "center", valign: "middle", margin: 0 });
  });

  // bottom: target / exclude
  const ty = 4.7;
  const items = [
    ["対象", "親請求先アカウント配下の全サブアカウントの user: メンバー", DEEP],
    ["除外", "自社ドメインのユーザー（運用管理者）はそのまま維持", MUTED],
    ["絞り込み", "特定の顧客ドメインだけを対象にすることも可能", TEAL],
  ];
  const iw = (W - 2 * M - 0.6) / 3;
  items.forEach(([h, d, c], i) => {
    const ix = M + i * (iw + 0.3);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ix, y: ty, w: iw, h: 1.55, fill: { color: WHITE }, line: { color: PANEL2, width: 1 }, rectRadius: 0.08, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: ix, y: ty + 0.22, w: 0.14, h: 0.36, fill: { color: c }, line: { type: "none" } });
    s.addText(h, { x: ix + 0.32, y: ty + 0.18, w: iw - 0.5, h: 0.4, fontFace: JP, fontSize: 16, bold: true, color: INK, margin: 0 });
    s.addText(d, { x: ix + 0.32, y: ty + 0.72, w: iw - 0.6, h: 0.7, fontFace: JP, fontSize: 12.5, color: MUTED, margin: 0 });
  });
}

// =====================================================================
// 3. 安全のしくみ（安心ポイント）
// =====================================================================
{
  const s = contentBase("SAFETY ・ 安全設計", "安心して使えるしくみ", 3);
  s.addText("権限変更は「うっかり」では起きない設計です。基本は確認だけ、本番は二重の関門があります。", { x: M, y: 1.95, w: W - 2 * M, h: 0.5, fontFace: JP, fontSize: 15, color: MUTED, margin: 0 });

  const cards = [
    ["①", "既定は Dry-Run", "何もしなければ「対象を表示するだけ」。実際の権限は変わりません。", DEEP],
    ["②", "本番は明示が必須", "apply（APPLY_MODE=true）を自分で指定したときだけ変更します。", TEAL],
    ["③", "実行前に確認", "make run-apply は対象一覧を見せ、yes と入力するまで実行しません。", AMBER],
    ["④", "全ログを保存", "誰が・いつ・何をしたかを GCS に自動保存（365日保管）。", GREEN],
  ];
  const cw = (W - 2 * M - 3 * 0.4) / 4, cy = 2.8, ch = 3.4;
  cards.forEach(([n, h, d, c], i) => {
    const x = M + i * (cw + 0.4);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: cy, w: cw, h: ch, fill: { color: WHITE }, line: { color: PANEL2, width: 1 }, rectRadius: 0.09, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: cy + 0.4, w: 0.85, h: 0.85, fill: { color: c }, line: { type: "none" } });
    s.addText(n, { x: x + 0.35, y: cy + 0.4, w: 0.85, h: 0.85, fontFace: JP, fontSize: 26, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(h, { x: x + 0.3, y: cy + 1.5, w: cw - 0.6, h: 0.7, fontFace: JP, fontSize: 17, bold: true, color: INK, margin: 0, valign: "top" });
    s.addText(d, { x: x + 0.3, y: cy + 2.15, w: cw - 0.55, h: 1.1, fontFace: JP, fontSize: 12.5, color: MUTED, margin: 0, valign: "top" });
  });
}

// =====================================================================
// 4. 2つの使い方（選び方）
// =====================================================================
{
  const s = contentBase("HOW TO RUN ・ 使い方の選択", "2つの実行方法 ― どちらでもOK", 4);
  s.addText("やりたいことは同じ（ジョブの実行）。あなたに合うほうを選んでください。", { x: M, y: 1.95, w: W - 2 * M, h: 0.4, fontFace: JP, fontSize: 15, color: MUTED, margin: 0 });

  const cy = 2.65, ch = 4.1, cw = (W - 2 * M - 0.6) / 2;
  // Method A
  const ax = M;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ax, y: cy, w: cw, h: ch, fill: { color: WHITE }, line: { color: DEEP, width: 2 }, rectRadius: 0.1, shadow: shadow() });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ax, y: cy, w: cw, h: 0.95, fill: { color: DEEP }, line: { type: "none" }, rectRadius: 0.1 });
  s.addShape(pres.shapes.RECTANGLE, { x: ax, y: cy + 0.55, w: cw, h: 0.4, fill: { color: DEEP }, line: { type: "none" } });
  s.addText("方法 A", { x: ax + 0.35, y: cy + 0.12, w: cw - 1, h: 0.4, fontFace: JP, fontSize: 15, bold: true, color: SKY, margin: 0 });
  s.addText("Cloud Shell で make コマンド", { x: ax + 0.35, y: cy + 0.45, w: cw - 1, h: 0.45, fontFace: JP, fontSize: 18, bold: true, color: WHITE, margin: 0 });
  chip(s, ax + cw - 1.75, cy + 0.27, 1.45, 0.42, "推奨", SKY, NAVY);
  const aPts = [
    "ブラウザだけで完結（インストール不要）",
    "make run / run-apply / logs が使える",
    "確認プロンプトなど安全機能をフル活用",
    "初回のみ git clone が必要",
  ];
  s.addText(aPts.map((t, i) => ({ text: t, options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 8 } })), { x: ax + 0.45, y: cy + 1.25, w: cw - 0.8, h: 2.7, fontFace: JP, fontSize: 14, color: INK, margin: 0 });

  // Method C
  const bx = ax + cw + 0.6;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: cy, w: cw, h: ch, fill: { color: WHITE }, line: { color: TEAL, width: 2 }, rectRadius: 0.1, shadow: shadow() });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: cy, w: cw, h: 0.95, fill: { color: TEAL }, line: { type: "none" }, rectRadius: 0.1 });
  s.addShape(pres.shapes.RECTANGLE, { x: bx, y: cy + 0.55, w: cw, h: 0.4, fill: { color: TEAL }, line: { type: "none" } });
  s.addText("方法 C", { x: bx + 0.35, y: cy + 0.12, w: cw - 1, h: 0.4, fontFace: JP, fontSize: 15, bold: true, color: SKY, margin: 0 });
  s.addText("Cloud Console から直接実行", { x: bx + 0.35, y: cy + 0.45, w: cw - 1, h: 0.45, fontFace: JP, fontSize: 18, bold: true, color: WHITE, margin: 0 });
  chip(s, bx + cw - 2.05, cy + 0.27, 1.75, 0.42, "コマンド不要", SKY, NAVY);
  const cPts = [
    "ブラウザのボタン操作だけで実行",
    "git clone も make も不要",
    "環境変数の設定で Dry-Run / 本番を切替",
    "確認プロンプトは出ない（要・事前確認）",
  ];
  s.addText(cPts.map((t) => ({ text: t, options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 8 } })), { x: bx + 0.45, y: cy + 1.25, w: cw - 0.8, h: 2.7, fontFace: JP, fontSize: 14, color: INK, margin: 0 });
}

// =====================================================================
// 5. はじめる前に：必要な権限
// =====================================================================
{
  const s = contentBase("ACCESS ・ 利用開始の準備", "はじめる前に：必要な権限", 5);
  s.addText("利用者は2つの権限だけで使えます。未設定なら、管理者に下記の付与を依頼してください。", { x: M, y: 1.95, w: W - 2 * M, h: 0.5, fontFace: JP, fontSize: 15, color: MUTED, margin: 0 });

  const rows = [
    [{ text: "ロール", options: { bold: true, color: WHITE, fill: { color: DEEP }, fontFace: JP, fontSize: 14, align: "left" } },
     { text: "付与対象", options: { bold: true, color: WHITE, fill: { color: DEEP }, fontFace: JP, fontSize: 14, align: "left" } },
     { text: "できること", options: { bold: true, color: WHITE, fill: { color: DEEP }, fontFace: JP, fontSize: 14, align: "left" } }],
    [{ text: "roles/run.developer", options: { fontFace: MONO, fontSize: 13, color: INK } },
     { text: "Cloud Run Job\nbilling-role-sync-job", options: { fontFace: JP, fontSize: 12.5, color: INK } },
     { text: "ジョブ（Dry-Run / 本番）の実行", options: { fontFace: JP, fontSize: 13, color: INK } }],
    [{ text: "roles/storage.objectViewer", options: { fontFace: MONO, fontSize: 13, color: INK } },
     { text: "GCS ログバケット\n{project}-billing-role-sync-logs", options: { fontFace: JP, fontSize: 12.5, color: INK } },
     { text: "実行ログの閲覧（make logs）", options: { fontFace: JP, fontSize: 13, color: INK } }],
  ];
  s.addTable(rows, { x: M, y: 2.75, w: W - 2 * M, colW: [3.6, 4.4, (W - 2 * M - 8.0)], rowH: [0.55, 0.95, 0.95], border: { pt: 1, color: PANEL2 }, fill: { color: WHITE }, valign: "middle", align: "left", autoPage: false });

  // note box
  const ny = 5.6;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: ny, w: W - 2 * M, h: 1.15, fill: { color: PANEL }, line: { type: "none" }, rectRadius: 0.08 });
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: ny + 0.18, w: 0.14, h: 0.78, fill: { color: GREEN }, line: { type: "none" } });
  s.addText([
    { text: "利用者がやらないこと： ", options: { bold: true, color: GREEN } },
    { text: "make setup / make init / make apply / make build などのセットアップ・構築操作は不要です。デプロイ済みのジョブを実行するだけなので、上記2権限があればすぐ使えます。", options: { color: INK } },
  ], { x: M + 0.35, y: ny + 0.15, w: W - 2 * M - 0.7, h: 0.85, fontFace: JP, fontSize: 13.5, valign: "middle", margin: 0 });
}

// =====================================================================
// 6. 管理者向け：利用者を追加するコマンド
// =====================================================================
{
  const s = contentBase("FOR ADMIN ・ 利用者の追加", "【管理者向け】利用者を追加する", 6);
  s.addText("管理者が以下を実行して権限を付与します。<NEW_USER_EMAIL> と <PROJECT_ID> を置き換えてください。", { x: M, y: 1.95, w: W - 2 * M, h: 0.5, fontFace: JP, fontSize: 15, color: MUTED, margin: 0 });

  s.addText("権限の付与", { x: M, y: 2.55, w: 6, h: 0.4, fontFace: JP, fontSize: 15, bold: true, color: DEEP, margin: 0 });
  code(s, M, 2.88, W - 2 * M, [
    "# ① ジョブの実行権限を付与",
    "gcloud run jobs add-iam-policy-binding billing-role-sync-job \\",
    "  --region=asia-northeast1 --project=<PROJECT_ID> \\",
    '  --member="user:<NEW_USER_EMAIL>" --role="roles/run.developer"',
    "",
    "# ② ログ閲覧権限を付与",
    "gcloud storage buckets add-iam-policy-binding \\",
    "  gs://<PROJECT_ID>-billing-role-sync-logs \\",
    '  --member="user:<NEW_USER_EMAIL>" --role="roles/storage.objectViewer"',
  ], { fs: 12.5, lh: 0.3 });

  const ny = 6.05;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: ny, w: W - 2 * M, h: 0.62, fill: { color: PANEL }, line: { type: "none" }, rectRadius: 0.07 });
  s.addText([
    { text: "取り消すとき： ", options: { bold: true, color: AMBER } },
    { text: "同じコマンドの add-iam-policy-binding を remove-iam-policy-binding に変えて実行します。", options: { color: INK } },
  ], { x: M + 0.3, y: ny, w: W - 2 * M - 0.6, h: 0.62, fontFace: JP, fontSize: 13, valign: "middle", margin: 0 });
}

// =====================================================================
// 7. 方法A 手順① 初回
// =====================================================================
{
  const s = contentBase("METHOD A ・ Cloud Shell", "方法A：はじめての起動（初回のみ）", 7);

  const steps = [
    ["Cloud Console を開きプロジェクトを選択", "console.cloud.google.com にアクセスし、対象プロジェクトを選びます。"],
    ["Cloud Shell をアクティブ化", "右上の「>_」アイコンをクリック。ブラウザ内にターミナルが開きます。"],
    ["リポジトリをクローン（初回のみ）", "下記コマンドでツールを取得し、フォルダへ移動します。"],
  ];
  let y = 2.1;
  steps.forEach(([h, d], i) => {
    badge(s, M, y, i + 1, DEEP);
    s.addText(h, { x: M + 0.7, y: y - 0.04, w: 7.6, h: 0.4, fontFace: JP, fontSize: 16.5, bold: true, color: INK, margin: 0 });
    s.addText(d, { x: M + 0.7, y: y + 0.38, w: 7.7, h: 0.55, fontFace: JP, fontSize: 13, color: MUTED, margin: 0 });
    y += 1.18;
  });

  // code on right
  code(s, 8.7, 2.15, W - M - 8.7, [
    "# 初回のみ：取得して移動",
    "$ git clone <リポジトリURL>",
    "$ cd billing-role-sync",
    "",
    "# プロジェクトを指定",
    "$ gcloud config set project \\",
    "    <PROJECT_ID>",
  ], { fs: 12.5, lh: 0.33, accent: true });

  const ny = 6.0;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: ny, w: W - 2 * M, h: 0.72, fill: { color: PANEL }, line: { type: "none" }, rectRadius: 0.07 });
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: ny + 0.14, w: 0.14, h: 0.44, fill: { color: TEAL }, line: { type: "none" } });
  s.addText([
    { text: "ヒント： ", options: { bold: true, color: TEAL } },
    { text: "Cloud Shell のホーム(~)は保存されるので、クローンしたフォルダは次回も残ります。インストール作業は一切不要です。", options: { color: INK } },
  ], { x: M + 0.35, y: ny, w: W - 2 * M - 0.7, h: 0.72, fontFace: JP, fontSize: 13, valign: "middle", margin: 0 });
}

// =====================================================================
// 8. 方法A 手順② 2回目以降
// =====================================================================
{
  const s = contentBase("METHOD A ・ Cloud Shell", "方法A：2回目以降の起動", 8);
  s.addText("2回目以降はクローン不要。フォルダへ移動するだけで使えます。", { x: M, y: 1.95, w: W - 2 * M, h: 0.4, fontFace: JP, fontSize: 15, color: MUTED, margin: 0 });

  const steps = [
    ["Cloud Shell を起動", "前回と同様に「>_」アイコンから起動します。"],
    ["フォルダへ移動", "既にクローン済みのディレクトリに入ります。"],
    ["（任意）最新版を取得", "更新があれば git pull で取り込みます。"],
  ];
  let y = 2.6;
  steps.forEach(([h, d], i) => {
    badge(s, M, y, i + 1, TEAL);
    s.addText(h, { x: M + 0.7, y: y - 0.04, w: 7.6, h: 0.4, fontFace: JP, fontSize: 16.5, bold: true, color: INK, margin: 0 });
    s.addText(d, { x: M + 0.7, y: y + 0.4, w: 7.7, h: 0.5, fontFace: JP, fontSize: 13, color: MUTED, margin: 0 });
    y += 1.15;
  });

  code(s, 8.7, 2.7, W - M - 8.7, [
    "# 2回目以降",
    "$ cd ~/billing-role-sync",
    "",
    "# 最新版にする場合のみ",
    "$ git pull",
  ], { fs: 13, lh: 0.34, accent: true });

  const ny = 6.05;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: ny, w: W - 2 * M, h: 0.7, fill: { color: "EAF6F0" }, line: { type: "none" }, rectRadius: 0.07 });
  s.addText([
    { text: "準備完了！ ", options: { bold: true, color: GREEN } },
    { text: "ここまでできたら、次ページ以降の make コマンドで日常操作を行えます。", options: { color: INK } },
  ], { x: M + 0.35, y: ny, w: W - 2 * M - 0.7, h: 0.7, fontFace: JP, fontSize: 13.5, valign: "middle", margin: 0 });
}

// =====================================================================
// 9. 日常操作① 対象確認 (Dry-Run)
// =====================================================================
{
  const s = contentBase("DAILY ・ 日常操作 ①", "対象ユーザーの確認（変更なし）", 9);
  s.addText("まずは Dry-Run。「誰が変更対象か」を表示するだけで、権限は一切変わりません。", { x: M, y: 1.95, w: W - 2 * M, h: 0.4, fontFace: JP, fontSize: 15, color: MUTED, margin: 0 });

  s.addText("全顧客を対象に確認", { x: M, y: 2.55, w: 6, h: 0.35, fontFace: JP, fontSize: 14, bold: true, color: DEEP, margin: 0 });
  code(s, M, 2.92, W - 2 * M, ["$ make run"], { fs: 14, lh: 0.34, accent: true });

  s.addText("特定の顧客ドメインだけ確認（カンマ区切りで複数可）", { x: M, y: 3.85, w: 9, h: 0.35, fontFace: JP, fontSize: 14, bold: true, color: DEEP, margin: 0 });
  code(s, M, 4.22, W - 2 * M, [
    "$ make run-domain DOMAINS=customer-a.com",
    "$ make run-domain DOMAINS=customer-a.com,customer-b.co.jp",
  ], { fs: 14, lh: 0.34, accent: true });

  const ny = 5.85;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: ny, w: W - 2 * M, h: 0.95, fill: { color: PANEL }, line: { type: "none" }, rectRadius: 0.07 });
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: ny + 0.18, w: 0.14, h: 0.6, fill: { color: GREEN }, line: { type: "none" } });
  s.addText([
    { text: "安全： ", options: { bold: true, color: GREEN } },
    { text: "make run 系はいくら実行しても権限は変わりません。出力に「(予定) + / - roles/...」と表示されるのが変更予定の内容です。気軽に確認できます。", options: { color: INK } },
  ], { x: M + 0.35, y: ny, w: W - 2 * M - 0.7, h: 0.95, fontFace: JP, fontSize: 13.5, valign: "middle", margin: 0 });
}

// =====================================================================
// 10. 日常操作② 権限変更 (apply)
// =====================================================================
{
  const s = contentBase("DAILY ・ 日常操作 ②", "権限変更の実行（本番）", 10);
  s.addText("run-apply は自動で Dry-Run → 対象表示 → 確認の順に進み、yes を入力したときだけ変更します。", { x: M, y: 1.95, w: W - 2 * M, h: 0.4, fontFace: JP, fontSize: 14.5, color: MUTED, margin: 0 });

  // left: commands
  code(s, M, 2.6, 5.7, [
    "# 全顧客を変更",
    "$ make run-apply",
    "",
    "# 特定ドメインのみ変更",
    "$ make run-apply-domain \\",
    "    DOMAINS=customer-a.com",
  ], { fs: 12.5, lh: 0.32, accent: true });

  // right: flow
  const fx = 6.9, fw = W - M - fx;
  const flow = [
    ["1", "Dry-Run 自動実行", "対象を洗い出し（約30〜60秒）", DEEP],
    ["2", "対象一覧を画面表示", "(予定) + / - roles/... を確認", TEAL],
    ["3", "確認プロンプト", "「yes」を入力しないと進まない", AMBER],
    ["4", "本番実行", "yes のときだけ権限を変更", GREEN],
  ];
  let fy = 2.55;
  const rh = 0.93;
  flow.forEach(([n, h, d, c], i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: fx, y: fy, w: fw, h: 0.78, fill: { color: WHITE }, line: { color: PANEL2, width: 1 }, rectRadius: 0.06, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: fx + 0.18, y: fy + 0.16, w: 0.46, h: 0.46, fill: { color: c }, line: { type: "none" } });
    s.addText(n, { x: fx + 0.18, y: fy + 0.16, w: 0.46, h: 0.46, fontFace: JP, fontSize: 15, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(h, { x: fx + 0.8, y: fy + 0.1, w: 3.0, h: 0.6, fontFace: JP, fontSize: 14.5, bold: true, color: INK, valign: "middle", margin: 0 });
    s.addText(d, { x: fx + 3.85, y: fy + 0.1, w: fw - 3.95, h: 0.6, fontFace: JP, fontSize: 11.5, color: MUTED, valign: "middle", margin: 0 });
    if (i < flow.length - 1) s.addShape(pres.shapes.DOWN_ARROW, { x: fx + 0.32, y: fy + 0.76, w: 0.18, h: 0.2, fill: { color: "C3D0DA" }, line: { type: "none" } });
    fy += rh;
  });

  const ny = 6.28;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: ny, w: 5.7, h: 0.56, fill: { color: PANEL }, line: { type: "none" }, rectRadius: 0.06 });
  s.addText([{ text: "キャンセル： ", options: { bold: true, color: AMBER } }, { text: "no や Ctrl+C で中断すれば変更されません。", options: { color: INK } }], { x: M + 0.25, y: ny, w: 5.2, h: 0.56, fontFace: JP, fontSize: 12, valign: "middle", margin: 0 });
}

// =====================================================================
// 11. 日常操作③ ログ確認 (make logs)
// =====================================================================
{
  const s = contentBase("DAILY ・ 日常操作 ③", "ログの確認（make logs）", 11);
  s.addText("実行結果は GCS に自動保存されます。あとから「誰が・いつ・何をしたか」を確認できます。", { x: M, y: 1.95, w: W - 2 * M, h: 0.4, fontFace: JP, fontSize: 15, color: MUTED, margin: 0 });

  // three command cards
  const cy = 2.55, ch = 1.32, cw = (W - 2 * M - 0.8) / 3;
  const cards = [
    ["直近の実行ログを表示", "$ make logs", DEEP],
    ["過去のログ一覧を表示", "$ make logs-list", TEAL],
    ["一覧から選んで表示", "$ make logs FILE=<ファイル名>", GREEN],
  ];
  cards.forEach(([h, cmd, c], i) => {
    const x = M + i * (cw + 0.4);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: cy, w: cw, h: ch, fill: { color: WHITE }, line: { color: PANEL2, width: 1 }, rectRadius: 0.08, shadow: shadow() });
    s.addText(h, { x: x + 0.28, y: cy + 0.16, w: cw - 0.56, h: 0.36, fontFace: JP, fontSize: 14, bold: true, color: c, margin: 0 });
    code(s, x + 0.28, cy + 0.6, cw - 0.56, [cmd], { fs: 11, lh: 0.3, accent: true });
  });

  // sample: execution summary
  s.addText("ログ末尾の「実行サマリー」で、何に対して何をしたかが一目で分かります", { x: M, y: 4.1, w: W - 2 * M, h: 0.35, fontFace: JP, fontSize: 14, bold: true, color: INK, margin: 0 });
  code(s, M, 4.48, W - 2 * M, [
    " 実行サマリー",
    " モード              : DRY-RUN（変更なし）",
    " 対象顧客ドメイン    : customer-a.com",
    " 対象ユーザー        : 1 件（変更予定）",
    "   [012345-678901-ABCDEF] user:sato@customer-a.com",
  ], { fs: 11.5, lh: 0.26 });

  const ny = 6.3;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: ny, w: W - 2 * M, h: 0.56, fill: { color: PANEL }, line: { type: "none" }, rectRadius: 0.06 });
  s.addText([
    { text: "保存先： ", options: { bold: true, color: DEEP } },
    { text: "gs://{project}-billing-role-sync-logs/  ", options: { fontFace: MONO, color: INK } },
    { text: "（Cloud Console の Cloud Storage 画面からも閲覧可・365日後に自動削除）", options: { color: MUTED } },
  ], { x: M + 0.3, y: ny, w: W - 2 * M - 0.6, h: 0.56, fontFace: JP, fontSize: 12.5, valign: "middle", margin: 0 });
}

// =====================================================================
// 12. 方法C Console 手順
// =====================================================================
{
  const s = contentBase("METHOD C ・ Cloud Console", "方法C：ボタン操作で実行（コマンド不要）", 12);
  s.addText("ターミナルを使いたくない人向け。ブラウザの UI だけでジョブを実行できます。", { x: M, y: 1.95, w: W - 2 * M, h: 0.4, fontFace: JP, fontSize: 15, color: MUTED, margin: 0 });

  const steps = [
    ["Cloud Run Jobs を開く", "Console の「Cloud Run」→「ジョブ」を開きます。"],
    ["対象ジョブを選ぶ", "billing-role-sync-job をクリックします。"],
    ["「実行」をクリック", "上部の「実行」ボタンを押します。"],
    ["環境変数を展開して設定", "「コンテナ、変数とシークレット…」を開き、次ページの表のとおり設定。"],
    ["「実行」で開始", "実行履歴で結果（成功/失敗）を確認します。"],
  ];
  let y = 2.45;
  steps.forEach(([h, d], i) => {
    badge(s, M, y, i + 1, TEAL, 0.46);
    s.addText(h, { x: M + 0.66, y: y - 0.06, w: 11.4, h: 0.4, fontFace: JP, fontSize: 16, bold: true, color: INK, margin: 0 });
    s.addText(d, { x: M + 0.66, y: y + 0.34, w: 11.4, h: 0.4, fontFace: JP, fontSize: 12.5, color: MUTED, margin: 0 });
    y += 0.86;
  });
}

// =====================================================================
// 13. 方法C 環境変数表
// =====================================================================
{
  const s = contentBase("METHOD C ・ Cloud Console", "方法C：環境変数の設定", 13);
  s.addText("「環境変数」に以下を設定して、確認だけ／本番、全顧客／特定ドメインを切り替えます。", { x: M, y: 1.95, w: W - 2 * M, h: 0.4, fontFace: JP, fontSize: 15, color: MUTED, margin: 0 });

  const hd = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: DEEP }, fontFace: JP, fontSize: 14, align: "center" } });
  const cell = (t, c = INK, mono = false) => ({ text: t, options: { fontFace: mono ? MONO : JP, fontSize: 13.5, color: c, align: "center" } });
  const rows = [
    [hd("実行内容"), hd("APPLY_MODE"), hd("TARGET_DOMAINS")],
    [cell("Dry-Run（全顧客）", INK), cell("false（既定）", MUTED, true), cell("（空のまま）", MUTED)],
    [cell("Dry-Run（特定ドメイン）", INK), cell("false（既定）", MUTED, true), cell("customer-a.com,customer-b.co.jp", INK, true)],
    [cell("本番（全顧客）", "B23B2E"), cell("true", "B23B2E", true), cell("（空のまま）", MUTED)],
    [cell("本番（特定ドメイン）", "B23B2E"), cell("true", "B23B2E", true), cell("customer-a.com", INK, true)],
  ];
  s.addTable(rows, { x: M, y: 2.7, w: W - 2 * M, colW: [3.6, 2.8, W - 2 * M - 6.4], rowH: [0.55, 0.62, 0.62, 0.62, 0.62], border: { pt: 1, color: PANEL2 }, fill: { color: WHITE }, valign: "middle", autoPage: false });

  const ny = 6.02;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: ny, w: W - 2 * M, h: 0.82, fill: { color: "FBF1E0" }, line: { color: AMBER, width: 1 }, rectRadius: 0.08 });
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: ny + 0.16, w: 0.14, h: 0.5, fill: { color: AMBER }, line: { type: "none" } });
  s.addText([
    { text: "⚠ 注意： ", options: { bold: true, color: "B26A12" } },
    { text: "Console 実行では make run-apply のような確認プロンプトが出ません。APPLY_MODE=true にする前に、必ず Dry-Run（false）で対象を確認してください。", options: { color: INK } },
  ], { x: M + 0.35, y: ny, w: W - 2 * M - 0.7, h: 0.82, fontFace: JP, fontSize: 13, valign: "middle", margin: 0 });
}

// =====================================================================
// 14. 困ったとき / FAQ
// =====================================================================
{
  const s = contentBase("TROUBLESHOOTING ・ 困ったとき", "うまくいかないときは", 14);

  const faq = [
    ["対象ユーザーが表示されない", "対象サブアカウントに billing.admin の user: がいない場合は正常です。ドメイン指定時は、そのドメインの該当者がいない可能性も。", GREEN],
    ["ジョブが「失敗（FAILED）」になった", "まず make logs でログを確認。権限不足の場合は管理者に連絡してください（利用者側では解決できないことが多い）。", AMBER],
    ["権限エラー（403）が出る", "run.developer / storage.objectViewer が未付与の可能性。管理者にP.5〜6の権限付与を依頼してください。", DEEP],
    ["コマンドが難しい・打ちたくない", "方法C（Cloud Console のボタン操作）に切り替えれば、コマンドなしで実行できます。", TEAL],
  ];
  const cw = (W - 2 * M - 0.5) / 2, ch = 1.95;
  faq.forEach(([q, a, c], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 0.5), y = 2.15 + row * (ch + 0.35);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, fill: { color: WHITE }, line: { color: PANEL2, width: 1 }, rectRadius: 0.08, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.25, w: 0.16, h: ch - 0.5, fill: { color: c }, line: { type: "none" } });
    s.addText([{ text: "Q. ", options: { bold: true, color: c } }, { text: q, options: { bold: true, color: INK } }], { x: x + 0.4, y: y + 0.22, w: cw - 0.65, h: 0.7, fontFace: JP, fontSize: 15.5, valign: "top", margin: 0 });
    s.addText([{ text: "A. ", options: { bold: true, color: MUTED } }, { text: a, options: { color: MUTED } }], { x: x + 0.4, y: y + 0.92, w: cw - 0.65, h: 0.95, fontFace: JP, fontSize: 12.5, valign: "top", margin: 0 });
  });
}

// =====================================================================
// 15. まとめ / チートシート
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: TEAL }, line: { type: "none" } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.28, y: 0, w: 0.1, h: H, fill: { color: DEEP }, line: { type: "none" } });

  s.addText("CHEAT SHEET", { x: 1.0, y: 0.7, w: 8, h: 0.4, fontFace: JP, fontSize: 14, bold: true, color: SKY, charSpacing: 4, margin: 0 });
  s.addText("まとめ ― これだけ覚えればOK", { x: 1.0, y: 1.12, w: 11, h: 0.7, fontFace: JP, fontSize: 30, bold: true, color: WHITE, margin: 0 });

  // command cheat card
  const cx = 1.0, cy = 2.15, cw = 7.0, chh = 4.5;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: cy, w: cw, h: chh, fill: { color: "0E2233" }, line: { color: "1C7293", width: 1 }, rectRadius: 0.1 });
  s.addText("よく使うコマンド（方法A）", { x: cx + 0.4, y: cy + 0.25, w: cw - 0.8, h: 0.4, fontFace: JP, fontSize: 15, bold: true, color: SKY, margin: 0 });
  const cmds = [
    ["make run", "対象を確認（全顧客・変更なし）"],
    ["make run-domain DOMAINS=a.com", "対象を確認（特定ドメイン）"],
    ["make run-apply", "権限を変更（確認後に本番）"],
    ["make run-apply-domain DOMAINS=a.com", "特定ドメインだけ変更"],
    ["make logs", "直近の実行ログを表示"],
    ["make logs-list", "過去ログの一覧"],
    ["make logs FILE=<ファイル名>", "一覧から選んで表示"],
  ];
  let yy = cy + 0.85;
  cmds.forEach(([c, d]) => {
    s.addText(c, { x: cx + 0.4, y: yy, w: cw - 0.8, h: 0.32, fontFace: MONO, fontSize: 13.5, bold: true, color: CODEAC, margin: 0 });
    s.addText(d, { x: cx + 0.4, y: yy + 0.31, w: cw - 0.8, h: 0.28, fontFace: JP, fontSize: 11.5, color: "AFC4D2", margin: 0 });
    yy += 0.5;
  });

  // right: key points
  const rx = 8.4, rw = W - 0.9 - rx;
  const pts = [
    ["迷ったら方法C", "コマンド不要。Console のボタンで実行。", TEAL],
    ["まず確認", "make run / Dry-Run で対象を必ず先に見る。", DEEP],
    ["本番は yes", "run-apply は yes 入力でのみ変更。", AMBER],
    ["記録は残る", "実行は make logs と監査ログで追跡可能。", GREEN],
  ];
  let py = 2.15;
  const ph = 1.02;
  pts.forEach(([h, d, c]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: py, w: rw, h: ph - 0.16, fill: { color: "13344B" }, line: { type: "none" }, rectRadius: 0.08 });
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: py + 0.16, w: 0.14, h: ph - 0.48, fill: { color: c }, line: { type: "none" } });
    s.addText(h, { x: rx + 0.35, y: py + 0.13, w: rw - 0.6, h: 0.4, fontFace: JP, fontSize: 16, bold: true, color: WHITE, margin: 0 });
    s.addText(d, { x: rx + 0.35, y: py + 0.5, w: rw - 0.6, h: 0.35, fontFace: JP, fontSize: 12, color: "AFC4D2", margin: 0 });
    py += ph;
  });

  s.addText("詳細は README.md を参照してください。", { x: 1.0, y: 6.9, w: 11, h: 0.4, fontFace: JP, fontSize: 12, color: "5E86A0", margin: 0 });
}

pres.writeFile({ fileName: "billing-role-sync_利用ガイド.pptx" }).then((f) => console.log("WROTE", f));
