import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Home from '../Home';

// Mock the components to focus on layout testing
vi.mock('../../components/Hero', () => ({
  default: () => <div data-testid="hero">Hero Component</div>
}));

vi.mock('../../components/Features', () => ({
  default: () => <div data-testid="features">Features Component</div>
}));

vi.mock('../../components/TestimonialCarousel', () => ({
  default: () => <div data-testid="testimonials">Testimonials Component</div>
}));

vi.mock('../../components/HowItWorksSection', () => ({
  default: () => <div data-testid="how-it-works">How It Works Component</div>
}));

vi.mock('../../components/FAQ', () => ({
  default: () => <div data-testid="faq">FAQ Component</div>
}));

// Mock react-helmet
vi.mock('react-helmet', () => ({
  Helmet: ({ children }) => <div data-testid="helmet">{children}</div>
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Intro Section Layout', () => {
    it('renders intro section with proper structure', () => {
      renderWithRouter(<Home />);
      
      expect(screen.getByText('Your Success Starts Here')).toBeInTheDocument();
      expect(screen.getByText(/At Raaz, we turn confusion into clarity/)).toBeInTheDocument();
      expect(screen.getByText('More Than Just Math — We Build Confidence')).toBeInTheDocument();
      expect(screen.getByText('Explore Our Programs Here')).toBeInTheDocument();
    });

    it('renders navigation buttons with proper accessibility', () => {
      renderWithRouter(<Home />);
      
      const grades79Button = screen.getByRole('link', { name: 'Grades 7-9' });
      const grades1012Button = screen.getByRole('link', { name: 'Grades 10-12' });
      
      expect(grades79Button).toBeInTheDocument();
      expect(grades1012Button).toBeInTheDocument();
      expect(grades79Button).toHaveAttribute('href', '/grades-7-9');
      expect(grades1012Button).toHaveAttribute('href', '/grades-10-12');
    });

    it('renders image with proper alt text and responsive classes', () => {
      renderWithRouter(<Home />);
      
      const image = screen.getByAltText('Student studying with tutor - personalized math tutoring session');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'images/student-studying.jpg');
      expect(image).toHaveClass('w-full', 'h-auto', 'rounded-lg', 'shadow-lg');
    });

    it('applies responsive grid layout classes', () => {
      renderWithRouter(<Home />);
      
      const introSection = screen.getByText('Your Success Starts Here').closest('section');
      const gridContainer = introSection.querySelector('.grid');
      
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2');
    });

    it('ensures navigation buttons have minimum touch target size', () => {
      renderWithRouter(<Home />);
      
      const grades79Button = screen.getByRole('link', { name: 'Grades 7-9' });
      const grades1012Button = screen.getByRole('link', { name: 'Grades 10-12' });
      
      expect(grades79Button).toHaveClass('min-h-[44px]');
      expect(grades1012Button).toHaveClass('min-h-[44px]');
    });

    it('applies responsive spacing classes', () => {
      renderWithRouter(<Home />);
      
      const introSection = screen.getByText('Your Success Starts Here').closest('section');
      const container = introSection.querySelector('.container');
      
      expect(container).toHaveClass('py-8', 'md:py-12', 'lg:py-24');
    });

    it('applies responsive typography classes', () => {
      renderWithRouter(<Home />);
      
      const heading = screen.getByText('Your Success Starts Here');
      expect(heading).toHaveClass('text-2xl', 'md:text-3xl', 'lg:text-4xl');
    });
  });

  describe('FAQ Section Layout', () => {
    it('renders FAQ section with responsive layout', () => {
      renderWithRouter(<Home />);
      
      const faqSection = screen.getByText('Frequently Asked Questions').closest('section');
      expect(faqSection).toHaveClass('bg-gray-100', 'py-12', 'md:py-16');
      
      const faqContainer = faqSection.querySelector('.container');
      expect(faqContainer).toHaveClass('mx-auto', 'px-4');
      
      const gridContainer = faqSection.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2');
    });

    it('renders contact information with proper icons', () => {
      renderWithRouter(<Home />);
      
      expect(screen.getByText('+1 (416) 909-2600')).toBeInTheDocument();
      expect(screen.getByText('raaztutoring@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    it('renders FAQ image with proper attributes', () => {
      renderWithRouter(<Home />);
      
      const faqImage = screen.getByAltText('Students learning together in a collaborative tutoring environment');
      expect(faqImage).toBeInTheDocument();
      expect(faqImage).toHaveAttribute('src', 'images/FAQ-image.png');
      expect(faqImage).toHaveClass('rounded-lg', 'shadow-lg', 'w-full', 'h-auto');
    });
  });
});