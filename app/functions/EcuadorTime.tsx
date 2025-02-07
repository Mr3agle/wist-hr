// Crear una fecha actual en GMT-5
const date = new Date();

date.setUTCHours(date.getUTCHours() - 5);
// Opción 2: Ajustar manualmente a GMT-5
let ecuadorTime = date.toISOString()
console.log("Fecha y hora ajustada a GMT-5:", ecuadorTime);