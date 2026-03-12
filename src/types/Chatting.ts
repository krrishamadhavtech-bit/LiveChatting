export type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  isMe: boolean;
  read: boolean;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
    senderId: string;
  };
  forwarded?: boolean;
  forwardedFrom?: string | null;
  type?: 'text' | 'call' | 'audio';
  audioUrl?: string;
  audioDuration?: number;
};

export type RouteParams = {
  userId?: string;
};