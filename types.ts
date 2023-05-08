export type ModelRoot = {
  type: "root";
  model: Model;
  refs: ModelRefs;
} & {
  options?: ModelOptions;
  variables?: ModelVariables;
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
    variables?: ModelVariables;
  };

export type ModelOptionCalculation = {
  type: "+" | "*";
  value: number;
};

export type ModelOptions = {
  x?: ModelOptionCalculation;
  y?: ModelOptionCalculation;
  z?: ModelOptionCalculation;
  uvlock?: boolean;
};

export type ModelVariables = Record<string, string>;

export type RefModel = {
  type: "ref";
  ref: string;
};

export type NormalModel = {
  type: "normal";
  model: string;
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
    | ({ model: string } & ModelOptions_old)
    | ({ model: string } & ModelOptions_old)[];
  when?: ModelCondition_old;
};

export type ModelOptions_old = {
  x?: number;
  y?: number;
  z?: number;
  uvlock?: boolean;
};

export type ModelCondition_old = Record<string, string>;
