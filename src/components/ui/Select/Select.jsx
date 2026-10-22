import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import styles from "./Select.module.css";

const SelectContext = createContext();

export function Select({ children, value, onValueChange, defaultValue }) {
  const [selectedValue, setSelectedValue] = useState(value || defaultValue);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) setSelectedValue(value);
  }, [value]);

  const handleSelect = (val) => {
    setSelectedValue(val);
    onValueChange?.(val);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ selectedValue, handleSelect, open, setOpen }}>
      {/* Garante position: relative rigoroso para conter o dropdown */}
      <div style={{ position: "relative", width: "100%" }} ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = "", ...props }) {
  const { open, setOpen } = useContext(SelectContext);
  return (
    <button
      type="button"
      className={`${styles.trigger} ${className}`.trim()}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      {...props}
    >
      {children}
      <svg
        className={styles.icon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

export function SelectValue({ placeholder = "Selecione..." }) {
  const { selectedValue } = useContext(SelectContext);
  return <span>{selectedValue || placeholder}</span>;
}

export function SelectContent({ children, className = "", ...props }) {
  const { open } = useContext(SelectContext);
  if (!open) return null;
  return (
    <div className={`${styles.content} ${className}`.trim()} {...props}>
      <div className={styles.viewport}>{children}</div>
    </div>
  );
}

export function SelectItem({ value, children, className = "", ...props }) {
  const { selectedValue, handleSelect } = useContext(SelectContext);
  const isChecked = selectedValue === value;

  return (
    <div
      role="option"
      aria-selected={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      className={`${styles.item} ${className}`.trim()}
      onClick={() => handleSelect(value)}
      {...props}
    >
      {children}
      {isChecked && (
        <span className={styles.itemIndicator}>
          ✓
        </span>
      )}
    </div>
  );
}

export function SelectSeparator({ className = "", ...props }) {
  return <div className={`${styles.separator} ${className}`.trim()} {...props} />;
}

export function SelectGroup({ children }) {
  return <div>{children}</div>;
}

Select.Trigger = SelectTrigger;
Select.Value = SelectValue;
Select.Content = SelectContent;
Select.Item = SelectItem;
Select.Separator = SelectSeparator;
Select.Group = SelectGroup;

export default Select;