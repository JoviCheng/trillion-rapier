import { createModel } from "@rematch/core";
import { RootModel } from "./index";
import { RewardType } from "../types/";

interface MainState {
  score: number;
}

export const main = createModel<RootModel>()({
  state: {
    score: 0,
  } as MainState, // initial state
  reducers: {
    setFields(state: MainState, fields: Partial<MainState>): MainState {
      return {
        ...state,
        ...fields,
      };
    },
  },
  effects: (dispatch) => ({
    // handle state changes with impure functions.
    // use async/await for async actions
    async updataScore(payload: { type: RewardType; level?: number }, state) {
      const { type, level } = payload;
      console.log("This is current root state", level);
      //   await new Promise((resolve) => setTimeout(resolve, 1000));
      switch (type) {
        case RewardType.PEG:
          dispatch.main.setFields({ score: state.main.score + 10 });
          break;
        case RewardType.BOTTOM:
          dispatch.main.setFields({
            score: state.main.score + 10 * Math.pow(2, level! * 10 || 1),
          });
          break;
      }
    },
  }),
});
