// Arquivo SelectInput.tsx
import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options = [],
  className = '',
  ...selectProps
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={selectProps.name} className="block mb-1 text-sm font-medium dark:text-slate-200">
        {label}
      </label>
      <select
        {...selectProps}
        className={`w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;