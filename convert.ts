import type {
  Model,
  Model_old,
  ModelCondition,
  ModelCondition_old,
  ModelOptionCalculation,
  ModelOptions,
  ModelOptions_old,
  ModelRefs,
  ModelRoot,
  ModelRoot_old,
  ModelVariables,
} from "./types.ts";

export const convert = (input: ModelRoot): ModelRoot_old => {
  return {
    multipart: convertModel(input.model, {
      refs: input.refs,
      options: mergeOptions({}, input.options ?? {}),
      variables: mergeVariables({}, input.variables ?? {}),
      condition: {},
    }),
  };
};

const convertModel = (
  input: Model,
  {
    refs,
    options,
    variables,
    condition,
  }: {
    refs: ModelRefs;
    options: ModelOptions_old;
    variables: ModelVariables;
    condition: ModelCondition;
  },
): Model_old[] => {
  if (input.type === "normal") {
    return [
      {
        apply: {
          model: Object.entries(variables).reduce(
            (acc, [k, v]) => acc.replaceAll(k, v),
            input.model,
          ),
          ...compileOptions(mergeOptions(options ?? {}, input.options ?? {})),
        },
        when: convertCondition(condition),
      },
    ];
  }

  if (input.type === "condition") {
    return convertModel(input.model, {
      refs,
      options: mergeOptions(options, input.options ?? {}),
      variables: mergeVariables(input.variables ?? {}, variables),
      condition: mergeConditions(input.when, condition),
    });
  }

  if (input.type === "ref") {
    return convertModel(refs[input.ref], {
      refs,
      options: mergeOptions(options, input.options ?? {}),
      variables: mergeVariables(input.variables ?? {}, variables),
      condition,
    });
  }

  if (input.type === "allOf") {
    return input.models
      .map((model) =>
        convertModel(model, {
          refs,
          options: mergeOptions(options, input.options ?? {}),
          variables: mergeVariables(input.variables ?? {}, variables),
          condition,
        })
      )
      .flat();
  }

  if (input.type === "oneOf") {
    return [
      {
        apply: input.models
          .map((model) =>
            convertModel(model, {
              refs,
              options: mergeOptions(options, input.options ?? {}),
              variables: mergeVariables(input.variables ?? {}, variables),
              condition,
            })
          )
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

const calculate = (
  a: Exclude<ModelOptions_old["x" | "y" | "z"], undefined>,
  b: ModelOptionCalculation,
): number => {
  if (b.type === "+") {
    return a + b.value;
  } else if (b.type === "*") {
    return a * b.value;
  }

  const _never: never = b.type;
  throw new Error();
};

const mergeOptions = (
  a: ModelOptions_old,
  b: ModelOptions,
): ModelOptions_old => {
  return {
    x: calculate(a.x ?? 0, b.x ?? { type: "+", value: 0 }),
    y: calculate(a.y ?? 0, b.y ?? { type: "+", value: 0 }),
    z: calculate(a.z ?? 0, b.z ?? { type: "+", value: 0 }),
    uvlock: b.uvlock ?? a.uvlock,
  };
};

const compileOptions = (
  options: ModelOptions_old,
): ModelOptions_old => {
  return {
    x: normalizeDegree(options.x === undefined ? 0 : options.x),
    y: normalizeDegree(options.y === undefined ? 0 : options.y),
    z: normalizeDegree(options.z === undefined ? 0 : options.z),
    uvlock: options.uvlock ?? false,
  };
};

const mergeVariables = (
  a: ModelVariables,
  b: ModelVariables,
): ModelVariables => {
  const conditions: ModelVariables = {};

  for (const [k, v] of Object.entries(a)) conditions[k] = v;
  for (const [k, v] of Object.entries(b)) conditions[k] = v;

  return conditions;
};

const normalizeDegree = (degree: number): number => {
  return (360 + (degree % 360)) % 360;
};
