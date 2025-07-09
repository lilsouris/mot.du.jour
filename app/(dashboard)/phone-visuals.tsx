'use client';

import Image from 'next/image';

export function PhoneVisuals() {
  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      {/* Phone 1 - Behind, tilted right, overlapping at bottom */}
      <div className="absolute z-10 transform rotate-12 translate-x-20 -translate-y-4">
        <div className="relative w-64 h-auto drop-shadow-2xl">
          <Image
            src="/Screen+Phone-1.png"
            alt="Mot du jour app interface - Screen 1"
            width={300}
            height={600}
            className="w-full h-auto rounded-2xl"
            priority
          />
        </div>
      </div>
      
      {/* Phone 2 - Front, tilted left, overlapping at bottom */}
      <div className="absolute z-20 transform -rotate-6 -translate-x-20 translate-y-4">
        <div className="relative w-64 h-auto drop-shadow-2xl">
          <Image
            src="/Screen+Phone-2.png"
            alt="Mot du jour app interface - Screen 2"
            width={300}
            height={600}
            className="w-full h-auto rounded-2xl"
            priority
          />
        </div>
      </div>
      
      {/* Subtle background gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 opacity-50 rounded-3xl -z-10"></div>
    </div>
  );
}