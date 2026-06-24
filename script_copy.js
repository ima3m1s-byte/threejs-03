

// 必要なモジュールを読み込み
import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

class ThreeApp {
  static SATELLITE_DISTANCE = 120;

  constructor(wrapper) {
    this.wrapper = wrapper;

    this.render = this.render.bind(this);

    // レンダラ
    this.renderer = new THREE.WebGLRenderer();


    // 画面の色
    const color = new THREE.Color(0xf000000);
    console.log(color);
    this.renderer.setClearColor(color);

    // シーン
    this.scene = new THREE.Scene();
    // カメラ
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

    // カメラのポジション
    this.camera.position.set(0, 0, +500);

    this.scene.add(this.camera);
    // ライト
    this.directionalLight = new THREE.DirectionalLight(
      0xffffff, 10
    );

    this.scene.add(this.directionalLight);

    const lightColor = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.AmbientLight(lightColor, intensity);
    this.scene.add(light);

    const helper = new THREE.DirectionalLightHelper(this.directionalLight, 6);
    this.scene.add(helper);

    // group
    this.group = new THREE.Group();

    // アニメ中か
    this.anime = false;


    // オブジェクト（飛行物）
    // 形
    this.coneGeometry = new THREE.ConeGeometry(10, 25, 32);

    // 色　MeshPhongMaterial　光沢のある素材
    this.satelliteMaterial = new THREE.MeshPhongMaterial({ color: 0xff00dd });
    // 色と形でメッシュを作成
    this.satellite = new THREE.Mesh(this.coneGeometry, this.satelliteMaterial);
    this.satelliteDirection = new THREE.Vector3(50, 50, 0).normalize();

    // メッシュをシーンに追加
    // this.scene.add(this.satellite);
    this.satellite.position.set(ThreeApp.SATELLITE_DISTANCE, 0, 0);

    // オブジェクト（球体）
    this.ball = new THREE.SphereGeometry(100, 32, 32);
    // マテリアル
    this.earthMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff33 });
    this.earth = new THREE.Mesh(this.ball, this.earthMaterial);

    this.group.add(this.satellite);
    this.scene.add(this.earth);
    this.scene.add(this.group);
    // コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);


    // ヘルパー
    const axesBarLength = 500;
    this.axesHelper = new THREE.AxesHelper(axesBarLength);
    this.scene.add(this.axesHelper);


    // リサイズイベント
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      // 更新
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
    }, false);
    this.wrapper.appendChild(this.renderer.domElement);
  }

  render() {
    requestAnimationFrame(this.render);

    if (this.anime) {

      this.group.rotation.z += 0.02;
    }

    // canvas要素をラッパーの子要素にする
    // シーンとカメラでレンダー
    this.renderer.render(this.scene, this.camera);
  }
}

const wrapper = document.querySelector('#webgl');
const app = new ThreeApp(wrapper);

window.addEventListener("DOMContentLoaded", () => {
  app.renderer.setSize(window.innerWidth, window.innerHeight);
  app.render();
})


// マウスカーソルの動きを検出できるようにする @@@
window.addEventListener('click', (e) => {

  if (app.anime) {
    app.anime = false;
    return;
  }

  app.anime = true;

}, false);
