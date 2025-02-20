import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DOGS } from '../utils/queries.js';
import DogCard from '../components/DogMatchCardComponent.js';

const Match: React.FC = () => {
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const { loading, error, data } = useQuery(GET_DOGS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const dogs = data.dogs.map((dog: any) => ({
    id: dog._id,
    name: dog.name,
    age: dog.age,
    breed: dog.breed,
    imageUrl: dog.image,
    owner: {
      name: dog.owner.name
    }
  }));

  const handleSwipeLeft = (id: string) => {
    console.log('Disliked dog:', id);
    setCurrentDogIndex((prevIndex) => (prevIndex + 1) % dogs.length);
  };

  const handleSwipeRight = (id: string) => {
    console.log('Liked dog:', id);
    setCurrentDogIndex((prevIndex) => (prevIndex + 1) % dogs.length);
  };

  return (
    <div className="match-page">
      <h1>Find a Pup Friend</h1>
      {dogs.length > 0 ? (
        <DogCard
          dog={dogs[currentDogIndex]}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      ) : (
        <p>No more dogs to show!</p>
      )}
    </div>
  );
};

export default Match;