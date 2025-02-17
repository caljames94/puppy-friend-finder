import React, { useState } from 'react';
import './component-css/DogCard.css';

interface DogProfile {
  id: string;
  name: string;
  age: number;
  breed: string;
  imageUrl: string;
  owner: {
    username: string;
  };
}

interface DogCardProps {
  dog: DogProfile;
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (id: string) => void;
}

const DogCard: React.FC<DogCardProps> = ({ dog, onSwipeLeft, onSwipeRight }) => {
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (clientX: number) => {
    setDragStart(clientX)
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (dragStart === null) return;
    const offset = clientX - dragStart;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        onSwipeRight(dog.id); // Need to ensure that this onSwipeRight and left functions trigger the create match in the backend database
      } else {
        onSwipeLeft(dog.id);
      }
    }
    setDragStart(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleDragEnd();

  const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleDragMove(e.clientX);
  };
  const handleMouseUp = () => handleDragEnd();

  const cardStyle = {
    transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)`,
    transition: isDragging ? 'none' : 'transform 0.3s ease'
  };

  return (
    <div className="container">
      <div className="card-container">
        <div 
          className="card"
          style={cardStyle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="card-content">
            <img 
              src={dog.imageUrl || "/api/placeholder/400/600"} 
              alt={dog.name}
              className="card-image"
            />
            <div className="card-info">
              <div className="name-age">
                <h2 className="name">{dog.name}</h2>
                <span className="age">{dog.age}</span>
              </div>
              <p className="breed">{dog.breed}</p>
              <p className="owner">Owner: {dog.owner.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          onClick={() => onSwipeLeft(dog.id)}
          className="swipe-button swipe-left"
        >
          <span className="button-icon">
          </span>
        </button>

        <button 
          onClick={() => onSwipeRight(dog.id)}
          className="swipe-button swipe-right"
        >
          <span className="button-icon">
          </span>
        </button>
      </div>
    </div>
  );
};

export default DogCard;