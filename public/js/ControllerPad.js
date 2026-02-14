export class ControllerPad {
  constructor(canvas, onPull) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.onPull = onPull;
    this.side = null;
    this.pull = { x: 0, y: 0 };
    this.dragging = false;

    if (canvas) this.bindEvents();
  }

  setSide(side) {
    this.side = side;
    this.pull = side === 'left' ? { x: -0.8, y: 0 } : { x: 0.8, y: 0 };
    this.draw();
  }

  bindEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.applyPointer(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      this.applyPointer(e.clientX, e.clientY);
    });

    const stop = () => {
      this.dragging = false;
    };
    this.canvas.addEventListener('pointerup', stop);
    this.canvas.addEventListener('pointercancel', stop);
    this.canvas.addEventListener('pointerleave', stop);
  }

  applyPointer(clientX, clientY) {
    const p = this.normalizePadPoint(clientX, clientY);
    if (!p) return;
    this.pull = p;
    this.draw();
    if (this.onPull) this.onPull(p);
  }

  normalizePadPoint(clientX, clientY) {
    if (!this.canvas || !this.side) return null;

    const rect = this.canvas.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * this.canvas.width;
    const sy = ((clientY - rect.top) / rect.height) * this.canvas.height;

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height - 22;
    const radius = Math.min(this.canvas.width * 0.4, this.canvas.height * 0.7);

    let vx = (sx - cx) / radius;
    let vy = (sy - cy) / radius;

    // Upward-only arc.
    vy = Math.min(0, vy);

    // Forward-only half for each side.
    if (this.side === 'left') vx = Math.max(0, vx);
    else vx = Math.min(0, vx);

    // Dot distance from center controls power.
    const mag = Math.hypot(vx, vy);
    if (mag > 1) {
      vx /= mag;
      vy /= mag;
    }

    // Server uses side-signed pullX; display uses world-forward vx.
    return { x: -vx, y: vy };
  }

  draw() {
    if (!this.ctx || !this.canvas || !this.side) return;
    const { ctx, canvas } = this;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h - 22;
    const radius = Math.min(w * 0.4, h * 0.7);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f1727';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#3f547a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    ctx.fillStyle = '#3d4a6828';
    if (this.side === 'left') {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, Math.PI * 1.5, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, Math.PI, Math.PI * 1.5, false);
      ctx.closePath();
      ctx.fill();
    }

    const dx = -this.pull.x * radius;
    const dy = this.pull.y * radius;
    const px = cx + dx;
    const py = cy + dy;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#d0dcff88';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#f4c95d';
    ctx.fill();

    const powerPct = Math.round(Math.min(1, Math.hypot(this.pull.x, this.pull.y)) * 100);

    ctx.fillStyle = '#afc7ef';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Aim direction + power', cx, 18);

    ctx.font = '12px sans-serif';
    if (this.side === 'left') ctx.fillText('Aim arc', cx + radius * 0.56, cy - radius * 0.62);
    else ctx.fillText('Aim arc', cx - radius * 0.56, cy - radius * 0.62);

    ctx.fillStyle = '#d8e5ff';
    if (this.side === 'left') ctx.fillText('Fire ->', cx + radius * 0.56, cy - radius * 0.44);
    else ctx.fillText('<- Fire', cx - radius * 0.56, cy - radius * 0.44);
    ctx.fillText('Up', cx, cy - radius - 8);
    ctx.fillText('Farther = stronger', cx, cy - radius + 10);
    ctx.fillText(`Power ${powerPct}%`, cx, cy - 6);
  }
}
