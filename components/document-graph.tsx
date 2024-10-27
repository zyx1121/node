import React, { useEffect, useRef } from 'react';
import { Network, Edge } from 'vis-network';
import { DataSet } from 'vis-data';

interface Document {
  id: string;
  title: string;
  links?: { targetDocument: { id: string; title: string } }[];
}

interface DocumentGraphProps {
  documents: Document[];
  onNodeClick: (documentId: string) => void;
}

const DocumentGraph: React.FC<DocumentGraphProps> = ({ documents, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = new DataSet(
      documents.map(doc => ({ id: doc.id, label: doc.title }))
    );

    const edges = new DataSet<Edge, 'id'>(
      documents.flatMap(doc =>
        (doc.links || []).map(link => ({
          id: `${doc.id}-${link.targetDocument.id}`,
          from: doc.id,
          to: link.targetDocument.id
        }))
      )
    );

    const data = { nodes, edges };

    const options = {
      nodes: {
        shape: 'dot',
        size: 10,
        font: {
          size: 12,
          color: '#666666'
        },
        borderWidth: 2,
        color: {
          border: '#999999',
          background: '#CCCCCC',
          highlight: {
            border: '#666666',
            background: '#AAAAAA'
          },
          hover: {
            border: '#666666',
            background: '#BBBBBB'
          }
        }
      },
      edges: {
        width: 1,
        color: {
          color: '#AAAAAA',
          highlight: '#888888',
          hover: '#999999'
        }
      },
      physics: {
        stabilization: false
      }
    };

    const network = new Network(containerRef.current, data, options);

    network.on('click', function(params) {
      if (params.nodes.length > 0) {
        onNodeClick(params.nodes[0]);
      }
    });

    return () => {
      network.destroy();
    };
  }, [documents, onNodeClick]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default DocumentGraph;
