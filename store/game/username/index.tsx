import { create } from "zustand";
import { CreateUsernameStore } from "./type";

const useCreateUsernameStore = create<CreateUsernameStore>((set) => ({
  username: "",
  setUsername: (username: string) => set({ username }),
}));

export default useCreateUsernameStore;
