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
      className="flex items-center bg-white dark:bg-dark-card hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:scale-105 group"
    >
      <div className={`p-7 ${isDanger ? 'bg-red-500' : 'bg-lumi-primary'}`}>
        <Icon className="w-10 h-10 text-white select-none pointer-events-none" />
      </div>
      <div className="p-4 flex flex-col justify-center transition-all duration-200 select-none">
        <p
          className={`text-base font-semibold transition-all duration-200 ${
            isDanger ? 'text-red-400' : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          {title}
        </p>
        <p
          className={`text-4xl font-bold transition-all duration-200 ${
            isDanger ? 'text-red-500' : 'text-gray-800 dark:text-white'
          }`}
        >
          {displayValue}
        </p>
      </div>
    </Link>
  );
}
