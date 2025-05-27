import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  readonly className?: string;
  readonly children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={clsx(
      'bg-white rounded-xl shadow-lg border border-gray-100/50 backdrop-blur-sm',
      className
    )}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  readonly className?: string;
  readonly children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => {
  return (
    <div className={clsx('px-6 py-4 border-b border-gray-100', className)}>
      {children}
    </div>
  );
};

interface CardContentProps {
  readonly className?: string;
  readonly children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ className, children }) => {
  return (
    <div className={clsx('px-6 py-4', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  readonly className?: string;
  readonly children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className, children }) => {
  return (
    <div className={clsx('px-6 py-4 border-t border-gray-100', className)}>
      {children}
    </div>
  );
};