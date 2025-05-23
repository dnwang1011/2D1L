/**
 * Simple console-based logger for testing purposes
 */

const logger = {
  debug: (data: any, message?: string) => console.debug(message || '', data),
  info: (data: any, message?: string) => console.info(message || '', data),
  warn: (data: any, message?: string) => console.warn(message || '', data),
  error: (data: any, message?: string) => console.error(message || '', data),
};

export default logger; 