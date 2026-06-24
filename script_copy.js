

// 必要なモジュールを読み込み
import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

let isClicked = false;
let isMoved = false;

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
    const cameraPos = new THREE.Vector3(0.0, 200, 1000);
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    // this.camera.position.copy(cameraPos);
    // カメラのポジションをセットするのが大事
    this.camera.position.set(0, 0, +500);
    // カメラの中心の座標的な？オービットコントロールがついてると意味ない的な？
    this.camera.lookAt(300, 0, 0);


    this.scene.add(this.camera);
    // ライト
    this.directionalLight = new THREE.DirectionalLight(
      0xffffff, 3
    );
    this.scene.add(this.directionalLight);
    const helper = new THREE.DirectionalLightHelper(this.directionalLight, 6);
    this.scene.add(helper);

    const colorLight = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.AmbientLight(colorLight, intensity);
    this.scene.add(light);

    this.isAnimating = false;
    this.circleCenter = null;
    this.theta = 0;
    this.radius = 120;

    // オブジェクト
    // 形
    this.coneGeometry = new THREE.ConeGeometry(10, 25, 32);

    // 色　MeshPhongMaterial　光沢のある素材
    this.satelliteMaterial = new THREE.MeshPhongMaterial({ color: 0xff00dd });
    // 色と形でメッシュを作成
    this.satellite = new THREE.Mesh(this.coneGeometry, this.satelliteMaterial);
    this.satelliteDirection = new THREE.Vector3(50, 50, 0).normalize();

    // メッシュをシーンに追加
    this.scene.add(this.satellite);
    this.satellite.position.set(120, 0, 0);

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
      // プロジェクション行列を更新
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
    }, false);
    this.wrapper.appendChild(this.renderer.domElement);
  }

  render() {
    requestAnimationFrame(this.render);

    if (this.isAnimating) {

      this.theta -= 0.02;

      this.satellite.position.set(
        this.circleCenter.x + Math.cos(this.theta) * this.radius,
        this.circleCenter.y + Math.sin(this.theta) * this.radius,
        0
      );

      const tangent = new THREE.Vector3(
        Math.sin(this.theta),
        -Math.cos(this.theta),
        0
      ).normalize();

      this.satellite.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        tangent
      );
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


let beforeRadians = 0;
let resetAxis;
// マウスカーソルの動きを検出できるようにする @@@
window.addEventListener('click', (e) => {
  if (app.isAnimating) {
    app.isAnimating = false;
    return;
  }

  // ポインター（マウスカーソル）のクライアント領域上の座標
  const pointerX = e.clientX;
  const pointerY = e.clientY;
  // 3D のワールド空間に合わせてスケールを揃える 右端が1,左端が-1になる
  const scaleX = pointerX / window.innerWidth * 2.0 - 1.0;
  const scaleY = pointerY / window.innerHeight * 2.0 - 1.0;


  const clickPosVector = new THREE.Vector3(scaleX * 300, scaleY * -300, 0);

  const subVector = new THREE.Vector3()
    .subVectors(clickPosVector, app.satellite.position)
    .normalize();

  const beforePos = new THREE.Vector3(0, 50, 0);
  beforePos.normalize();

  // (C) 変換前と変換後の２つのベクトルから外積で法線ベクトルを求める @@@
  const normalAxis = new THREE.Vector3().crossVectors(beforePos, subVector);
  normalAxis.normalize();
  // (D) 変換前と変換後のふたつのベクトルから内積でコサインを取り出す
  const cos = beforePos.dot(subVector);

  // (D) コサインをラジアンに戻す
  const radians = Math.acos(cos);

  const qtn = new THREE.Quaternion().setFromAxisAngle(normalAxis, radians);
  app.satellite.quaternion.premultiply(qtn);


  const direction = subVector.clone();

  const left = new THREE.Vector3(
    -direction.y,
    direction.x,
    0
  );

  app.circleCenter = app.satellite.position.clone().add(
    left.multiplyScalar(app.radius)
  );

  const radiusVector = new THREE.Vector3()
    .subVectors(
      app.satellite.position,
      app.circleCenter
    );

  app.theta = Math.atan2(
    radiusVector.y,
    radiusVector.x
  );

  app.isAnimating = true;

  app.satellite.position.set(120, 0, 0);
  isMoved = true;

  app.render();

  // リセット用の軸
  resetAxis = new THREE.Vector3().crossVectors(subVector, beforePos).normalize();
  beforeRadians = radians;

}, false);
