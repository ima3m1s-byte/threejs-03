import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';

class ThreeApp {
  static SATELLITE_DISTANCE = 120;

  constructor(wrapper) {
    this.wrapper = wrapper;
    this.render = this.render.bind(this);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(new THREE.Color(0x000000));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(0, 0, 500);
    this.scene.add(this.camera);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    this.scene.add(this.directionalLight);
    this.scene.add(new THREE.AmbientLight(0xFFFFFF, 1));
    this.scene.add(new THREE.DirectionalLightHelper(this.directionalLight, 6));

    this.group = new THREE.Group();
    this.anime = false;

    this.coneGeometry = new THREE.ConeGeometry(10, 25, 32);
    this.satelliteMaterial = new THREE.MeshPhongMaterial({ color: 0xff00dd });
    this.satellite = new THREE.Mesh(this.coneGeometry, this.satelliteMaterial);
    this.satellite.position.set(ThreeApp.SATELLITE_DISTANCE, 0, 0);

    this.ball = new THREE.SphereGeometry(100, 32, 32);
    this.earthMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff33 });
    this.earth = new THREE.Mesh(this.ball, this.earthMaterial);

    this.group.add(this.satellite);
    this.scene.add(this.earth);
    this.scene.add(this.group);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.scene.add(new THREE.AxesHelper(500));

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
    }, false);

    this.wrapper.appendChild(this.renderer.domElement);
  }

  render() {
    requestAnimationFrame(this.render);

    if (this.anime) {
      // 尖端方向（ローカルY軸）をワールド空間で取得
      const tipDirection = new THREE.Vector3(0, 1, 0)
        .applyQuaternion(this.satellite.quaternion)
        .normalize();

      // X軸との外積 → 尖端に垂直な公転軸を求める
      // 初期状態(尖端=+Y)のとき: X × Y = -Z → negateしてZ軸方向に
      const worldX = new THREE.Vector3(1, 0, 0);
      const orbitAxis = new THREE.Vector3()
        .crossVectors(tipDirection, worldX)
        .normalize();

      // 特異点（尖端がX軸と平行）の回避
      if (orbitAxis.lengthSq() < 0.001) {
        orbitAxis.set(0, 0, 1);
      }

      const delta = new THREE.Quaternion();
      delta.setFromAxisAngle(orbitAxis, -0.02);
      this.group.quaternion.premultiply(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

const wrapper = document.querySelector('#webgl');
const app = new ThreeApp(wrapper);

window.addEventListener("DOMContentLoaded", () => {
  app.renderer.setSize(window.innerWidth, window.innerHeight);
  app.render();
});

const rotateBtn = document.querySelector(".rotatebtn");
rotateBtn.addEventListener("click", () => {
  app.satellite.rotateX(2 * Math.PI / 360 * rotateBtn.dataset.rotate);
});

const animeBtn = document.querySelector(".animebtn");
animeBtn.addEventListener("click", () => {
  app.anime = !app.anime;
});

const resetBtn = document.querySelector(".reset");
resetBtn.addEventListener("click", () => {
  app.anime = false;
  app.group.quaternion.set(0, 0, 0, 1);
  app.satellite.rotation.set(0, 0, 0);
  app.satellite.position.set(ThreeApp.SATELLITE_DISTANCE, 0, 0);
});