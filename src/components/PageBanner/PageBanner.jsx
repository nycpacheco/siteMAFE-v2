import React from "react";
import { Volleyball } from "lucide-react";
import styles from "./PageBanner.module.css";

export function PageBanner({ eyebrow, title, text }) {
  return (
    <section className={styles.banner}>
      <Volleyball aria-hidden="true" className={styles.bgIcon} />
      <div className={styles.container}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
      </div>
    </section>
  );
}

export default PageBanner;
