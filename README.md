# WebAR 浸水深シミュレーション v2.5

## 概要

この版は **マーカーなし正式版** です。

過去に成功している **getUserMedia 直接カメラ表示方式** を採用し、MindAR / AR.js / Three.js を使わずに、スマホカメラ映像へ浸水表現を重ねます。

## 目的

iPhone / Android のブラウザで、浸水高さを分かりやすく体験できるページを作ることです。

使い方はシンプルです。

1. QRコードなどからページを開く
2. カメラ開始
3. 浸水高さ標識や対象物にスマホを向ける
4. 水面ラインを手動で合わせる
5. この高さに固定
6. 体験開始

## v2.5 の特徴

- マーカーなし
- 外部ライブラリなし
- `index.html` 1ファイルで動作
- getUserMediaでカメラ映像を直接表示
- 水面ライン
- 水面下の水色半透明フィルター
- 波の揺れ
- 水の濃さ調整
- 波の強さ調整
- 水面高さの手動調整
- 体験開始ボタン
- 操作パネル非表示
- 右下の「操作」ボタンで復帰

## 使っていないもの

安定性を優先するため、この版では以下を使っていません。

- MindAR
- AR.js
- Three.js
- flood-marker.mind
- 画像ターゲット認識
- 3D水面Plane
- 外部CDN

## ファイル構成

```text
webar-flood-depth-no-marker-v2-5/
├─ index.html
└─ README.md
```

## GitHub Pagesへのアップロード

1. GitHub Desktopで対象リポジトリを開く
2. 既存の `index.html` をこの版の `index.html` で上書き
3. `README.md` をこの版の `README.md` で上書き
4. Summary に以下を入力

```text
Release no marker flood depth simulation v2.5
```

5. `Commit to main`
6. `Push origin`

## スマホでの確認URL

例：

```text
https://marunonbe.github.io/webar-flood-stable-test/?v=25
```

## 確認手順

1. ChromeまたはSafariで開く
2. 「カメラ開始」を押す
3. カメラを許可する
4. カメラ映像が表示されることを確認
5. 水面↑ / 水面↓ / スライダーで水面位置を合わせる
6. 必要に応じて水の濃さ・波の強さを調整
7. 「この高さに固定」を押す
8. 「体験開始」を押す
9. 右下の「操作」でパネルを戻す

## 黒画面の場合

まずChromeで確認してください。

確認項目：

- GitHub PagesのHTTPS URLで開いているか
- カメラ許可を拒否していないか
- 端末のカメラが他アプリで使われていないか
- URL末尾に `?v=25` を付けて再読み込みしたか
- SafariでだめならChromeで試したか

## 今後の発展案

このマーカーなし方式を正式版として使いながら、必要に応じて別ページでマーカー認識を試すのがおすすめです。

おすすめ構成：

```text
index.html        → マーカーなし正式版
marker-test.html  → MindAR実験版
```

正式運用ページを壊さずに、実験版だけでマーカー認識を検証できます。
