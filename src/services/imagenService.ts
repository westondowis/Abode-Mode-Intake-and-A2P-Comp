import { Lead, SellLead, BuyLead } from '../types';

export interface ImagenGenerationResult {
  imageUrl: string;
  prompt: string;
  source: 'imagen-api' | 'fallback-ai';
  model?: string;
}

export function getSuggestedLandPrompts(lead: Lead): string[] {
  const isSell = lead.type === 'sell';
  if (isSell) {
    const s = lead as SellLead;
    const location = `${s.county ? s.county + ' County, ' : ''}${s.state || 'rural US'}`;
    const acreageStr = s.acreage ? `${s.acreage} acres of ` : '';
    const topo = s.topography && s.topography.length > 0 ? s.topography.join(', ') : 'scenic rolling terrain';

    return [
      `Aerial drone shot of ${acreageStr}vacant land in ${location}, ${topo}, clear sunny sky, survey boundary perspective, 8k resolution cinematic real estate photography`,
      `Panoramic wide-angle view of ${acreageStr}rural acreage in ${location} with dirt road access, natural vegetation, golden hour light, photorealistic landscape`,
      `Scenic ground-level view of pristine undeveloped property in ${location}, mountain backdrop, natural trees and wild grasses, peaceful American landscape photography`,
      `Top-down satellite and plat overlay perspective of ${acreageStr}rural land parcel in ${location}, natural topography contours and road access visible`,
    ];
  } else {
    const b = lead as BuyLead;
    const states = b.targetStates && b.targetStates.length > 0 ? b.targetStates.join(' & ') : 'American West';
    const acres = b.minAcreage ? `${b.minAcreage}-${b.maxAcreage} acres` : 'vacant acreage';
    const use = b.plannedUse || 'homestead and recreation';

    return [
      `Scenic ${acres} land parcel in ${states}, ideal for ${use}, pristine wilderness, mountain vistas, dramatic sunset lighting, high resolution real estate photography`,
      `Expansive rural countryside in ${states}, lush trees, open pastures, private dirt road leading into property, photorealistic 8k drone photograph`,
      `Aerial view of undeveloped off-grid acreage in ${states}, natural water features, towering trees, majestic landscape suitable for private cabin retreat`,
      `Golden hour panoramic view of raw land parcel in ${states}, peaceful countryside, unpaved driveway, clear blue horizon`,
    ];
  }
}

/**
 * Procedural fallback SVG generator when API key is missing or server is offline
 * Generates an authentic, beautiful terrain canvas data URL with geographic features
 */
function createProceduralLandDataUrl(prompt: string, aspectRatio: string): string {
  const width = aspectRatio === '16:9' ? 960 : aspectRatio === '1:1' ? 700 : 800;
  const height = aspectRatio === '16:9' ? 540 : aspectRatio === '1:1' ? 700 : 600;

  // Determine color scheme from prompt
  const isDesert = prompt.toLowerCase().includes('desert') || prompt.toLowerCase().includes('mesa') || prompt.toLowerCase().includes('arizona');
  const isMountain = prompt.toLowerCase().includes('mountain') || prompt.toLowerCase().includes('colorado') || prompt.toLowerCase().includes('rocky');
  const isForest = prompt.toLowerCase().includes('wood') || prompt.toLowerCase().includes('forest') || prompt.toLowerCase().includes('tree');

  const skyTop = isDesert ? '#1a2c38' : isMountain ? '#0c2333' : '#0d222e';
  const skyBottom = isDesert ? '#d97736' : isMountain ? '#3b82f6' : '#22d3ee';
  const groundColor1 = isDesert ? '#9a3412' : isMountain ? '#134e4a' : '#14532d';
  const groundColor2 = isDesert ? '#7c2d12' : isMountain ? '#0f3c39' : '#0f3922';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skyTop}" />
        <stop offset="65%" stop-color="${skyBottom}" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.4" />
      </linearGradient>
      <linearGradient id="terrainGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${groundColor1}" />
        <stop offset="100%" stop-color="${groundColor2}" />
      </linearGradient>
      <pattern id="platGrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(242, 200, 100, 0.15)" stroke-width="1" />
      </pattern>
    </defs>

    <!-- Sky -->
    <rect width="${width}" height="${height}" fill="url(#skyGrad)" />
    
    <!-- Distant Mountains -->
    <polygon points="0,${height * 0.65} ${width * 0.2},${height * 0.42} ${width * 0.45},${height * 0.58} ${width * 0.75},${height * 0.38} ${width},${height * 0.6} ${width},${height} 0,${height}" fill="#0A4251" opacity="0.65" />
    <polygon points="${width * 0.15},${height * 0.68} ${width * 0.38},${height * 0.48} ${width * 0.62},${height * 0.62} ${width * 0.88},${height * 0.46} ${width},${height * 0.65} ${width},${height} 0,${height}" fill="#08303a" opacity="0.8" />
    
    <!-- Foothills & Rolling Acreage -->
    <path d="M 0,${height * 0.68} Q ${width * 0.3},${height * 0.58} ${width * 0.6},${height * 0.72} T ${width},${height * 0.68} L ${width},${height} L 0,${height} Z" fill="url(#terrainGrad)" />
    <path d="M 0,${height * 0.78} Q ${width * 0.4},${height * 0.7} ${width * 0.8},${height * 0.82} L ${width},${height} L 0,${height} Z" fill="${groundColor2}" />

    <!-- Survey Boundary Marker Lines -->
    <polygon points="${width * 0.25},${height * 0.72} ${width * 0.68},${height * 0.66} ${width * 0.78},${height * 0.9} ${width * 0.32},${height * 0.94}" fill="rgba(242, 200, 100, 0.12)" stroke="#F2C864" stroke-width="2" stroke-dasharray="6 3" />
    <rect width="${width}" height="${height}" fill="url(#platGrid)" opacity="0.4" />

    <!-- Corner Survey Stakes -->
    <circle cx="${width * 0.25}" cy="${height * 0.72}" r="5" fill="#F2C864" stroke="#00171C" stroke-width="2" />
    <circle cx="${width * 0.68}" cy="${height * 0.66}" r="5" fill="#F2C864" stroke="#00171C" stroke-width="2" />
    <circle cx="${width * 0.78}" cy="${height * 0.9}" r="5" fill="#F2C864" stroke="#00171C" stroke-width="2" />
    <circle cx="${width * 0.32}" cy="${height * 0.94}" r="5" fill="#F2C864" stroke="#00171C" stroke-width="2" />

    <!-- Overlay Badge -->
    <g transform="translate(24, 24)">
      <rect width="190" height="32" rx="8" fill="#00171C" fill-opacity="0.85" stroke="#F2C864" stroke-width="1.2" />
      <text x="14" y="21" fill="#F2C864" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" letter-spacing="1">IMAGEN • LAND PREVIEW</text>
    </g>

    <!-- Bottom Caption -->
    <g transform="translate(${width - 240}, ${height - 40})">
      <rect width="216" height="26" rx="6" fill="#00171C" fill-opacity="0.85" stroke="#0A4251" stroke-width="1" />
      <text x="10" y="17" fill="#88BBD8" font-family="'Plus Jakarta Sans', sans-serif" font-size="10">AI-Assisted Parcel Visualization</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Call the Imagen proxy endpoint to generate high quality land placeholder imagery
 */
export async function generateLandPlaceholderImage(
  prompt: string,
  aspectRatio: '16:9' | '4:3' | '1:1' = '4:3'
): Promise<ImagenGenerationResult> {
  try {
    const response = await fetch('/api/generate-land-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, aspectRatio }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.imageUrl) {
        return {
          imageUrl: data.imageUrl,
          prompt,
          source: 'imagen-api',
          model: data.model || 'imagen-3.0-generate-002',
        };
      }
    } else {
      console.warn(`Imagen API endpoint returned status ${response.status}`);
    }
  } catch (err) {
    console.warn('Network call to /api/generate-land-image failed, using procedural fallback:', err);
  }

  // Graceful fallback: procedural visualizer ensuring zero downtime
  const fallbackUrl = createProceduralLandDataUrl(prompt, aspectRatio);
  return {
    imageUrl: fallbackUrl,
    prompt,
    source: 'fallback-ai',
    model: 'procedural-gis-visualizer',
  };
}
