import { init, Models, RematchDispatch, RematchRootState } from "@rematch/core";
import loadingPlugin, { ExtraModelsFromLoading } from "@rematch/loading";
import { main } from "./main";

type FullModel = ExtraModelsFromLoading<RootModel>;

export interface RootModel extends Models<RootModel> {
  main: typeof main;
}

export const models: RootModel = { main };

export const store = init<RootModel, FullModel>({
  models,
  // add loadingPlugin to your store
  plugins: [loadingPlugin()],
});

export type Store = typeof store;
export type RootDispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel & FullModel>;
