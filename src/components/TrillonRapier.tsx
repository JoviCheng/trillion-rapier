import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { RootState, RootDispatch } from "../model";
import { useRematch } from "../utils/useRematch";
import { COLOR, PINBALL_SIZE, GRAVITY, WIREFRAMES } from "../const";
import { createStaticBodies } from "../utils/Factory";
import { rand } from "../utils/";
import { RewardType } from "../types/";

let pinball: Matter.Body;
let engine: Matter.Engine,
  world: Matter.World,
  render: Matter.Render,
  stopperGroup: number;

const mapState = (state: RootState) => ({
  ...state.main,
  loading: state.loading,
});

const mapDispatch = (dispatch: RootDispatch) => ({
  ...dispatch.main,
});

export default function TrillonRapier() {
  const containerRef = useRef(null);

  const [
    { totalScore, ball, hitsCount },
    { updataScore, setFields },
  ] = useRematch(mapState, mapDispatch);

  useEffect(() => {
    function launchPinball() {
      Matter.Body.setVelocity(pinball, { x: 0, y: 0 });
      Matter.Body.setPosition(pinball, { x: 465, y: 765 });
      let curVelocity = { x: 0, y: -27 + rand(-3, 1) };
      setFields({
        ball: {
          ...ball,
          speed: curVelocity,
        },
      });
      Matter.Body.setVelocity(pinball, curVelocity);
      Matter.Body.setAngularVelocity(pinball, 0);
    }

    function pingReward(level: number) {
      updataScore({ type: RewardType.BOTTOM, level });

      setTimeout(function() {
        launchPinball();
      }, 1000);
    }

    function pingPeg(peg: Matter.Body) {
      updataScore({ type: RewardType.PEG });

      // flash color
      peg.render.fillStyle = COLOR.BUMPER_LIT;
      setTimeout(function() {
        peg.render.fillStyle = COLOR.BUMPER;
      }, 100);
    }

    function createPinball(world: Matter.World, stopperGroup: number) {
      // x/y are set to when pinball is launched
      pinball = Matter.Bodies.circle(0, 0, PINBALL_SIZE, {
        label: "pinball",
        restitution: ball.restitution,
        collisionFilter: {
          group: stopperGroup,
        },
        render: {
          fillStyle: COLOR.PINBALL,
        },
      });
      Matter.World.add(world, pinball);
    }
    engine = Matter.Engine.create();
    engine.timing.timeScale = 1.2;
    world = engine.world;
    world.bounds = {
      min: { x: 0, y: 0 },
      max: { x: 500, y: 800 },
    };
    world.gravity.y = GRAVITY; // simulate rolling on a slanted table

    // render (shared)
    render = Matter.Render.create({
      element: containerRef.current!,
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
    launchPinball();

    Matter.Events.on(engine, "collisionStart", function(event) {
      let pairs = event.pairs;
      pairs.forEach(function(pair) {
        if (pair.bodyB.label === "pinball") {
          switch (pair.bodyA.label) {
            case "reset":
              launchPinball();
              break;
            case "reward":
              pingReward(pair.bodyA["rewardLevel"]);
              break;
            case "peg":
              pingPeg(pair.bodyA);
              break;
          }
        }
      });
    });

    Matter.Events.on(engine, "beforeUpdate", function(event) {
      // bumpers can quickly multiply velocity, so keep that in check
      // 保险杠可以快速增加速度，所以要控制住
      // Matter.Body.setVelocity(pinball, {
      //   x: Math.max(Math.min(pinball.velocity.x, MAX_VELOCITY), -MAX_VELOCITY),
      //   y: Math.max(Math.min(pinball.velocity.y, MAX_VELOCITY), -MAX_VELOCITY),
      // });
      // cheap way to keep ball from going back down the shooter lane
      if (pinball) {
        if (pinball.position.x > 450 && pinball.velocity.y > 0) {
          Matter.Body.setVelocity(pinball, { x: 0, y: -20 });
        }
      }
    });

    // mouse drag (god mode for grabbing pinball)
    Matter.World.add(
      world,
      Matter.MouseConstraint.create(engine, {
        mouse: Matter.Mouse.create(render.canvas),
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container" ref={containerRef}>
      <div className="score current-score"></div>
      <div className="score high-score"></div>
    </div>
  );
}
