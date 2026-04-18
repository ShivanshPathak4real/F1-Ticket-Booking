/* ═══════════════════════════════════════
   GRID STORM — MAIN.JS
   GSAP + ScrollTrigger + Three.js + Lenis
   ═══════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────────
   1. LENIS SMOOTH SCROLLING
───────────────────────────────────── */
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  smooth: true,
  smoothTouch: false,
});

function lenisRaf(time) {
  lenis.raf(time);
  requestAnimationFrame(lenisRaf);
}
requestAnimationFrame(lenisRaf);

// GSAP ScrollTrigger proxy for Lenis
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
ScrollTrigger.scrollerProxy(document.body, {
  scrollTop(value) {
    if (arguments.length) lenis.scrollTo(value, { immediate: true });
    return lenis.scroll;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
});
lenis.on('scroll', ScrollTrigger.update);
ScrollTrigger.defaults({ scroller: document.body });

/* ─────────────────────────────────────
   2. CUSTOM CURSOR
───────────────────────────────────── */
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');
let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.05, ease: 'none' });
});

function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  gsap.set(cursorTrail, { x: trailX, y: trailY });
  requestAnimationFrame(animateTrail);
}
animateTrail();

// Cursor hover effects
document.querySelectorAll('a, button, .tier-card, .about-card, .race-card, .driver-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    gsap.to(cursor, { scale: 1.8, duration: 0.3 });
    gsap.to(cursorTrail, { scale: 1.5, duration: 0.3 });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(cursor, { scale: 1, duration: 0.3 });
    gsap.to(cursorTrail, { scale: 1, duration: 0.3 });
  });
});

/* ─────────────────────────────────────
   3. NAVBAR
───────────────────────────────────── */
const navbar = document.getElementById('navbar');
lenis.on('scroll', ({ scroll }) => {
  navbar.classList.toggle('scrolled', scroll > 80);
});

// Nav smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target, { duration: 1.6 });
      // Close mobile menu if open
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
    }
  });
});

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

/* ─────────────────────────────────────
   4. SPEED LINES (HERO)
───────────────────────────────────── */
const speedLinesContainer = document.getElementById('speedLines');
const NUM_LINES = 18;
for (let i = 0; i < NUM_LINES; i++) {
  const line = document.createElement('div');
  line.className = 'speed-line';
  const w = 150 + Math.random() * 400;
  const top = Math.random() * 100;
  const delay = Math.random() * 4;
  const dur = 1.5 + Math.random() * 3;
  line.style.cssText = `
    width: ${w}px;
    top: ${top}%;
    left: ${20 + Math.random() * 40}%;
    animation-delay: ${delay}s;
    animation-duration: ${dur}s;
    opacity: 0;
  `;
  speedLinesContainer.appendChild(line);
}

/* ─────────────────────────────────────
   5. THREE.JS — F1 CAR
───────────────────────────────────── */
(function initThreeJS() {
  const canvas = document.getElementById('f1Canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth || window.innerWidth * 0.6, canvas.offsetHeight || window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
  camera.position.set(0, 2.5, 8);
  camera.lookAt(0, 0, 0);

  // Lights
  const ambientLight = new THREE.AmbientLight(0x110008, 2);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xfa255e, 4);
  mainLight.position.set(5, 5, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xc39ea0, 1.5);
  fillLight.position.set(-5, 3, -3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xfa255e, 2);
  rimLight.position.set(0, -2, -5);
  scene.add(rimLight);

  const pointLight1 = new THREE.PointLight(0xfa255e, 3, 15);
  pointLight1.position.set(3, 2, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xf8e5e5, 1.5, 10);
  pointLight2.position.set(-3, 1, 2);
  scene.add(pointLight2);

  // Materials
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1a0005,
    metalness: 0.85,
    roughness: 0.15,
    envMapIntensity: 1.5,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xfa255e,
    metalness: 0.6,
    roughness: 0.2,
    emissive: 0xfa255e,
    emissiveIntensity: 0.3,
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x0d0d0d,
    metalness: 0.4,
    roughness: 0.6,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 1.0,
    roughness: 0.05,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.0,
    roughness: 0.9,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.9,
    roughness: 0.1,
  });

  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xfa255e,
    emissive: 0xfa255e,
    emissiveIntensity: 1.5,
    metalness: 0,
    roughness: 1,
  });

  const carGroup = new THREE.Group();
  scene.add(carGroup);

  // ── MONOCOQUE / CHASSIS ──
  const chassisGeo = new THREE.BoxGeometry(1.0, 0.22, 4.0);
  const chassis = new THREE.Mesh(chassisGeo, bodyMat);
  chassis.position.set(0, 0.1, 0);
  carGroup.add(chassis);

  // Cockpit (tapered)
  const cockpitShape = new THREE.Shape();
  cockpitShape.moveTo(-0.45, 0);
  cockpitShape.lineTo(0.45, 0);
  cockpitShape.lineTo(0.3, 0.6);
  cockpitShape.lineTo(-0.3, 0.6);
  cockpitShape.closePath();
  const extrudeSettings = { depth: 1.6, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 };
  const cockpitGeo = new THREE.ExtrudeGeometry(cockpitShape, extrudeSettings);
  const cockpit = new THREE.Mesh(cockpitGeo, bodyMat);
  cockpit.rotation.x = -Math.PI / 2;
  cockpit.position.set(-0.45, 0.22, -0.6);
  carGroup.add(cockpit);

  // Nose cone
  const noseConeGeo = new THREE.CylinderGeometry(0.05, 0.38, 1.8, 8);
  const noseCone = new THREE.Mesh(noseConeGeo, bodyMat);
  noseCone.rotation.z = Math.PI / 2;
  noseCone.rotation.x = Math.PI * 0.04;
  noseCone.position.set(0, 0.02, 2.3);
  carGroup.add(noseCone);

  // Nose tip accent
  const noseTipGeo = new THREE.ConeGeometry(0.06, 0.3, 6);
  const noseTip = new THREE.Mesh(noseTipGeo, accentMat);
  noseTip.rotation.z = Math.PI / 2;
  noseTip.position.set(0, 0.02, 3.25);
  carGroup.add(noseTip);

  // Front Wing
  const frontWingGeo = new THREE.BoxGeometry(2.6, 0.04, 0.5);
  const frontWing = new THREE.Mesh(frontWingGeo, accentMat);
  frontWing.position.set(0, -0.05, 2.9);
  carGroup.add(frontWing);

  // Front wing elements
  const fwEl1Geo = new THREE.BoxGeometry(2.2, 0.03, 0.25);
  const fwEl1 = new THREE.Mesh(fwEl1Geo, bodyMat);
  fwEl1.position.set(0, 0.04, 2.75);
  fwEl1.rotation.x = 0.12;
  carGroup.add(fwEl1);

  const fwEl2 = fwEl1.clone();
  fwEl2.position.set(0, 0.1, 2.6);
  fwEl2.rotation.x = 0.18;
  carGroup.add(fwEl2);

  // Front wing endplates
  [-1.25, 1.25].forEach(x => {
    const epGeo = new THREE.BoxGeometry(0.04, 0.18, 0.5);
    const ep = new THREE.Mesh(epGeo, carbonMat);
    ep.position.set(x, -0.01, 2.9);
    carGroup.add(ep);
  });

  // Sidepods
  [-0.58, 0.58].forEach((x, i) => {
    const spGeo = new THREE.BoxGeometry(0.32, 0.28, 2.0);
    const sidepod = new THREE.Mesh(spGeo, bodyMat);
    sidepod.position.set(x, -0.02, 0.2);
    carGroup.add(sidepod);

    // Sidepod intake accent
    const intakeGeo = new THREE.BoxGeometry(0.22, 0.16, 0.04);
    const intake = new THREE.Mesh(intakeGeo, carbonMat);
    intake.position.set(x * 1.1, 0.02, 1.1);
    carGroup.add(intake);

    // Sidepod accent stripe
    const stripeGeo = new THREE.BoxGeometry(0.33, 0.04, 2.0);
    const stripe = new THREE.Mesh(stripeGeo, accentMat);
    stripe.position.set(x, 0.1, 0.2);
    carGroup.add(stripe);
  });

  // Engine cover
  const engineCoverGeo = new THREE.BoxGeometry(0.55, 0.42, 1.8);
  const engineCover = new THREE.Mesh(engineCoverGeo, bodyMat);
  engineCover.position.set(0, 0.32, -0.4);
  carGroup.add(engineCover);

  // Halo
  const haloGeo = new THREE.TorusGeometry(0.35, 0.03, 8, 20, Math.PI);
  const halo = new THREE.Mesh(haloGeo, chromeMat);
  halo.rotation.x = -Math.PI / 2;
  halo.rotation.z = Math.PI;
  halo.position.set(0, 0.72, 0.1);
  carGroup.add(halo);

  // Rear wing
  const rearWingGeo = new THREE.BoxGeometry(1.8, 0.05, 0.5);
  const rearWing = new THREE.Mesh(rearWingGeo, bodyMat);
  rearWing.position.set(0, 0.85, -2.2);
  carGroup.add(rearWing);

  const rearWingEl2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.04, 0.4), accentMat);
  rearWingEl2.position.set(0, 0.95, -2.0);
  rearWingEl2.rotation.x = -0.1;
  carGroup.add(rearWingEl2);

  // Rear wing endplates
  [-0.9, 0.9].forEach(x => {
    const rwEp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.55), carbonMat);
    rwEp.position.set(x, 0.78, -2.2);
    carGroup.add(rwEp);
  });

  // DRS actuator
  const drsGeo = new THREE.BoxGeometry(0.03, 0.5, 0.04);
  [-0.5, 0.5].forEach(x => {
    const drs = new THREE.Mesh(drsGeo, chromeMat);
    drs.position.set(x, 0.62, -2.18);
    carGroup.add(drs);
  });

  // Floor / diffuser
  const floorGeo = new THREE.BoxGeometry(1.2, 0.04, 3.8);
  const floor = new THREE.Mesh(floorGeo, carbonMat);
  floor.position.set(0, -0.08, 0);
  carGroup.add(floor);

  // Diffuser
  const diffuserGeo = new THREE.BoxGeometry(1.3, 0.22, 0.5);
  const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
  diffuser.position.set(0, -0.06, -2.15);
  diffuser.rotation.x = -0.3;
  carGroup.add(diffuser);

  // Exhaust glow
  const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.04, 0.25, 8);
  const exhaust = new THREE.Mesh(exhaustGeo, glowMat);
  exhaust.rotation.z = Math.PI / 2;
  exhaust.position.set(0.2, 0.55, -2.1);
  carGroup.add(exhaust);

  // ── WHEELS ──
  const wheelPositions = [
    { x: -0.9, y: -0.18, z: 1.7 },  // front left
    { x:  0.9, y: -0.18, z: 1.7 },  // front right
    { x: -0.9, y: -0.18, z: -1.5 }, // rear left
    { x:  0.9, y: -0.18, z: -1.5 }, // rear right
  ];

  const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 20);
  const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.33, 12);
  const brakeDiscGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);

  wheelPositions.forEach((pos) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(pos.x, pos.y, pos.z);

    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    wheelGroup.add(tire);

    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    // Rim spokes
    for (let i = 0; i < 5; i++) {
      const spokeGeo = new THREE.BoxGeometry(0.5, 0.04, 0.04);
      const spoke = new THREE.Mesh(spokeGeo, chromeMat);
      spoke.rotation.x = (i / 5) * Math.PI * 2;
      wheelGroup.add(spoke);
    }

    // Brake disc
    const brakeSign = pos.x < 0 ? -1 : 1;
    const brakeDisc = new THREE.Mesh(brakeDiscGeo, new THREE.MeshStandardMaterial({
      color: 0xfa255e, emissive: 0x880022, emissiveIntensity: 0.5,
      metalness: 0.7, roughness: 0.4
    }));
    brakeDisc.rotation.z = Math.PI / 2;
    brakeDisc.position.x = brakeSign * 0.1;
    wheelGroup.add(brakeDisc);

    // Suspension arm
    const suspGeo = new THREE.CylinderGeometry(0.025, 0.025, Math.abs(pos.x) * 1.8, 6);
    const susp = new THREE.Mesh(suspGeo, chromeMat);
    susp.rotation.z = Math.PI / 2;
    susp.position.x = pos.x > 0 ? -0.45 : 0.45;
    susp.position.y = 0.05;
    wheelGroup.add(susp);

    carGroup.add(wheelGroup);
  });

  // ── GRID LINE under car ──
  const gridGeo = new THREE.PlaneGeometry(8, 4);
  const gridMat = new THREE.MeshStandardMaterial({
    color: 0xfa255e,
    emissive: 0xfa255e,
    emissiveIntensity: 0.15,
    transparent: true,
    opacity: 0.08,
    roughness: 1,
  });
  const gridPlane = new THREE.Mesh(gridGeo, gridMat);
  gridPlane.rotation.x = -Math.PI / 2;
  gridPlane.position.y = -0.62;
  scene.add(gridPlane);

  // Ground glow
  const glowGeo = new THREE.PlaneGeometry(5, 2);
  const glowGroundMat = new THREE.MeshStandardMaterial({
    color: 0xfa255e,
    emissive: 0xfa255e,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.06,
  });
  const glowGround = new THREE.Mesh(glowGeo, glowGroundMat);
  glowGround.rotation.x = -Math.PI / 2;
  glowGround.position.y = -0.6;
  scene.add(glowGround);

  // ── PARTICLES ──
  const particleCount = 120;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3]     = (Math.random() - 0.5) * 14;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xfa255e,
    size: 0.03,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Resize handler
  function onResize() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // Mouse interaction for 3D car
  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;

  document.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    targetRotY = nx * 0.4;
    targetRotX = ny * 0.15;
  });

  // Scroll-driven animation
  let scrollProgress = 0;
  lenis.on('scroll', ({ progress }) => {
    scrollProgress = progress;
  });

  // Animation loop
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse follow
    currentRotX += (targetRotX - currentRotX) * 0.05;
    currentRotY += (targetRotY - currentRotY) * 0.05;

    // Scroll-driven rotation (carGroup rotates as page scrolls)
    const scrollRot = scrollProgress * Math.PI * 0.4;
    carGroup.rotation.y = currentRotY + Math.sin(t * 0.3) * 0.05 + scrollRot;
    carGroup.rotation.x = currentRotX + Math.sin(t * 0.2) * 0.02;

    // Floating animation
    carGroup.position.y = Math.sin(t * 0.8) * 0.06;

    // Light orbit
    pointLight1.position.x = Math.cos(t * 0.5) * 4;
    pointLight1.position.z = Math.sin(t * 0.5) * 4;

    // Particle drift
    const pPos = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3 + 1] += 0.003;
      if (pPos[i * 3 + 1] > 4) pPos[i * 3 + 1] = -4;
    }
    particleGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();
})();

/* ─────────────────────────────────────
   6. HERO ENTRANCE ANIMATION
───────────────────────────────────── */
window.addEventListener('load', () => {
  const tl = gsap.timeline({ delay: 0.3 });

  tl.to('.hero-badge', {
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'
  })
  .to('.title-line', {
    opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'expo.out'
  }, '-=0.4')
  .to('.hero-tagline', {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'
  }, '-=0.3')
  .to('.hero-actions', {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'
  }, '-=0.4')
  .to('.hero-stats', {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'
  }, '-=0.4');

  // Animate stat counters
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.count);
    gsap.to({ val: 0 }, {
      val: target,
      duration: 2,
      delay: 1.5,
      ease: 'power2.out',
      onUpdate: function() { el.textContent = Math.round(this.targets()[0].val); }
    });
  });
});

/* ─────────────────────────────────────
   7. SCROLL-TRIGGERED ANIMATIONS
───────────────────────────────────── */

// Section headers
gsap.utils.toArray('.section-tag').forEach(el => {
  gsap.to(el, {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
  });
});

gsap.utils.toArray('.section-title').forEach(title => {
  const spans = title.querySelectorAll('span');
  gsap.to(spans, {
    opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out',
    scrollTrigger: { trigger: title, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
});

gsap.utils.toArray('.section-subtitle').forEach(el => {
  gsap.to(el, {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
  });
});

// About cards
gsap.utils.toArray('.about-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1, y: 0, duration: 0.7, delay: i * 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' }
  });
});

// Track SVG drawing animation
const trackPath = document.getElementById('trackPath');
if (trackPath) {
  gsap.to(trackPath, {
    strokeDashoffset: 0,
    duration: 2.5,
    ease: 'none',
    scrollTrigger: {
      trigger: '.stadium-panorama',
      start: 'top 80%',
      end: 'bottom 60%',
      scrub: 1,
    }
  });
  // Animate track car
  const trackCar = document.getElementById('trackCar');
  if (trackCar) {
    gsap.to(trackCar, {
      motionPath: { path: trackPath, align: trackPath, alignOrigin: [0.5, 0.5], autoRotate: true },
      duration: 3,
      ease: 'none',
      scrollTrigger: {
        trigger: '.stadium-panorama',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
      }
    });
  }
}

// Race cards stagger
gsap.utils.toArray('.race-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1, x: 0, duration: 0.7, delay: i * 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' }
  });
});

// Timeline line draw
gsap.fromTo('.timeline-line', { scaleY: 0, transformOrigin: 'top center' }, {
  scaleY: 1, duration: 1.5, ease: 'none',
  scrollTrigger: { trigger: '.races-timeline', start: 'top 70%', end: 'bottom 80%', scrub: 0.5 }
});

// Booking section
gsap.utils.toArray('.tier-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1, x: 0, duration: 0.7, delay: i * 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' }
  });
});

gsap.to('.booking-form-panel', {
  opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
  scrollTrigger: { trigger: '.booking-form-panel', start: 'top 80%', toggleActions: 'play none none reverse' }
});

// Drivers
const driverLeclerc = document.getElementById('driverLeclerc');
const driverVerstappen = document.getElementById('driverVerstappen');

if (driverLeclerc) {
  gsap.to(driverLeclerc, {
    opacity: 1, x: 0, duration: 0.9, ease: 'expo.out',
    scrollTrigger: { trigger: driverLeclerc, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
}
if (driverVerstappen) {
  gsap.to(driverVerstappen, {
    opacity: 1, x: 0, duration: 0.9, ease: 'expo.out',
    scrollTrigger: { trigger: driverVerstappen, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
}

// Drivers number count-up
gsap.utils.toArray('.d-num').forEach(el => {
  const val = parseInt(el.textContent);
  gsap.from({ v: 0 }, {
    v: 0,
    onStart() { el.textContent = '0'; },
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to({ v: 0 }, {
          v: val, duration: 1.5, ease: 'power2.out',
          onUpdate: function() { el.textContent = Math.round(this.targets()[0].v); }
        });
      }
    }
  });
});

// Guest image reveal
const guestFrame = document.querySelector('.guest-image-frame');
const guestRevealer = document.querySelector('.guest-revealer');
const guestContent = document.querySelector('.guest-content');

if (guestFrame && guestRevealer) {
  const guestTl = gsap.timeline({
    scrollTrigger: { trigger: '#guests', start: 'top 60%', toggleActions: 'play none none reverse' }
  });

  guestTl
    .to(guestFrame, { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out' })
    .to(guestRevealer, { scaleY: 0, duration: 1.0, ease: 'expo.inOut', transformOrigin: 'top' }, '-=0.4')
    .to(guestContent, { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out' }, '-=0.6');
}

// Developer card
gsap.to('.dev-card', {
  opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
  scrollTrigger: { trigger: '.dev-card', start: 'top 80%', toggleActions: 'play none none reverse' }
});

/* ─────────────────────────────────────
   8. PARALLAX EFFECTS
───────────────────────────────────── */
gsap.to('.hero-bg-track', {
  yPercent: 30,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  }
});

// Section backgrounds parallax
gsap.to('.book-bg', {
  yPercent: 20,
  ease: 'none',
  scrollTrigger: {
    trigger: '#book',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  }
});

/* ─────────────────────────────────────
   9. MAGNETIC BUTTONS
───────────────────────────────────── */
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  let rect;

  btn.addEventListener('mouseenter', () => {
    rect = btn.getBoundingClientRect();
  });

  btn.addEventListener('mousemove', (e) => {
    if (!rect) return;
    const bx = rect.left + rect.width / 2;
    const by = rect.top + rect.height / 2;
    const dx = (e.clientX - bx) * 0.35;
    const dy = (e.clientY - by) * 0.35;
    gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
  });

  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  });
});

/* ─────────────────────────────────────
   10. VANILLA TILT
───────────────────────────────────── */
if (typeof VanillaTilt !== 'undefined') {
  VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
    max: 8,
    speed: 400,
    glare: false,
    'max-glare': 0.15,
    scale: 1.02,
  });
}

/* ─────────────────────────────────────
   11. BOOKING LOGIC
───────────────────────────────────── */
let selectedTierPrice = 0;
let selectedTierName = '';
let qty = 1;

function selectTier(tier, price) {
  selectedTierPrice = price;
  selectedTierName = { general: 'General Grandstand', grandstand: 'Premium Grandstand T1', vip: 'VIP Suite' }[tier] || tier;
  qty = 1;

  document.getElementById('qtyDisplay').textContent = qty;
  document.getElementById('tierName').textContent = selectedTierName;
  document.getElementById('tierPrice').textContent = `₹${price.toLocaleString('en-IN')}`;

  updateOrderSummary();

  // Animate the display
  gsap.fromTo('#tierDisplay', { scale: 0.95, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out' });

  // Highlight selected tier card
  document.querySelectorAll('.tier-card').forEach(c => c.classList.remove('selected'));
  const sel = document.querySelector(`[data-tier="${tier}"]`);
  if (sel) {
    sel.classList.add('selected');
    gsap.fromTo(sel, { borderColor: 'rgba(250,37,94,0.3)' }, { borderColor: '#fa255e', duration: 0.4 });
  }

  // Scroll to form
  lenis.scrollTo(document.querySelector('.booking-form-panel'), { offset: -100, duration: 1.2 });
}

function changeQty(delta) {
  qty = Math.max(1, Math.min(10, qty + delta));
  document.getElementById('qtyDisplay').textContent = qty;
  updateOrderSummary();
  gsap.fromTo('#qtyDisplay', { scale: 1.3, color: '#fa255e' }, { scale: 1, color: '#f8e5e5', duration: 0.3 });
}

function updateOrderSummary() {
  const total = selectedTierPrice * qty;
  document.getElementById('summaryPrice').textContent = selectedTierPrice ? `₹${selectedTierPrice.toLocaleString('en-IN')}` : '—';
  document.getElementById('summaryQty').textContent = qty;
  document.getElementById('summaryTotal').textContent = selectedTierPrice ? `₹${total.toLocaleString('en-IN')}` : '—';
  gsap.fromTo('#summaryTotal', { color: '#fff' }, { color: '#fa255e', duration: 0.3, yoyo: true, repeat: 1 });
}

// Make functions global
window.selectTier = selectTier;
window.changeQty = changeQty;

document.getElementById('bookNowBtn').addEventListener('click', () => {
  if (!selectedTierPrice) {
    gsap.to('#bookNowBtn', { x: [-8, 8, -6, 6, -4, 4, 0], duration: 0.4 });
    gsap.to('#tierDisplay', { borderColor: '#fa255e', duration: 0.3, yoyo: true, repeat: 3 });
    return;
  }
  openModal();
});

/* ─────────────────────────────────────
   12. MODAL
───────────────────────────────────── */
const modalOverlay = document.getElementById('modalOverlay');

function openModal() {
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  gsap.fromTo('.modal-icon', { scale: 0, rotation: -30 }, {
    scale: 1, rotation: 0, duration: 0.6, delay: 0.2, ease: 'back.out(1.7)'
  });
}

function closeModal() {
  gsap.to('.modal-card', { scale: 0.9, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    gsap.set('.modal-card', { scale: 1, opacity: 1 });
  }});
}

window.closeModal = closeModal;

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

/* ─────────────────────────────────────
   13. HERO TITLE GLITCH EFFECT
───────────────────────────────────── */
const titleLines = document.querySelectorAll('.title-line');
setInterval(() => {
  titleLines.forEach(line => {
    if (Math.random() > 0.85) {
      gsap.fromTo(line, { skewX: (Math.random() - 0.5) * 4, opacity: 0.8 }, {
        skewX: 0, opacity: 1, duration: 0.12, ease: 'none'
      });
    }
  });
}, 3000);

/* ─────────────────────────────────────
   14. INTERSECTION OBSERVER FALLBACK
───────────────────────────────────── */
const ioObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// Observe elements that might not have GSAP targeting
document.querySelectorAll('.about-card, .race-card, .tier-card').forEach(el => {
  ioObserver.observe(el);
});

/* ─────────────────────────────────────
   15. SECTION BACKGROUND EFFECTS
───────────────────────────────────── */
// Scroll-based section color shifts
gsap.utils.toArray('section').forEach((section, i) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top center',
    end: 'bottom center',
    onEnter: () => gsap.to('body', { '--active-section': i, duration: 0.5 }),
  });
});

/* ─────────────────────────────────────
   16. DRIVER CARDS HOVER
───────────────────────────────────── */
document.querySelectorAll('.driver-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    gsap.to(card.querySelector('.driver-number-bg'), { opacity: 0.08, y: -10, duration: 0.4 });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card.querySelector('.driver-number-bg'), { opacity: 0.03, y: 0, duration: 0.4 });
  });
});

/* ─────────────────────────────────────
   17. HORIZONTAL SCROLL EFFECT (Races tag)
───────────────────────────────────── */
gsap.to('.section-tag', {
  letterSpacing: '8px',
  ease: 'none',
  scrollTrigger: {
    trigger: '#races',
    start: 'top 80%',
    end: 'top 40%',
    scrub: true,
  }
});

/* ─────────────────────────────────────
   18. BOOKING SECTION — HIGHLIGHT ON SCROLL
───────────────────────────────────── */
ScrollTrigger.create({
  trigger: '#book',
  start: 'top 40%',
  onEnter: () => {
    gsap.to('.book-bg', { opacity: 1, duration: 1 });
  }
});

/* ─────────────────────────────────────
   19. GUEST QUOTE TYPE-EFFECT
───────────────────────────────────── */
ScrollTrigger.create({
  trigger: '.guest-quote',
  start: 'top 80%',
  once: true,
  onEnter: () => {
    gsap.fromTo('.guest-quote', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
  }
});

/* ─────────────────────────────────────
   20. WINDOW RESIZE HANDLER
───────────────────────────────────── */
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});

/* ─────────────────────────────────────
   21. FOOTER ANIMATION
───────────────────────────────────── */
gsap.fromTo('#footer', { opacity: 0, y: 30 }, {
  opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
  scrollTrigger: { trigger: '#footer', start: 'top 90%', toggleActions: 'play none none reverse' }
});

/* ─────────────────────────────────────
   22. PAGE PROGRESS INDICATOR
───────────────────────────────────── */
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  height: 2px;
  background: linear-gradient(to right, #fa255e, #c39ea0);
  width: 0%;
  z-index: 99999;
  pointer-events: none;
  transition: width 0.1s;
`;
document.body.appendChild(progressBar);

lenis.on('scroll', ({ progress }) => {
  progressBar.style.width = `${progress * 100}%`;
});

/* ─────────────────────────────────────
   CONSOLE EASTER EGG
───────────────────────────────────── */
console.log(
  '%cGRID STORM 🏎\n%cBuilt with GSAP + Three.js + Lenis\n%cFeel the Speed. Book the Thrill.',
  'color: #fa255e; font-size: 28px; font-weight: bold;',
  'color: #c39ea0; font-size: 14px;',
  'color: #f8e5e5; font-size: 12px; font-style: italic;'
);

(function () {
  const EVENT_CODE = "SCRS_PA"; // replace during event
  const UID = "SCRS_ARENA_A3"; // replace with participant ID

  const footer = document.createElement("div");

  // Non-intrusive styling
  footer.style.position = "fixed";
  footer.style.bottom = "0";
  footer.style.left = "0";
  footer.style.width = "100%";
  footer.style.background = "rgba(0,0,0,0.75)";
  footer.style.color = "#fff";
  footer.style.fontSize = "12px";
  footer.style.padding = "6px 10px";
  footer.style.textAlign = "right";
  footer.style.zIndex = "9999";
  footer.style.pointerEvents = "none";

  function formatTime(date) {
    return date.toLocaleTimeString('en-GB', { hour12: false });
  }

  function updateTime() {
    const now = new Date();
    footer.innerText =
      "Created at: " + formatTime(now) +
      " | Event Code: " + EVENT_CODE +
      " | UID: " + UID  ;
  }

  updateTime();
  setInterval(updateTime, 1000); // keeps updating every second

  document.body.appendChild(footer);
})();