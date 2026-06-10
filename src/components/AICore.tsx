import { useRef, useEffect } from "react";
import * as THREE from "three";

/**
 * AICore — original WebGL "AI agent" hero object.
 * A glassy faceted crystal core wrapped in a glowing wireframe, orbited by a
 * neural network of nodes + links, ambient dust, reactive to the mouse.
 *
 * Requires: npm install three @types/three
 * Drop inside a positioned parent (e.g. a relative div with a fixed height).
 */
export default function AICore() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;

    // Gracefully skip if WebGL is unavailable (e.g. sandboxed environments)
    const testCanvas = document.createElement("canvas");
    const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
    if (!gl) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W(), H());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // ── Core crystal ──
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 1),
      new THREE.MeshStandardMaterial({
        color: 0x2a1200, metalness: 0.3, roughness: 0.65,
        emissive: 0xff6010, emissiveIntensity: 0.06,
        flatShading: true, transparent: true, opacity: 0.97,
      })
    );
    group.add(core);

    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.54, 1),
      new THREE.MeshBasicMaterial({ color: 0xffaa44, wireframe: true, transparent: true, opacity: 0.35 })
    );
    group.add(wire);

    const kernel = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 0),
      new THREE.MeshBasicMaterial({ color: 0xff8020, transparent: true, opacity: 0.92 })
    );
    group.add(kernel);

    // ── Neural nodes ──
    const NODES = 26;
    const nodeGroup = new THREE.Group();
    group.add(nodeGroup);
    const nodes: THREE.Mesh[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffc06a });
    const nodeMat2 = new THREE.MeshBasicMaterial({ color: 0x8f7bff });
    for (let i = 0; i < NODES; i++) {
      const m = new THREE.Mesh(nodeGeo, i % 5 === 0 ? nodeMat2 : nodeMat);
      const phi = Math.acos(1 - (2 * (i + 0.5)) / NODES);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2.6 + (i % 3) * 0.35;
      m.userData = { phi, theta, base: r, speed: 0.12 + (i % 4) * 0.04 };
      m.position.setFromSphericalCoords(r, phi, theta);
      nodeGroup.add(m);
      nodes.push(m);
    }

    // ── Links ──
    const linkPairs: THREE.Mesh[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].position.distanceTo(nodes[j].position) < 1.5 && Math.random() > 0.55) {
          linkPairs.push(nodes[i], nodes[j]);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linkPairs.length * 3), 3));
    const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0xff8a30, transparent: true, opacity: 0.18 }));
    group.add(lines);

    // ── Dust ──
    const dustCount = 320;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const r = 3.4 + Math.random() * 3.2;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      dustPos[i * 3] = r * Math.sin(b) * Math.cos(a);
      dustPos[i * 3 + 1] = r * Math.sin(b) * Math.sin(a);
      dustPos[i * 3 + 2] = r * Math.cos(b);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffb366, size: 0.028, transparent: true, opacity: 0.5 }));
    scene.add(dust);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x150800, 0.8));
    const p1 = new THREE.PointLight(0xff6010, 18, 20); p1.position.set(4, 3, 4); scene.add(p1);
    const p2 = new THREE.PointLight(0x6644ff, 4, 20); p2.position.set(-5, -4, 1); scene.add(p2);
    const p3 = new THREE.PointLight(0xff9933, 3, 15); p3.position.set(-2, 4, 3); scene.add(p3);

    // ── Mouse parallax ──
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, t = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.01;
      cur.x += (target.x - cur.x) * 0.05;
      cur.y += (target.y - cur.y) * 0.05;
      const sp = reduce ? 0.2 : 1;

      group.rotation.y += 0.0024 * sp;
      group.rotation.x = cur.y * 0.4;
      group.rotation.z = cur.x * 0.08;
      wire.rotation.y -= 0.004 * sp;
      wire.rotation.x += 0.002 * sp;
      core.rotation.y -= 0.0012 * sp;
      kernel.rotation.x += 0.02 * sp;
      kernel.rotation.y += 0.016 * sp;
      kernel.scale.setScalar(0.9 + Math.sin(t * 2.2) * 0.12);

      nodes.forEach((m, i) => {
        const u = m.userData as { phi: number; theta: number; base: number; speed: number };
        const rr = u.base + Math.sin(t * u.speed * 6 + i) * 0.12;
        m.position.setFromSphericalCoords(rr, u.phi + Math.sin(t * 0.3 + i) * 0.04, u.theta + t * u.speed * 0.4);
      });
      nodeGroup.rotation.y = t * 0.06;

      const pa = lineGeo.attributes.position.array as Float32Array;
      for (let k = 0; k < linkPairs.length; k++) {
        pa[k * 3] = linkPairs[k].position.x;
        pa[k * 3 + 1] = linkPairs[k].position.y;
        pa[k * 3 + 2] = linkPairs[k].position.z;
      }
      lineGeo.attributes.position.needsUpdate = true;

      dust.rotation.y = -t * 0.02;
      dust.rotation.x = t * 0.01;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0 }} aria-hidden="true" />;
}
