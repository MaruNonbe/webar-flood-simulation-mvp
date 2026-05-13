import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";

import { createWaterSurface, updateWaterSurface } from "./water.js";
import { updateUnderwaterOverlay } from "./underwater-overlay.js";
import {
  createHeightSampler,
  resetHeightSampler,
  sampleMarkerHeight,
} from "./marker-height-controller.js";

const TARGET_SRC = "./assets/targets/flood-marker.mind";

const container = document.querySelector("#ar-container");
const startButton = document.querySelector("#start-button");
const resetButton = document.querySelector("#reset-button");
const statusText = document.querySelector("#status");

let mindarThree = null;
let renderer = null;
let scene = null;
let camera = null;
let anchor = null;

let water = null;
let arStarted = false;
let markerLocked = false;
let waterHeightWorld = null;

const clock = new THREE.Clock();
let heightSampler = createHeightSampler();

function setStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

async function startAR() {
  if (arStarted) return;

  if (!container) {
    alert("ar-container が見つかりません。index.htmlを確認してください。");
    return;
  }

  startButton.disabled = true;
  setStatus("AR起動中です。カメラ許可を求められたら許可してください。");

  try {
    // flood-marker.mind が存在するか先に確認
    const targetCheck = await fetch(TARGET_SRC, { cache: "no-store" });

    if (!targetCheck.ok) {
      throw new Error(
        `MindARターゲットが見つかりません。\n${TARGET_SRC}\nstatus=${targetCheck.status}`
      );
    }

    mindarThree = new MindARThree({
      container,
      imageTargetSrc: TARGET_SRC,
      maxTrack: 1,
      filterMinCF: 0.0001,
      filterBeta: 0.001,
      uiScanning: "yes",
      uiLoading: "yes",
      uiError: "yes",
    });

    renderer = mindarThree.renderer;
    scene = mindarThree.scene;
    camera = mindarThree.camera;

    // 重要：Three.js Canvasが黒背景でカメラ映像を隠さないようにする
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = true;

    if (renderer.domElement) {
      renderer.domElement.style.background = "transparent";
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.zIndex = "2";
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // ライト
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x447788, 1.2);
    scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
    directionalLight.position.set(1, 2, 1);
    scene.add(directionalLight);

    // マーカー
    anchor = mindarThree.addAnchor(0);

    anchor.onTargetFound = () => {
      if (!markerLocked) {
        setStatus("波マークを認識しました。水面高さを計測中です。");
      } else {
        setStatus("波マークを再認識しました。水面高さは保持中です。");
      }
    };

    anchor.onTargetLost = () => {
      if (markerLocked) {
        setStatus("マーカーが画面外です。水面高さは保持しています。");
      } else {
        setStatus("波マークをカメラ中央に映してください。");
      }
    };

    // 水面
    water = createWaterSurface();
    water.visible = false;
    scene.add(water);

    await mindarThree.start();

    arStarted = true;
    resetButton.disabled = false;

    setStatus(
      "ARを開始しました。\n浸水高さ標識の黒枠・波マーク・2.0m部分をカメラに映してください。"
    );

    renderer.setAnimationLoop(renderLoop);
  } catch (error) {
    console.error(error);

    setStatus(
      "AR起動に失敗しました。\n" +
        "確認してください：\n" +
        "1. flood-marker.mind が assets/targets/ にあるか\n" +
        "2. GitHub PagesのURLで開いているか\n" +
        "3. Safari/Chromeでカメラ許可しているか\n\n" +
        String(error.message || error)
    );

    startButton.disabled = false;
  }
}

function renderLoop() {
  const elapsed = clock.elapsedTime;

  if (!renderer || !scene || !camera) return;

  if (anchor && anchor.group && anchor.group.visible && !markerLocked) {
    const markerWorldPosition = new THREE.Vector3();
    anchor.group.getWorldPosition(markerWorldPosition);

    const result = sampleMarkerHeight(heightSampler, markerWorldPosition.y);

    setStatus(
      `水面高さを計測中です。\nサンプル数: ${result.count}\n波マークをなるべく動かさず映してください。`
    );

    if (result.ready) {
      waterHeightWorld = result.height;
      markerLocked = true;

      setStatus(
        `水面高さを固定しました。\nY=${waterHeightWorld.toFixed(
          3
        )}\nマーカーが画面外になっても保持します。`
      );
    }
  }

  if (waterHeightWorld !== null && water) {
    water.visible = true;

    // 水面を水平面として固定
    water.position.set(0, waterHeightWorld, -3);
    water.rotation.x = -Math.PI / 2;

    updateWaterSurface(water, elapsed);

    const screenY = worldYToScreenY(waterHeightWorld);
    updateUnderwaterOverlay(screenY, elapsed, true);
  } else {
    updateUnderwaterOverlay(window.innerHeight * 0.5, elapsed, false);
  }

  renderer.render(scene, camera);
}

function worldYToScreenY(worldY) {
  if (!camera) return window.innerHeight * 0.5;

  const worldPoint = new THREE.Vector3(0, worldY, -3);
  const projected = worldPoint.project(camera);

  const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

  if (!Number.isFinite(y)) {
    return window.innerHeight * 0.5;
  }

  return Math.max(0, Math.min(window.innerHeight, y));
}

function resetWaterHeight() {
  markerLocked = false;
  waterHeightWorld = null;
  heightSampler = resetHeightSampler();

  if (water) {
    water.visible = false;
  }

  updateUnderwaterOverlay(window.innerHeight * 0.5, clock.elapsedTime, false);

  setStatus("水面高さを再設定します。波マークをもう一度カメラに映してください。");
}

startButton.addEventListener("click", startAR);
resetButton.addEventListener("click", resetWaterHeight);

window.addEventListener("resize", () => {
  if (renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
});