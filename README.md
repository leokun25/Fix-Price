# 料金表 Web アプリ（Square 商品 CSV 連携）

Next.js (App Router, TypeScript) + Tailwind で構築した料金表アプリです。Square の商品 CSV をアップロードすると、料金表（タイル式 UI）が自動更新されます。

- **デプロイ**: Vercel
- **DB**: Supabase
- **在庫連携**: なし（価格のみ利用）

## 機能

- **トップ**: ブランド一覧（タイル）
- **ブランド詳細**: 機種一覧（タイル）
- **機種詳細**: パーツ一覧（グループ別）、行クリックで詳細モーダル・コピー
- **検索**: 機種名・パーツ名で横断検索（Fuse.js）
- **お客様用表示**: `?mode=customer` で余計な情報を隠し、価格を大きく表示
- **管理画面** (`/admin`): 簡易パスワード認証で CSV アップロード

## セットアップ手順

### 1. Supabase でプロジェクト作成

1. [Supabase](https://supabase.com) でプロジェクトを作成する。
2. **SQL Editor** を開き、`supabase/schema.sql` の内容を実行する。
3. **Settings → API** で Project URL と anon key を控える。

### 2. 環境変数

```bash
cp .env.example .env.local
```

`.env.local` に設定する項目:

- `NEXT_PUBLIC_SUPABASE_URL` … Supabase の Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` … Supabase の anon key
- `ADMIN_PASSWORD` … 管理画面用パスワード

### 3. 開発サーバー起動

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開く。

### 4. Vercel デプロイ

1. Vercel にリポジトリをインポートする。
2. Environment Variables に上記 3 つを追加する。
3. デプロイを実行する。

## CSV 仕様（Square 商品 CSV）

利用する列: トークン / 商品名（表示するパーツ名）/ カテゴリ（階層の正）/ 価格（円）/ アーカイブ済み。カテゴリは 3 階層・先頭カンマ・1 セル複数カテゴリに対応。対象: カテゴリ 2 階層以上・価格有効・アーカイブ済み≠Y。

## リポジトリ構成

```
src/
  app/           # ページ・API
  lib/           # CSV 正規化・Supabase・データ取得
supabase/
  schema.sql     # DB スキーマ
.env.example
README.md
```
