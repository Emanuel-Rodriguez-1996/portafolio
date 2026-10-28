import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// --- OVERLAY: se resuelve primero y de forma independiente de la escena 3D,
// así el resto del sitio siempre queda visible aunque Three.js falle ---
const overlay = document.getElementById("overlay");
if (overlay) overlay.addEventListener("click", () => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.style.display = "none", 800);
});

// --- MENÚ HAMBURGUESA (mobile) ---
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");
        navToggle.classList.toggle("open", isOpen);
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
            navToggle.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

try {

const canvas = document.getElementById("myThreeCanvas");
// Mantener la galaxia fija como telón 3D mientras el contenido editorial cruza el viewport.
document.body.prepend(canvas);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- ILUMINACIÓN ---
scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(10, 10, 10);
scene.add(sunLight);

// --- LUZ DEL SATÉLITE ---
const satLight = new THREE.PointLight(0x00f2ff, 2, 10);
scene.add(satLight);

const lightHelper = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x00f2ff })
);
scene.add(lightHelper);

// --- TEXTURA DE ESTRELLA ---
function createCircleTexture() {
    const c = document.createElement("canvas");
    c.width = 64; c.height = 64;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0.0, "rgba(255,255,255,1)");
    g.addColorStop(0.2, "rgba(255,255,255,0.8)");
    g.addColorStop(1.0, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
}
const starTexture = createCircleTexture();

// --- CARGA DE MODELOS ---
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.173.0/examples/jsm/libs/draco/");
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
let moonModel, sol, sat;

loader.load('imgs/moon.glb', (g) => { moonModel = g.scene; moonModel.position.set(7.8, 1.7, -1.5); moonModel.scale.set(2.5, 2.5, 2.5); scene.add(moonModel); });
loader.load('imgs/Sol.glb', (g) => { sol = g.scene; sol.position.set(-28, 13, -1.5); sol.scale.set(5, 5, 5); scene.add(sol); });
loader.load('imgs/satellite.glb', (g) => {
    sat = g.scene;
    sat.traverse(c => { if (c.isMesh) { c.material.metalness = 0.9; c.material.roughness = 0.1; } });
    sat.scale.set(.3, .3, .3); scene.add(sat);
});

// --- GALAXIA ---
const isSmall = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4;
const count = isSmall ? 15000 : 40000;
const positions = new Float32Array(count * 3);
const original = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
const touched = new Uint8Array(count);
const colorHelper = new THREE.Color();

for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 1) * 25, a = Math.random() * Math.PI * 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r, z = (Math.random() - 0.5) * 4;
    positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
    original[i * 3] = x; original[i * 3 + 1] = y; original[i * 3 + 2] = z;

    const rand = Math.random();
    if (rand > 0.9) colorHelper.set(0x445566);
    else if (rand > 0.7) colorHelper.set(0x554433);
    else colorHelper.set(0x333333);

    // Intensidad base de las estrellas (0.8 según tu comentario)/ aumentar para que sean más blancas
    colors[i * 3] = colorHelper.r * 0.8; 
    colors[i * 3 + 1] = colorHelper.g * 0.8;
    colors[i * 3 + 2] = colorHelper.b * 0.8;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const points = new THREE.Points(geometry, new THREE.PointsMaterial({
    size: 0.06, 
    alphaMap: starTexture,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
}));
scene.add(points);

// Escultura orbital de código: acompaña proyectos, stack y contacto durante el recorrido.
const portfolioAccent = new THREE.Group();
const accentCoreMaterial = new THREE.MeshBasicMaterial({ color: 0xc7ff58, wireframe: true, transparent: true, opacity: 0 });
const accentRingMaterial = new THREE.MeshBasicMaterial({ color: 0x7de4e5, transparent: true, opacity: 0 });
const accentKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.05, 0.009, 120, 6, 2, 3), accentCoreMaterial);
const accentShell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.48, 1), new THREE.MeshBasicMaterial({ color: 0x9be8c4, wireframe: true, transparent: true, opacity: 0 }));
const accentRing = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.006, 8, 144), accentRingMaterial);
accentRing.rotation.set(0.8, 0.2, 0.25);
portfolioAccent.add(accentKnot, accentShell, accentRing);
portfolioAccent.position.set(5.1, 0.15, -1.4);
portfolioAccent.scale.setScalar(0.82);
scene.add(portfolioAccent);

// --- SETUP DE TINTINEO ---
const numTwinklers = 200; 
const twinkleData = [];

for (let i = 0; i < numTwinklers; i++) {
    const idx = Math.floor(Math.random() * count);
    twinkleData.push({
        idx: idx,
        speed: 2.0 + Math.random() * 5.0, 
        phase: Math.random() * Math.PI * 2,
        flashR: 1.0, 
        flashG: 1.0, 
        flashB: 1.0,
        baseR: colors[idx * 3],
        baseG: colors[idx * 3 + 1],
        baseB: colors[idx * 3 + 2]
    });
}

const mouse = new THREE.Vector2(), target = new THREE.Vector2(), raycaster = new THREE.Raycaster();
window.addEventListener("mousemove", (e) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// --- ANIMACIÓN ---
let isVisible = true;
let scrollScene = 0;
let sceneChapter = 0;
let introBlend = 1;
window.addEventListener("scroll", () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollScene = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    const chapters = [...document.querySelectorAll("#inicio, #proyects, #skills, #sobreMi, #contacto")];
    const center = window.innerHeight * 0.52;
    let closest = Infinity;
    chapters.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const distance = center < rect.top ? rect.top - center : center > rect.bottom ? center - rect.bottom : 0;
        if (distance < closest) { closest = distance; sceneChapter = index; }
    });
}, { passive: true });
let rafId = null;
const heroSection = document.body;
new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && rafId === null && !document.hidden) animate();
}, { threshold: 0 }).observe(heroSection);
document.addEventListener("visibilitychange", () => {
    if (!document.hidden && isVisible && rafId === null) animate();
});

function animate() {
    if (!isVisible || document.hidden) { rafId = null; return; }
    rafId = requestAnimationFrame(animate);
    const timeNow = performance.now();
    const time = timeNow * 0.001;
    mouse.lerp(target, 0.1);

    const cameraDepth = 8 + sceneChapter * 0.48;
    camera.position.z += (cameraDepth - camera.position.z) * 0.025;
    camera.position.x += (mouse.x * 2.5 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 2.5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    points.rotation.z = time * 0.02 + scrollScene * 0.055;

    const introTarget = sceneChapter === 0 ? 1 : 0;
    introBlend += (introTarget - introBlend) * 0.025;
    points.material.opacity += ((0.08 + introBlend * 0.72) - points.material.opacity) * 0.025;
    if (moonModel) moonModel.visible = introBlend > 0.12;
    if (sol) sol.visible = introBlend > 0.12;
    if (sat) sat.visible = introBlend > 0.12;
    satLight.visible = introBlend > 0.12;
    lightHelper.visible = introBlend > 0.12;

    const accentOpacity = Math.min(0.42, Math.max(0, sceneChapter * 0.12));
    const accentColors = [0xc7ff58, 0x7de4e5, 0xa3ffb0, 0xd7a7ff, 0xc7ff58];
    accentCoreMaterial.color.setHex(accentColors[sceneChapter] || accentColors[0]);
    accentCoreMaterial.opacity += (accentOpacity - accentCoreMaterial.opacity) * 0.035;
    accentShell.material.opacity += (accentOpacity * 0.38 - accentShell.material.opacity) * 0.035;
    accentRingMaterial.opacity += (accentOpacity * 0.8 - accentRingMaterial.opacity) * 0.035;
    portfolioAccent.rotation.y += 0.003 + sceneChapter * 0.0007;
    portfolioAccent.rotation.x = Math.sin(time * 0.3) * 0.08;
    portfolioAccent.position.x += ((window.innerWidth < 760 ? 3.5 : 5.1) - portfolioAccent.position.x) * 0.025;
    portfolioAccent.position.y = Math.sin(time * 0.45) * 0.15;

    // --- SATÉLITE ---
    if (sat) {
        const spd = time * 0.2;
        const posX = Math.cos(spd) * 7 + 3;
        const posY = Math.sin(spd * 0.5) * 1.5;
        const posZ = Math.sin(spd) * 6;
        sat.position.set(posX, posY, posZ);
        satLight.position.copy(sat.position);
        lightHelper.position.copy(sat.position);
        sat.rotation.y += 0.01;
    }

    // --- INTERACCIÓN GALAXIA ---
    raycaster.setFromCamera(mouse, camera);
    const mousePos = new THREE.Vector3();
    raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), mousePos);
    if (moonModel) moonModel.rotation.y += 0.001;
    if (sol) sol.rotation.y += 0.001;

    const posArr = geometry.attributes.position.array;
    const cosR = Math.cos(-points.rotation.z), sinR = Math.sin(-points.rotation.z);
    const lMX = mousePos.x * cosR - mousePos.y * sinR;
    const lMY = mousePos.x * sinR + mousePos.y * cosR;

    // Solo se tocan las partículas que estaban afectadas el frame anterior o lo están ahora
    const R2 = 4; // radio 2 al cuadrado
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const ox = original[i3], oy = original[i3 + 1];
        const dx = ox - lMX, dy = oy - lMY;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
            const f = (1 - Math.sqrt(d2) / 2) * 0.8;
            posArr[i3] = ox + (lMX - ox) * f;
            posArr[i3 + 1] = oy + (lMY - oy) * f;
            touched[i] = 1;
        } else if (touched[i]) {
            posArr[i3] = ox; posArr[i3 + 1] = oy;
            touched[i] = 0;
        }
    }
    geometry.attributes.position.needsUpdate = true;

    // --- TINTINEO ---
    const colorArr = geometry.attributes.color.array;
    for (let i = 0; i < numTwinklers; i++) {
        const t = twinkleData[i];
        const i3 = t.idx * 3;
        const flash = Math.pow(Math.sin(time * t.speed + t.phase), 30); 
        
        colorArr[i3] = t.baseR + (t.flashR * flash * 40.0);
        colorArr[i3 + 1] = t.baseG + (t.flashG * flash * 40.0);
        colorArr[i3 + 2] = t.baseB + (t.flashB * flash * 40.0);
    }
    geometry.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

} catch (err) {
    console.error("Error al iniciar la escena 3D (el resto del sitio sigue funcionando):", err);
}




