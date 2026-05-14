(() => {
  const OK_DEG = 8;
  const WARN_DEG = 15;
  const MAX_UI_DEG = 25;

  let currentBeta = null;
  let currentGamma = null;
  let baseBeta = null;
  let baseGamma = null;
  let sensorStarted = false;
  let debugVisible = false;

  const guide = document.getElementById("postureGuide");
  const bubble = document.getElementById("postureBubble");
  const statusEl = document.getElementById("postureStatus");
  const debugEl = document.getElementById("postureDebug");
  const startBtn = document.getElementById("postureStartBtn");
  const calibrateBtn = document.getElementById("postureCalibrateBtn");
  const toggleDebugBtn = document.getElementById("postureToggleDebug");

  if (!guide || !bubble || !statusEl || !debugEl || !startBtn || !calibrateBtn) {
    console.warn("[PostureGuide] UI elements not found. Posture guide disabled.");
    return;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function setGuideState(state) {
    guide.classList.remove("posture-ok", "posture-warn", "posture-danger");

    if (state === "ok") guide.classList.add("posture-ok");
    if (state === "warn") guide.classList.add("posture-warn");
    if (state === "danger") guide.classList.add("posture-danger");
  }

  function setBubbleColor(color) {
    bubble.style.background = color;
    bubble.style.boxShadow = `0 0 10px ${color}`;
  }

  async function requestOrientationPermissionIfNeeded() {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      const permission = await DeviceOrientationEvent.requestPermission();

      if (permission !== "granted") {
        throw new Error("Device orientation permission was not granted.");
      }
    }
  }

  function startSensor() {
    if (sensorStarted) {
      statusEl.textContent = "傾きセンサーは開始済みです";
      return;
    }

    window.addEventListener("deviceorientation", handleOrientation, true);
    sensorStarted = true;

    statusEl.textContent = "スマホを見やすい角度にして基準設定してください";
  }

  function handleOrientation(event) {
    if (event.beta == null || event.gamma == null) {
      statusEl.textContent = "傾きセンサー値を取得できません";
      return;
    }

    currentBeta = event.beta;
    currentGamma = event.gamma;

    if (baseBeta === null || baseGamma === null) {
      baseBeta = currentBeta;
      baseGamma = currentGamma;
    }

    updateGuide();
  }

  function updateGuide() {
    if (currentBeta === null || currentGamma === null) {
      return;
    }

    const diffBeta = currentBeta - baseBeta;
    const diffGamma = currentGamma - baseGamma;

    const x = clamp(diffGamma, -MAX_UI_DEG, MAX_UI_DEG) / MAX_UI_DEG;
    const y = clamp(diffBeta, -MAX_UI_DEG, MAX_UI_DEG) / MAX_UI_DEG;

    bubble.style.transform =
      `translate(calc(-50% + ${x * 28}px), calc(-50% + ${y * 28}px))`;

    const absBeta = Math.abs(diffBeta);
    const absGamma = Math.abs(diffGamma);
    const maxTilt = Math.max(absBeta, absGamma);

    let message = "その角度でOKです";
    let color = "#00e676";
    let state = "ok";

    if (maxTilt > WARN_DEG) {
      color = "#ff5252";
      state = "danger";

      if (absGamma > absBeta) {
        message = diffGamma > 0
          ? "少し右へ傾いています"
          : "少し左へ傾いています";
      } else {
        message = diffBeta > 0
          ? "前後方向に大きく傾いています"
          : "スマホをもう少し立ててください";
      }
    } else if (maxTilt > OK_DEG) {
      color = "#ffd740";
      state = "warn";

      if (absGamma > absBeta) {
        message = diffGamma > 0
          ? "少し右に傾いています"
          : "少し左に傾いています";
      } else {
        message = "スマホの角度を少し調整してください";
      }
    }

    setBubbleColor(color);
    setGuideState(state);
    statusEl.textContent = message;

    debugEl.innerHTML =
      `beta: ${currentBeta.toFixed(1)} / gamma: ${currentGamma.toFixed(1)}<br>` +
      `diffBeta: ${diffBeta.toFixed(1)} / diffGamma: ${diffGamma.toFixed(1)}`;
  }

  startBtn.addEventListener("click", async () => {
    try {
      if (typeof DeviceOrientationEvent === "undefined") {
        statusEl.textContent = "この端末では傾きセンサーを利用できません";
        return;
      }

      await requestOrientationPermissionIfNeeded();
      startSensor();
    } catch (error) {
      console.error("[PostureGuide]", error);
      statusEl.textContent = "傾きセンサーを開始できませんでした。手動でスマホを縦に持ってください。";
    }
  });

  calibrateBtn.addEventListener("click", () => {
    if (currentBeta === null || currentGamma === null) {
      statusEl.textContent = "まだ傾き値を取得できていません";
      return;
    }

    baseBeta = currentBeta;
    baseGamma = currentGamma;

    statusEl.textContent = "この角度を基準にしました";
    updateGuide();
  });

  if (toggleDebugBtn) {
    toggleDebugBtn.addEventListener("click", () => {
      debugVisible = !debugVisible;
      debugEl.classList.toggle("hidden", !debugVisible);
      toggleDebugBtn.textContent = debugVisible ? "閉じる" : "詳細";
    });
  }

  // センサー非対応時の初期案内
  if (typeof DeviceOrientationEvent === "undefined") {
    statusEl.textContent = "傾きセンサー非対応です。スマホを縦に持ってください。";
  }
})();