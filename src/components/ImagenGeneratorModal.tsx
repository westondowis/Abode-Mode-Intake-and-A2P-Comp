import React, { useState, useEffect } from 'react';
import { Lead, SellLead, BuyLead } from '../types';
import {
  generateLandPlaceholderImage,
  getSuggestedLandPrompts,
  ImagenGenerationResult,
} from '../services/imagenService';
import { updateLeadImage } from '../services/leadsStorage';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Check,
  CheckCircle2,
  Wand2,
  Layers,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface ImagenGeneratorModalProps {
  lead: Lead | null;
  onClose: () => void;
  onImageSaved?: (updatedLead: Lead) => void;
}

export const ImagenGeneratorModal: React.FC<ImagenGeneratorModalProps> = ({
  lead,
  onClose,
  onImageSaved,
}) => {
  if (!lead) return null;

  const isSell = lead.type === 'sell';
  const suggestedPrompts = getSuggestedLandPrompts(lead);

  const [prompt, setPrompt] = useState(suggestedPrompts[0]);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('4:3');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<ImagenGenerationResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (lead.imageUrl) {
      setGeneratedResult({
        imageUrl: lead.imageUrl,
        prompt: lead.imagePrompt || prompt,
        source: 'imagen-api',
      });
    }
  }, [lead]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSaveSuccess(false);
    try {
      const result = await generateLandPlaceholderImage(prompt, aspectRatio);
      setGeneratedResult(result);
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLead = () => {
    if (!generatedResult) return;
    const updated = updateLeadImage(lead.id, generatedResult.imageUrl, prompt);
    if (updated && onImageSaved) {
      onImageSaved(updated);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#00171C] border border-[#0A4251] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0A4251] bg-[#0A4251]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0A4251] border border-[#F2C864]/50 flex items-center justify-center text-[#F2C864]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <span>Imagen Land Visualizer</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2C864]/20 border border-[#F2C864]/40 text-[#F2C864] uppercase font-mono">
                  AI Imagery
                </span>
              </h2>
              <p className="text-xs text-[#88BBD8]">
                Generate placeholder imagery for #{lead.id} (
                {isSell ? `${(lead as SellLead).county}, ${(lead as SellLead).state}` : (lead as BuyLead).targetStates.join(', ')}
                )
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#0A4251]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[75vh]">
          {/* Preview Canvas Area */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#F2C864] mb-2 flex items-center justify-between">
              <span>Listing Imagery Preview</span>
              {generatedResult && (
                <span className="text-[11px] text-[#88BBD8] font-normal">
                  Source: {generatedResult.model || 'Imagen'}
                </span>
              )}
            </label>

            <div className="relative w-full h-64 sm:h-72 rounded-2xl border border-[#0A4251] bg-[#0c1622] overflow-hidden flex items-center justify-center group">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-center px-4">
                  <div className="w-10 h-10 border-3 border-[#F2C864] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[#F2C864] font-semibold">Generating parcel imagery with Imagen...</p>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    Synthesizing terrain topography, horizon lighting, and GIS boundary elements...
                  </p>
                </div>
              ) : generatedResult ? (
                <div className="relative w-full h-full">
                  <img
                    src={generatedResult.imageUrl}
                    alt="Generated parcel visualization"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-[#00171C]/80 border border-[#F2C864]/40 text-[10px] text-[#F2C864] backdrop-blur-sm">
                    Imagen Placeholder • Ready to Attach
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500 text-center px-4">
                  <ImageIcon className="w-10 h-10 text-[#0A4251]" />
                  <p className="text-xs text-slate-400">No imagery generated yet for this listing.</p>
                  <p className="text-[11px] text-slate-500">
                    Select a suggested prompt below and click "Generate Imagery" to create a realistic placeholder.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: '4:3', label: '4:3 (Property Card)' },
                  { id: '16:9', label: '16:9 (Landscape Banner)' },
                  { id: '1:1', label: '1:1 (Square Profile)' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAspectRatio(opt.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    aspectRatio === opt.id
                      ? 'bg-[#0A4251] border-[#F2C864] text-[#F2C864] shadow-md'
                      : 'bg-[#00171C] border-[#0A4251]/70 text-slate-400 hover:border-[#0A4251] hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Prompts */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
              <span>Suggested Land Prompts</span>
              <span className="text-[11px] text-slate-500 font-normal">Click to apply</span>
            </label>
            <div className="space-y-2">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                    prompt === p
                      ? 'bg-[#0A4251]/50 border-[#F2C864] text-white font-medium'
                      : 'bg-[#00171C] border-[#0A4251]/60 text-slate-400 hover:text-slate-200 hover:border-[#0A4251]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Prompt Specification
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the land parcel visual style, vegetation, topography, and lighting..."
              className="w-full bg-[#00171C] text-sm text-slate-100 placeholder:text-slate-500 rounded-xl p-3 border border-[#0A4251] focus:outline-none focus:border-[#F2C864]"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#0A4251] bg-[#0A4251]/30 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0A4251] hover:bg-[#0d5264] border border-[#F2C864]/50 text-[#F2C864] font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#F2C864] border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{generatedResult ? 'Regenerate' : 'Generate with Imagen'}</span>
                </>
              )}
            </button>

            {generatedResult && (
              <button
                type="button"
                onClick={handleSaveToLead}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F2C864] hover:bg-amber-300 text-[#00171C] font-extrabold text-xs shadow-lg transition-all"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Attached to Listing!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save to Listing</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
