/**
 * Dead Reckoning Service
 * 
 * Estimates the user's position between QR scans using:
 * - Accelerometer (step detection via motion magnitude)
 * - Compass heading (DeviceOrientationEvent)
 * 
 * Every time a QR is scanned, position resets to exact GPS.
 * Between scans, position is updated by detected steps × stride × heading.
 */

export interface Position {
  lat: number;
  lng: number;
  accuracy: 'exact' | 'estimated'; // 'exact' = from QR, 'estimated' = dead reckoning
  stepCount: number;
}

// Average human stride length in meters
const STRIDE_LENGTH = 0.75;

// 1 meter in degrees latitude (roughly constant globally)
const METERS_PER_LAT_DEGREE = 111320;

export class DeadReckoning {
  private position: Position | null = null;
  private heading: number = 0; // compass degrees, 0 = North
  private lastAccel = { x: 0, y: 0, z: 0 };
  private stepThreshold = 12; // m/s² magnitude change to count as a step
  private lastStepTime = 0;
  private minStepInterval = 300; // ms, prevents counting one footfall as multiple steps

  private motionListener: ((e: DeviceMotionEvent) => void) | null = null;
  private orientationListener: ((e: DeviceOrientationEvent) => void) | null = null;
  private onPositionUpdate: ((pos: Position) => void) | null = null;

  start(onUpdate: (pos: Position) => void) {
    this.onPositionUpdate = onUpdate;

    // ── Compass heading ──
    this.orientationListener = (e: DeviceOrientationEvent) => {
      const h = (e as any).webkitCompassHeading ?? (e.alpha !== null ? (360 - e.alpha) % 360 : null);
      if (h !== null) this.heading = h;
    };
    window.addEventListener('deviceorientation', this.orientationListener, true);

    // ── Step detection via accelerometer ──
    this.motionListener = (e: DeviceMotionEvent) => {
      const accel = e.accelerationIncludingGravity;
      if (!accel || accel.x === null || accel.y === null || accel.z === null) return;

      const dx = accel.x! - this.lastAccel.x;
      const dy = accel.y! - this.lastAccel.y;
      const dz = accel.z! - this.lastAccel.z;
      const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);

      this.lastAccel = { x: accel.x!, y: accel.y!, z: accel.z! };

      const now = Date.now();
      if (magnitude > this.stepThreshold && now - this.lastStepTime > this.minStepInterval) {
        this.lastStepTime = now;
        this.onStep();
      }
    };
    window.addEventListener('devicemotion', this.motionListener);
  }

  stop() {
    if (this.orientationListener) window.removeEventListener('deviceorientation', this.orientationListener, true);
    if (this.motionListener) window.removeEventListener('devicemotion', this.motionListener);
  }

  /**
   * Call this every time a QR code is scanned — resets to exact known position
   */
  resetToExact(lat: number, lng: number) {
    this.position = { lat, lng, accuracy: 'exact', stepCount: 0 };
    this.onPositionUpdate?.(this.position);
  }

  /**
   * Called on each detected step — moves position forward by one stride
   * in the current compass heading direction
   */
  private onStep() {
    if (!this.position) return;

    const headingRad = (this.heading * Math.PI) / 180;

    // Convert stride in meters to lat/lng delta
    const deltaLat = (Math.cos(headingRad) * STRIDE_LENGTH) / METERS_PER_LAT_DEGREE;

    // Longitude degrees per meter varies with latitude
    const metersPerLngDegree = METERS_PER_LAT_DEGREE * Math.cos((this.position.lat * Math.PI) / 180);
    const deltaLng = (Math.sin(headingRad) * STRIDE_LENGTH) / metersPerLngDegree;

    this.position = {
      lat: this.position.lat + deltaLat,
      lng: this.position.lng + deltaLng,
      accuracy: 'estimated',
      stepCount: this.position.stepCount + 1,
    };

    this.onPositionUpdate?.(this.position);
  }

  getPosition(): Position | null {
    return this.position;
  }

  getHeading(): number {
    return this.heading;
  }
}