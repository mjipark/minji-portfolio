/**
 * Gradient Mesh Engine & Interactive UI Control Panel
 * Creates an animated pastel fluid mesh background with full customizable UI & UX controls.
 */

class GradientMesh {
  constructor() {
    this.canvas = document.getElementById('gradient-mesh-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    
    // Default Settings & Theme Configurations
    this.palettes = {
      pastel: {
        name: 'Pastel Mesh',
        bg: '#FAF3E0',
        nodes: [
          { r: 200, g: 180, b: 226, radius: 0.55 }, // Lilac / Lavender (#C8B4E2)
          { r: 186, g: 149, b: 199, radius: 0.45 }, // Deep Pastel Purple (#BA95C7)
          { r: 255, g: 191, b: 163, radius: 0.50 }, // Coral Pink (#FFBFA3)
          { r: 255, g: 196, b: 196, radius: 0.40 }, // Rose Peach (#FFC4C4)
          { r: 255, g: 230, b: 153, radius: 0.50 }  // Warm Gold (#FFE699)
        ]
      },
      sunset: {
        name: 'Sunset Glow',
        bg: '#FFF2EB',
        nodes: [
          { r: 255, g: 140, b: 148, radius: 0.55 }, // Coral Rose
          { r: 255, g: 184, b: 140, radius: 0.50 }, // Soft Peach
          { r: 224, g: 130, b: 196, radius: 0.45 }, // Violet Pink
          { r: 255, g: 219, b: 153, radius: 0.50 }, // Warm Amber
          { r: 198, g: 150, b: 232, radius: 0.40 }  // Lavender
        ]
      },
      ocean: {
        name: 'Ocean Breeze',
        bg: '#F0F9FF',
        nodes: [
          { r: 165, g: 216, b: 255, radius: 0.55 }, // Soft Sky Blue
          { r: 186, g: 230, b: 225, radius: 0.45 }, // Mint Foam
          { r: 200, g: 190, b: 245, radius: 0.50 }, // Periwinkle
          { r: 220, g: 240, b: 255, radius: 0.40 }, // Ice Blue
          { r: 255, g: 215, b: 230, radius: 0.45 }  // Blush Tint
        ]
      },
      cosmic: {
        name: 'Cosmic Lavender',
        bg: '#F6F0FA',
        nodes: [
          { r: 175, g: 140, b: 220, radius: 0.55 }, // Deep Amethyst
          { r: 215, g: 170, b: 235, radius: 0.48 }, // Soft Orchid
          { r: 245, g: 185, b: 215, radius: 0.45 }, // Dust Rose
          { r: 150, g: 165, b: 230, radius: 0.50 }, // Indigo Mist
          { r: 255, g: 225, b: 180, radius: 0.40 }  // Warm Glow
        ]
      }
    };

    // Load saved settings or set defaults
    const savedConfig = this.loadConfig();
    this.speed = savedConfig.speed !== undefined ? savedConfig.speed : 0.4;
    this.activePaletteKey = savedConfig.paletteKey || 'pastel';
    this.mouseInteractive = savedConfig.mouseInteractive !== undefined ? savedConfig.mouseInteractive : true;
    this.isPaused = savedConfig.isPaused || false;

    this.time = 0;
    this.mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    this.initNodes();
    this.resize();
    this.bindEvents();
    this.buildControlPanelUI();

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.isPaused = true;
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  loadConfig() {
    try {
      const data = localStorage.getItem('mp_gradient_mesh_config');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveConfig() {
    try {
      const config = {
        speed: this.speed,
        paletteKey: this.activePaletteKey,
        mouseInteractive: this.mouseInteractive,
        isPaused: this.isPaused
      };
      localStorage.setItem('mp_gradient_mesh_config', JSON.stringify(config));
    } catch (e) {}
  }

  initNodes() {
    const palette = this.palettes[this.activePaletteKey];
    this.nodes = palette.nodes.map((n, i) => {
      return {
        r: n.r,
        g: n.g,
        b: n.b,
        baseRadius: n.radius,
        // Orbital trajectory parameters
        vx: 0.2 + (i % 3) * 0.15,
        vy: 0.25 + (i % 2) * 0.2,
        phaseX: (i * Math.PI) / 2.5,
        phaseY: (i * Math.PI) / 3,
        orbitScaleX: 0.25 + (i * 0.05),
        orbitScaleY: 0.20 + (i * 0.06),
        // Current position
        x: 0,
        y: 0,
        currentRadius: 0
      };
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    // Scale canvas for devicePixelRatio for extra crisp rendering while keeping performance optimal
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.targetX = -1000;
      this.mouse.targetY = -1000;
    });

    // Touch interaction for mobile devices
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = e.touches[0].clientX;
        this.mouse.targetY = e.touches[0].clientY;
      }
    }, { passive: true });
  }

  animate() {
    if (!this.isPaused) {
      this.time += 0.005 * this.speed;
    }

    // Smooth mouse position interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    const palette = this.palettes[this.activePaletteKey];
    const w = this.width;
    const h = this.height;

    // Fill base background
    this.ctx.fillStyle = palette.bg;
    this.ctx.fillRect(0, 0, w, h);

    // Render each liquid radial gradient node
    this.nodes.forEach((node, i) => {
      const angleX = this.time * node.vx + node.phaseX;
      const angleY = this.time * node.vy + node.phaseY;

      // Base orbital movement around screen center
      let posX = (0.5 + Math.sin(angleX) * node.orbitScaleX + Math.cos(angleY * 0.7) * 0.1) * w;
      let posY = (0.5 + Math.cos(angleY) * node.orbitScaleY + Math.sin(angleX * 0.8) * 0.1) * h;

      // Mouse magnet interaction
      if (this.mouseInteractive && this.mouse.x > 0) {
        const dx = this.mouse.x - posX;
        const dy = this.mouse.y - posY;
        const dist = Math.hypot(dx, dy);
        const maxDist = Math.max(w, h) * 0.4;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 45 * (i % 2 === 0 ? 1 : -0.7);
          posX += (dx / dist) * force;
          posY += (dy / dist) * force;
        }
      }

      node.x = posX;
      node.y = posY;

      // Pulse radius subtly
      const radiusPulse = Math.sin(this.time * 1.5 + i) * 0.05;
      node.currentRadius = Math.max(w, h) * (node.baseRadius + radiusPulse);

      // Render radial gradient node
      const radGrad = this.ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, node.currentRadius
      );

      const alphaCore = 0.80;
      const alphaMid = 0.45;

      radGrad.addColorStop(0, `rgba(${node.r}, ${node.g}, ${node.b}, ${alphaCore})`);
      radGrad.addColorStop(0.5, `rgba(${node.r}, ${node.g}, ${node.b}, ${alphaMid})`);
      radGrad.addColorStop(1, `rgba(${node.r}, ${node.g}, ${node.b}, 0)`);

      this.ctx.save();
      this.ctx.fillStyle = radGrad;
      this.ctx.globalCompositeOperation = i === 0 ? 'source-over' : 'multiply';
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.currentRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Soft liquid overlay pass for smooth organic texture
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'overlay';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    this.ctx.fillRect(0, 0, w, h);
    this.ctx.restore();
  }

  setPalette(key) {
    if (!this.palettes[key]) return;
    this.activePaletteKey = key;
    this.initNodes();
    this.saveConfig();

    // Update active state in UI
    const buttons = document.querySelectorAll('.palette-pill');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.palette === key);
    });
  }

  setSpeed(val) {
    this.speed = parseFloat(val);
    this.saveConfig();
  }

  toggleMouse(enable) {
    this.mouseInteractive = enable;
    this.saveConfig();
  }

  togglePlay() {
    this.isPaused = !this.isPaused;
    this.saveConfig();

    const playBtn = document.getElementById('mesh-play-btn');
    if (playBtn) {
      playBtn.innerHTML = this.isPaused ? '▶ Play Animation' : '⏸ Pause Animation';
      playBtn.classList.toggle('paused', this.isPaused);
    }
  }

  buildControlPanelUI() {
    if (document.getElementById('mesh-control-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'mesh-control-widget';
    widget.className = 'mesh-widget';

    widget.innerHTML = `
      <button id="mesh-widget-toggle" class="mesh-widget-trigger" aria-label="Toggle Gradient Settings">
        <span class="widget-icon">✨</span>
        <span class="widget-label">Gradient Mesh</span>
      </button>

      <div id="mesh-widget-panel" class="mesh-widget-content hidden">
        <div class="widget-header">
          <div>
            <h4>Gradient Mesh Controls</h4>
            <p>Customize liquid motion &amp; color themes</p>
          </div>
          <button id="mesh-widget-close" class="widget-close-btn" aria-label="Close Panel">&times;</button>
        </div>

        <div class="widget-section">
          <label class="widget-label-title">Color Palette</label>
          <div class="palette-grid">
            ${Object.keys(this.palettes).map(key => `
              <button class="palette-pill ${this.activePaletteKey === key ? 'active' : ''}" data-palette="${key}">
                <span class="palette-dot" style="background: linear-gradient(135deg, rgb(${this.palettes[key].nodes[0].r}, ${this.palettes[key].nodes[0].g}, ${this.palettes[key].nodes[0].b}), rgb(${this.palettes[key].nodes[2].r}, ${this.palettes[key].nodes[2].g}, ${this.palettes[key].nodes[2].b}));"></span>
                <span>${this.palettes[key].name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="widget-section">
          <div class="slider-header">
            <label for="mesh-speed-slider">Motion Speed</label>
            <span id="mesh-speed-val">${Math.round(this.speed * 100)}%</span>
          </div>
          <input type="range" id="mesh-speed-slider" min="0.0" max="1.5" step="0.05" value="${this.speed}">
        </div>

        <div class="widget-section row-flex">
          <div class="toggle-group">
            <label for="mesh-mouse-toggle">Mouse Magnet Interaction</label>
            <input type="checkbox" id="mesh-mouse-toggle" ${this.mouseInteractive ? 'checked' : ''}>
          </div>
        </div>

        <div class="widget-footer">
          <button id="mesh-play-btn" class="widget-btn-primary ${this.isPaused ? 'paused' : ''}">
            ${this.isPaused ? '▶ Play Animation' : '⏸ Pause Animation'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // Event Listeners for Controls UI
    const triggerBtn = document.getElementById('mesh-widget-toggle');
    const closeBtn = document.getElementById('mesh-widget-close');
    const panel = document.getElementById('mesh-widget-panel');
    const speedSlider = document.getElementById('mesh-speed-slider');
    const speedValDisplay = document.getElementById('mesh-speed-val');
    const mouseToggle = document.getElementById('mesh-mouse-toggle');
    const playBtn = document.getElementById('mesh-play-btn');

    const togglePanel = () => {
      panel.classList.toggle('hidden');
      triggerBtn.classList.toggle('active', !panel.classList.contains('hidden'));
    };

    triggerBtn.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', togglePanel);

    // Palette Switcher
    const palettePills = widget.querySelectorAll('.palette-pill');
    palettePills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.setPalette(pill.dataset.palette);
      });
    });

    // Speed Slider
    speedSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.setSpeed(val);
      speedValDisplay.textContent = `${Math.round(val * 100)}%`;
    });

    // Mouse Magnet Toggle
    mouseToggle.addEventListener('change', (e) => {
      this.toggleMouse(e.target.checked);
    });

    // Play/Pause Button
    playBtn.addEventListener('click', () => {
      this.togglePlay();
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.gradientMeshApp = new GradientMesh();
});
