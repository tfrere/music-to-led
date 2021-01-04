import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { svgPathProperties } from 'svg-path-properties';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { group } from 'console';
import { Vector3 } from 'three';

let size = 50;
let divisions = 30;

const centerObject = obj => {
  let children = obj.children;
  let minVector = { x: 0, y: 0, z: 0 };
  let maxVector = { x: 0, y: 0, z: 0 };
  for (let i = 0, j = children.length; i < j; i++) {
    let box = new THREE.Box3().setFromObject(children[i]);
    let sphere = box.getBoundingSphere(new THREE.Sphere());
    let centerPoint = sphere.center;
    if (centerPoint.x < minVector.x) minVector.x = centerPoint.x;
    if (centerPoint.y < minVector.y) minVector.y = centerPoint.y;
    if (centerPoint.z < minVector.z) minVector.z = centerPoint.z;
    if (centerPoint.x > minVector.x) maxVector.x = centerPoint.x;
    if (centerPoint.y > minVector.y) maxVector.y = centerPoint.y;
    if (centerPoint.z > minVector.z) maxVector.z = centerPoint.z;
  }
  // console.log('this is complete', minVector, maxVector);
  // var objectCenter = completeBoundingBox.getCenter();
  // console.log('This is the center of your Object3D:', objectCenter);
  obj.position.set(
    (maxVector.x - minVector.x) / 2,
    (maxVector.y - minVector.y) / 2,
    (maxVector.z - minVector.z) / 2
  );
  // console.log('obj position', obj.position);
};

class ScenoVisualizer2d extends React.Component {
  constructor(props) {
    super(props);
    const scenes = this.props.config._strips.map(strip => {
      return strip.scene;
    });
    let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    let camera = new THREE.PerspectiveCamera(
      45,
      this.props.width / this.props.height,
      0.1,
      1000
    );
    // let camera = new THREE.OrthographicCamera(
    //   this.props.width / -2,
    //   this.props.width / 2,
    //   this.props.height / 2,
    //   this.props.height / -2,
    //   0.1,
    //   1000
    // );
    camera.position.x = 0;
    camera.position.y = 0.05;
    camera.position.z = -5.2;
    camera.lookAt(0, 0, 0);

    let light = new THREE.AmbientLight(0x404040, 100); // soft white light

    let backgroundColor = '#051824'; //'rgb(9,24,35)';
    let gridColor = 'rgb(35,50,60)';
    let centerGridColor = 'rgb(25,40,50)';
    let gridHelper = new THREE.GridHelper(
      size,
      divisions,
      gridColor,
      centerGridColor
    );
    gridHelper.position.set(0, -5, 0);

    this.state = {
      hasDarkMode: false,
      scene: new THREE.Scene(),
      scenes: scenes,
      camera: camera,
      light: light,
      renderer: renderer,
      controls: new OrbitControls(camera, renderer.domElement),
      gridHelper: gridHelper,
      backgroundColor: backgroundColor,
      shapesObjects: [],
      groupObject: null
    };
    // console.log(props);

    document.addEventListener('keydown', this.handleKeyDown);
  }

  onWindowResize = () => {
    this.state.camera.aspect = this.props.width / this.props.height;
    this.state.camera.updateProjectionMatrix();
    this.state.renderer.setSize(this.props.width, this.props.height);
  };

  handleKeyDown = event => {
    let that = this;
    switch (event.keyCode) {
      case 32:
        event.preventDefault();
        that.state.camera.position.set(0, 0.05, -1.2);
        that.state.camera.lookAt(new THREE.Vector3(0, 0, 0));

        break;
      default:
        break;
    }
  };

  componentWillUnmount() {
    this.stopLoop();
    document.removeEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.onWindowResize, false);
  }

  startLoop = () => {
    if (!this._frameId) {
      this._frameId = window.requestAnimationFrame(this.loop);
    }
  };

  stopLoop = () => {
    window.cancelAnimationFrame(this._frameId);
  };

  loop = () => {
    this.animate();
    this._frameId = window.requestAnimationFrame(this.loop);
  };

  componentDidMount() {
    let {
      scene,
      camera,
      renderer,
      fog,
      controls,
      gridHelper,
      scenes,
      light
    } = this.state;

    renderer.setClearColor(0x000000, 0); // the default

    // controls.enablePan = false;
    // controls.enableZoom = false;
    scene.add(gridHelper);
    scene.add(light);
    scene.fog = new THREE.Fog(this.state.backgroundColor, 5, 10);

    renderer.setSize(this.props.width, this.props.height);
    renderer.toneMapping = THREE.ReinhardToneMapping;

    // https://threejs.org/examples/#webgl_postprocessing_unreal_bloom

    this.mount.appendChild(renderer.domElement);

    let shapesObjects = [];
    var groupObject = new THREE.Group();

    scenes.map((scene, sceneIndex) => {
      scene.shapes.map(shape => {
        shapesObjects.push(
          this.createShape(
            shape.svg_string,
            scenes[sceneIndex].size,
            shape.offset,
            shape,
            sceneIndex
          )
        );
      });
    });
    var mergedShapesObjects = [].concat.apply([], shapesObjects);

    this.setState(
      {
        shapesObjects: mergedShapesObjects
      },
      () => {
        mergedShapesObjects.map(object => {
          groupObject.add(object);
        });
        this.setState({ groupObject: groupObject });
        centerObject(groupObject);
        // groupObject.position.set(0.5, 0.5, 0.5);
        scene.add(groupObject);

        this.startLoop();
      }
    );
  }

  createShape = (path, size, offset, shape, sceneIndex) => {
    let {
      scene,
      camera,
      renderer,
      fog,
      controls,
      gridHelper,
      scenes
    } = this.state;

    const properties = new svgPathProperties(path);

    const length = properties.getTotalLength();
    const pixels_length = shape.pixel_range[1] - shape.pixel_range[0];
    const gap = length / pixels_length;

    let i = 0;
    let objects = [];

    while (++i < pixels_length) {
      const coords = properties.getPointAtLength(gap * i);
      var geometry = new THREE.SphereGeometry(0.02, 0.02, 0.02);
      var material = new THREE.MeshPhongMaterial({
        color: 0x000000
      });
      var object = new THREE.Mesh(geometry, material);
      object.scene_index = sceneIndex;
      object.pixel_index = shape.pixel_range[0] + i;
      objects.push(object);
      object.position.x = (coords.x / 130) * -1;
      object.position.y = (coords.y / 130) * -1;
    }

    return objects;
  };

  animate = () => {
    let {
      scene,
      camera,
      renderer,
      fog,
      controls,
      gridHelper,
      shapesObjects
    } = this.state;
    let that = this;

    shapesObjects.map((elem, elem_index) => {
      if (that.props.pixels[elem.scene_index]) {
        elem.material.color.setStyle(
          `rgb(${Math.round(
            that.props.pixels[elem.scene_index][0][elem.pixel_index]
          )},
                      ${Math.round(
                        that.props.pixels[elem.scene_index][1][elem.pixel_index]
                      )},
                      ${Math.round(
                        that.props.pixels[elem.scene_index][2][elem.pixel_index]
                      )})
                      `
        );
      }
    });

    if (this.props.hasDarkMode) {
      scene.remove(gridHelper);
    } else {
      scene.add(gridHelper);
    }

    this.onWindowResize();

    renderer.render(scene, camera);
  };

  render() {
    return (
      <div
        style={{
          width: this.props.width,
          height: this.props.height
        }}
        ref={mount => {
          this.mount = mount;
        }}
        className="sceno-visualizer"
      ></div>
    );
  }
}

export default ScenoVisualizer2d;
