export function console.log(...text: any[]) {
  // Используем new Error().stack для получения стека вызовов
  const stack = new Error().stack;

  // Извлекаем информацию о вызывающей функции из стека
  if (stack) {
    const stackLines = stack.split('\n');
    if (stackLines.length >= 3) {
      // Третья строка стека содержит информацию о вызывающей функции
      const callerInfo = stackLines[2].trim();
      console.log(`${callerInfo}:`, ...text);
    } else {
      console.log('Unknown caller:', ...text);
    }
  } else {
    console.log(...text);
  }
}