import get from 'lodash/get';
import { useEffect, useState } from 'react';
import {
  SchemaField,
  SchemaFieldArray,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
  SchemaFieldType,
} from 'renderer/models/schema/schema';
import StoryProvider from 'renderer/services/story_provider';
import useEventState from 'renderer/utils/use_event_state';
import { generateUUID } from 'renderer/utils/uuid';
import FieldNumber from './number_field';
import FieldSelect from './select_field';
import FieldString from './string_field';

export function FieldContainer({
  schema,
  value,
  onValueChange,
}: {
  schema: SchemaField;
  value: any;
  onValueChange?: (value: any) => void;
}) {
  if (schema.type === SchemaFieldType.Object) {
    const objectValueChange = (v: any, id: string) => {
      if (onValueChange) {
        onValueChange({
          ...value,
          [id]: v,
        });
      }
    };

    return (
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
        }}
      >
        {(schema as SchemaFieldObject).fields.map((item, i) => {
          if (item.data.config.enableWhen) {
            const fn = eval(item.data.config.enableWhen);
            if (!fn(value)) {
              return null;
            }
          }

          if (item.data.type === SchemaFieldType.String) {
            return (
              <div
                style={{
                  gridColumn: `span ${item.data.config.colSpan} / span ${item.data.config.colSpan}`,
                }}
                key={item.id}
              >
                <FieldString
                  label={item.name || item.id}
                  schema={item.data as SchemaFieldString}
                  value={value[item.id]}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </div>
            );
          }

          if (item.data.type === SchemaFieldType.Number) {
            return (
              <div
                style={{
                  gridColumn: `span ${item.data.config.colSpan} / span ${item.data.config.colSpan}`,
                }}
                key={item.id}
              >
                <FieldNumber
                  label={item.name || item.id}
                  schema={item.data as SchemaFieldNumber}
                  value={value[item.id]}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </div>
            );
          }

          if (item.data.type === SchemaFieldType.Select) {
            return (
              <div
                style={{
                  gridColumn: `span ${item.data.config.colSpan} / span ${item.data.config.colSpan}`,
                }}
                key={item.id}
              >
                <FieldSelect
                  label={item.name || item.id}
                  schema={item.data as SchemaFieldSelect}
                  value={value[item.id]}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  } else if (schema.type === SchemaFieldType.String) {
    return (
      <div
        style={{
          gridColumn: `span ${schema.config.colSpan} / span ${schema.config.colSpan}`,
        }}
      >
        <FieldString
          schema={schema as SchemaFieldString}
          value={value}
          onValueChange={(v) => {
            if (onValueChange) {
              onValueChange(v);
            }
          }}
        />
      </div>
    );
  } else if (schema.type === SchemaFieldType.Number) {
    return (
      <div
        style={{
          gridColumn: `span ${schema.config.colSpan} / span ${schema.config.colSpan}`,
        }}
      >
        <FieldNumber
          schema={schema as SchemaFieldNumber}
          value={value}
          onValueChange={(v) => {
            if (onValueChange) {
              onValueChange(v);
            }
          }}
        />
      </div>
    );
  } else if (schema.type === SchemaFieldType.Select) {
    return (
      <div
        style={{
          gridColumn: `span ${schema.config.colSpan} / span ${schema.config.colSpan}`,
        }}
      >
        <FieldSelect
          schema={schema as SchemaFieldSelect}
          value={value}
          onValueChange={(v) => {
            if (onValueChange) {
              onValueChange(v);
            }
          }}
        />
      </div>
    );
  }
  return null;
}

/* export function FieldArray({
 *   label,
 *   schema,
 *   value,
 *   onValueChange,
 * }: {
 *   label?: string;
 *   schema: SchemaFieldArray;
 *   value: any[];
 *   onValueChange?: (value: any) => void;
 * }) {
 *   const currentLang = useEventState<any>({
 *     property: 'currentLang',
 *     event: StoryProvider.event,
 *     initialVal: StoryProvider.currentLang,
 *   });
 *   const translations = useEventState<any>({
 *     property: 'translations',
 *     event: StoryProvider.event,
 *     initialVal: StoryProvider.translations,
 *   });
 *   const [list, setList] = useState<any[]>(
 *     value.map((item) => {
 *       return {
 *         id: generateUUID(),
 *         value: item,
 *       };
 *     })
 *   );
 *   const addItem = () => {
 *     setList((prev) => {
 *       return prev.concat({
 *         id: generateUUID(),
 *         value: schema.fieldSchema.config.needI18n
 *           ? generateUUID()
 *           : schema.fieldSchema.config.defaultValue,
 *       });
 *     });
 *   };
 *
 *   const moveUpItem = (sourceIndex: number) => {
 *     setList((prev) => {
 *       const targetIndex = Math.max(sourceIndex - 1, 0);
 *       return prev.map((item, j) => {
 *         if (j === sourceIndex) {
 *           return prev[targetIndex];
 *         }
 *         if (j === targetIndex) {
 *           return prev[sourceIndex];
 *         }
 *         return item;
 *       }, []);
 *     });
 *   };
 *   const moveDownItem = (sourceIndex: number) => {
 *     setList((prev) => {
 *       const targetIndex = Math.min(sourceIndex + 1, prev.length - 1);
 *       return prev.map((item, j) => {
 *         if (j === sourceIndex) {
 *           return prev[targetIndex];
 *         }
 *         if (j === targetIndex) {
 *           return prev[sourceIndex];
 *         }
 *         return item;
 *       }, []);
 *     });
 *   };
 *   const deleteItem = (i: number) => {
 *     setList((prev) => {
 *       return prev.filter((_, j) => j !== i);
 *     });
 *   };
 *
 *   useEffect(() => {
 *     if (onValueChange) {
 *       onValueChange(list.map((item) => item.value));
 *     }
 *   }, [list]);
 *
 *   const onItemChange = (v: any, i: number) => {
 *     setList((prev) => {
 *       return prev.map((item, j) =>
 *         j === i ? { id: item.id, value: v } : item
 *       );
 *     });
 *   };
 *
 *   return (
 *     <Grid item xs={schema.config.colSpan}>
 *       <Stack spacing={4}>
 *         {list.map((item, i) => {
 *           const summary = schema.config.summary.replace(
 *             /\{\{[A-Za-z0-9_.\[\]]+\}\}/g,
 *             (all) => {
 *               const word = all.substring(2, all.length - 2);
 *               if (word === '___key') {
 *                 return item.name;
 *               }
 *               if (word === '___index') {
 *                 return i + 1;
 *               }
 *               if (word.includes('___val')) {
 *                 if (schema.fieldSchema.type !== 'object') {
 *                   return schema.fieldSchema.type === 'string' &&
 *                     schema.fieldSchema.config.needI18n
 *                     ? translations[item.value]?.[currentLang]
 *                     : item.value;
 *                 } else {
 *                   const wpath = word.split('.').splice(1).join('.');
 *                   const v = get(item.value, wpath);
 *
 *                   const field = schema.fieldSchema.fields.find(
 *                     (f) => f.id === wpath
 *                   );
 *
 *                   return field?.data?.type === 'string' &&
 *                     field?.data?.config?.needI18n
 *                     ? v[currentLang]
 *                     : v;
 *                 }
 *               }
 *               return item.value;
 *             }
 *           );
 *           return (
 *             <Stack
 *               key={item.id}
 *               spacing={1}
 *               direction="row"
 *               style={{ width: '100%', alignItems: 'center' }}
 *             >
 *               <Stack spacing="2" direction="row" sx={{ flexGrow: 1 }}>
 *                 <FieldContainer
 *                   schema={schema.fieldSchema as SchemaField}
 *                   value={item.value}
 *                   onValueChange={(v) => onItemChange(v, i)}
 *                 />
 *                 <IconButton onClick={() => moveUpItem(i)} color="primary">
 *                   <ArrowUpwardIcon />
 *                 </IconButton>
 *                 <IconButton onClick={() => moveDownItem(i)} color="primary">
 *                   <ArrowDownwardIcon />
 *                 </IconButton>
 *                 <IconButton onClick={() => deleteItem(i)} color="primary">
 *                   <DeleteIcon />
 *                 </IconButton>
 *               </Stack>
 *             </Stack>
 *           );
 *         })}
 *         <Button
 *           variant="contained"
 *           onClick={addItem}
 *           sx={{
 *             width: '80%',
 *             padding: '10px',
 *             borderRadius: '0px',
 *             clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)',
 *             marginLeft: 'auto!important',
 *             marginRight: 'auto!important',
 *           }}
 *         >
 *           Add Item
 *         </Button>
 *       </Stack>
 *     </Grid>
 *   );
 * } */
