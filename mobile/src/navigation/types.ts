export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Profile: undefined;
  InterestConfirmation: { userId: string; loanType?: 'nano' | 'term' };
};
