import React from 'react';

interface SceneHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}

export const SceneHeader: React.FC<SceneHeaderProps> = ({ title, subtitle, className }) => {
  return (
    <div className={`flex flex-col gap-2 mb-8 ${className}`}>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-300">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};
