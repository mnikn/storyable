export enum ConditionType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
}

export interface Condition {
  conditionType: ConditionType;
}

export enum NumberComapreType {
  Greater = 'greater',
  GreaterThan = 'greaterThan',
  Less = 'less',
  LessThan = 'lessThan',
  Equal = 'equal',
  NotEqual = 'notEqual',
}

export enum StringComapreType {
  Includes = 'includes',
  NotIncludes = 'notIncludes',
  Equal = 'equal',
  NotEqual = 'notEqual',
}

export enum BooleanCompareType {
  Equal = 'equal',
  NotEqual = 'notEqual',
}

export interface NumberCondition extends Condition {
  targetValue: number;
  compareType: NumberComapreType;
  sourceParam: string;
}

export interface StringCondition extends Condition {
  targetValue: string;
  compareType: StringComapreType;
  sourceParam: string;
}

export interface BooleanCondition extends Condition {
  targetValue: boolean;
  compareType: BooleanCompareType;
  sourceParam: string;
}

export interface ScriptCondition extends Condition {
  code: string;
}
