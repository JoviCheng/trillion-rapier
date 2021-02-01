import Matter from "matter-js";
import {
  COLOR,
  PATHS,
  PEGS_GROUP,
  PINBALL_SIZE,
  GRAVITY,
  WIREFRAMES,
} from "../const";
import {
  PegFactory,
  BoundaryFactory,
  PathFactory,
  WallFactory,
  SideWallFactory,
  AwardAreaFactory,
  ResetAreaFactory,
} from "./Factory";
import { rand } from "./index";
import { RootDispatch } from "../model/";
import { RewardType } from "../types/";

let pinball: Matter.Body;
let engine: Matter.Engine,
  world: Matter.World,
  render: Matter.Render,
  stopperGroup: number;

function createStaticBodies(world: Matter.World) {
  const pegs: Matter.Body[] = [];
  for (let row = 0; row < PEGS_GROUP.ROW; row++) {
    const cols = row % 2 ? PEGS_GROUP.CLOS : PEGS_GROUP.CLOS - 1;
    const offset = row % 2 ? 0 : PEGS_GROUP.BASE_SIZE / 2;
    const y = PEGS_GROUP.TOP_OFFSET + PEGS_GROUP.BASE_SIZE * row;
    for (let col = 0; col < cols; col++) {
      const x = PEGS_GROUP.LEFT_OFFSET + PEGS_GROUP.BASE_SIZE * col + offset;
      pegs.push(PegFactory(x, y));
    }
  }

  Matter.World.add(world, [
    ...pegs,
    BoundaryFactory(250, -30, 500, 100),
    BoundaryFactory(250, 830, 500, 100),
    BoundaryFactory(-30, 400, 100, 800),
    BoundaryFactory(530, 400, 100, 800),

    // dome
    PathFactory(250, 90, PATHS.DOME),

    // pegs (left, mid, right)
    // shooter lane wall
    WallFactory(445, 520, 20, 610, COLOR.OUTER),

    // 三角墙
    SideWallFactory(),
    SideWallFactory(true),
    AwardAreaFactory(),

    ResetAreaFactory(465, 30),
  ]);
}

function createPinball(world, stopperGroup: number) {
  // x/y are set to when pinball is launched
  pinball = Matter.Bodies.circle(0, 0, PINBALL_SIZE, {
    label: "pinball",
    restitution: 0.9,
    collisionFilter: {
      group: stopperGroup,
    },
    render: {
      fillStyle: COLOR.PINBALL,
    },
  });
  Matter.World.add(world, pinball);
  launchPinball();
}

function launchPinball() {
  // updateScore(0);
  Matter.Body.setPosition(pinball, { x: 465, y: 765 });
  Matter.Body.setVelocity(pinball, { x: 0, y: -25 + rand(-2, 2) });
  Matter.Body.setAngularVelocity(pinball, 0);
}

export default function init(
  element: React.MutableRefObject<any>,
  upScore: RootDispatch["main"]["updataScore"]
) {
  function pingReward(level: number) {
    upScore({ type: RewardType.BOTTOM, level });

    setTimeout(function () {
      launchPinball();
    }, 1000);
  }

  function pingBumper(bumper: Matter.Body) {
    upScore({ type: RewardType.PEG });

    // flash color
    bumper.render.fillStyle = COLOR.BUMPER_LIT;
    setTimeout(function () {
      bumper.render.fillStyle = COLOR.BUMPER;
    }, 100);
  }
  engine = Matter.Engine.create();
  world = engine.world;
  world.bounds = {
    min: { x: 0, y: 0 },
    max: { x: 500, y: 800 },
  };
  world.gravity.y = GRAVITY; // simulate rolling on a slanted table

  // render (shared)
  render = Matter.Render.create({
    element: element.current,
    engine: engine,
    options: {
      width: world.bounds.max.x,
      height: world.bounds.max.y,
      wireframes: WIREFRAMES,
      background: COLOR.BACKGROUND,
    },
  });
  Matter.Render.run(render);

  // runner
  let runner = Matter.Runner.create();
  Matter.Runner.run(runner, engine);

  // used for collision filtering on various bodies
  stopperGroup = Matter.Body.nextGroup(true);

  createStaticBodies(world);
  createPinball(world, stopperGroup);

  Matter.Events.on(engine, "collisionStart", function (event) {
    let pairs = event.pairs;
    pairs.forEach(function (pair) {
      if (pair.bodyB.label === "pinball") {
        switch (pair.bodyA.label) {
          case "reset":
            launchPinball();
            break;
          case "reward":
            pingReward(pair.bodyA["rewardLevel"]);
            break;
          case "peg":
            pingBumper(pair.bodyA);
            break;
        }
      }
    });
  });

  Matter.Events.on(engine, "beforeUpdate", function (event) {
    // bumpers can quickly multiply velocity, so keep that in check
    // 保险杠可以快速增加速度，所以要控制住
    // Matter.Body.setVelocity(pinball, {
    //   x: Math.max(Math.min(pinball.velocity.x, MAX_VELOCITY), -MAX_VELOCITY),
    //   y: Math.max(Math.min(pinball.velocity.y, MAX_VELOCITY), -MAX_VELOCITY),
    // });
    // cheap way to keep ball from going back down the shooter lane
    if (pinball) {
      if (pinball.position.x > 450 && pinball.velocity.y > 0) {
        Matter.Body.setVelocity(pinball, { x: 0, y: -10 });
      }
    }
  });
}
