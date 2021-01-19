import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import {
  AmbientLight,
  DirectionalLight,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGL1Renderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { stations } from "./constants";
import Starfield from "./objects/Starfield";
import Station from "./objects/Station";
import PlayerShip from "./objects/PlayerShip";

import {
  handleSetPlayerIsTraveling,
  handleSetPlayerLocation,
} from "./redux/actions/player";

import {
  CameraTargetChangeEvent,
  GameState,
  MapCoordinate,
  ShipTravelEvent,
} from "../types";

const mapState = (state: GameState) => ({
  cameraTarget: state.camera.target,
  playerDestination: state.player.destination,
  playerDockedStation: state.player.dockedStation,
  playerIsTraveling: state.player.isTraveling,
  playerLocation: state.player.location,
  playerTravelDuration: state.player.travelDuration,
});

const mapDispatch = {
  handleSetPlayerIsTraveling,
  handleSetPlayerLocation,
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

type GameSceneProps = PropsFromRedux & {
  playerShip: any;
};

// TODO - Camera position needs to update on tick as well (stay with camera target);
// TODO - When page is reloaded mid flight, scene should set up in flight, not at previous station
class GameScene extends React.Component<GameSceneProps, unknown> {
  constructor(props: GameSceneProps) {
    super(props);
    this.stations = [];
  }

  // * Properties
  ambientLight!: AmbientLight;
  camera!: PerspectiveCamera;
  cameraTarget: Object3D | undefined;
  container!: HTMLDivElement | null;
  directionalLight!: DirectionalLight;
  orbitControls!: OrbitControls;
  renderer!: WebGL1Renderer;
  scene!: Scene;
  starfield!: Object3D;
  travelStartTimestamp?: number;
  stations!: Object3D[];

  // * -------------------------
  // * Lifecycle Events
  // * -------------------------
  componentDidMount(): void {
    this.init();
  }

  // * -------------------------
  // * Methods
  // * -------------------------
  createObjects(): void {
    // * Light
    this.ambientLight = new AmbientLight(0x888888);
    this.directionalLight = new DirectionalLight(0xfdfcf0, 1);
    this.directionalLight.position.set(20, 10, 20);
    this.scene.add(this.directionalLight);
    this.scene.add(this.ambientLight);

    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    // * Player Ship
    // const playerShipObject = new PlayerShip({
    //   label: "Player Ship",
    //   x: this.props.playerDockedStation
    //     ? this.props.playerLocation[0] - 0.75
    //     : this.props.playerLocation[0],
    //   y: this.props.playerLocation[1],
    //   z: this.props.playerLocation[2],
    // });
    // this.playerShip = playerShipObject.object;
    this.scene.add(this.props.playerShip.object);
    // * When scene is rebuilt, player ship is always in focus
    this.camera.position.set(
      this.props.playerShip.object.position.x,
      this.props.playerShip.object.position.y,
      this.props.playerShip.object.position.z + 10
    );

    // * Stations
    stations.forEach((station) => {
      const stationObject = new Station({
        color: station.color,
        depth: station.depth,
        height: station.height,
        id: station.id,
        label: station.name,
        width: station.width,
        x: station.location[0],
        y: station.location[1],
        z: station.location[2],
      });
      this.scene.add(stationObject.object);
      this.stations.push(stationObject.object);
    });

    // * Starfield
    const starfield = new Starfield({});
    this.starfield = starfield.object;
    this.scene.add(this.starfield);
  }

  init(): void {
    // * Setup base scene
    this.setupBaseScene();
    this.createObjects();
    this.setupListeners();

    const cameraTargets: { [index: string]: Object3D } = {
      ship: this.props.playerShip.object,
      "1": this.stations[0],
      "2": this.stations[1],
      "3": this.stations[2],
    };

    this.cameraTarget = cameraTargets[this.props.cameraTarget];

    this.tick = this.tick.bind(this);
    this.tick();
  }

  setupBaseScene(): void {
    // * Setup Scene
    this.scene = new THREE.Scene();
    // * Setup Camera
    const height = window.innerHeight;
    const width = window.innerWidth;
    const aspectRatio = width / height;
    const fieldOfView = 60;
    const nearPlane = 1;
    const farPlane = 10000;
    this.camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    );
    // * Setup Renderer
    this.renderer = new THREE.WebGL1Renderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    // * Append to Container
    if (this.container) {
      this.container.appendChild(this.renderer.domElement);
    }
  }

  setupListeners(): void {
    // TODO - See if you can rewrite the listeners and abstract out a lot of the functionality, including integrating w Redux better
    window.addEventListener(
      "resize",
      () => {
        const height = window.innerHeight;
        const width = window.innerWidth;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      },
      false
    );

    // ? What Do I Want To Do?
    // * 1. User clicks "Travel" button
    // * 2. Redux State is Updated to Show Player Travel
    // * 3. GameScene takes in the new Redux State changes, and animates the ship traveling
    window.addEventListener("shipTravel", (e: ShipTravelEvent) => {
      console.log("START OF EVENT LISTENER");
      if (!this.props.playerDestination || !this.props.playerTravelDuration) {
        throw new Error("No player destination or no player travel duration!");
      }

      // ! When you figure out the on reload
      // * On reload, create new tween for ship travel, but don't add easing
      const tween = new TWEEN.Tween({
        x: this.props.playerShip.object.position.x,
        y: this.props.playerShip.object.position.y,
        z: this.props.playerShip.object.position.z,
      })
        .to(
          {
            // * The 0.75 makes the ship appear to "dock" with the station, instead of just getting "consumed" by it
            x: this.props.playerDestination.location[0] - 0.75,
            y: this.props.playerDestination.location[1],
            z: this.props.playerDestination.location[2],
          },
          this.props.playerTravelDuration
        )
        .onUpdate((posObj: { x: number; y: number; z: number }) => {
          (window as any).shipMoving = true;
          // * Figure out how to update the player position in Redux, but
          // * Probably not on every time ".onUpdate()" runs, because it does it a ton of times per second. That's a lot of logic.
          // * Maybe that doesn't matter?
          const coordinate: MapCoordinate = [posObj.x, posObj.y, posObj.z];
          this.props.playerShip.object.position.set(
            coordinate[0],
            coordinate[1],
            coordinate[2]
          );
          console.log("UPDATE");
          this.props.handleSetPlayerLocation(coordinate);
        })
        .onComplete(() => {
          // eslint-disable-next-line
          (window as any).shipMoving = false;
          (window as any).travelComplete = true;
          (window as any).tween = undefined;
          console.log("COMPLETED!!!");
        });

      if (e.detail && e.detail.easing) {
        tween.easing(TWEEN.Easing.Quintic.InOut);
      }

      // eslint-disable-next-line
      (window as any).travelComplete = false;
      tween.start();
      handleSetPlayerIsTraveling(true);
    });

    window.addEventListener(
      "cameraTargetChange",
      (e: CameraTargetChangeEvent) => {
        if (!e.detail) {
          throw new Error("No detail!");
        }

        let correspondingObject: Object3D | undefined = this.props.playerShip
          .object;
        // TODO - Rewrite how this is looked up
        if (e.detail.cameraTarget !== "ship") {
          correspondingObject = this.scene.children.find(
            (object) =>
              object.userData && object.userData.id === e.detail?.cameraTarget
          );
        }
        this.cameraTarget = correspondingObject;
        if (!this.cameraTarget) {
          throw new Error("No camera target!");
        }
        this.camera.position.set(
          this.cameraTarget.position.x,
          this.cameraTarget.position.y,
          this.cameraTarget.position.z + 10
        );
      }
    );
  }

  tick(timestamp?: number): void {
    TWEEN.update(timestamp);

    this.renderer.render(this.scene, this.camera);

    // * Focus orbit camera on the camera target
    if (!this.cameraTarget) {
      throw new Error("No camera target!");
    }
    this.orbitControls.target.set(
      this.cameraTarget.position.x,
      this.cameraTarget.position.y,
      this.cameraTarget.position.z
    );
    this.orbitControls.update();

    requestAnimationFrame(this.tick);
  }

  // * -------------------------
  // * Component Output
  // * -------------------------
  render(): JSX.Element {
    return (
      <div
        id="scene"
        ref={(container) => {
          if (container) {
            this.container = container;
          }
        }}
      ></div>
    );
  }
}

export default connector(GameScene);
