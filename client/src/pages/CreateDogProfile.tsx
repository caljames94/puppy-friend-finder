import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { CREATE_DOG } from '../utils/mutations';

const personalityOptions = ['Friendly', 'Playful', 'Energetic', 'Calm', 'Shy', 'Independent', 'Social'];

const CreateDogProfile: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    age: '',
    breed: '',
    personality: [] as string[],
    profilePicture: '',
    suburb: ''
  });

  const navigate = useNavigate();

  const [createDog, { error }] = useMutation(CREATE_DOG);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handlePersonalityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setFormState(prevState => ({
        ...prevState,
        personality: [...prevState.personality, value]
      }));
    } else {
      setFormState(prevState => ({
        ...prevState,
        personality: prevState.personality.filter(trait => trait !== value)
      }));
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { data } = await createDog({
        variables: {
          ...formState,
          age: parseInt(formState.age),
        }
      });

      if (data.createDog) {
        navigate('/match'); // Navigate to the Match page after successful dog creation
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="create-dog-profile-page">
      <h2>Create Your Dog's Profile</h2>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Dog's Name"
          value={formState.name}
          onChange={handleChange}
        />
        <input
          type="number"
          name="age"
          placeholder="Dog's Age"
          value={formState.age}
          onChange={handleChange}
        />
        <input
          type="text"
          name="breed"
          placeholder="Dog's Breed"
          value={formState.breed}
          onChange={handleChange}
        />
        <div>
          <p>Dog's Personality (select all that apply):</p>
          {personalityOptions.map(trait => (
            <label key={trait}>
              <input
                type="checkbox"
                name="personality"
                value={trait}
                checked={formState.personality.includes(trait)}
                onChange={handlePersonalityChange}
              />
              {trait}
            </label>
          ))}
        </div>
        <input
          type="text"
          name="profilePicture"
          placeholder="Profile Picture URL"
          value={formState.profilePicture}
          onChange={handleChange}
        />
        <input
          type="text"
          name="suburb"
          placeholder="Your Suburb"
          value={formState.suburb}
          onChange={handleChange}
        />
        <button type="submit">Create Dog Profile</button>
      </form>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default CreateDogProfile;