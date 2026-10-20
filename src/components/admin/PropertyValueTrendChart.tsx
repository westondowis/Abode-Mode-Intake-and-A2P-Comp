import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Sparkles } from 'lucide-react';

interface MonthlyDataPoint {
  month: string;
  year: number;
  avgPricePerAcre: number;
  medianSalePrice: number;
  totalVolumeThousands: number;
  closedDeals: number;
  coloradoAvg: number;
  texasAvg: number;
  southwestAvg: number;
}

const MARKET_TREND_DATA: MonthlyDataPoint[] = [
  {
    month: 'Nov',
    year: 2025,
    avgPricePerAcre: 5820,
    medianSalePrice: 28500,
    totalVolumeThousands: 410,
    closedDeals: 14,
    coloradoAvg: 6200,
    texasAvg: 5400,
    southwestAvg: 4800,
  },
  {
    month: 'Dec',
    year: 2025,
    avgPricePerAcre: 5750,
    medianSalePrice: 27800,
    totalVolumeThousands: 360,
    closedDeals: 12,
    coloradoAvg: 6150,
    texasAvg: 5350,
    southwestAvg: 4750,
  },
  {
    month: 'Jan',
    year: 2026,
    avgPricePerAcre: 5910,
    medianSalePrice: 29200,
    totalVolumeThousands: 440,
    closedDeals: 15,
    coloradoAvg: 6350,
    texasAvg: 5500,
    southwestAvg: 4900,
  },
  {
    month: 'Feb',
    year: 2026,
    avgPricePerAcre: 6040,
    medianSalePrice: 30500,
    totalVolumeThousands: 490,
    closedDeals: 16,
    coloradoAvg: 6500,
    texasAvg: 5620,
    southwestAvg: 5020,
  },
  {
    month: 'Mar',
    year: 2026,
    avgPricePerAcre: 6180,
    medianSalePrice: 31800,
    totalVolumeThousands: 580,
    closedDeals: 19,
    coloradoAvg: 6680,
    texasAvg: 5780,
    southwestAvg: 5150,
  },
  {
    month: 'Apr',
    year: 2026,
    avgPricePerAcre: 6320,
    medianSalePrice: 32600,
    totalVolumeThousands: 640,
    closedDeals: 21,
    coloradoAvg: 6850,
    texasAvg: 5900,
    southwestAvg: 5280,
  },
  {
    month: 'May',
    year: 2026,
    avgPricePerAcre: 6490,
    medianSalePrice: 34100,
    totalVolumeThousands: 720,
    closedDeals: 24,
    coloradoAvg: 7050,
    texasAvg: 6050,
    southwestAvg: 5410,
  },
  {
    month: 'Jun',
    year: 2026,
    avgPricePerAcre: 6680,
    medianSalePrice: 35500,
    totalVolumeThousands: 790,
    closedDeals: 26,
    coloradoAvg: 7250,
    texasAvg: 6220,
    southwestAvg: 5590,
  },
  {
    month: 'Jul',
    year: 2026,
    avgPricePerAcre: 6850,
    medianSalePrice: 36800,
    totalVolumeThousands: 860,
    closedDeals: 28,
    coloradoAvg: 7420,
    texasAvg: 6380,
    southwestAvg: 5740,
  },
  {
    month: 'Aug',
    year: 2026,
    avgPricePerAcre: 6720,
    medianSalePrice: 35900,
    totalVolumeThousands: 810,
    closedDeals: 25,
    coloradoAvg: 7300,
    texasAvg: 6280,
    southwestAvg: 5620,
  },
  {
    month: 'Sep',
    year: 2026,
    avgPricePerAcre: 6590,
    medianSalePrice: 34900,
    totalVolumeThousands: 750,
    closedDeals: 23,
    coloradoAvg: 7150,
    texasAvg: 6150,
    southwestAvg: 5500,
  },
  {
    month: 'Oct',
    year: 2026,
    avgPricePerAcre: 6640,
    medianSalePrice: 35400,
    totalVolumeThousands: 780,
    closedDeals: 24,
    coloradoAvg: 7210,
    texasAvg: 6200,
    southwestAvg: 5540,
  },
];

export const PropertyValueTrendChart: React.FC = () => {
  const [metric, setMetric] = useState<'pricePerAcre' | 'medianPrice' | 'volume'>('pricePerAcre');
  const [viewMode, setViewMode] = useState<'composite' | 'regional'>('composite');

  const startVal = MARKET_TREND_DATA[0].avgPricePerAcre;
  const currentVal = MARKET_TREND_DATA[MARKET_TREND_DATA.length - 1].avgPricePerAcre;
  const percentageGain = (((currentVal - startVal) / startVal) * 100).toFixed(1);

  const formatYAxis = (val: number) => {
    if (metric === 'volume') return `$${val}k`;
    return `$${val.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MonthlyDataPoint;
      return (
        <div className="bg-[#00171C]/95 border border-[#0A4251] p-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[210px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#0A4251]">
            <span className="font-bold text-white">
              {data.month} {data.year} Market Report
            </span>
            <span className="text-[10px] text-[#F2C864] font-mono font-semibold">
              {data.closedDeals} closed deals
            </span>
          </div>

          <div className="space-y-1 pt-1 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Avg Price / Acre:</span>
              <span className="font-bold text-[#F2C864] font-mono">
                ${data.avgPricePerAcre.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Median Parcel Sale:</span>
              <span className="font-semibold text-white font-mono">
                ${data.medianSalePrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Volume:</span>
              <span className="font-semibold text-[#88BBD8] font-mono">
                ${data.totalVolumeThousands}k
              </span>
            </div>
          </div>

          {viewMode === 'regional' && (
            <div className="pt-2 mt-2 border-t border-[#0A4251]/70 text-[11px] space-y-0.5">
              <div className="flex justify-between text-teal-300">
                <span>Colorado Foothills:</span>
                <span className="font-mono">${data.coloradoAvg}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>Texas Ranches:</span>
                <span className="font-mono">${data.texasAvg}</span>
              </div>
              <div className="flex justify-between text-cyan-300">
                <span>Southwest Desert:</span>
                <span className="font-mono">${data.southwestAvg}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#00171C] border border-[#0A4251] shadow-2xl space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A4251]/50 border border-[#F2C864]/30 text-[#F2C864] text-xs font-semibold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Market Intelligence & Valuation Dynamics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2.5">
            <span>Property Value Trend (Last 12 Months)</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono">
              +{percentageGain}% YoY
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracking nationwide rural acreage transactions, median prices, and price-per-acre fluctuations.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Metric Selector */}
          <div className="flex bg-[#0A4251]/30 p-1 rounded-xl border border-[#0A4251] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMetric('pricePerAcre')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                metric === 'pricePerAcre'
                  ? 'bg-[#F2C864] text-[#00171C] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              $/Acre
            </button>
            <button
              type="button"
              onClick={() => setMetric('medianPrice')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                metric === 'medianPrice'
                  ? 'bg-[#F2C864] text-[#00171C] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Median Parcel
            </button>
            <button
              type="button"
              onClick={() => setMetric('volume')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                metric === 'volume'
                  ? 'bg-[#F2C864] text-[#00171C] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Volume ($k)
            </button>
          </div>

          {/* Regional vs Composite Switcher */}
          <div className="flex bg-[#0A4251]/30 p-1 rounded-xl border border-[#0A4251] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('composite')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'composite'
                  ? 'bg-[#0A4251] text-[#F2C864] border border-[#F2C864]/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Composite
            </button>
            <button
              type="button"
              onClick={() => setViewMode('regional')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'regional'
                  ? 'bg-[#0A4251] text-[#F2C864] border border-[#F2C864]/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              By Region
            </button>
          </div>
        </div>
      </div>

      {/* Metric Mini Stat Pill Banners */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#0A4251]/20 border border-[#0A4251]">
          <span className="text-slate-400 block text-[11px]">Current Market Avg</span>
          <span className="text-lg font-bold text-[#F2C864] font-mono">
            ${currentVal.toLocaleString()} <span className="text-xs text-slate-400">/ac</span>
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#0A4251]/20 border border-[#0A4251]">
          <span className="text-slate-400 block text-[11px]">12-Month Peak</span>
          <span className="text-lg font-bold text-white font-mono">
            $6,850 <span className="text-xs text-slate-400">(July 2026)</span>
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#0A4251]/20 border border-[#0A4251]">
          <span className="text-slate-400 block text-[11px]">12-Mo Volume</span>
          <span className="text-lg font-bold text-[#88BBD8] font-mono">
            $7.68M <span className="text-xs text-slate-400">Total</span>
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#0A4251]/20 border border-[#0A4251]">
          <span className="text-slate-400 block text-[11px]">Underwriting Velocity</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">
            24 <span className="text-xs text-slate-400">deals/mo</span>
          </span>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'composite' ? (
            <AreaChart
              data={MARKET_TREND_DATA}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                {/* Gold Gradient */}
                <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F2C864" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F2C864" stopOpacity={0.0} />
                </linearGradient>
                {/* Mist Gradient */}
                <linearGradient id="colorMist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#88BBD8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#88BBD8" stopOpacity={0.0} />
                </linearGradient>
                {/* Teal Gradient */}
                <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A4251" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#0A4251" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#0A4251" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                tick={{ fill: '#88BBD8', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#88BBD8', fontSize: 11 }}
                tickFormatter={formatYAxis}
                tickLine={false}
                domain={
                  metric === 'pricePerAcre'
                    ? [5000, 7200]
                    : metric === 'medianPrice'
                    ? [25000, 40000]
                    : [200, 1000]
                }
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={
                  metric === 'pricePerAcre'
                    ? 'avgPricePerAcre'
                    : metric === 'medianPrice'
                    ? 'medianSalePrice'
                    : 'totalVolumeThousands'
                }
                name={
                  metric === 'pricePerAcre'
                    ? 'Avg Price / Acre'
                    : metric === 'medianPrice'
                    ? 'Median Sale'
                    : 'Volume ($k)'
                }
                stroke="#F2C864"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorGold)"
                activeDot={{ r: 6, fill: '#F2C864', stroke: '#00171C', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <AreaChart
              data={MARKET_TREND_DATA}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCO" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorTX" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F2C864" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F2C864" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSW" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#0A4251" opacity={0.5} vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#88BBD8', fontSize: 11 }} tickLine={false} />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#88BBD8', fontSize: 11 }}
                tickFormatter={(val) => `$${val}`}
                tickLine={false}
                domain={[4500, 7800]}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                formatter={(val) => <span className="text-xs text-slate-300 font-medium">{val}</span>}
              />
              <Area
                type="monotone"
                dataKey="coloradoAvg"
                name="Colorado Foothills"
                stroke="#2dd4bf"
                strokeWidth={2}
                fill="url(#colorCO)"
              />
              <Area
                type="monotone"
                dataKey="texasAvg"
                name="Texas Ranch"
                stroke="#F2C864"
                strokeWidth={2}
                fill="url(#colorTX)"
              />
              <Area
                type="monotone"
                dataKey="southwestAvg"
                name="Southwest Desert"
                stroke="#38bdf8"
                strokeWidth={2}
                fill="url(#colorSW)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Insight */}
      <div className="pt-4 border-t border-[#0A4251]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F2C864]" />
          <span>
            <strong>Market Insight:</strong> Mountain recreational land in Colorado showed the highest appreciation (+16.3%), while Texas rural acreages demonstrated highest liquidity.
          </span>
        </div>
        <span className="text-[11px] text-[#88BBD8] font-mono whitespace-nowrap">
          Updated: {new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
};
