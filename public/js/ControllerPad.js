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

    const inset = 22;
    const cx = this.side === 'left' ? inset : this.canvas.width - inset;
    const cy = this.canvas.height - inset;
    const radius = Math.max(20, Math.min(this.canvas.width - inset * 2, this.canvas.height - inset * 2));

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
    const inset = 22;
    const cx = this.side === 'left' ? inset : w - inset;
    const cy = h - inset;
    const radius = Math.max(20, Math.min(w - inset * 2, h - inset * 2));
    const startAngle = this.side === 'left' ? Math.PI * 1.5 : Math.PI;
    const endAngle = this.side === 'left' ? Math.PI * 2 : Math.PI * 1.5;

    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0a1322');
    bg.addColorStop(1, '#0f1a2f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const fill = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
    fill.addColorStop(0, '#29406288');
    fill.addColorStop(1, '#1a2a4380');
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle, false);
    ctx.closePath();
    ctx.fill();

    for (let i = 1; i <= 3; i += 1) {
      ctx.strokeStyle = i === 3 ? '#6284bfcc' : '#4b638a88';
      ctx.lineWidth = i === 3 ? 2.2 : 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, (radius * i) / 3, startAngle, endAngle, false);
      ctx.stroke();
    }

    ctx.strokeStyle = '#7a95c1bb';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (this.side === 'left' ? 1 : -1) * radius, cy);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - radius);
    ctx.stroke();

    const dx = -this.pull.x * radius;
    const dy = this.pull.y * radius;
    const px = cx + dx;
    const py = cy + dy;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#e7f0ffcc';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd36c';
    ctx.fill();
    ctx.strokeStyle = '#3a2f17';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const powerPct = Math.round(Math.min(1, Math.hypot(this.pull.x, this.pull.y)) * 100);

    const labelX = this.side === 'left' ? w * 0.52 : w * 0.48;
    ctx.fillStyle = '#afc7ef';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Drag in the cone to aim + power', labelX, 24);
    ctx.fillStyle = '#d8e5ff';
    ctx.font = '13px sans-serif';
    ctx.fillText(this.side === 'left' ? 'Fire ->' : '<- Fire', labelX, 44);
    ctx.fillText(`Power ${powerPct}%`, labelX, 64);
  }
}
