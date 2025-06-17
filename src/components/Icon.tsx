import React from 'react';

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  iconUrl: string;
}

export function Icon({ iconUrl, className, ...props }: IconProps) {
  return (
    <span
      {...props}
      className={`inline-block w-6 h-6 shrink-0 bg-current ${className}`}
      style={{
        maskImage: `url(${iconUrl})`,
        WebkitMaskImage: `url(${iconUrl})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
    />
  );
}