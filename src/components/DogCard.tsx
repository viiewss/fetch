import React from 'react';
import type { Dog } from '../types';

interface DogCardProps {
  dog: Dog;
  isFavorite: boolean;
  onToggle: (id: string) => void;
}

export default function DogCard({ dog, isFavorite, onToggle }: DogCardProps) {
  return (
    <div className="border p-4 rounded relative overflow-hidden bg-white">
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
        <img
          src={dog.img}
          alt={dog.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Dog information */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold truncate">{dog.name}</h4>
        <p className="text-sm text-gray-600">Breed: {dog.breed}</p>
        <p className="text-sm text-gray-600">Age: {dog.age}</p>
        <p className="text-sm text-gray-600">Zip Code: {dog.zip_code}</p>
      </div>

      {/* Favorite toggle */}
      <button
        onClick={() => onToggle(dog.id)}
        className="absolute top-2 right-2 text-xl focus:outline-none"
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorite ? '💖' : '🤍'}
      </button>
    </div>
  );
}


