import { create } from 'zustand';

interface UserData {
  name: string;
  avatar: string;
  role: string;
  department: string;
  year: string;
  bio: string;
  interests: string[];
}

interface UserStore {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userData: {
    name: "Arjun Patel",
    avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80",
    role: "Student",
    department: "Computer Engineering",
    year: "Third",
    bio: "Passionate about software development and artificial intelligence. Always eager to learn new technologies and collaborate on innovative projects.",
    interests: ["Web Development", "AI/ML", "Competitive Programming", "Open Source"],
  },
  updateUserData: (data) =>
    set((state) => ({
      userData: { ...state.userData, ...data },
    })),
}));