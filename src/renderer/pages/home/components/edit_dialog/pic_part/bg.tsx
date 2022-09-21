import { useState } from 'react';
import Cropper from 'react-easy-crop';
import { SchemaFieldFile } from 'renderer/models/schema/schema';
import FieldFile from '../../extra_data/field/file_field';

const picSchema = new SchemaFieldFile();

function BgContent({
  data,
  onValueChange,
}: {
  data: any;
  onValueChange: () => void;
}) {
  return (
    <div className="flex">
      <FieldFile
        schema={picSchema}
        value={data.pic}
        label={'pic'}
        onValueChange={(val) => {
          data.pic = val;
          onValueChange();
        }}
      />
    </div>
  );
}

export default BgContent;
