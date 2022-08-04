import Eventemitter from 'eventemitter3';
import { useEffect, useState } from 'react';

function useEventState<T>({
  event,
  property,
  initialVal,
}: {
  event: Eventemitter;
  property: string;
  initialVal?: T;
}) {
  const [data, setData] = useState<T | undefined>(initialVal);

  useEffect(() => {
    const updateData = (val: T) => {
      setData(val);
    };
    event.on(`change:${property}`, updateData);

    return () => {
      event.off(`change:${property}`, updateData);
    };
  }, [event, property]);

  return data;
}

export default useEventState;
