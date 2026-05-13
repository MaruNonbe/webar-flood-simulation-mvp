import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export class MarkerHeightController {
  constructor({ sampleDurationMs = 900, minSamples = 12 } = {}) {
    this.sampleDurationMs = sampleDurationMs;
    this.minSamples = minSamples;
    this.reset();
  }

  reset() {
    this.locked = false;
    this.sampling = false;
    this.startedAt = 0;
    this.samples = [];
    this.waterHeightWorld = null;
    this.lastMarkerWorldPosition = new THREE.Vector3();
  }

  updateFromAnchor(anchorGroup, nowMs) {
    if (this.locked || !anchorGroup?.visible) return this.getState();

    const position = new THREE.Vector3();
    anchorGroup.getWorldPosition(position);
    this.lastMarkerWorldPosition.copy(position);

    if (!this.sampling) {
      this.sampling = true;
      this.startedAt = nowMs;
      this.samples = [];
    }

    this.samples.push(position.y);

    const elapsed = nowMs - this.startedAt;
    if (elapsed >= this.sampleDurationMs && this.samples.length >= this.minSamples) {
      this.waterHeightWorld = robustAverage(this.samples);
      this.locked = true;
      this.sampling = false;
    }

    return this.getState();
  }

  getProgress(nowMs) {
    if (!this.sampling) return 0;
    return Math.max(0, Math.min(1, (nowMs - this.startedAt) / this.sampleDurationMs));
  }

  getState() {
    return {
      locked: this.locked,
      sampling: this.sampling,
      sampleCount: this.samples.length,
      waterHeightWorld: this.waterHeightWorld,
      lastMarkerWorldPosition: this.lastMarkerWorldPosition.clone(),
    };
  }
}

function robustAverage(values) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const trim = Math.floor(sorted.length * 0.18);
  const trimmed = sorted.slice(trim, sorted.length - trim || sorted.length);
  const target = trimmed.length ? trimmed : sorted;
  const total = target.reduce((sum, value) => sum + value, 0);

  return total / target.length;
}
