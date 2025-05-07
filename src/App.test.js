import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page', () => {
  render(<App />);
  const homeText = screen.getByText(/Welcome to the Carbon Credit Marketplace/i);
  expect(homeText).toBeInTheDocument();
});
