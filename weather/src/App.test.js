import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the city search input', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/search for a city/i);
  expect(inputElement).toBeInTheDocument();
});
