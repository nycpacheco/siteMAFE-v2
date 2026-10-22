import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button/Button";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Página não encontrada</h2>
        <p className={styles.text}>
          A página que você procura não existe ou foi movida.
        </p>
        <div className={styles.action}>
          <Button asChild variant="default" size="lg">
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
