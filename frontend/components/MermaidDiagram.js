import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function MermaidDiagram({ diagramString }) {
  const diagramRef = useRef(null);

  useEffect(() => {
    if (diagramString && diagramRef.current) {
      // Clear previous content
      diagramRef.current.innerHTML = '';

      // Initialize mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      });

      // Render the diagram
      mermaid.render('mermaid-diagram', diagramString).then(({ svg }) => {
        if (diagramRef.current) {
          diagramRef.current.innerHTML = svg;
        }
      }).catch((error) => {
        console.error('Mermaid rendering error:', error);
        if (diagramRef.current) {
          diagramRef.current.innerHTML = '<p class="text-red-500">Error rendering diagram</p>';
        }
      });
    }
  }, [diagramString]);

  if (!diagramString) {
    return (
      <div className="text-center py-8 text-gray-500">
        No diagram available
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <div ref={diagramRef} className="flex justify-center" />
    </div>
  );
}
