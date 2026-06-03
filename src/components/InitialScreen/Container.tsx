import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function Container(props: Readonly<ContainerProps>) {
  return (
     <div className={props.fullWidth ? "w-full" : `container p-1 mx-auto xl:px-0`}>
      {props.children}
    </div>
  );
}

