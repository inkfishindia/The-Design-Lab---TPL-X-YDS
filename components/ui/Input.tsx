import React, { useRef, useEffect } from 'react';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

const baseClasses = 'block w-full rounded-none bg-transparent px-2 py-2.5 text-midnight-navy border-0 border-b-2 border-midnight-navy/30 focus:outline-none focus:ring-0 focus:border-heritage-blue transition-colors placeholder-midnight-navy/60';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, ...props }, ref) => (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-semibold text-midnight-navy/80 mb-1">{label}</label>}
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
      <div>
        {label && <label htmlFor={id} className="block text-sm font-semibold text-midnight-navy/80 mb-1">{label}</label>}
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
          className={cn(baseClasses, 'resize-none overflow-y-hidden', className)}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';