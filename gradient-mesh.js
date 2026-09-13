/**
 * Gradient Mesh Engine — Pastel Mesh Only, No Controls
 * Clean animated pastel liquid mesh background.
 */

class GradientMesh {
  constructor() {
    this.canvas = document.getElementById('gradient-mesh-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');

    // Fixed Pastel Mesh Palette
    this.bg = '#FAF3E0';
    this.nodeConfig = [
      { r: 200, g: 180, b: 226, radius: 0.55, vx: 0.20, vy: 0.25, phaseX: 0, phaseY: 0.3, ox: 0.25, oy: 0.20 },
      { r: 186, g: 149, b: 199, radius: 0.45, vx: 0.35, vy: 0.20, phaseX: 1.257, phaseY: 1.047, ox: 0.30, oy: 0.26 },
      { r: 255, g: 191, b: 163, radius: 0.50, vx: 0.23, vy: 0.40, phaseX: 2.513, phaseY: 1.885, ox: 0.20, oy: 0.32 },
      { r: 255, g: 196, b: 196, radius: 0.42, vx: 0.50, vy: 0.30, phaseX: 3.770, phaseY: 2.722, ox: 0.35, oy: 0.22 },
      { r: 255, g: 230, b: 153, radius: 0.50, vx: 0.28, vy: 0.22, phaseX: 5.027, phaseY: 3.560, ox: 0.22, oy: 0.35 },
    ];

    this.nodes = this.nodeConfig.map(n => ({ ...n, x: 0, y: 0 }));
    this.time = 0;
    this.mouse = { x: -2000, y: -2000, tx: -2000, ty: -2000 };

    this.resize();
    this.bindEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(dpr, dpr);
  }

  bindEvents() {
    window.addEventListener('resize', () => { this.ctx.resetTransform(); this.resize(); });
    window.addEventListener('mousemove', e => { this.mouse.tx = e.clientX; this.mouse.ty = e.clientY; });
    window.addEventListener('touchmove', e => {
      if (e.touches.length) { this.mouse.tx = e.touches[0].clientX; this.mouse.ty = e.touches[0].clientY; }
    }, { passive: true });
  }

  animate() {
    this.time += 0.004; // slow, dreamy drift speed
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.04;
    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    const { width: w, height: h, ctx } = this;
    ctx.fillStyle = this.bg;
    ctx.fillRect(0, 0, w, h);

    this.nodes.forEach((node, i) => {
      const ax = this.time * node.vx + node.phaseX;
      const ay = this.time * node.vy + node.phaseY;

      let px = (0.5 + Math.sin(ax) * node.ox + Math.cos(ay * 0.7) * 0.08) * w;
      let py = (0.5 + Math.cos(ay) * node.oy + Math.sin(ax * 0.8) * 0.08) * h;

      const dx = this.mouse.x - px;
      const dy = this.mouse.y - py;
      const dist = Math.hypot(dx, dy);
      const maxD = Math.max(w, h) * 0.45;
      if (dist < maxD && dist > 0) {
        const force = (1 - dist / maxD) * 38 * (i % 2 === 0 ? 1 : -0.6);
        px += (dx / dist) * force;
        py += (dy / dist) * force;
      }

      const pulse = Math.sin(this.time * 1.4 + i * 0.9) * 0.04;
      const radius = Math.max(w, h) * (node.radius + pulse);

      const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
      grad.addColorStop(0, `rgba(${node.r},${node.g},${node.b},0.82)`);
      grad.addColorStop(0.5, `rgba(${node.r},${node.g},${node.b},0.40)`);
      grad.addColorStop(1, `rgba(${node.r},${node.g},${node.b},0)`);

      ctx.save();
      ctx.globalCompositeOperation = i === 0 ? 'source-over' : 'multiply';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.gradientMeshApp = new GradientMesh();
});