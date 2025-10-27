import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function MermaidDiagram({ diagramString }) {
  const diagramRef = useRef(null);

  useEffect(() => {
    // 1. Check if we have valid input and a DOM reference
    if (!diagramString || !diagramRef.current) {
      return;
    }

    // Clear previous content
    diagramRef.current.innerHTML = '';
    
    // Define a unique ID for the SVG rendering process
    const diagramId = 'mermaid-diagram-' + Math.random().toString(36).substr(2, 9);
    
    // Asynchronously render the diagram to a hidden element first for stability
    const renderDiagram = async () => {
      try {
        // Initialize mermaid (safe to call multiple times)
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        });

        // Create a temporary hidden div where Mermaid can safely render the SVG
        const tempDiv = document.createElement('div');
        tempDiv.style.visibility = 'hidden';
        document.body.appendChild(tempDiv);
        
        // Await the asynchronous rendering to get the final SVG string
        const { svg } = await mermaid.render(diagramId, diagramString, tempDiv);
        
        // Remove the temporary rendering element
        document.body.removeChild(tempDiv);

        if (diagramRef.current) {
          // Inject the finalized SVG string into the actual component ref
          diagramRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('CRITICAL: Mermaid rendering failed for topology:', error);
        if (diagramRef.current) {
          diagramRef.current.innerHTML = '<p class="text-red-500">Error rendering diagram: Check browser console.</p>';
        }
      }
    };

    // Execute the rendering function
    renderDiagram();

  }, [diagramString]); // Only re-run when the topology string changes

  if (!diagramString) {
    return (
      <div className="text-center py-8 text-gray-500">
        No diagram available
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto p-4 border rounded-lg">
      {/* The diagram will be injected into this div */}
      <div ref={diagramRef} className="flex justify-center" />
    </div>
  );
}