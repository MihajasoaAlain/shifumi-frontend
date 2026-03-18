export type CreateUsernameForm = {
  username: string;
};

export type CreateUsernameFormActions = {
  setUsername: (username: string) => void;
};

export type CreateUsernameStore = CreateUsernameForm & CreateUsernameFormActions;
