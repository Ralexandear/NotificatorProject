export interface TelegramMessage {
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
}
