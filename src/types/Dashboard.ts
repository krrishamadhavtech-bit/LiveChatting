import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./navigation";

export type FirestoreUser = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen: any;
    createdAt: any;
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount: number; // Add unread count
    isTyping?: boolean; // Optional: typing indicator
};

export type DashboardNavigationProp = StackNavigationProp<
    RootStackParamList,
    'DashboardScreen'
>;
