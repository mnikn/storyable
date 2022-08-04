import { useCallback, useState } from 'react';
import Link from './components/link';
import NodeCard from './components/node_card';
import Sidebar from './sidebar';
import useView from './use_view';

function Home() {
  const [zoomDom, setZoomDom] = useState<HTMLDivElement | null>(null);

  const { treeData, linkData } = useView({
    zoomDom,
  });

  const onDomMounted = useCallback((dom: HTMLDivElement) => {
    if (dom) {
      setZoomDom(dom);
    }
  }, []);

  return (
    <div className="flex h-full">
      <Sidebar />
      <div
        id="main-content"
        className="flex-grow bg-gray-600 relative"
        style={{ overflow: 'hidden' }}
      >
        <div ref={onDomMounted} className="absolute h-full w-full">
          <div id="nodes" className="absolute h-full w-full">
            {treeData.map((item) => {
              return (
                <div key={item.id}>
                  <>
                    <NodeCard
                      pos={{
                        x: item.x0,
                        y: item.y0,
                      }}
                    />
                  </>
                </div>
              );
            })}
          </div>

          <svg
            id="dialogue-tree-links-container"
            className="absolute w-full h-full"
            style={{
              overflow: 'inherit',
              pointerEvents: 'none',
            }}
          />

          <div
            id="connections"
            className="absolute w-full h-full "
            style={{
              overflow: 'inherit',
              pointerEvents: 'none',
            }}
          >
            {linkData.map((item) => {
              return (
                <Link
                  key={item.from.data.id + '-' + item.target.data.id}
                  from={item.from}
                  target={item.target}
                  linkData={item.data}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
