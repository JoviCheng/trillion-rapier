import { createModel } from "@rematch/core";
import BigNumber from "bignumber.js";
import { RootModel } from "./index";
import { RewardType } from "../types/";

interface MainState {
  totalScore: number;
  hitRate: number;
  hitsCount: {
    peg?: number;
    bottom?: number[];
  };
  round: {
    baseHit: number;
    pegHit: number;
    score: number;
  };
  ball: {
    restitution: number;
    speed: {
      x: number;
      y: number;
    };
  };
}

export const main = createModel<RootModel>()({
  state: {
    totalScore: 0,
    hitsCount: {
      peg: 0,
      bottom: [0, 0, 0],
    },
    hitRate: 1.01,
    round: {
      baseHit: 1,
      pegHit: 0,
      score: 0,
    },
    ball: {
      restitution: 0.1,
      speed: {
        x: 0,
        y: 0,
      },
    },
  } as MainState,
  reducers: {
    setFields(state: MainState, fields: Partial<MainState>): MainState {
      return {
        ...state,
        ...fields,
      };
    },
  },
  effects: (dispatch) => ({
    // use async/await for async actions
    async updataScore(payload: { type: RewardType; level?: number }, state) {
      const { type, level } = payload;
      //   await new Promise((resolve) => setTimeout(resolve, 1000));
      switch (type) {
        case RewardType.PEG:
          let newHit = new BigNumber(state.main.round.baseHit)
            .times(state.main.hitRate)
            .toNumber();
          // 更新本轮信息
          dispatch.main.setFields({
            round: {
              baseHit: newHit,
              score: state.main.round.score + newHit,
              pegHit: state.main.round.pegHit + 1,
            },
          });
          break;
        case RewardType.BOTTOM:
          let temp = state.main.hitsCount.bottom!;
          temp[level! - 1] = temp[level! - 1] + 1;
          dispatch.main.setFields({
            totalScore: state.main.round.score + state.main.totalScore,
            hitsCount: {
              peg: state.main.round.pegHit,
              bottom: [...temp],
            },
          });
          // 统计总数
          dispatch.main.setFields({
            round: {
              baseHit: 1,
              pegHit: 0,
              score: 0,
            },
          });
          break;
      }
    },
    async upgrade(payload: { type: RewardType; level?: number }, state) {},
  }),
});
