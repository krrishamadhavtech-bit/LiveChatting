export type RootStackParamList = {
  DashboardScreen: undefined;
  ChattingScreen: {
    userId: string;
    userName: string;
    userAvatar :string
  };
  Login: undefined;
  Signup: undefined;
};
export type NavigationProp = {
  navigate: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T]
  ) => void;
};