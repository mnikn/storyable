import * as d3 from 'd3';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import useView from './use_view';

function Home() {
  const [zoomDom, setZoomDom] = useState<HTMLDivElement>(null);

  const { treeData, linkData } = useView({
    zoomDom,
  });

  const onDomMounted = useCallback((dom) => {
    if (dom) {
      setZoomDom(dom);
    }
  }, []);

  return (
    <div className="flex h-full">
      <div className="bg-gray-50 w-72"></div>
      <div
        id="main-content"
        className="flex-grow bg-gray-600"
        style={{ overflow: 'hidden' }}
      >
        <div ref={onDomMounted} className="h-full w-full">
          <div id="nodes" className="relative h-full w-full">
            {treeData.map((item) => {
              return (
                <div key={item.id}>
                  <>
                    <div
                      className="absolute bg-red-400"
                      style={{
                        transform: `translate(${item.y0}px,${item.x0}px)`,
                        height: '100px',
                        width: '100px',
                      }}
                    />
                  </>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
