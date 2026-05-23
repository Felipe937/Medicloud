import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import FormInput from './FormInput';

describe('FormInput Component', () => {
  let mockOnChange;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  describe('Renderizado', () => {
    it('debe renderizar el componente correctamente', () => {
      render(
        <FormInput
          label="Email"
          id="email"
          type="email"
        />
      );

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('debe renderizar el label con el texto correcto', () => {
      render(
        <FormInput
          label="Nombre Completo"
          id="fullname"
          type="text"
        />
      );

      expect(screen.getByText('Nombre Completo')).toBeInTheDocument();
    });

    it('debe renderizar input de tipo text por defecto', () => {
      render(
        <FormInput
          label="Nombre"
          id="name"
        />
      );

      const input = screen.getByLabelText('Nombre');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('debe renderizar input de tipo email', () => {
      render(
        <FormInput
          label="Email"
          id="email"
          type="email"
        />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('debe renderizar input de tipo password', () => {
      render(
        <FormInput
          label="Contraseña"
          id="password"
          type="password"
        />
      );

      const input = screen.getByLabelText('Contraseña');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('debe renderizar textarea cuando type es textarea', () => {
      render(
        <FormInput
          label="Descripción"
          id="description"
          type="textarea"
        />
      );

      const textarea = screen.getByLabelText('Descripción');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('debe renderizar asterisco de campo requerido', () => {
      render(
        <FormInput
          label="Correo"
          id="email"
          type="email"
          required
        />
      );

      const label = screen.getByText('Correo');
      expect(label.textContent).toContain('*');
    });

    it('no debe mostrar asterisco si field es opcional', () => {
      render(
        <FormInput
          label="Correo"
          id="email"
          type="email"
          required={false}
        />
      );

      const label = screen.getByText('Correo');
      expect(label.textContent).not.toContain('*');
    });
  });

  describe('Inputs', () => {
    it('debe permitir escribir en el input', async () => {
      const user = userEvent.setup();
      render(
        <FormInput
          label="Nombre"
          id="name"
          type="text"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Nombre');
      await user.type(input, 'Juan Pérez');

      expect(input.value).toBe('Juan Pérez');
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('debe permitir escribir en textarea', async () => {
      const user = userEvent.setup();
      render(
        <FormInput
          label="Descripción"
          id="description"
          type="textarea"
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByLabelText('Descripción');
      await user.type(textarea, 'Esta es una descripción');

      expect(textarea.value).toBe('Esta es una descripción');
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('debe actualizar el valor cuando cambia prop value', () => {
      const { rerender } = render(
        <FormInput
          label="Email"
          id="email"
          type="email"
          value=""
        />
      );

      let input = screen.getByLabelText('Email');
      expect(input.value).toBe('');

      rerender(
        <FormInput
          label="Email"
          id="email"
          type="email"
          value="test@example.com"
        />
      );

      input = screen.getByLabelText('Email');
      expect(input.value).toBe('test@example.com');
    });

    it('debe llamar a onChange cuando el valor cambia', async () => {
      const user = userEvent.setup();
      render(
        <FormInput
          label="Teléfono"
          id="phone"
          type="tel"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Teléfono');
      await user.type(input, '1234567890');

      expect(mockOnChange).toHaveBeenCalledTimes(10);
    });

    it('debe aceptar placeholder personalizado', () => {
      render(
        <FormInput
          label="Email"
          id="email"
          type="email"
          placeholder="usuario@medicloud.com"
        />
      );

      const input = screen.getByPlaceholderText('usuario@medicloud.com');
      expect(input).toBeInTheDocument();
    });

    it('debe manejar múltiples tipos de input', async () => {
      const types = ['text', 'email', 'password', 'number', 'tel', 'date'];

      for (const type of types) {
        const { unmount } = render(
          <FormInput
            label={type}
            id={type}
            type={type}
          />
        );

        const input = screen.getByLabelText(type);
        expect(input).toHaveAttribute('type', type);

        unmount();
      }
    });
  });

  describe('Validación y errores', () => {
    it('debe mostrar mensaje de error cuando se proporciona', () => {
      const errorMessage = 'Este campo es requerido';
      render(
        <FormInput
          label="Email"
          id="email"
          type="email"
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('debe mostrar diferentes mensajes de error', () => {
      const { rerender } = render(
        <FormInput
          label="Email"
          id="email"
          type="email"
          error="Email es requerido"
        />
      );

      expect(screen.getByText('Email es requerido')).toBeInTheDocument();

      rerender(
        <FormInput
          label="Email"
          id="email"
          type="email"
          error="Email no válido"
        />
      );

      expect(screen.queryByText('Email es requerido')).not.toBeInTheDocument();
      expect(screen.getByText('Email no válido')).toBeInTheDocument();
    });

    it('no debe mostrar mensaje de error cuando error no se proporciona', () => {
      render(
        <FormInput
          label="Email"
          id="email"
          type="email"
        />
      );

      expect(screen.queryByText(/error|es requerido|no válido/i)).not.toBeInTheDocument();
    });

    it('debe mostrar error con clase form-error', () => {
      const { container } = render(
        <FormInput
          label="Email"
          id="email"
          type="email"
          error="Email no válido"
        />
      );

      const errorElement = container.querySelector('.form-error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.textContent).toBe('Email no válido');
    });
  });

  describe('Atributos HTML', () => {
    it('debe tener el id correcto', () => {
      render(
        <FormInput
          label="Nombre"
          id="fullname"
          type="text"
        />
      );

      const input = screen.getByLabelText('Nombre');
      expect(input).toHaveAttribute('id', 'fullname');
    });

    it('debe tener clase form-control', () => {
      render(
        <FormInput
          label="Email"
          id="email"
          type="email"
        />
      );

      const input = screen.getByLabelText('Email');
      expect(input.classList.contains('form-control')).toBe(true);
    });

    it('debe tener clase form-group en el contenedor', () => {
      const { container } = render(
        <FormInput
          label="Email"
          id="email"
          type="email"
        />
      );

      expect(container.querySelector('.form-group')).toBeInTheDocument();
    });

    it('debe tener clase form-label en el label', () => {
      const { container } = render(
        <FormInput
          label="Email"
          id="email"
          type="email"
        />
      );

      expect(container.querySelector('.form-label')).toBeInTheDocument();
    });

    it('debe tener atributo required cuando se proporciona', () => {
      render(
        <FormInput
          label="Email"
          id="email"
          type="email"
          required
        />
      );

      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('required');
    });

    it('debe tener atributo disabled cuando se proporciona', () => {
      render(
        <FormInput
          label="Email"
          id="email"
          type="email"
          disabled
        />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('disabled');
    });

    it('debe ser accesible con etiqueta asociada', () => {
      render(
        <FormInput
          label="Nombre Completo"
          id="fullname"
          type="text"
        />
      );

      const input = screen.getByLabelText('Nombre Completo');
      const label = screen.getByText('Nombre Completo');

      expect(input).toHaveAttribute('id', 'fullname');
      expect(label).toHaveAttribute('for', 'fullname');
    });
  });

  describe('Textarea', () => {
    it('debe tener minHeight en textarea', () => {
      const { container } = render(
        <FormInput
          label="Notas"
          id="notes"
          type="textarea"
        />
      );

      const textarea = container.querySelector('textarea');
      expect(textarea.style.minHeight).toBe('100px');
    });

    it('debe permitir resize vertical en textarea', () => {
      const { container } = render(
        <FormInput
          label="Notas"
          id="notes"
          type="textarea"
        />
      );

      const textarea = container.querySelector('textarea');
      expect(textarea.style.resize).toBe('vertical');
    });

    it('debe renderizar textarea con placeholder', () => {
      render(
        <FormInput
          label="Descripción"
          id="description"
          type="textarea"
          placeholder="Ingrese descripción"
        />
      );

      const textarea = screen.getByPlaceholderText('Ingrese descripción');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Props adicionales', () => {
    it('debe aceptar props HTML estándar', () => {
      render(
        <FormInput
          label="Email"
          id="email"
          type="email"
          placeholder="Correo electrónico"
          maxLength={100}
          autoComplete="email"
        />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('placeholder', 'Correo electrónico');
      expect(input).toHaveAttribute('maxLength', '100');
      expect(input).toHaveAttribute('autoComplete', 'email');
    });

    it('debe propagar eventos de input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <FormInput
          label="Búsqueda"
          id="search"
          type="text"
          onChange={handleChange}
        />
      );

      const input = screen.getByLabelText('Búsqueda');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
    });
  });
});
