import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";

import { MarkerHeightController } from "./marker-height-controller.js";
import { createWaterSurface, updateWaterSurface } from "./water.js";
import { updateUnderwaterOverlay } from "./underwater-overlay.js";

const container = document.querySelector("#ar-container");
const startButton = document.querySelector("#start-button");
const resetButton = document.querySelector("#reset-button");
const statusText = document.querySelector("#status");

const TARGET_SRC = "./assets/targets/flood-marker.mind";

let mindarThree = null;
let renderer = null;
let scene = null;
let camera = null;
let anchor = null;
let water = null;
let clock = new THREE.Clock();
let heightController = new MarkerHeightController({ sampleDurationMs: 900, minSamples: 12 });
let lastScreenY = window.innerHeight * 0.50;
let arStarted = false;

startButton.addEventListener("click", startAR);
resetButton.addEventListener("click", resetWaterHeight);
window.addEventListener("resize", () => {
  if (renderer) renderer.setSize(window.innerWidth, window.innerHeight);
});

async function startAR() {
  if (arStarted) return;

  startButton.disabled = true;
  setStatus("AR起動中です。カメラ許可を求められたら許可してください。");

  try {
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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x255f7a, 1.25));

    const directional = new THREE.DirectionalLight(0xffffff, 1.0);
    directional.position.set(0.5, 1, 0.3);
    scene.add(directional);

    anchor = mindarThree.addAnchor(0);
    anchor.onTargetFound = () => {
      if (!heightController.locked) {
        setStatus("波マークを認識しました。水面高さをサンプリングしています…");
      } else {
        setStatus("波マークを再認識しました。水面高さは固定済みです。");
      }
    };
    anchor.onTargetLost = () => {
      if (heightController.locked) {
        setStatus("マーカーが外れても水面高さを保持しています。");
      } else {
        setStatus("波マークをカメラに映してください。");
      }
    };

    water = createWaterSurface();
    scene.add(water);

    await mindarThree.start();

    arStarted = true;
    startButton.textContent = "AR起動済み";
    resetButton.disabled = false;
    setStatus("波マークをカメラに映してください。");

    clock = new THREE.Clock();
    renderer.setAnimationLoop(renderLoop);
  } catch (error) {
    console.error(error);
    setStatus(
      "AR起動に失敗しました。HTTPS環境、カメラ許可、assets/targets/flood-marker.mind の有無を確認してください。"
    );
    startButton.disabled = false;
  }
}

function renderLoop() {
  const elapsedTime = clock.getElapsedTime();
  const nowMs = performance.now();

  const isMarkerVisible = Boolean(anchor?.group?.visible);
  if (isMarkerVisible && !heightController.locked) {
    heightController.updateFromAnchor(anchor.group, nowMs);
    const progress = Math.round(heightController.getProgress(nowMs) * 100);
    setStatus(`水面高さを測定中… ${progress}%`);
  }

  const state = heightController.getState();
  if (state.locked && typeof state.waterHeightWorld === "number") {
    updateWaterObject(state.waterHeightWorld, elapsedTime);

    if (isMarkerVisible) {
      lastScreenY = worldPointToScreenY(new THREE.Vector3(0, state.waterHeightWorld, -2.8));
    }

    updateUnderwaterOverlay(lastScreenY, elapsedTime, true);
    if (!isMarkerVisible) {
      setStatus("水面高さを保持中です。必要に応じて再設定できます。");
    }
  } else {
    if (water) water.visible = false;
    updateUnderwaterOverlay(lastScreenY, elapsedTime, false);
  }

  renderer.render(scene, camera);
}

function updateWaterObject(waterHeightWorld, elapsedTime) {
  if (!water) return;

  water.visible = true;
  water.position.set(0, waterHeightWorld, -2.8);
  water.rotation.set(-Math.PI / 2, 0, 0);

  updateWaterSurface(water, elapsedTime);
}

function worldPointToScreenY(worldPoint) {
  const projected = worldPoint.clone().project(camera);
  const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

  if (!Number.isFinite(y)) return lastScreenY;
  return Math.max(0, Math.min(window.innerHeight, y));
}

function resetWaterHeight() {
  heightController.reset();
  lastScreenY = window.innerHeight * 0.50;
  if (water) water.visible = false;
  updateUnderwaterOverlay(lastScreenY, clock.getElapsedTime(), false);
  setStatus("水面高さを再設定します。波マークをカメラに映してください。");
}

function setStatus(message) {
  if (statusText && statusText.textContent !== message) {
    statusText.textContent = message;
  }
}
