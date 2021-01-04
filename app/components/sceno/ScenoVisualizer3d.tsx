import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { svgPathProperties } from 'svg-path-properties';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { group } from 'console';
import { Vector3 } from 'three';

let size = 50;
let divisions = 30;

class ScenoVisualizer3d extends React.Component {
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
    camera.position.x = 0;
    camera.position.y = 0.05;
    camera.position.z = -1.2;
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
    // scene.fog = new THREE.Fog(this.state.backgroundColor, 5, 10);

    renderer.setSize(this.props.width, this.props.height);
    renderer.toneMapping = THREE.ReinhardToneMapping;

    // https://threejs.org/examples/#webgl_postprocessing_unreal_bloom

    this.mount.appendChild(renderer.domElement);

    var points = [
      [-1.0, 0.0, 0.0],
      [1.0, 0.0, 0.0],
      [1.114271640777588, 0.0, 0.0],
      [1.1156846284866333, -0.07846865803003311, 0.0006925098714418709],
      [1.1156846284866333, -2.0590391159057617, 0.0006925098714418709],
      [1.1156846284866333, -2.1246163845062256, 0.0006925098714418709],
      [1.0163344144821167, -2.1246163845062256, 0.0006925098714418709],
      [-0.9456319808959961, -2.1246163845062256, 0.0006925098714418709],
      [-1.0103787183761597, -2.1246163845062256, 0.0006924201734364033],
      [-1.0103788375854492, -2.1246163845062256, 1.117509365081787],
      [-1.0103788375854492, -2.1246163845062256, 0.11381816864013672],
      [-0.9705696105957031, -0.12638933956623077, 1.14189612865448],
      [0.9590467810630798, -0.12638933956623077, 1.14189612865448],
      [1.0013623237609863, -0.12638942897319794, 1.14189612865448],
      [1.0013625621795654, -0.17319907248020172, 1.14189612865448],
      [1.0013625621795654, -2.0985682010650635, 1.14189612865448],
      [1.0013622045516968, -2.1246163845062256, 1.14189612865448],
      [0.9900809526443481, -2.1246163845062256, 1.14189612865448],
      [-0.9450291395187378, -2.1246163845062256, 1.14189612865448],
      [-1.0103788375854492, -2.1246163845062256, 1.1418962478637695]
    ];

    var points2 = [
      [1.0, 2.0, 0.0],
      [3.0, 2.0, 0.0],
      [3.0, -2.0, 0.0],
      [1.0, -2.0, 0.0]
    ];

    this.addShape(points);
    this.addShape(points2);

    // let shapesObjects = [];
    // var groupObject = new THREE.Group();

    // scenes.map((scene, sceneIndex) => {
    //   scene.shapes.map(shape => {
    //     shapesObjects.push(
    //       this.createShape(
    //         shape.svg_string,
    //         scenes[sceneIndex].size,
    //         shape.offset,
    //         shape,
    //         sceneIndex
    //       )
    //     );
    //   });
    // });
    // var mergedShapesObjects = [].concat.apply([], shapesObjects);

    // this.setState(
    //   {
    //     shapesObjects: mergedShapesObjects
    //   },
    //   () => {
    //     mergedShapesObjects.map(object => {
    //       groupObject.add(object);
    //     });
    //     this.setState({ groupObject: groupObject });
    //     centerObject(groupObject);
    //     // groupObject.position.set(0.5, 0.5, 0.5);
    //     console.log(groupObject);
    //     scene.add(groupObject);

    //     this.startLoop();
    //   }
    // );
    this.startLoop();
  }

  addShape = points => {
    //========== scale the curve to make it as large as you want
    var scale = 5;
    //========== Convert the array of points into vertices (in Blender the z axis is UP so we swap the z and y)
    for (var i = 0; i < points.length; i++) {
      var x = points[i][0] * scale;
      var y = points[i][1] * scale;
      var z = points[i][2] * scale;
      points[i] = new THREE.Vector3(x, z, -y);
    }
    //========== Create a path from the points
    var curvePath = new THREE.CatmullRomCurve3(points);

    this.createShape(curvePath);
  };

  createShape = curve => {
    const points = curve.getPoints(100);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: 0x550000 });
    const curveObject = new THREE.Line(lineGeometry, material);
    this.state.scene.add(curveObject);

    // visualize spaced points

    const sphereGeomtry = new THREE.SphereBufferGeometry(0.07);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

    const spacedPoints = curve.getSpacedPoints(100);

    spacedPoints.map(point => {
      const helper = new THREE.Mesh(sphereGeomtry, sphereMaterial);
      helper.position.copy(point);
      this.state.scene.add(helper);
    });
  };

  //   createShape = (path, size, offset, shape, sceneIndex) => {
  //     let {
  //       scene,
  //       camera,
  //       renderer,
  //       fog,
  //       controls,
  //       gridHelper,
  //       scenes
  //     } = this.state;

  //     const properties = new svgPathProperties(path);

  //     const length = properties.getTotalLength();
  //     const pixels_length = shape.pixel_range[1] - shape.pixel_range[0];
  //     const gap = length / pixels_length;

  //     let i = 0;
  //     let objects = [];

  //     while (++i < pixels_length) {
  //       const coords = properties.getPointAtLength(gap * i);
  //       var geometry = new THREE.SphereGeometry(0.02, 0.02, 0.02);
  //       var material = new THREE.MeshPhongMaterial({
  //         color: 0x000000
  //       });
  //       var object = new THREE.Mesh(geometry, material);
  //       object.scene_index = sceneIndex;
  //       object.pixel_index = shape.pixel_range[0] + i;
  //       objects.push(object);
  //       object.position.x = (coords.x / 130) * -1;
  //       object.position.y = (coords.y / 130) * -1;
  //     }

  //     return objects;
  //   };

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

    // shapesObjects.map((elem, elem_index) => {
    //   if (that.props.pixels[elem.scene_index]) {
    //     elem.material.color.setStyle(
    //       `rgb(${Math.round(
    //         that.props.pixels[elem.scene_index][0][elem.pixel_index]
    //       )},
    //                   ${Math.round(
    //                     that.props.pixels[elem.scene_index][1][elem.pixel_index]
    //                   )},
    //                   ${Math.round(
    //                     that.props.pixels[elem.scene_index][2][elem.pixel_index]
    //                   )})
    //                   `
    //     );
    //   }
    // });

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

export default ScenoVisualizer3d;
