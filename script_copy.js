

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
    // console.log(cameraPos);
    // this.camera.position.set(200, 200, 500);

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

    // メッシュをシーンに追加
    // this.scene.add(this.earth);

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
      // プロジェクション行列を更新
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
    }, false);
    this.wrapper.appendChild(this.renderer.domElement);
  }

  render() {
    requestAnimationFrame(this.render);
    // this.group.rotation.z += 0.05;
    // コントロールを更新
    // this.controls.update();

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
  console.log(beforeRadians);
  console.log(isMoved);
  if (isMoved) {
    const resetQtn = new THREE.Quaternion().setFromAxisAngle(resetAxis, beforeRadians);
    app.satellite.quaternion.premultiply(resetQtn);
    app.satellite.position.set(
      ThreeApp.SATELLITE_DISTANCE, 0, 0
    );

    app.render();
    isMoved = false;
    return;
  }

  isClicked = true;

  // ポインター（マウスカーソル）のクライアント領域上の座標
  const pointerX = e.clientX;
  const pointerY = e.clientY;
  // 3D のワールド空間に合わせてスケールを揃える 右端が1,左端が-1になる
  const scaleX = pointerX / window.innerWidth * 2.0 - 1.0;
  const scaleY = pointerY / window.innerHeight * 2.0 - 1.0;

  console.log("X" + scaleX);
  console.log("Y" + scaleY);

  // const subVector = new THREE.Vector3().subVectors(this.moon.position, this.satellite.position);

  // app.satellite.position.set(
  //   scaleX * 100,
  //   scaleY * -100,
  //   0.0
  // );

  const clickPosVector = new THREE.Vector3(scaleX * 100, scaleY * -100, 0);
  console.log("clickPosVector" + clickPosVector);
  const subVector = new THREE.Vector3().subVectors(clickPosVector, app.satellite.position);
  console.log(subVector);

  subVector.normalize();
  console.log("の孫" + subVector);

  const beforePos = new THREE.Vector3(0, 50, 0);
  beforePos.normalize();

  // (C) 変換前と変換後の２つのベクトルから外積で法線ベクトルを求める @@@
  const normalAxis = new THREE.Vector3().crossVectors(beforePos, subVector);
  normalAxis.normalize();
  // (D) 変換前と変換後のふたつのベクトルから内積でコサインを取り出す
  const cos = beforePos.dot(subVector);
  console.log("コス！" + cos);
  // (D) コサインをラジアンに戻す
  const radians = Math.acos(cos);
  console.log("ラディア〜ン" + radians);
  const qtn = new THREE.Quaternion().setFromAxisAngle(normalAxis, radians);
  app.satellite.quaternion.premultiply(qtn);
  // console.log(app.satellite.position);
  isMoved = true;
  app.render();
  // 元の位置に回転するための軸
  resetAxis = new THREE.Vector3().crossVectors(subVector, beforePos).normalize();

  beforeRadians = radians;

  // - ２を掛けて１を引く -------------------------------------------------
  // WebGL やグラフィックスプログラミングの文脈では、座標の値を加工するよう
  // なケースが多くあります。（要は座標変換）
  // なんらかの座標系（座標の取り扱いを決めた１つのルール）から、別の座標系
  // へと値を変換する際、座標を 0.0 ～ 1.0 の範囲になるように変換したり、似
  // たようなケースとして -1.0 ～ 1.0 に変換するような状況がよくあります。
  // 今回の例では「ブラウザのクライアント領域の座標系」から、三次元の世界で
  // 扱いやすいように座標を変換しましたが、画面の幅や高さで割ることでまず値
  // を 0.0 ～ 1.0 の範囲に収まるよう変換し、さらに続けて -1.0 ～ 1.0 に変換
  // するために２倍して１を引いています。
  // 単純計算なので、落ち着いて考えてみましょう。
  // ----------------------------------------------------------------------
}, false);

function setHeadPosAnimation(headPos) {
  requestAnimationFrame(setHeadPosAnimation);

  if (!isClicked) {
    return;
  }


}