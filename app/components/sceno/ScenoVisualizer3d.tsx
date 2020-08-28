import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { svgPathProperties } from 'svg-path-properties';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

var size = 50;
var divisions = 30;

class ScenoVisualizer3d extends React.Component {
  constructor(props) {
    super(props);
    const scenes = this.props.config._strips.map(strip => {
      return strip.scene;
    });
    let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    let camera = new THREE.PerspectiveCamera(
      115,
      this.props.width / this.props.height,
      0.1,
      1000
    );

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
        that.state.camera.position.set(0, 0.05, 1.2);
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
      scenes
    } = this.state;

    camera.position.x = 0;
    camera.position.y = 0.05;
    camera.position.z = 1.2;
    camera.lookAt(0, 0, 0);

    renderer.setClearColor(0x000000, 0); // the default

    controls.enablePan = false;
    controls.enableZoom = false;
    scene.add(gridHelper);
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

    const XCenterOffset = (size.width * size.scale) / 2;
    const YCenterOffset = (size.height * size.scale) / 2;
    const length = properties.getTotalLength();
    const pixels_length = shape.pixel_range[1] - shape.pixel_range[0];
    const gap = length / pixels_length;

    let i = 0;
    let objects = [];

    while (++i < pixels_length) {
      const coords = properties.getPointAtLength(gap * i);
      var geometry = new THREE.SphereGeometry(0.02, 0.02, 0.02);
      var material = new THREE.MeshBasicMaterial({
        color: 0x000000
      });
      var object = new THREE.Mesh(geometry, material);
      object.scene_index = sceneIndex;
      object.pixel_index = shape.pixel_range[0] + i;
      objects.push(object);
      object.position.x = ((coords.x - XCenterOffset + offset[0]) / 100) * -1;
      object.position.y = ((coords.y - YCenterOffset + offset[1]) / 100) * -1;
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

export default ScenoVisualizer3d;
