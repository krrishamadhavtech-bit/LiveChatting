export type RootStackParamList = {
  DashboardScreen: undefined;
  ChattingScreen: {
    userId: string;
  };
  Login: undefined;
  Signup: undefined;
  CallScreen: {
    callId: string;
    isCaller: boolean;
    userName?: string;
    userAvatar?: string | null;
  };
};