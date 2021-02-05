import Matter from "matter-js";
import { COLOR, PEGS_GROUP, awardAreaConfig } from "../const";

export function createPegPart() {
  const pegsPart: Matter.Body[] = [];
  for (let row = 0; row < PEGS_GROUP.ROW; row++) {
    const cols = row % 2 ? PEGS_GROUP.CLOS : PEGS_GROUP.CLOS - 1;
    const offset = row % 2 ? 0 : PEGS_GROUP.BASE_SIZE / 2;
    const y = PEGS_GROUP.TOP_OFFSET + PEGS_GROUP.BASE_SIZE * row;
    for (let col = 0; col < cols; col++) {
      const x = PEGS_GROUP.LEFT_OFFSET + PEGS_GROUP.BASE_SIZE * col + offset;
      pegsPart.push(PegFactory(x, y));
    }
  }
  return pegsPart;
}

export function PegFactory(x: number, y: number) {
  const PEG_SIZE = 2;
  const PINBALL_SIZE = 10;
  return Matter.Bodies.circle(x, y, PEG_SIZE, {
    label: "peg",
    isStatic: true,
    render: {
      fillStyle: COLOR.BUMPER,
    },
  });
}

export function BoundaryFactory(
  x: number,
  y: number,
  width: number,
  height: number
) {
  return Matter.Bodies.rectangle(x, y, width, height, {
    isStatic: true,
    render: {
      fillStyle: COLOR.OUTER,
    },
  });
}

export function PathFactory(x: number, y: number, path: string) {
  let vertices = Matter.Vertices.fromPath(path, Matter.Body.create({}));
  return Matter.Bodies.fromVertices(x, y, [vertices], {
    isStatic: true,
    render: {
      fillStyle: COLOR.OUTER,

      // add stroke and line width to fill in slight gaps between fragments
      strokeStyle: COLOR.OUTER,
      lineWidth: 1,
    },
  });
}

export function WallFactory(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  angle = 0
) {
  return Matter.Bodies.rectangle(x, y, width, height, {
    angle: angle,
    isStatic: true,
    chamfer: { radius: 10 },
    render: {
      fillStyle: color,
    },
  });
}

// 三角组合墙
export function SideWallFactory(right?: boolean) {
  const s = 28;
  const sideWallPoints = [0, 0, s / 2, 0, s, s, s / 2, 2 * s, 0, 2 * s];
  const sideWallArray: Matter.Body[] = [];
  for (let i = 0; i < 9; i++) {
    sideWallArray.push(
      Matter.Bodies.fromVertices(
        right ? 438 : 17,
        250 + 2 * s * i,
        [
          Matter.Vertices.fromPath(
            sideWallPoints.join(" "),
            Matter.Body.create({})
          ),
        ],
        {
          render: { fillStyle: COLOR.OUTER },
        }
      )
    );
  }
  let sideWallBody = Matter.Body.create({
    parts: sideWallArray,
    isStatic: true,
  });
  if (right) {
    Matter.Body.rotate(sideWallBody, Math.PI);
  }
  return sideWallBody;
}

export function AwardAreaFactory() {
  let awardAreaGroup: Matter.Body[] = [];
  // 奖励区域分隔 Body
  for (let index = 0; index < awardAreaConfig.length - 1; index++) {
    const x =
      PEGS_GROUP.LEFT_OFFSET +
      (index === 0 ? 1 : PEGS_GROUP.BASE_SIZE) * awardAreaConfig[index].axisX;
    awardAreaGroup.push(
      Matter.Bodies.rectangle(x, 762, 0.5, 40, {
        isStatic: true,
        chamfer: { radius: 2 },
        render: {
          fillStyle: COLOR.INNER,
          opacity: 0,
        },
      })
    );
  }
  for (let index = 0; index < awardAreaConfig.length; index++) {
    const x =
      PEGS_GROUP.LEFT_OFFSET +
      (index === 0 ? 1 : PEGS_GROUP.BASE_SIZE) * awardAreaConfig[index].axisX;
    let awardAreaBody = Matter.Bodies.rectangle(
      x - (PEGS_GROUP.BASE_SIZE * awardAreaConfig[index].width) / 2,
      761,
      PEGS_GROUP.BASE_SIZE * awardAreaConfig[index].width - 2,
      39,
      {
        label: "reward",
        isStatic: true,
        isSensor: true,
        render: {
          fillStyle: awardAreaConfig[index].color,
        },
      }
    );
    awardAreaBody["rewardLevel"] = awardAreaConfig[index].level;
    awardAreaGroup.push(awardAreaBody);
  }
  return Matter.Body.create({ parts: awardAreaGroup, isStatic: true });
}

// contact with these bodies causes pinball to be relaunched
export function ResetAreaFactory(x: number, width: number) {
  return Matter.Bodies.rectangle(x, 781, width, 2, {
    label: "reset",
    isStatic: true,
    render: {
      fillStyle: "#fff",
    },
  });
}
