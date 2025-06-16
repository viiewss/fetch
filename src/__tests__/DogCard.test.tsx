import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DogCard from '../components/DogCard';
import type { Dog } from '../types';

describe('DogCard', () => {
  const dog: Dog = {
    id: '1',
    img: 'dog.jpg',
    name: 'Fido',
    age: 3,
    zip_code: '12345',
    breed: 'Labrador',
  };

  test('renders info and toggles favorite', async () => {
    const onToggle = jest.fn();
    render(<DogCard dog={dog} isFavorite={false} onToggle={onToggle} />);

    expect(screen.getByText('Fido')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /add to favorites/i });
    expect(button).toHaveTextContent('🤍');

    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledWith('1');
  });
});
