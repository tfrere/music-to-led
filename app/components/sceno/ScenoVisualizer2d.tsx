import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { svgPathProperties } from 'svg-path-properties';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { group } from 'console';
import { Vector3 } from 'three';

import { transformSVGPath } from "../../utils/transformSVGPath.js";

import { computeGroupCenter } from "../../utils/computeGroupCenter.js";

let size = 50;
let divisions = 30;

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
    camera.position.z = -6.2;
    camera.lookAt(0, 0, 0);

    let light = new THREE.AmbientLight(0x404040, 100); // soft white light

    let backgroundColor = '#051824'; //'rgb(9,24,35)';
    let gridColor = 'rgb(35,50,60)';
    let centerGridColor = 'rgb(25,40,50)';
    let lineColor = 'rgb(55,70,80)';
    let fog = new THREE.Fog(backgroundColor, 5, 15);
    let lineMaterial = new THREE.LineBasicMaterial({linewidth:10, color:lineColor});
    let gridHelper = new THREE.GridHelper(
      size,
      divisions,
      gridColor,
      centerGridColor
    );
    gridHelper.position.set(0, -3, 0);
    let axis = new THREE.AxisHelper(10);


    this.state = {
      hasDarkMode: false,
      scene: new THREE.Scene(),
      scenes: scenes,
      axis:axis,
      fog:fog,
      camera: camera,
      light: light,
      renderer: renderer,
      lineMaterial: lineMaterial,
      lineColor: lineColor,
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
    // let that = this;
    // switch (event.keyCode) {
    //   case 32:
    //     // event.preventDefault();
    //     that.state.camera.position.set(0, 0.05, -6.2);
    //     that.state.camera.lookAt(new THREE.Vector3(0, 0, 0));

    //     break;
    //   default:
    //     break;
    // }
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
      axis,
      gridHelper,
      scenes,
      light
    } = this.state;

    renderer.setClearColor(0x000000, 0); // the default

    // controls.enablePan = false;
    // controls.enableZoom = false;
    scene.add(gridHelper);
    scene.add(light);
    // scene.add(axis);
    scene.fog = fog;

    renderer.setSize(this.props.width, this.props.height);
    renderer.toneMapping = THREE.ReinhardToneMapping;

    // https://threejs.org/examples/#webgl_postprocessing_unreal_bloom

    this.mount.appendChild(renderer.domElement);

    let shapesObjects = [];
    let backgroundObjects = [];
    var groupObject = new THREE.Group();

    scenes.map((scene, sceneIndex) => {
      scene.shapes.map(shape => {
        shapesObjects.push(
          this.createShape(
            shape.svg_string,
            shape,
            sceneIndex
          )
        );
      });
      if(scene.backgrounds) {
        scene.backgrounds.map(background => {
          backgroundObjects.push(
            this.createBackground(background.svg_string)
          );
        });
      }
      
    });
    var mergedShapesObjects = [].concat.apply([], shapesObjects);
    var mergedBackgroundObjects = [].concat.apply([], backgroundObjects);

    this.setState(
      {
        shapesObjects: mergedShapesObjects
      },
      () => {
        mergedShapesObjects.map(object => {
          groupObject.add(object);
        });
        mergedBackgroundObjects.map(object => {
          groupObject.add(object);
        });
        this.setState({ groupObject: groupObject });

        const groupCenter = computeGroupCenter(groupObject);
        groupObject.position.copy(groupCenter).negate(); 

        scene.add(groupObject);

        this.startLoop();
      }
    );
  }

  createBackground = (background) => {

    var shapepath = transformSVGPath(background);
    var objects = [];
    if(shapepath != -1) {
      var simpleShape = shapepath.toShapes(true);
      for (var i = 0; i < simpleShape.length; i++){
        let shape3d = new THREE.BufferGeometry().setFromPoints(simpleShape[i].getPoints());
        let line = new THREE.Line(shape3d, this.state.lineMaterial);
        line.scale.set(-.01,-.01,.01);
        objects.push(line);
      }
    }
    else {
      console.log("wierd shape detected !");
    }
    return objects;
  };


  createShape = (path, shape, sceneIndex) => {

    const properties = new svgPathProperties(path);

    const length = properties.getTotalLength();
    const pixels_length = shape.pixel_range[1] - shape.pixel_range[0];
    const gap = length / pixels_length;

    let i = 0;
    let objects = [];

    while (++i < pixels_length) {
      const coords = properties.getPointAtLength(gap * i);
      var geometry = new THREE.SphereGeometry(.04, .04, .04);
      var material = new THREE.MeshPhongMaterial({
        color: 0x000000
      });
      var object = new THREE.Mesh(geometry, material);
      object.scene_index = sceneIndex;
      object.pixel_index = shape.pixel_range[0] + i;
      objects.push(object);
      object.position.x = (coords.x / 100) * -1;
      object.position.y = (coords.y / 100) * -1;
      if(shape.z_index) {
        object.position.z = shape.z_index;
      }
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
      this.state.lineMaterial.color.setHex(0x000000);
    } else {
      scene.add(gridHelper);
      this.state.lineMaterial.color.setStyle(this.state.lineColor);
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
