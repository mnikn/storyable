import { useState } from 'react';
import Cropper from 'react-easy-crop';
import { SchemaFieldFile } from 'renderer/models/schema/schema';
import FieldFile from '../../extra_data/field/file_field';

const picSchema = new SchemaFieldFile();

function BgContent({ data }: { data: any }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  return (
    <div className="flex">
      <FieldFile schema={picSchema} value={data.pic} label={'pic'} />
    </div>
  );
}

export default BgContent;
