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

    let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    let camera = new THREE.PerspectiveCamera(45,this.props.width / this.props.height,0.1,1000);

    let controls = new OrbitControls(camera, renderer.domElement);
    camera.position.x = this.props.config.scene_camera.x || 0;
    camera.position.y = this.props.config.scene_camera.y || 0;
    camera.position.z = this.props.config.scene_camera.z || -16;
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
    let axis = new THREE.AxisHelper(.1);

    this.state = {
      hasDarkMode: false,
      scene: new THREE.Scene(),
      scenes: null,
      axis:axis,
      fog:fog,
      camera: camera,
      light: light,
      renderer: renderer,
      lineMaterial: lineMaterial,
      lineColor: lineColor,
      controls: controls,
      gridHelper: gridHelper,
      backgroundColor: backgroundColor,
      shapesObjects: [],
      groupObject: null
    };

    document.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.onWindowResize);
  }

  onWindowResize = () => {
    // TO DO : do not have to being called every frame
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
    this.setState({groupObject: null});
    this.stopLoop();
    document.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.onWindowResize, false);
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
      light
    } = this.state;
    let that = this;

    const scenes = this.props.config._strips.map(strip => {
      return strip.scene;
    });

    renderer.setClearColor(0x000000, 0); // the default

    controls.enablePan = false;
    controls.minZoom = 3;
    controls.maxZoom = 10;
    // controls.enableZoom = false;
    scene.add(gridHelper);
    scene.add(light);
    // scene.add(axis);
    scene.fog = fog;

    renderer.setSize(that.props.width, that.props.height);
    renderer.toneMapping = THREE.ReinhardToneMapping;

    // https://threejs.org/examples/#webgl_postprocessing_unreal_bloom

    that.mount.appendChild(renderer.domElement);

    let shapesObjects = [];
    let backgroundObjects = [];
    let groupObject = new THREE.Group();

    scenes.map((scene, sceneIndex) => {
      scene.shapes.map(shape => {
        shapesObjects.push(
          that.createShape(
            shape.svg_string,
            shape,
            sceneIndex
          )
        );
      });
      if(scene.backgrounds) {
        scene.backgrounds.map(background => {
          backgroundObjects.push(
            that.createBackground(background.svg_string)
          );
        });
      }
      
    });

    let mergedShapesObjects = [].concat.apply([], shapesObjects);
    let mergedBackgroundObjects = [].concat.apply([], backgroundObjects);

    mergedShapesObjects.map(object => {
      groupObject.add(object);
    });

    mergedBackgroundObjects.map(object => {
      groupObject.add(object);
    });

    that.setState({ scenes: scenes, shapesObjects: mergedShapesObjects, groupObject: groupObject }, () => {
      that.centerObjects();

      scene.add(that.state.groupObject);

      that.onWindowResize();
      that.startLoop();
    });

  }

  centerObjects = () => {
    // console.log("numberofobjectsinthegroup", this.state.groupObject.children.length);
    const groupCenter = computeGroupCenter(this.state.groupObject);
    // console.log(groupCenter);
    let test = this.state.groupObject.position.copy(groupCenter).negate(); 
    // console.log(test);

  }

  createBackground = (background) => {

    let shapepath = transformSVGPath(background);
    let objects = [];
    if(shapepath != -1) {
      let simpleShape = shapepath.toShapes(true);
      for (let i = 0; i < simpleShape.length; i++){
        let shape3d = new THREE.BufferGeometry().setFromPoints(simpleShape[i].getPoints());
        let line = new THREE.Line(shape3d, this.state.lineMaterial);
        line.scale.set(-.01,-.01,.01);
        objects.push(line);
      }
    }
    else {
      console.log("wired shape detected !");
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
      let geometry = new THREE.SphereGeometry(.04, .04, .04);
      let material = new THREE.MeshPhongMaterial({color: 0x000000});
      let object = new THREE.Mesh(geometry, material);
      object.scene_index = sceneIndex;
      object.pixel_index = shape.pixel_range[0] + i;
      objects.push(object);
      object.position.x = (coords.x / 100) * -1;
      object.position.y = (coords.y / 100) * -1;
      if(shape.z_index) {
        object.position.z = shape.z_index;
      }
      else {
        object.position.z = 0;
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
    // console.log(this.state.camera.position);
    // console.log(this.state.camera.rotation);
    renderer.render(scene, camera);
  };

  computeCameraCoordinates = () => {
    return `x: ${Math.round(this.state.camera.position.x * 100) / 100 }   y: ${Math.round(this.state.camera.position.y * 100) / 100 }   z: ${Math.round(this.state.camera.position.z * 100) / 100 }`;
  }

  render() {
    return (
      <>
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
      <p className="sceno-visualizer__camera-coordinates">{this.computeCameraCoordinates()}</p>
      </>
    );
  }
}

export default ScenoVisualizer2d;
