// src/components/DogCard.jsx
import React from 'react';

export default function DogCard({ dog, isFavorite, onToggle }) {
  return (
    <div className="border p-4 rounded relative">
      <img
        src={dog.img}
        alt={dog.name}
        className="w-full h-48 object-cover mb-2 rounded"
      />
      <h4 className="font-semibold">{dog.name}</h4>
      <p>Breed: {dog.breed}</p>
      <p>Age: {dog.age}</p>
      <p>Zip: {dog.zip_code}</p>
      <button
        onClick={() => onToggle(dog.id)}
        className="absolute top-2 right-2 text-xl"
      >
        {isFavorite ? '💖' : '🤍'}
      </button>
    </div>
  );
}
