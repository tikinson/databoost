import fs from 'fs';
import path from 'path';

class Logger {
  constructor(logFilePath = './output/test.log') {
    this.logFilePath = logFilePath;

    // Створення папки логів, якщо вона не існує
    const logDir = path.dirname(logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  // Метод для запису логів
  log(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;

    // Виводимо лог у консоль
    console.log(logMessage);

    // Записуємо лог у файл
    fs.appendFileSync(this.logFilePath, logMessage + '\n', 'utf8');
  }

  // Визначаємо методи для кожного рівня логування
  info(message) {
    this.log('info', message);
  }

  warn(message) {
    this.log('warn', message);
  }

  error(message) {
    this.log('error', message);
  }

  debug(message) {
    this.log('debug', message);
  }
}

export default Logger;
