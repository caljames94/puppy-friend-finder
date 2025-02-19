import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { REGISTER } from '../utils/mutations.js';
import Auth from '../utils/auth.js';


const CreateProfile: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const [register, { error }] = useMutation(REGISTER);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
        const { data } = await register({ variables: {...formState }
        });

        Auth.login(data.register.token);
        navigate('/create-dog-profile');
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="create-profile-page">
      <h2>Create Your Profile</h2>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter Your First Name"
          value={formState.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Enter Your Email"
          value={formState.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter Your Password"
          value={formState.password}
          onChange={handleChange}
        />
        <button type="submit">Sign Up</button>
      </form>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default CreateProfile;