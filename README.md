# WebAR 浸水シミュレーション MVP

MindAR.js + Three.js + HTML/CSS/JavaScript で作成した、WebAR浸水シミュレーションのMVP版です。

## できること

- iPhone Safari / Android Chrome のブラウザ動作を想定
- 浸水高さ標識の波マークを画像ターゲットとして認識
- 認識したマーカーの高さを約0.9秒サンプリングして水面高さとして固定
- マーカーが画面外に出ても、最後に取得した水面ラインを保持
- Three.jsの軽量ShaderMaterialで、少し波立つ水面を表示
- 水面ラインより下に水色の半透明フィルターを表示
- 波打つ水面ラインをSVGで表示
- 「水面高さを再設定」ボタン付き

## 重要な注意

このMVPは、画像マーカーAR方式です。ARKit/ARCoreのような本格的な空間トラッキングではありません。
そのため、マーカーが画面外に出たあとに端末を大きく動かすと、実空間と水面の一致は弱くなります。
ただし、添付参考画像のような「水面より下が水中に見える」演出は、画面合成で安定して見せる設計です。

## ファイル構成

```text
webar-flood-simulation-mvp/
├─ index.html
├─ src/
│  ├─ styles.css
│  ├─ main.js
│  ├─ water.js
│  ├─ underwater-overlay.js
│  └─ marker-height-controller.js
├─ assets/
│  ├─ targets/
│  │  ├─ flood-marker-source.png
│  │  └─ PLACE_FLOOD_MARKER_MIND_HERE.txt
│  └─ textures/
└─ README.md
```

## 必ず必要な作業：flood-marker.mind の作成

このZIPには、実際の浸水高さ標識から作成した `flood-marker.mind` は入っていません。
実際に使用する波マーク画像から、MindAR用ターゲットファイルを作成してください。

作成後、以下に配置します。

```text
assets/targets/flood-marker.mind
```

### ターゲット画像のおすすめ条件

- 波マークだけでなく、周囲の文字・枠・数字なども少し含める
- 特徴点が多い画像にする
- 単色・単純すぎる波線だけを切り抜かない
- 画像は正面から撮影し、ブレや反射を避ける
- PNGまたはJPGで用意する

波マークだけだと画像認識が不安定になる可能性があります。浸水高さ標識全体、または波マーク＋周囲の目盛り・文字を含める方が安定します。

## ローカル確認方法

ブラウザのカメラ機能は、基本的にHTTPS環境またはlocalhostで動きます。

PCで簡易確認する場合：

```powershell
cd path\to\webar-flood-simulation-mvp
python -m http.server 8080
```

その後、PCブラウザで開きます。

```text
http://localhost:8080
```

スマホ実機で確認する場合は、HTTPSで公開してください。

## Xserver等へのアップロード手順

1. `webar-flood-simulation-mvp` フォルダをサーバーにアップロード
2. `assets/targets/flood-marker.mind` を配置
3. HTTPSのURLで `index.html` を開く
4. カメラ許可をON
5. 浸水高さ標識の波マークを映す
6. 水面高さが固定されたら、端末を少し上下に動かして見え方を確認

## 実機確認のポイント

- iPhoneはSafariで確認
- AndroidはChromeで確認
- 省電力モードはOFF推奨
- 明るい環境でマーカーを映す
- マーカーが小さすぎる場合は、カメラに近づける
- 水面高さ固定後にズレる場合は「水面高さを再設定」を押す

## リアル化の次ステップ

MVP確認後、次の改善を追加すると参考画像に近づきます。

1. 実際の水面ノーマルマップを使った反射表現
2. 水面下の揺らぎシェーダー強化
3. 泡・浮遊粒子の追加
4. 水面ライン周辺の白い反射ハイライト強化
5. マーカー高さの平均化時間を端末ごとに調整
6. 可能ならWebXR Hit TestやARKit/ARCore系の空間認識方式への拡張

## 開発メモ

使用CDN：

- Three.js `0.160.0`
- MindAR.js `1.2.5`

8th Wallは使用していません。
