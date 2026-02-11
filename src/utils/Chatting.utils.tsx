export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const isMessageTooLong = (text: string, maxLength: number = 500): boolean => {
  return text.length > maxLength;
};

export const isNearMessageLimit = (text: string, threshold: number = 450): boolean => {
  return text.length > threshold;
};

export const trimMessage = (text: string): string => {
  return text.trim();
};

export const isEmptyMessage = (text: string): boolean => {
  return trimMessage(text).length === 0;
};

export const getRandomReply = (replies: string[]): string => {
  return replies[Math.floor(Math.random() * replies.length)];
};

export const sanitizeMessage = (text: string): string => {
  return text.replace(/[<>]/g, '');
};
