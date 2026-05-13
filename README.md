# WebAR 浸水シミュレーション MVP

このMVPは、iPhone Safari / Android Chromeで黒画面になりにくい構成を優先した、浸水高さシミュレーションの第1段階です。

## 方針

この版では、安定動作を優先するため、以下は使っていません。

- MindAR
- AR.js
- Three.js
- flood-marker.mind
- 画像ターゲット認識
- 3D水面Plane
- 複雑なシェーダー

まず、`navigator.mediaDevices.getUserMedia` でスマホのカメラ映像を直接 `video` 要素に表示します。
その上に、以下の表現をHTML/CSS/SVG/JavaScriptだけで重ねます。

- 波打つ水面ライン
- 水面下の水色半透明フィルター
- 水中の光の揺らぎ風オーバーレイ
- 水面高さ調整UI
- 水表現ON/OFF

## ファイル構成

```text
webar-flood-simulation-mvp/
├─ index.html
└─ README.md
```

## GitHub Pagesへのアップロード手順

1. GitHub Desktopでリポジトリを開きます。
2. 既存の `index.html` を、このMVP版の `index.html` で上書きします。
3. `README.md` も必要に応じて上書きします。
4. GitHub Desktopの `Changes` に変更が出ていることを確認します。
5. Summaryに以下のように入力します。

```text
Replace with stable getUserMedia MVP
```

6. `Commit to main` を押します。
7. `Push origin` を押します。
8. GitHub Pagesの公開URLを開きます。

例：

```text
https://marunonbe.github.io/webar-flood-simulation-mvp/
```

キャッシュが残る場合は、以下のようにURL末尾にパラメータを付けます。

```text
https://marunonbe.github.io/webar-flood-simulation-mvp/?v=stable1
```

## スマホでの確認手順

1. iPhoneはSafari、AndroidはChromeでGitHub PagesのURLを開きます。
2. 画面下にUIパネルが表示されることを確認します。
3. `カメラ開始` を押します。
4. カメラ使用を求められたら許可します。
5. カメラ映像が表示されるか確認します。
6. 水面ラインが少し波打つことを確認します。
7. 水面ラインより下に水色の半透明フィルターがかかることを確認します。
8. スライダーまたは `水面↑` / `水面↓` で水面位置を調整します。
9. `水表現ON/OFF` で水表現が切り替わることを確認します。

## HTTPSについて

スマホブラウザでカメラを使うには、基本的にHTTPSが必要です。
GitHub PagesはHTTPSで公開されるため、テストに向いています。

NG例：

```text
http://example.com/
```

OK例：

```text
https://marunonbe.github.io/webar-flood-simulation-mvp/
```

## 黒画面になった場合の確認項目

### 1. UIが表示されているか

UIが表示されている場合、HTML/CSSは読み込めています。
カメラ映像が黒い場合は、カメラ許可や端末側の問題を確認します。

UIも表示されない場合は、以下を確認してください。

- `index.html` が正しくアップロードされているか
- GitHub Desktopで `Push origin` まで行ったか
- GitHub PagesのURLを開いているか
- GitHubのコード画面を開いていないか
- Safari/Chromeのキャッシュが残っていないか

### 2. GitHub PagesのURLで開いているか

OK：

```text
https://marunonbe.github.io/webar-flood-simulation-mvp/
```

NG：

```text
https://github.com/MaruNonbe/webar-flood-simulation-mvp
```

### 3. HTTPSで開いているか

カメラ起動にはHTTPSが必要です。
`http://` ではカメラが使えない場合があります。

### 4. カメラ許可

iPhone Safariの場合：

```text
設定
↓
Safari
↓
カメラ
↓
確認 または 許可
```

または、Safariのアドレスバー周辺からWebサイト設定を開き、カメラ許可を確認します。

Android Chromeの場合：

```text
アドレスバー左の鍵マーク
↓
サイトの設定
↓
カメラ
↓
許可
```

### 5. 他のアプリがカメラを使っていないか

カメラアプリ、Zoom、LINE、Instagramなどがカメラを使用中の場合、ブラウザ側で映像取得に失敗することがあります。

### 6. エラー名ごとの目安

- `NotAllowedError`: カメラ許可が拒否されています。
- `NotFoundError`: カメラが見つかりません。
- `NotReadableError`: 他のアプリがカメラを使用している可能性があります。
- HTTPSではないという表示: GitHub PagesなどのHTTPS URLで開いてください。

## 第2段階でMindARを追加する場合

第1段階で、iPhone/Androidともに以下が成功してからMindARを追加します。

- カメラ映像が表示される
- 水面ラインが表示される
- 水面下に水色フィルターがかかる
- 水面高さを手動調整できる

その後の方針：

1. 現在の `getUserMedia` 直接表示版をバックアップします。
2. 別ブランチまたは別フォルダーでMindAR版を作ります。
3. 浸水高さ標識の黒枠・波マーク・2.0m部分を画像ターゲット化します。
4. `flood-marker.mind` を作成します。
5. MindARでマーカー認識だけを先に確認します。
6. マーカー認識成功後、現在の水面ライン位置をマーカー高さに連動させます。
7. Three.jsの3D水面Planeは最後に追加します。

## 開発上の注意

第1段階では、安定性を優先します。
黒画面や読み込み停止の原因を増やさないため、外部ライブラリは使用しません。

まずは1ファイルの `index.html` で、スマホカメラが確実に映ることを確認してください。
