import React from "react";
import { Slot } from "@radix-ui/react-slot";
import styles from "./Button.module.css";

export function Button({
  children,
  variant = "default",
  size = "default",
  className = "",
  asChild = false,
  ...props
}) {
  const variantKey = variant.charAt(0).toUpperCase() + variant.slice(1);
  const sizeKey = size.charAt(0).toUpperCase() + size.slice(1);

  const variantClass = styles[`variant${variantKey}`] || styles.variantDefault;
  const sizeClass = styles[`size${sizeKey}`] || styles.sizeDefault;

  // Usa o Slot se asChild for true, ou a tag <button> padrão se for false
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={`${styles.button} ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Comp>
  );
}

// Garante compatibilidade caso outro arquivo importe sem chaves
export default Button;