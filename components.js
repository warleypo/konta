function setDatePicker(data) {
  console.log("Data", data);
}

const options = {
  autoClose: true,
  format: "dd/mm/yyyy",
  showClearBtn: true,
  onSelect: (d) => setDatePicker(d.toISOString().substring(0, 10)),
  i18n: {
    cancel: "Cancelar",
    clear: "Limpar",
    done: "Ok",
    months: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    monthsShort: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    weekdays: [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ],
    weekdaysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    weekdaysAbbrev: ["D", "S", "T", "Q", "Q", "S", "S"],
  },
};

document.addEventListener("DOMContentLoaded", function () {
  const elemsSelect = document.querySelectorAll("select");
  const instancesSelect = M.FormSelect.init(elemsSelect, {});

  const elemsPicker = document.querySelectorAll(".datepicker");
  const instancesPicker = M.Datepicker.init(elemsPicker, options);

  M.updateTextFields();
});
