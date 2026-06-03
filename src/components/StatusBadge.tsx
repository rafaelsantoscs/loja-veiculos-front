interface StatusBadgeProps {
    value: string;
    className?: string;
  }
  
  export const StatusBadge: React.FC<StatusBadgeProps> = ({ value, className = '' }) => {
    if (!value) return <span className={`text-slate-500 ${className}`}>-</span>;
  
    const statusConfig = {
      Q: { text: 'Quebrado', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      F: { text: 'Faltando', color: 'text-rose-600', bg: 'bg-rose-100' },
      P: { text: 'Perfeito', color: 'text-green-600', bg: 'bg-green-100' }
    };
  
    const status = statusConfig[value as keyof typeof statusConfig];
  
    return (
      <span className={`${status?.color || 'text-slate-500'} ${status?.bg || ''} px-2 py-0.5 rounded font-medium ${className}`}>
        {status?.text || value}
      </span>
    );
  };