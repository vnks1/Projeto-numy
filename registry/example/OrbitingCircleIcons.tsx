import React from "react";

type OrbitingCircleIconsProps = {
  radius: number;
  duration?: number;
  reverse?: boolean;
  speed?: number;
  children: React.ReactNode;
};

export function OrbitingCircleIcons({
  radius,
  duration = 20,
  reverse = false,
  speed = 1,
  children,
}: OrbitingCircleIconsProps) {
  const items = React.Children.toArray(children);
  const actualDuration = duration / Math.max(speed, 0.1);

  return (
    <div
      className={`orbiting-circle-track ${reverse ? "reverse" : ""}`}
      style={{ animationDuration: `${actualDuration}s` }}
    >
      {items.map((child, index) => {
        const angle = (360 / items.length) * index;
        return (
          <div
            key={index}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}px) rotate(${-angle}deg)`,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

