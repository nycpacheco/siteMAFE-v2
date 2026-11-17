import React, { createContext, useContext, useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import styles from "./Dialog.module.css";

const DialogContext = createContext();

export function Dialog({ children, open: controlledOpen, onOpenChange, defaultOpen = false }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (newOpen) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, asChild = false, onClick, className = "", ...props }) {
  const { setOpen } = useContext(DialogContext);
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      type={asChild ? undefined : "button"}
      onClick={(e) => {
        setOpen(true);
        onClick?.(e);
      }}
      className={className}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function DialogContent({ children, className = "", size = "default", ...props }) {
  const { open, setOpen } = useContext(DialogContext);
  if (!open) return null;

  const sizeClass = size === "large" ? styles.contentLarge : "";
  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div
        className={`${styles.content} ${sizeClass} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className = "", ...props }) {
  return (
    <div className={`${styles.header} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function DialogFooter({ children, className = "", ...props }) {
  return (
    <div className={`${styles.footer} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = "", ...props }) {
  return (
    <h2 className={`${styles.title} ${className}`.trim()} {...props}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className = "", ...props }) {
  return (
    <p className={`${styles.description} ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export function DialogClose({ children, onClick, className = "", ...props }) {
  const { setOpen } = useContext(DialogContext);
  return (
    <button
      type="button"
      className={`${styles.closeButton} ${className}`.trim()}
      onClick={(e) => {
        setOpen(false);
        onClick?.(e);
      }}
      {...props}
    >
      {children || "✕"}
    </button>
  );
}

Dialog.Trigger = DialogTrigger;
Dialog.Content = DialogContent;
Dialog.Header = DialogHeader;
Dialog.Footer = DialogFooter;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Close = DialogClose;

export default Dialog;