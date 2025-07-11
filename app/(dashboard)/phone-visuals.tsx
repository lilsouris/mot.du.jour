'use client';

export function PhoneVisuals() {
  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      {/* Phone 1 - Behind, tilted right, overlapping at bottom */}
      <div className="absolute z-10 transform rotate-12 translate-x-20 -translate-y-4">
        <div className="relative w-64 h-80 drop-shadow-2xl">
          <div className="w-full h-full bg-gray-900 rounded-2xl border-4 border-gray-800 relative overflow-hidden">
            {/* Screen content placeholder */}
            <div className="absolute inset-2 bg-gradient-to-b from-orange-400 to-orange-600 rounded-xl flex flex-col items-center justify-center text-white">
              <div className="text-xs font-semibold mb-2">Mot du jour</div>
              <div className="w-12 h-12 bg-white/20 rounded-full mb-2"></div>
              <div className="text-xs text-center px-4">
                "Votre message quotidien personnalisé"
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Phone 2 - Front, tilted left, overlapping at bottom */}
      <div className="absolute z-20 transform -rotate-6 -translate-x-20 translate-y-4">
        <div className="relative w-64 h-80 drop-shadow-2xl">
          <div className="w-full h-full bg-gray-900 rounded-2xl border-4 border-gray-800 relative overflow-hidden">
            {/* Screen content placeholder */}
            <div className="absolute inset-2 bg-gradient-to-b from-purple-400 to-purple-600 rounded-xl flex flex-col items-center justify-center text-white">
              <div className="text-xs font-semibold mb-2">Dashboard</div>
              <div className="space-y-1 w-full px-4">
                <div className="h-2 bg-white/30 rounded"></div>
                <div className="h-2 bg-white/30 rounded w-3/4"></div>
                <div className="h-2 bg-white/30 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle background gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 opacity-50 rounded-3xl -z-10"></div>
    </div>
  );
}