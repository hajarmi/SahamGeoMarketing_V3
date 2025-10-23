export default function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000] min-w-[180px]">
      <h3 className="font-semibold text-xs mb-2 text-gray-800">Légende ATM</h3>

      {/* ATM Performance Legend - More compact */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white"></div>
          <span className="text-xs text-gray-600">≥90% Excellente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"></div>
          <span className="text-xs text-gray-600">80-89% Bonne</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></div>
          <span className="text-xs text-gray-600">&lt;80% Faible</span>
        </div>
      </div>

      {/* Compact size indicator */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
          </div>
          <span className="text-xs text-gray-500">Taille ∝ Performance</span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">🖱️ Cliquez sur un ATM pour plus d'infos</div>
      </div>
    </div>
  )
}
