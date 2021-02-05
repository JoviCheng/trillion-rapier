import { createModel } from "@rematch/core";
import BigNumber from "bignumber.js";
import { RootModel } from "./index";
import { RewardType } from "../types/";

interface MainState {
  score: number;
  baseHit: number;
  hitsCount: {
    peg?: number;
    bottom?: number[];
  };
  ball: {
    speed: {
      x: number;
      y: number;
    };
  };
}

export const main = createModel<RootModel>()({
  state: {
    score: 0,
    baseHit: 1,
    hitsCount: {
      peg: 0,
      bottom: [0, 0, 0],
    },
    ball: {
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
          console.log(state.main.hitsCount.peg || 0);
          let newHit = new BigNumber(state.main.baseHit).times(1.01).toNumber();
          dispatch.main.setFields({
            baseHit: newHit,
            score: state.main.score + newHit,
            hitsCount: {
              ...state.main.hitsCount,
              peg: state.main.hitsCount.peg! + 1,
            },
          });
          break;
        case RewardType.BOTTOM:
          let temp = state.main.hitsCount.bottom!;
          temp[level! - 1] = temp[level! - 1] + 1;
          dispatch.main.setFields({
            hitsCount: { ...state.main.hitsCount, bottom: temp },
            baseHit: 1,
          });
          dispatch.main.setFields({
            // score: state.main.score + 10 * Math.pow(2, level! * 10 || 1),
          });
          break;
      }
    },
  }),
});
