import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

import './CircularGallery.css';

type GalleryItem = { image: string; text: string };
type CircularGalleryProps = {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
};

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: Record<string, any>) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function createTextTexture(gl: WebGLRenderingContext, text: string, font = '800 40px "Figtree", "Inter", sans-serif', color = '#ffffff') {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const padding = 26 * dpr;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable');

  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(parseInt(font, 10) * 1.2);

  canvas.width = Math.ceil(textWidth + padding * 2);
  canvas.height = Math.ceil(textHeight + padding * 1.5);

  context.scale(dpr, dpr);
  context.font = font;
  context.textBaseline = 'middle';
  context.textAlign = 'center';

  const chipWidth = (canvas.width / dpr) - padding * 0.32;
  const chipHeight = (canvas.height / dpr) - padding * 0.38;
  const chipX = (canvas.width / dpr - chipWidth) / 2;
  const chipY = (canvas.height / dpr - chipHeight) / 2;
  context.fillStyle = 'rgba(0, 0, 0, 0.75)';
  context.roundRect(chipX, chipY, chipWidth, chipHeight, 14);
  context.fill();

  // Soft stroke for extra contrast
  context.strokeStyle = 'rgba(255,255,255,0.4)';
  context.lineWidth = 1.2;
  context.stroke();

  context.fillStyle = color;
  context.shadowColor = 'rgba(0,0,0,0.6)';
  context.shadowBlur = 6;
  context.fillText(text, canvas.width / (2 * dpr), canvas.height / (2 * dpr));

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width / dpr, height: canvas.height / dpr };
}

class Title {
  gl: WebGLRenderingContext;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor: string;
  font: string;
  mesh!: Mesh;

  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }: { gl: WebGLRenderingContext; plane: Mesh; renderer: Renderer; text: string; textColor?: string; font?: string }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });

    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeight = Math.max(this.plane.scale.y * 0.28, 0.4);
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.50 - textHeight * 0.2;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  extra = 0;
  geometry: Plane;
  gl: WebGLRenderingContext;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: { width: number; height: number };
  text: string;
  viewport: { width: number; height: number };
  bend: number;
  textColor: string;
  borderRadius: number;
  font: string;
  program!: Program;
  plane!: Mesh;
  title!: Title;
  speed = 0;
  scale = 1;
  padding = 2;
  width = 0;
  widthTotal = 0;
  x = 0;
  isBefore = false;
  isAfter = false;

  constructor({ geometry, gl, image, index, length, renderer, scene, screen, text, viewport, bend, textColor, borderRadius = 0, font }: { geometry: Plane; gl: WebGLRenderingContext; image: string; index: number; length: number; renderer: Renderer; scene: Transform; screen: { width: number; height: number }; text: string; viewport: { width: number; height: number }; bend: number; textColor: string; borderRadius?: number; font: string }) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);

          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font,
    });
  }

  update(scroll: { current: number; last: number }, direction: 'right' | 'left') {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport }: { screen?: { width: number; height: number }; viewport?: { width: number; height: number } } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if ((this.plane as any).program.uniforms.uViewportSizes) {
        (this.plane as any).program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 3.5; // add breathing room between cards
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  container: HTMLDivElement;
  scrollSpeed: number;
  scroll: { ease: number; current: number; target: number; last: number; position?: number };
  onCheckDebounce: () => void;
  renderer!: Renderer;
  gl!: WebGLRenderingContext;
  camera!: any;
  scene!: Transform;
  planeGeometry!: Plane;
  mediasImages: GalleryItem[] = [];
  medias: Media[] = [];
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  isDown = false;
  isHovered = false;
  start = 0;
  raf = 0;
  boundOnMouseEnter?: () => void;
  boundOnMouseLeave?: () => void;

  constructor(container: HTMLDivElement, { items, bend = 3, textColor = '#ffffff', borderRadius = 0.05, font = 'bold 30px Figtree', scrollSpeed = 2, scrollEase = 0.05 }: { items?: GalleryItem[]; bend?: number; textColor?: string; borderRadius?: number; font?: string; scrollSpeed?: number; scrollEase?: number }) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck, 200);

    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl as unknown as WebGLRenderingContext;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
  }

  createMedias(items: GalleryItem[] = [], bend = 1.2, textColor: string, borderRadius: number, font: string) {
    const defaultItems: GalleryItem[] = [
      { image: 'https://picsum.photos/seed/bridge/900/650', text: 'Bridge' },
      { image: 'https://picsum.photos/seed/desk/900/650', text: 'Desk Setup' },
      { image: 'https://picsum.photos/seed/water/900/650', text: 'Waterfall' },
      { image: 'https://picsum.photos/seed/strawberry/900/650', text: 'Strawberries' },
      { image: 'https://picsum.photos/seed/dive/900/650', text: 'Deep Diving' },
      { image: 'https://picsum.photos/seed/train/900/650', text: 'Train Track' },
      { image: 'https://picsum.photos/seed/island/900/650', text: 'Santorini' },
      { image: 'https://picsum.photos/seed/lights/900/650', text: 'Blurry Lights' },
      { image: 'https://picsum.photos/seed/nyc/900/650', text: 'New York' },
      { image: 'https://picsum.photos/seed/dog/900/650', text: 'Good Boy' },
      { image: 'https://picsum.photos/seed/coast/900/650', text: 'Coastline' },
      { image: 'https://picsum.photos/seed/palms/900/650', text: 'Palm Trees' },
    ];

    const galleryItems = items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) =>
      new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
      }),
    );
  }

  onTouchDown = (e: TouchEvent | MouseEvent) => {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
  };

  onTouchMove = (e: TouchEvent | MouseEvent) => {
    if (!this.isDown) return;
    const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = (this.scroll.position ?? 0) + distance;
  };

  onTouchUp = () => {
    this.isDown = false;
    this.onCheck();
  };

  onWheel = (e: WheelEvent) => {
    const delta = e.deltaY || (e as any).wheelDelta || (e as any).detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  };

  onCheck = () => {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  };

  onResize = () => {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  };

  update = () => {
    if (!this.isDown && !this.isHovered) {
      const isMobile = window.innerWidth <= 640;
        this.scroll.target += isMobile ? 0.03 : 0.08; // slower auto-scroll
    }

    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction: 'right' | 'left' = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update);
  };

  addEventListeners() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousewheel', this.onWheel as EventListener);
    window.addEventListener('wheel', this.onWheel as EventListener);
    window.addEventListener('mousedown', this.onTouchDown as EventListener);
    window.addEventListener('mousemove', this.onTouchMove as EventListener);
    window.addEventListener('mouseup', this.onTouchUp as EventListener);
    window.addEventListener('touchstart', this.onTouchDown as EventListener);
    window.addEventListener('touchmove', this.onTouchMove as EventListener);
    window.addEventListener('touchend', this.onTouchUp as EventListener);

    this.boundOnMouseEnter = () => { this.isHovered = true; };
    this.boundOnMouseLeave = () => { this.isHovered = false; };
    this.container.addEventListener('mouseenter', this.boundOnMouseEnter);
    this.container.addEventListener('mouseleave', this.boundOnMouseLeave);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousewheel', this.onWheel as EventListener);
    window.removeEventListener('wheel', this.onWheel as EventListener);
    window.removeEventListener('mousedown', this.onTouchDown as EventListener);
    window.removeEventListener('mousemove', this.onTouchMove as EventListener);
    window.removeEventListener('mouseup', this.onTouchUp as EventListener);
    window.removeEventListener('touchstart', this.onTouchDown as EventListener);
    window.removeEventListener('touchmove', this.onTouchMove as EventListener);
    window.removeEventListener('touchend', this.onTouchUp as EventListener);
    if (this.boundOnMouseEnter) this.container.removeEventListener('mouseenter', this.boundOnMouseEnter);
    if (this.boundOnMouseLeave) this.container.removeEventListener('mouseleave', this.boundOnMouseLeave);
    if (this.renderer?.gl?.canvas?.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default function CircularGallery({ items = [], bend = 3, textColor = '#ffffff', borderRadius = 0.05, font = '800 40px "Figtree", "Inter", sans-serif', scrollSpeed = 1, scrollEase = 0.12 }: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const app = new App(containerRef.current, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase });
    return () => app.destroy();
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);

  return <div className="circular-gallery-block" ref={containerRef} />;
}
