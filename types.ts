export type ModelRoot = {
  type: "root";
  model: Model;
  refs: ModelRefs;
};

export type ModelRefs = Record<string, Model>;

export type Model =
  & (
    | RefModel
    | NormalModel
    | ConditionModel
    | AllOfModel
    | OneOfModel
  )
  & {
    options?: ModelOptions;
  };

export type ModelOptions = {
  x?: number;
  y?: number;
  z?: number;
  uvlock?: boolean;
};

export type RefModel = {
  type: "ref";
  ref: string;
};

export type NormalModel = {
  type: "normal";
  models: string[];
};

export type ConditionModel = {
  type: "condition";
  when: ModelCondition;
  model: Model;
};

export type ModelCondition = Record<string, string[]>;

export type AllOfModel = {
  type: "allOf";
  models: Model[];
};

export type OneOfModel = {
  type: "oneOf";
  models: Model[];
};

export type ModelRoot_old = {
  multipart: Model_old[];
};

export type Model_old = {
  apply:
    | ({ model: string } & ModelOptions)
    | ({ model: string } & ModelOptions)[];
  when?: ModelCondition_old;
};

export type ModelCondition_old = Record<string, string>;
