export function addTimeToTimeString(time: string, hoursToAdd: number, minutesToAdd: number) {
  const [hours, minutes] = time.split(':').map(Number); // Разбиваем строку на часы и минуты
  const date = new Date(); // Создаём объект даты
  date.setHours(hours, minutes); // Устанавливаем часы и минуты
  date.setMinutes(date.getMinutes() + hoursToAdd * 60 + minutesToAdd); // Добавляем время
  return date.toTimeString().slice(0, 5); // Возвращаем строку в формате HH:mm
}