interface StatCardProps {
    iconUrl: string;
    title: string;
    value: number | string;
    variant?: 'default' | 'danger';
}

export function StatCard({ iconUrl, title, value, variant = 'default' }: StatCardProps) {
    const isDanger = variant === 'danger';

    return (
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className={`p-10 ${isDanger ? 'bg-red-500' : 'bg-lumi-primary'}`}>
                <img src={iconUrl} alt={title} className="w-10 h-10" />
            </div>
            <div className="p-7 flex flex-col justify-center">
                <p className={`text-base font-semibold ${isDanger ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>{title}</p>
                <p className={`text-4xl font-bold ${isDanger ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}>{value}</p>
            </div>
        </div>
    );
}