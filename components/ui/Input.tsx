
import React, { useRef, useEffect } from 'react';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

const baseClasses = 'block w-full rounded-lg bg-dark-bg px-4 py-2.5 text-text-light border border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-colors placeholder-text-muted/50 text-sm';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-semibold text-text-muted mb-1.5">{label}</label>}
      <input ref={ref} id={id} className={cn(baseClasses, className)} {...props} />
    </div>
  )
);
Input.displayName = 'Input';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, id, className, onChange, rows = 3, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const autoResize = (target: HTMLTextAreaElement | null) => {
      if (target) {
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
      }
    };
    
    useEffect(() => {
        autoResize(internalRef.current);
    }, [props.value]);


    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      autoResize(e.target);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="w-full">
        {label && <label htmlFor={id} className="block text-sm font-semibold text-text-muted mb-1.5">{label}</label>}
        <textarea
          ref={(node) => {
            if (node) {
              internalRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }
          }}
          id={id}
          rows={rows}
          className={cn(baseClasses, 'resize-none overflow-y-hidden leading-relaxed', className)}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
