import type {
  Model,
  Model_old,
  ModelCondition,
  ModelCondition_old,
  ModelOptions,
  ModelRefs,
  ModelRoot,
  ModelRoot_old,
} from "./types.ts";

export const convert = (input: ModelRoot): ModelRoot_old => {
  return {
    multipart: convertModel(input.model, {
      refs: input.refs,
      options: {},
      condition: {},
    }),
  };
};

const convertModel = (
  input: Model,
  {
    refs,
    options,
    condition,
  }: {
    refs: ModelRefs;
    options: ModelOptions;
    condition: ModelCondition;
  },
): Model_old[] => {
  if (input.type === "normal") {
    return [
      {
        apply: input.models.map((model) => ({
          model,
          ...mergeOptions(input.options ?? {}, options ?? {}),
        })),
        when: convertCondition(condition),
      },
    ];
  }

  if (input.type === "condition") {
    return convertModel(input.model, {
      refs,
      options: mergeOptions(input.options ?? {}, options),
      condition: mergeConditions(input.when, condition),
    });
  }

  if (input.type === "ref") {
    return convertModel(refs[input.ref], { refs, options, condition });
  }

  if (input.type === "allOf") {
    return input.models
      .map((model) => convertModel(model, { refs, options, condition }))
      .flat();
  }

  if (input.type === "oneOf") {
    return [
      {
        apply: input.models
          .map((model) => convertModel(model, { refs, options, condition }))
          .flat()
          .map(({ apply }) => apply)
          .flat(),
        when: convertCondition(condition),
      },
    ];
  }

  const _never: never = input;
  throw new Error();
};

const convertCondition = (
  condition: ModelCondition,
): ModelCondition_old | undefined => {
  const entries = Object.entries(condition).map(([k, v]) => [k, v.join("|")]);
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries);
};

const mergeConditions = (
  a: ModelCondition,
  b: ModelCondition,
): ModelCondition => {
  const conditions: ModelCondition = {};

  for (const [k, v] of Object.entries(a)) conditions[k] = v;
  for (const [k, v] of Object.entries(b)) conditions[k] = v;

  return conditions;
};

const mergeOptions = (a: ModelOptions, b: ModelOptions): ModelOptions => {
  return {
    uvlock: a.uvlock ?? b.uvlock,
    x: normalizeDegree((a.x ?? 0) + (b.x ?? 0)),
    y: normalizeDegree((a.y ?? 0) + (b.y ?? 0)),
    z: normalizeDegree((a.z ?? 0) + (b.z ?? 0)),
  };
};

const normalizeDegree = (degree: number): number => degree % 360;
