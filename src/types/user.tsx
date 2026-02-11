// types/index.ts
export type User = {
  id: string;
  name: string;
  avatar: string;
  lastSeen: Date;
  isOnline: boolean;
  lastMessage?: string;
  unreadCount?: number;
  timestamp?: Date;
};

export type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isMe: boolean;
  read: boolean;
};

export type ChatRoom = {
  id: string;
  participants: string[];
  lastMessage: Message | null;
  createdAt: Date;
};