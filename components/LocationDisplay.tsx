
import React from 'react';
import { Location, GameState } from '../types';

interface LocationDisplayProps {
  location: Location;
  gameState: GameState;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ location, gameState }) => {
  return (
    <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-xl border border-slate-700">
      <h2 className="text-2xl md:text-3xl font-bold text-sky-400 mb-3">{location.name}</h2>
      <img 
        src={location.getImageUrl(gameState)} 
        alt={location.name} 
        className="w-full h-48 md:h-64 object-cover rounded-md mb-4 shadow-lg border border-slate-600"
      />
      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{location.getDescription(gameState)}</p>
    </div>
  );
};

export default LocationDisplay;
    