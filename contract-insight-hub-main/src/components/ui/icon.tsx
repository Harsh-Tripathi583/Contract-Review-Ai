import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

interface Props extends ComponentPropsWithoutRef<"span"> {
  name: string;
  filled?: boolean;
  size?: number;
}

// Material Symbols icon component. Matches the Stitch design's icon set.
export function Icon({ name, filled, size = 20, className, style, ...rest }: Props) {
  return (
    <span
      {...rest}
      className={cn("material-symbols-outlined leading-none", filled && "fill", className)}
      style={{ fontSize: size, ...style }}
      aria-hidden
    >
      {name}
    </span>
  );
}
