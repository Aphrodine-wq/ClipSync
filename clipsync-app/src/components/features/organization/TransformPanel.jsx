import { useState } from 'react';
import useClipStore from '../../../store/useClipStore';
import * as transforms from '../../../utils/transforms';

const TransformPanel = ({ clip }) => {
  const { showTransforms, toggleTransforms, addClip } = useClipStore();
  const [transforming, setTransforming] = useState(false);

  const handleTransform = async (transformFn, transformName) => {
    try {
      setTransforming(true);
      const result = await transformFn(clip.content);
      await addClip(result);
      setTransforming(false);
    } catch (error) {
      console.error(`Failed to ${transformName}:`, error);
      alert(error.message || `Failed to ${transformName}`);
      setTransforming(false);
    }
  };

  const getTransformsForType = () => {
    const commonTransforms = [
      { label: 'lowercase', fn: transforms.toLowerCase },
      { label: 'UPPERCASE', fn: transforms.toUpperCase },
      { label: 'Base64 Encode', fn: transforms.base64Encode },
      { label: 'URL Encode', fn: transforms.urlEncode },
    ];

    const typeSpecificTransforms = {
      json: [
        { label: 'Beautify', fn: transforms.beautifyJSON },
        { label: 'Minify', fn: transforms.minifyJSON },
      ],
      code: [
        { label: 'Beautify JSON', fn: transforms.beautifyJSON },
      ],
      text: [
        { label: 'camelCase', fn: transforms.toCamelCase },
        { label: 'snake_case', fn: transforms.toSnakeCase },
        { label: 'kebab-case', fn: transforms.toKebabCase },
        { label: 'PascalCase', fn: transforms.toPascalCase },
      ],
    };

    const specific = typeSpecificTransforms[clip.type] || [];
    return [...specific, ...commonTransforms];
  };

  const allTransforms = [
    { label: 'camelCase', fn: transforms.toCamelCase },
    { label: 'snake_case', fn: transforms.toSnakeCase },
    { label: 'kebab-case', fn: transforms.toKebabCase },
    { label: 'Hash (SHA-256)', fn: transforms.generateSHA256 },
    { label: 'Reverse', fn: transforms.reverseString },
    { label: 'Sort Lines', fn: transforms.sortLines },
  ];

  const mainTransforms = getTransformsForType().slice(0, 4);
  const extraTransforms = showTransforms ? allTransforms : [];

  return (
    <div className="border-t border-zinc-200 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-800">Quick Transforms</h3>
        <button 
          onClick={toggleTransforms}
          className="text-xs text-blue-600 font-medium hover:text-blue-700"
        >
          {showTransforms ? 'Show less' : 'Show all'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {mainTransforms.map((transform, index) => (
          <button 
            key={index}
            onClick={() => handleTransform(transform.fn, transform.label)}
            disabled={transforming}
            className="px-3 py-2.5 bg-zinc-50 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {transform.label}
          </button>
        ))}
      </div>

      {showTransforms && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {extraTransforms.map((transform, index) => (
            <button 
              key={index}
              onClick={() => handleTransform(transform.fn, transform.label)}
              disabled={transforming}
              className="px-3 py-2.5 bg-zinc-50 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {transform.label}
            </button>
          ))}
        </div>
      )}

      {transforming && (
        <div className="mt-3 text-center">
          <div className="inline-block w-4 h-4 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default TransformPanel;
