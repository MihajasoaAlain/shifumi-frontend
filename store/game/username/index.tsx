import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CreateUsernameStore } from "./type";

const useCreateUsernameStore = create<CreateUsernameStore>()(
  persist(
    (set) => ({
      username: "",
      setUsername: (username: string) => set({ username }),
    }),
    { name: "shifumi-username" },
  ),
);

export default useCreateUsernameStore;
