

export interface GroupedMessages {
  [key: string]: Message[];
}

export interface ChattingViewModelState {
  messages: Message[];
  messageText: string;
  sending: boolean;
}

export interface ChattingUser {
  username: string;
  userId: string;
}


export type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  isMe: boolean;
  read: boolean;
};

export type RouteParams = {
  userId?: string;
  userName?: string;
  userAvatar?: string;
};