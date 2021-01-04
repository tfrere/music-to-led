import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { svgPathProperties } from 'svg-path-properties';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { group } from 'console';
import { Vector3 } from 'three';

let size = 50;
let divisions = 30;

class ThreeVisualizer extends React.Component {
  constructor(props) {
    super(props);
    let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    let camera = new THREE.PerspectiveCamera(
      45,
      this.props.width / this.props.height,
      0.1,
      1000
    );
    camera.position.x = 0;
    camera.position.y = 0.05;
    camera.position.z = -5.2;
    camera.lookAt(0, 0, 0);

    let light = new THREE.AmbientLight(0x404040, 100); // soft white light

    let backgroundColor = '#051824'; //'rgb(9,24,35)';
    // let gridColor = 'rgb(35,50,60)';
    // let centerGridColor = 'rgb(25,40,50)';

    let gridColor = 'rgb(100,100,100)';
    let centerGridColor = 'rgb(200,200,200)';
    let gridHelper = new THREE.GridHelper(
      size,
      divisions,
      centerGridColor,
      gridColor
    );
    gridHelper.position.set(0, -5, 0);

    this.state = {
      hasDarkMode: false,
      scene: new THREE.Scene(),
      camera: camera,
      light: light,
      renderer: renderer,
      controls: new OrbitControls(camera, renderer.domElement),
      gridHelper: gridHelper,
      backgroundColor: backgroundColor
    };
    // console.log(props);

    document.addEventListener('keydown', this.handleKeyDown);

    this.startLoop();
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

  tweenAnimate = (vectorToAnimate, target, options) => {
    options = options || {};
    // get targets from options or set to defaults
    var to = target,
      easing = options.easing || TWEEN.Easing.Quadratic.In,
      duration = options.duration || 2000;
    // create the tween
    var tween = new TWEEN.Tween(vectorToAnimate)
      .to({ x: to.x, y: to.y, z: to.z }, duration)
      .easing(easing)
      .onUpdate(function(d) {
        console.log(options);
        console.log(controls.target);
        camera.lookAt(controls.target.x, controls.target.y, controls.target.z);
        if (options.update) {
          options.update(d);
        }
      })
      .onComplete(function() {
        if (options.callback) options.callback();
      });
    // start the tween
    tween.start();
    // return the tween in case we want to manipulate it later on
    return tween;
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
    scene.fog = new THREE.Fog(this.state.backgroundColor, 10, 50);

    renderer.setSize(this.props.width, this.props.height);
    renderer.toneMapping = THREE.ReinhardToneMapping;

    // https://threejs.org/examples/#webgl_postprocessing_unreal_bloom

    this.mount.appendChild(renderer.domElement);

    var groupObject = new THREE.Group();

    scene.add(groupObject);
  }

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

  animate = () => {
    let { scene, camera, renderer, fog, controls, gridHelper } = this.state;
    let that = this;

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

export default ThreeVisualizer;
