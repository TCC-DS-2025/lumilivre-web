import { Link } from 'react-router-dom';

interface StatCardProps {
  iconUrl: string;
  title: string;
  value: number | string;
  variant?: 'default' | 'danger';
  to: string;
}

export function StatCard({
  iconUrl,
  title,
  value,
  variant = 'default',
  to,
}: StatCardProps) {
  const isDanger = variant === 'danger';
  return (
    <Link
      to={to}
      className="flex items-center bg-white dark:bg-dark-card hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:scale-105"
    >
      <div className={`p-7 ${isDanger ? 'bg-red-500' : 'bg-lumi-primary'}`}>
        <img
          src={iconUrl}
          alt={title}
          className="w-10 h-10 select-none pointer-events-none"
        />
      </div>
      <div className="p-4 flex flex-col justify-center select-none">
        <p
          className={`text-base font-semibold ${isDanger ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
        >
          {title}
        </p>
        <p
          className={`text-4xl font-bold ${isDanger ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}
        >
          {value}
        </p>
      </div>
    </Link>
  );
}
