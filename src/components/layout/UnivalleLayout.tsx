import React from 'react';
function cn(...inputs: (string | Record<string, boolean> | undefined | null)[]): string {
  const classes: string[] = [];
  inputs.forEach(input => {
    if (!input) return;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      Object.entries(input).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  });
  return classes.join(' ');
}
import './UnivalleLayout.css';

export interface UnivalleContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  id?: string;
}

const UnivalleContainer: React.FC<UnivalleContainerProps> = ({
  children,
  maxWidth = 'lg',
  padding = 'md',
  className,
  id,
}) => {
  const containerClasses = cn(
    'univalle-container',
    `univalle-container-${maxWidth}`,
    `univalle-container-padding-${padding}`,
    className
  );

  return (
    <div className={containerClasses} id={id}>
      {children}
    </div>
  );
};

export interface UnivalleSectionProps {
  children: React.ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'white' | 'light' | 'primary' | 'secondary' | 'transparent';
  className?: string;
  id?: string;
}

const UnivalleSection: React.FC<UnivalleSectionProps> = ({
  children,
  spacing = 'md',
  background = 'transparent',
  className,
  id,
}) => {
  const sectionClasses = cn(
    'univalle-section',
    `univalle-section-spacing-${spacing}`,
    `univalle-section-bg-${background}`,
    className
  );

  return (
    <section className={sectionClasses} id={id}>
      {children}
    </section>
  );
};

export interface UnivalleGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  className?: string;
}

const UnivalleGrid: React.FC<UnivalleGridProps> = ({
  children,
  columns = 1,
  gap = 'md',
  responsive = true,
  className,
}) => {
  const gridClasses = cn(
    'univalle-grid',
    `univalle-grid-cols-${columns}`,
    `univalle-grid-gap-${gap}`,
    {
      'univalle-grid-responsive': responsive,
    },
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export interface UnivalleFlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  className?: string;
}

const UnivalleFlex: React.FC<UnivalleFlexProps> = ({
  children,
  direction = 'row',
  justify = 'start',
  align = 'stretch',
  gap = 'none',
  wrap = false,
  className,
}) => {
  const flexClasses = cn(
    'univalle-flex',
    `univalle-flex-${direction}`,
    `univalle-flex-justify-${justify}`,
    `univalle-flex-align-${align}`,
    `univalle-flex-gap-${gap}`,
    {
      'univalle-flex-wrap': wrap,
    },
    className
  );

  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
};

export interface UnivalleCardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const UnivalleCard: React.FC<UnivalleCardProps> = ({
  children,
  padding = 'md',
  shadow = 'sm',
  rounded = 'md',
  border = true,
  hover = false,
  className,
  onClick,
}) => {
  const cardClasses = cn(
    'univalle-card',
    `univalle-card-padding-${padding}`,
    `univalle-card-shadow-${shadow}`,
    `univalle-card-rounded-${rounded}`,
    {
      'univalle-card-border': border,
      'univalle-card-hover': hover,
      'univalle-card-clickable': !!onClick,
    },
    className
  );

  const handleClick = () => {
    if (onClick && !hover) {
      onClick();
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
};

export { UnivalleContainer, UnivalleSection, UnivalleGrid, UnivalleFlex, UnivalleCard };
export default UnivalleContainer;