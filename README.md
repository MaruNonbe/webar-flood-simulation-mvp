# WebAR 浸水シミュレーション MVP v2

## 概要

この版は、過去に成功している **getUserMedia 直接カメラ表示方式** を使った安全版です。

第2段階として、ARマーカー認識はまだ使わず、スマホのカメラ映像に以下を重ねます。

- 水面ライン
- 水面下の水色半透明フィルター
- 水中の光の揺らぎ
- 水面高さの手動調整
- 「この高さに固定」ボタン

## 使っていないもの

黒画面や読み込み停止を避けるため、この版では以下を使っていません。

- MindAR
- AR.js
- Three.js
- flood-marker.mind
- 外部CDN
- 3D水面Plane
- 画像ターゲット認識

## ファイル構成

```text
webar-flood-stable-mvp-v2/
├─ index.html
└─ README.md
```

## GitHub Pagesへのアップロード

1. GitHub Desktopで対象リポジトリを開く
2. 既存の `index.html` をこの版の `index.html` で上書き
3. `README.md` をこの版の `README.md` で上書き
4. Summary に以下を入力

```text
Update to stable manual water height MVP v2
```

5. `Commit to main`
6. `Push origin`

## スマホでの確認

GitHub PagesのURLを開きます。

例：

```text
https://marunonbe.github.io/webar-flood-stable-test/?v=2
```

確認手順：

1. Chrome または Safari で開く
2. 「カメラ開始」を押す
3. カメラを許可する
4. カメラ映像が出ることを確認
5. 水面ラインを標識の波マークに合わせる
6. 「この高さに固定」を押す

## 黒画面の場合

まず Chrome で確認してください。

表示ステータスで以下が出ればカメラ取得は成功です。

```text
video要素: あり
readyState: 4
videoSize: 720 x 1280 など
paused: false
srcObject: あり
secureContext: OK
```

それでも黒い場合は以下を確認してください。

- GitHub PagesのHTTPS URLで開いているか
- カメラ許可を拒否していないか
- 古いURLキャッシュを読んでいないか
- `?v=2` などを付けて再読み込みしたか
- SafariでだめならChromeで試したか

## 次の段階

このv2が安定したら、次は次のどちらかに進みます。

### A案：手動方式の完成度を上げる

- 水表現をさらにリアルにする
- 水面ラインをより自然にする
- 水色の濃さ調整を追加
- 説明パネルを非表示にするボタンを追加
- 体験者向けUIに整える

### B案：MindARを別ページに追加する

- `marker.html` など別ページで実験
- 成功版の `index.html` は壊さない
- マーカー認識が安定してから統合する

おすすめは **A案で手動方式を完成させてから、B案へ進む** ことです。
