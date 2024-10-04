import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  signal,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

type Cube = THREE.Mesh<
  THREE.BoxGeometry,
  THREE.MeshBasicMaterial,
  THREE.Object3DEventMap
>;
type Cubes = Cube[];

@Component({
  selector: 'app-three-scene',
  templateUrl: './three-scene.component.html',
  standalone: true,
  styleUrl: './three-scene.component.css',
})
export class ThreeSceneComponent implements OnInit {
  currentRange = signal(1000);
  currentLods: THREE.LOD<THREE.Object3DEventMap>[] = [];
  infoRender = signal({
    calls: 0,
    frame: 0,
    lines: 0,
    points: 0,
    triangles: 0,
  });
  cubes!: THREE.InstancedMesh;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75, // FOV - поле зрения. Протяженность сцены в градусах.
    window.innerWidth / window.innerHeight, // соотношение сторон
    0.1, // near
    110 // far
  );
  renderer = new THREE.WebGLRenderer(); // canvas
  controls = new OrbitControls(this.camera, this.renderer.domElement);
  @ViewChild('canvas', { static: true }) // просто мой div
  canvasRef!: ElementRef<HTMLElement>;

  deleteCube(cube: THREE.InstancedMesh) {
    // @ts-ignore
    cube.material?.dispose();
    cube.geometry.dispose();

    this.scene.remove(cube);
  }
  deleteCubes() {
    this.cubes && this.deleteCube(this.cubes);
    this.currentLods.forEach((lod) => {
      this.scene.remove(lod);
    });
    this.currentLods = [];
  }
  randomCoords(): number {
    return Math.random() * 40 - 25;
  }
  addCube(cube: THREE.InstancedMesh) {
    this.cubes = cube;
    this.renderScene();
  }
  createInstanceCubes(count: number) {
    //создание одинаковых кубов
    const lod = new THREE.LOD();
    const geometryHigh = new THREE.BoxGeometry(1, 1, 1); // геометрия куба, вершины
    const geometryLow = new THREE.BoxGeometry(0.5, 0.5, 0.5); // геометрия куба, вершины
    const geometrySuperLow = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    const material = new THREE.MeshBasicMaterial({ color: 0xfcba03 }); // его окраска, зеленый
    const instancedMeshHigh = new THREE.InstancedMesh(
      geometryHigh,
      material,
      count
    );
    const instancedMeshLow = new THREE.InstancedMesh(
      geometryLow,
      material,
      count
    );
    const instancedMeshSuperLow = new THREE.InstancedMesh( //супер низкое качество (в теории)
      geometrySuperLow,
      material,
      count
    );
    for (let i = 0; i < count; i++) {
      const position = new THREE.Matrix4().makeTranslation(
        this.randomCoords(), // x
        this.randomCoords(), // y
        this.randomCoords() // z
      );
      instancedMeshHigh.setMatrixAt(i, position);
      instancedMeshLow.setMatrixAt(i, position);
      instancedMeshSuperLow.setMatrixAt(i, position);
    }
    lod.addLevel(instancedMeshHigh, 0); //высотакая дет
    lod.addLevel(instancedMeshLow, 50); //низкая
    lod.addLevel(instancedMeshSuperLow, 100); // super низкая
    this.scene.add(lod);
    this.currentLods.push(lod);
    return instancedMeshHigh;
  }
  addCubes() {
    this.deleteCubes();
    const instance = this.createInstanceCubes(this.currentRange());
    this.addCube(instance);
  }

  ngOnInit() {
    this.renderer.setSize(window.innerWidth, window.innerHeight); // размер приложения
    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);

    this.camera.position.z = 45; // отодвинуть камеру
    this.controls = new OrbitControls(this.camera, this.renderer.domElement); // обновляю
    this.controls.autoRotate = false;
    this.controls.target.set(0, 0.5, 0);
    this.controls.enablePan = false; //панорама
    this.controls.enableDamping = true; // сглаживание
    this.controls.update();

    this.addCubes();
    this.renderer.setAnimationLoop(this.rerenderCamera.bind(this)); // петля для обновления камеры
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera); // рендер сцены
  }

  rerenderCamera() {
    this.controls.update();
    this.renderScene();
  }

  handleRange(value: any) {
    this.currentRange.set(value.target.value);
    this.addCubes();

    //информация
    this.infoRender.set(this.renderer.info.render);
    console.log('Кубы:', this.scene.children);
  }
}
