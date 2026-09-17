/**
 * Gerenciamento de gráficos
 */

import { formatarDataBR } from "../utils/formatters.js";

class GraficoManager {
  constructor() {
    this.grafico = null;
    this.contexto = null;
  }

  init() {
    const canvas = document.getElementById("grafico");
    if (canvas) {
      this.contexto = canvas.getContext("2d");
    }
  }

  /**
   * Gerar gráfico de receitas vs despesas por mês
   */
  gerar(meses) {
    if (!this.contexto) return;

    // Destruir gráfico anterior
    if (this.grafico) {
      this.grafico.destroy();
    }

    const labels = Object.keys(meses);
    const receitas = labels.map((m) => meses[m].receita);
    const despesas = labels.map((m) => meses[m].despesa);

    // Usar requestAnimationFrame para não bloquear
    requestAnimationFrame(() => {
      this.grafico = new Chart(this.contexto, {
        type: "bar",
        data: {
          labels: labels.map((k) => formatarDataBR(k)),
          datasets: [
            {
              label: "Receitas",
              data: receitas,
              backgroundColor: "#4CAF50",
              borderColor: "#45a049",
              borderWidth: 1,
            },
            {
              label: "Despesas",
              data: despesas,
              backgroundColor: "#f44336",
              borderColor: "#da190b",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => "R$ " + value.toFixed(2),
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            title: {
              display: true,
              text: "Receitas vs Despesas",
            },
          },
        },
      });
    });
  }
}

export const graficoManager = new GraficoManager();
