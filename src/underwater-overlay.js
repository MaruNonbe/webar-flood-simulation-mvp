const overlay = document.querySelector("#underwater-overlay");
const caustics = document.querySelector("#caustics-overlay");
const waterLine = document.querySelector("#water-line");
const waveBack = document.querySelector("#wave-path-back");
const waveFront = document.querySelector("#wave-path-front");

let lastY = window.innerHeight * 0.52;

export function updateUnderwaterOverlay(screenY, elapsedTime, visible) {
  if (!overlay || !waterLine || !waveBack || !waveFront) return;

  if (!visible) {
    overlay.style.opacity = "0";
    waterLine.style.opacity = "0";
    if (caustics) caustics.style.opacity = "0";
    return;
  }

  const targetY = clamp(screenY, 0, window.innerHeight);
  lastY += (targetY - lastY) * 0.12;

  overlay.style.opacity = "1";
  overlay.style.top = `${lastY}px`;
  overlay.style.height = `${window.innerHeight - lastY}px`;

  if (caustics) {
    caustics.style.opacity = "0.30";
    caustics.style.clipPath = `inset(${lastY}px 0 0 0)`;
    caustics.style.backgroundPosition = `${elapsedTime * 16}px ${elapsedTime * 8}px, ${-elapsedTime * 11}px ${elapsedTime * 6}px`;
  }

  waterLine.style.opacity = "1";
  waterLine.style.top = `${lastY}px`;

  const d1 = buildWavePath(1200, 96, 10, elapsedTime * 1.15, 0);
  const d2 = buildWavePath(1200, 96, 7, elapsedTime * 1.42, 0.8);
  waveBack.setAttribute("d", d1);
  waveFront.setAttribute("d", d2);
}

function buildWavePath(width, height, amp, phase, offset) {
  const mid = height / 2;
  const step = 96;
  let d = `M0,${mid}`;

  for (let x = 0; x <= width; x += step) {
    const x1 = x + step / 2;
    const x2 = x + step;
    const y1 = mid + Math.sin((x / width) * Math.PI * 6 + phase + offset) * amp;
    const y2 = mid + Math.sin((x2 / width) * Math.PI * 6 + phase + offset) * amp;
    d += ` Q${x1},${y1.toFixed(2)} ${x2},${y2.toFixed(2)}`;
  }

  return d;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
