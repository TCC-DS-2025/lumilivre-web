import { Link } from 'react-router-dom';
import type { FunctionComponent, SVGProps } from 'react';

interface StatCardProps {
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  title: string;
  value: number | string;
  variant?: 'default' | 'danger';
  to: string;
  isLoading?: boolean;
  hasError?: boolean;
}

export function StatCard({
  Icon,
  title,
  value,
  variant = 'default',
  to,
  isLoading = false,
  hasError = false,
}: StatCardProps) {
  const isDanger = variant === 'danger';

  let displayValue: string | number = value;
  if (isLoading) displayValue = '...';
  if (hasError) displayValue = '-';

  return (
    <Link
      to={to}
      className="group flex items-stretch bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 hover:shadow-lg"
    >
      <div
        className={`w-24 flex items-center justify-center shrink-0 
          ${isDanger ? 'bg-red-500' : 'bg-lumi-primary'}`}
      >
        <Icon className="w-10 h-10 text-white fill-current" />
      </div>

      <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
        <p
          className={`font-bold uppercase tracking-wide truncate 
            ${isDanger ? 'text-red-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          {title}
        </p>
        <p
          className={`text-3xl font-bold truncate mt-1
            ${isDanger ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}
          title={String(displayValue)}
        >
          {displayValue}
        </p>
      </div>
    </Link>
  );
}
