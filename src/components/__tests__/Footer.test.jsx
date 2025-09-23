import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Footer from '../Footer';

// Mock the Contact component
vi.mock('../Contact', () => ({
  default: () => <div data-testid="contact-form">Contact Form</div>
}));

const FooterWithRouter = () => (
  <BrowserRouter>
    <Footer />
  </BrowserRouter>
);

describe('Footer Component', () => {
  beforeEach(() => {
    render(<FooterWithRouter />);
  });

  describe('Responsive Layout', () => {
    test('renders all main sections', () => {
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
      expect(screen.getByText('Raaz Tutoring')).toBeInTheDocument();
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Follow Us')).toBeInTheDocument();
    });

    test('displays logo with proper responsive sizing', () => {
      const logo = screen.getByAltText('Raaz Tutoring Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveClass('w-24', 'md:w-32');
    });

    test('renders contact form section', () => {
      expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    });

    test('displays responsive typography for headings', () => {
      const mainHeading = screen.getByText('Get in Touch');
      expect(mainHeading).toHaveClass('text-2xl', 'md:text-3xl');
    });
  });

  describe('Navigation Links', () => {
    test('renders all navigation links with proper touch targets', () => {
      const homeLink = screen.getByRole('link', { name: 'Home' });
      const aboutLink = screen.getByRole('link', { name: 'About Us' });
      const grades79Link = screen.getByRole('link', { name: 'Grades 7–9' });
      const grades1012Link = screen.getByRole('link', { name: 'Grades 10–12' });

      [homeLink, aboutLink, grades79Link, grades1012Link].forEach(link => {
        expect(link).toBeInTheDocument();
        expect(link).toHaveClass('min-h-[44px]');
        expect(link).toHaveClass('py-2');
      });
    });

    test('navigation links have proper responsive alignment', () => {
      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveClass('justify-center', 'md:justify-start');
    });
  });

  describe('Contact Information', () => {
    test('displays email and phone information', () => {
      expect(screen.getByText('raaztutoring@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('(416) 909-2600')).toBeInTheDocument();
    });

    test('renders social media link with proper touch target', () => {
      const instagramLink = screen.getByLabelText('Follow us on Instagram');
      expect(instagramLink).toBeInTheDocument();
      expect(instagramLink).toHaveClass('min-h-[44px]', 'min-w-[44px]');
      expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/raaztutoring/');
      expect(instagramLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Responsive Spacing', () => {
    test('applies responsive padding and margins', () => {
      const heading = screen.getByText('Get in Touch');
      expect(heading).toHaveClass('mb-6', 'md:mb-8');
    });

    test('applies responsive grid layout', () => {
      const gridContainer = screen.getByText('Quick Links').closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-3');
      expect(gridContainer).toHaveClass('gap-8', 'md:gap-12');
    });
  });

  describe('Copyright Section', () => {
    test('renders copyright text with proper styling', () => {
      const copyright = screen.getByText('© 2025 Raaz Tutoring. All rights reserved.');
      expect(copyright).toBeInTheDocument();
      expect(copyright).toHaveClass('text-center', 'text-gray-500', 'text-sm');
    });

    test('copyright section has responsive margins', () => {
      const copyrightSection = screen.getByText('© 2025 Raaz Tutoring. All rights reserved.').closest('div');
      expect(copyrightSection).toHaveClass('mt-8', 'md:mt-12');
    });
  });

  describe('Accessibility', () => {
    test('social media link has proper aria-label', () => {
      const instagramLink = screen.getByLabelText('Follow us on Instagram');
      expect(instagramLink).toBeInTheDocument();
    });

    test('all interactive elements meet minimum touch target size', () => {
      const interactiveElements = [
        ...screen.getAllByRole('link'),
      ];

      interactiveElements.forEach(element => {
        const hasMinHeight = element.classList.contains('min-h-[44px]') || 
                           element.classList.contains('py-2');
        expect(hasMinHeight).toBe(true);
      });
    });
  });
});