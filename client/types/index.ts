import { StateCreator } from "zustand";

export type MiddlewareEnabledStateCreator<
    I,
    O
> = StateCreator<I, [["zustand/devtools", never], ["zustand/persist", unknown], ["zustand/immer", never]], [], O>;