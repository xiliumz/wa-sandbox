import { useId } from 'react';
import { cn } from '@/utils/cn';

export const INPUT_CLASS =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg '
  + 'focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent bg-white';

export const LABEL_CLASS = 'block text-xs font-medium text-gray-600 mb-1';

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password';
  placeholder?: string;
  description?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  description,
  multiline = false,
  rows = 3,
  className,
}: FieldProps) {
  const id = useId();
  const descriptionId = `${id}-description`;

  return (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          aria-describedby={description ? descriptionId : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={cn(INPUT_CLASS, 'resize-none', className)}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={id}
          aria-describedby={description ? descriptionId : undefined}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(INPUT_CLASS, className)}
          placeholder={placeholder}
        />
      )}
      {description && (
        <p id={descriptionId} className="text-[11px] text-gray-400 mt-1">{description}</p>
      )}
    </div>
  );
}
