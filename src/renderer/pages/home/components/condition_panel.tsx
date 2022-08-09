import {
  BooleanCompareType,
  BooleanCondition,
  Condition,
  ConditionType,
  NumberComapreType,
  NumberCondition,
  StringComapreType,
  StringCondition,
} from 'renderer/models/condition';
import { CgMathPlus, CgRemove } from 'react-icons/cg';

function NumberConditonItem({
  data,
  onChange,
}: {
  data: NumberCondition;
  onChange: (val: NumberCondition) => void;
}) {
  return (
    <div className="block mr-2 flex items-center">
      <input
        className="border border-gray-300 w-1/3 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none mr-4"
        placeholder="Param"
        value={data.sourceParam}
        onChange={(e) => {
          onChange({
            ...data,
            sourceParam: e.target.value,
          });
        }}
      />
      <select
        className="border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer mr-4"
        value={data.compareType}
        onChange={(e) => {
          onChange({
            ...data,
            compareType: e.target.value as NumberComapreType,
          });
        }}
      >
        {Object.keys(NumberComapreType).map((key, i) => {
          return (
            <option value={Object.values(NumberComapreType)[i]}>{key}</option>
          );
        })}
      </select>
      <input
        className="border border-gray-300 w-1/3 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none mr-4"
        type="number"
        placeholder="Compare"
        value={data.targetValue}
        onChange={(e) => {
          onChange({
            ...data,
            targetValue: Number(e.target.value),
          });
        }}
      />
    </div>
  );
}

function StringConditonItem({
  data,
  onChange,
}: {
  data: StringCondition;
  onChange: (val: StringCondition) => void;
}) {
  return (
    <div className="block mr-2 flex items-center">
      <input
        className="border border-gray-300 w-1/3 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none mr-4"
        placeholder="Param"
        value={data.sourceParam}
        onChange={(e) => {
          onChange({
            ...data,
            sourceParam: e.target.value,
          });
        }}
      />
      <select
        className="border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer mr-4"
        value={data.compareType}
        onChange={(e) => {
          onChange({
            ...data,
            compareType: e.target.value as StringComapreType,
          });
        }}
      >
        {Object.keys(StringComapreType).map((key, i) => {
          return (
            <option value={Object.values(StringComapreType)[i]}>{key}</option>
          );
        })}
      </select>
      <input
        className="border border-gray-300 w-1/3 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none mr-4"
        placeholder="Compare"
        value={data.targetValue}
        onChange={(e) => {
          onChange({
            ...data,
            targetValue: e.target.value,
          });
        }}
      />
    </div>
  );
}

function BooleanConditonItem({
  data,
  onChange,
}: {
  data: BooleanCondition;
  onChange: (val: BooleanCondition) => void;
}) {
  return (
    <div className="block mr-2 flex items-center">
      <input
        className="border border-gray-300 w-1/3 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none mr-4"
        placeholder="Param"
        value={data.sourceParam}
        onChange={(e) => {
          onChange({
            ...data,
            sourceParam: e.target.value,
          });
        }}
      />
      <select
        className="border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer mr-4"
        value={data.compareType}
        onChange={(e) => {
          onChange({
            ...data,
            compareType: e.target.value as BooleanCompareType,
          });
        }}
      >
        {Object.keys(BooleanCompareType).map((key, i) => {
          return (
            <option value={Object.values(BooleanCompareType)[i]}>{key}</option>
          );
        })}
      </select>
      <input
        className="text-blue-600 w-1/3 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 outline-none cursor-pointer mr-4"
        type="checkbox"
        placeholder="Compare"
        checked={data.targetValue}
        onChange={(e) => {
          onChange({
            ...data,
            targetValue: e.target.checked,
          });
        }}
      />
    </div>
  );
}

function ConditionPanel({
  conditions,
  onChange,
}: {
  conditions: Condition[];
  onChange: (val: Condition[]) => void;
}) {
  return (
    <div className="block mb-5">
      <div className="text-md text-black mb-2 font-bold">Enable Conditions</div>
      <div className="h-48 overflow-auto border border-gray-300 p-2 mb-4 rounded-md">
        {conditions.length === 0 && (
          <div className="text-md text-gray-500 w-full h-full flex items-center justify-center">
            Empty enable condition
          </div>
        )}
        {conditions.map((condition, i) => {
          return (
            <div className="flex border border-gray-300 p-2 mb-2 rounded-md items-center">
              <div className="block mr-2 flex items-center">
                <div className="text-sm mr-2">Type:</div>
                <select
                  className="border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer mr-4"
                  value={condition.conditionType}
                  onChange={(e) => {
                    switch (e.target.value) {
                      case ConditionType.Number: {
                        const val: NumberCondition = {
                          sourceParam: '',
                          targetValue: 0,
                          compareType: NumberComapreType.Greater,
                          conditionType: ConditionType.Number,
                        };
                        conditions[i] = val;
                        onChange(conditions);
                        return;
                      }
                      case ConditionType.String: {
                        const val: StringCondition = {
                          sourceParam: '',
                          targetValue: '',
                          compareType: StringComapreType.Equal,
                          conditionType: ConditionType.String,
                        };
                        conditions[i] = val;
                        onChange(conditions);
                        return;
                      }
                      case ConditionType.Boolean: {
                        const val: BooleanCondition = {
                          sourceParam: '',
                          targetValue: true,
                          compareType: BooleanCompareType.Equal,
                          conditionType: ConditionType.Boolean,
                        };
                        conditions[i] = val;
                        onChange(conditions);
                        return;
                      }
                    }
                  }}
                >
                  {Object.keys(ConditionType).map((key, i) => {
                    return (
                      <option value={Object.values(ConditionType)[i]}>
                        {key}
                      </option>
                    );
                  })}
                </select>
              </div>
              {condition.conditionType === ConditionType.Number && (
                <NumberConditonItem
                  data={condition as NumberCondition}
                  onChange={(val) => {
                    conditions[i] = val;
                    onChange(conditions);
                  }}
                />
              )}
              {condition.conditionType === ConditionType.String && (
                <StringConditonItem
                  data={condition as StringCondition}
                  onChange={(val) => {
                    conditions[i] = val;
                    onChange(conditions);
                  }}
                />
              )}
              {condition.conditionType === ConditionType.Boolean && (
                <BooleanConditonItem
                  data={condition as BooleanCondition}
                  onChange={(val) => {
                    conditions[i] = val;
                    onChange(conditions);
                  }}
                />
              )}
              <CgRemove
                className="ml-2 cursor-pointer text-md hover:text-gray-400 transition-all flex-shrink-0"
                onClick={() => {
                  conditions.splice(i, 1);
                  onChange(conditions);
                }}
              />
            </div>
          );
        })}
      </div>
      <button
        className="w-full border border-gray-300 hover:text-gray-400 p-2 border-dashed transition-all flex items-center justify-center"
        onClick={() => {
          const numberCondition: NumberCondition = {
            sourceParam: '',
            targetValue: 0,
            compareType: NumberComapreType.Greater,
            conditionType: ConditionType.Number,
          };
          conditions.push(numberCondition);
          onChange(conditions);
        }}
      >
        <CgMathPlus className="mr-2" /> Add condition
      </button>
    </div>
  );
}

export default ConditionPanel;
