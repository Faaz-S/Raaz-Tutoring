import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Contact from '../Contact';

// Mock fetch
global.fetch = vi.fn();

describe('Contact Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    render(<Contact />);
  });

  describe('Mobile Optimization', () => {
    test('renders all form inputs with proper mobile sizing', () => {
      const nameInput = screen.getByPlaceholderText('Your Name');
      const emailInput = screen.getByPlaceholderText('Your Email');
      const phoneInput = screen.getByPlaceholderText('Your Contact Number');
      const messageTextarea = screen.getByPlaceholderText('Your Message');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });

      // Check minimum height for touch targets
      [nameInput, emailInput, phoneInput, submitButton].forEach(element => {
        expect(element).toHaveClass('min-h-[44px]');
      });

      // Check textarea minimum height
      expect(messageTextarea).toHaveClass('min-h-[120px]');
    });

    test('applies responsive padding and text sizing', () => {
      const nameInput = screen.getByPlaceholderText('Your Name');
      const emailInput = screen.getByPlaceholderText('Your Email');
      const phoneInput = screen.getByPlaceholderText('Your Contact Number');
      const messageTextarea = screen.getByPlaceholderText('Your Message');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });

      [nameInput, emailInput, phoneInput, messageTextarea].forEach(element => {
        expect(element).toHaveClass('py-3', 'md:py-2');
        expect(element).toHaveClass('text-base', 'md:text-sm');
      });

      expect(submitButton).toHaveClass('py-3', 'md:py-2');
      expect(submitButton).toHaveClass('text-base', 'md:text-sm');
    });

    test('applies responsive form spacing', () => {
      const form = document.getElementById('contact');
      expect(form).toHaveClass('space-y-4', 'md:space-y-3');
    });
  });

  describe('Input Types and Attributes', () => {
    test('email input has proper mobile keyboard type', () => {
      const emailInput = screen.getByPlaceholderText('Your Email');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('inputMode', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
    });

    test('phone input has proper mobile keyboard type', () => {
      const phoneInput = screen.getByPlaceholderText('Your Contact Number');
      expect(phoneInput).toHaveAttribute('type', 'tel');
      expect(phoneInput).toHaveAttribute('inputMode', 'tel');
      expect(phoneInput).toHaveAttribute('autoComplete', 'tel');
    });

    test('name input has proper autocomplete', () => {
      const nameInput = screen.getByPlaceholderText('Your Name');
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(nameInput).toHaveAttribute('autoComplete', 'name');
    });

    test('form has noValidate attribute for custom validation', () => {
      const form = document.getElementById('contact');
      expect(form).toHaveAttribute('noValidate');
    });
  });

  describe('Accessibility', () => {
    test('submit button has proper focus styles', () => {
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      expect(submitButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-red-500');
    });

    test('submit button has active state for touch devices', () => {
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      expect(submitButton).toHaveClass('active:bg-red-800');
    });

    test('status messages have proper accessibility attributes', async () => {
      const user = userEvent.setup();
      
      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      await user.click(submitButton);

      await waitFor(() => {
        const statusMessage = screen.getByRole('alert');
        expect(statusMessage).toBeInTheDocument();
        expect(statusMessage).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Form Validation', () => {
    test('validates phone number with proper error styling', async () => {
      const user = userEvent.setup();
      
      const nameInput = screen.getByPlaceholderText('Your Name');
      const emailInput = screen.getByPlaceholderText('Your Email');
      const phoneInput = screen.getByPlaceholderText('Your Contact Number');
      const messageInput = screen.getByPlaceholderText('Your Message');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(phoneInput, '123'); // Invalid phone
      await user.type(messageInput, 'Test message');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toHaveTextContent('Please enter a valid phone number');
        expect(errorMessage).toHaveClass('text-red-600', 'bg-red-50', 'border-red-200');
      });
    });

    test('shows success message with proper styling', async () => {
      const user = userEvent.setup();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const nameInput = screen.getByPlaceholderText('Your Name');
      const emailInput = screen.getByPlaceholderText('Your Email');
      const phoneInput = screen.getByPlaceholderText('Your Contact Number');
      const messageInput = screen.getByPlaceholderText('Your Message');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(phoneInput, '1234567890');
      await user.type(messageInput, 'Test message');
      await user.click(submitButton);

      await waitFor(() => {
        const successMessage = screen.getByRole('alert');
        expect(successMessage).toHaveTextContent('Your message has been sent successfully');
        expect(successMessage).toHaveClass('text-green-600', 'bg-green-50', 'border-green-200');
      });
    });

    test('shows network error with proper styling', async () => {
      const user = userEvent.setup();
      
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const nameInput = screen.getByPlaceholderText('Your Name');
      const emailInput = screen.getByPlaceholderText('Your Email');
      const phoneInput = screen.getByPlaceholderText('Your Contact Number');
      const messageInput = screen.getByPlaceholderText('Your Message');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(phoneInput, '1234567890');
      await user.type(messageInput, 'Test message');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toHaveTextContent('Failed to send. Please try again later.');
        expect(errorMessage).toHaveClass('text-red-600', 'bg-red-50', 'border-red-200');
      });
    });
  });

  describe('Form Submission', () => {
    test('submits form with valid data', async () => {
      const user = userEvent.setup();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const nameInput = screen.getByPlaceholderText('Your Name');
      const emailInput = screen.getByPlaceholderText('Your Email');
      const phoneInput = screen.getByPlaceholderText('Your Contact Number');
      const messageInput = screen.getByPlaceholderText('Your Message');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(phoneInput, '1234567890');
      await user.type(messageInput, 'Test message');
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'https://ejvcjiyn1i.execute-api.us-east-2.amazonaws.com/Prod/contact',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'John Doe',
              email: 'john@example.com',
              phone: '1234567890',
              message: 'Test message'
            })
          }
        );
      });
    });

    test('clears form after successful submission', async () => {
      const user = userEvent.setup();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const nameInput = screen.getByPlaceholderText('Your Name');
      const emailInput = screen.getByPlaceholderText('Your Email');
      const phoneInput = screen.getByPlaceholderText('Your Contact Number');
      const messageInput = screen.getByPlaceholderText('Your Message');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(phoneInput, '1234567890');
      await user.type(messageInput, 'Test message');
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(phoneInput.value).toBe('');
        expect(messageInput.value).toBe('');
      });
    });
  });

  describe('Phone Number Validation', () => {
    test('accepts valid phone numbers with different formats', async () => {
      const user = userEvent.setup();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const phoneInput = screen.getByPlaceholderText('Your Contact Number');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });

      // Fill other required fields
      await user.type(screen.getByPlaceholderText('Your Name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('Your Email'), 'john@example.com');
      await user.type(screen.getByPlaceholderText('Your Message'), 'Test message');

      // Test various phone formats
      const validPhones = [
        '1234567890',
        '(123) 456-7890',
        '123-456-7890',
        '+1 123 456 7890',
        '123.456.7890'
      ];

      for (const phone of validPhones) {
        await user.clear(phoneInput);
        await user.type(phoneInput, phone);
        await user.click(submitButton);

        await waitFor(() => {
          expect(fetch).toHaveBeenCalled();
        });

        fetch.mockClear();
      }
    });

    test('rejects invalid phone numbers', async () => {
      const user = userEvent.setup();
      
      const phoneInput = screen.getByPlaceholderText('Your Contact Number');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });

      // Fill other required fields
      await user.type(screen.getByPlaceholderText('Your Name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('Your Email'), 'john@example.com');
      await user.type(screen.getByPlaceholderText('Your Message'), 'Test message');

      const invalidPhones = ['123', '12345', 'abc', ''];

      for (const phone of invalidPhones) {
        await user.clear(phoneInput);
        if (phone) await user.type(phoneInput, phone);
        await user.click(submitButton);

        await waitFor(() => {
          const errorMessage = screen.getByRole('alert');
          expect(errorMessage).toHaveTextContent('Please enter a valid phone number');
        });
      }
    });
  });
});