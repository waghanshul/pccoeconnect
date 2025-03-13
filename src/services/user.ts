
import { create } from 'zustand';
import { supabase } from "@/integrations/supabase/client";

export type UserStatus = 'online' | 'offline' | 'busy';

interface UserData {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  year: string;
  bio: string;
  interests: string[];
  isPublic: boolean;
  email: string;
  phone: string;
  status: UserStatus;
}

interface UserStore {
  userData: UserData;
  isLoading: boolean;
  error: Error | null;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  updateUserStatus: (status: UserStatus) => Promise<void>;
}

const defaultUserData: UserData = {
  id: "",
  name: "Guest User",
  avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80",
  role: "student",
  department: "",
  year: "",
  bio: "",
  interests: [],
  isPublic: true,
  email: "",
  phone: "",
  status: "offline",
};

export const useUserStore = create<UserStore>((set, get) => ({
  userData: defaultUserData,
  isLoading: false,
  error: null,

  fetchUserProfile: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Fetch extended profile data based on role
      let extendedData = {};
      if (profileData.role === 'student') {
        const { data: studentData, error: studentError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (studentError) throw studentError;
        extendedData = studentData || {};
      } else if (profileData.role === 'admin') {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (adminError) throw adminError;
        extendedData = adminData || {};
      }
      
      // Combine the data
      set({
        userData: {
          id: profileData.id,
          name: profileData.full_name,
          avatar: profileData.avatar_url || defaultUserData.avatar,
          role: profileData.role,
          department: (extendedData as any).department || '',
          year: (extendedData as any).year || '',
          bio: (extendedData as any).bio || '',
          interests: (extendedData as any).interests || [],
          isPublic: true,
          email: profileData.email,
          phone: '',
          status: profileData.status as UserStatus || 'offline',
        },
        isLoading: false
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      set({ error: error as Error, isLoading: false });
    }
  },

  updateUserData: async (data: Partial<UserData>) => {
    try {
      set({ isLoading: true, error: null });
      const { userData } = get();
      const userId = userData.id;
      
      // Update profiles table
      if (data.name || data.avatar || data.email) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: data.name,
            avatar_url: data.avatar,
            email: data.email,
          })
          .eq('id', userId);
        
        if (profileError) throw profileError;
      }
      
      // Update extended profile data
      if (userData.role === 'student' && (data.bio || data.interests || data.year)) {
        const { error: studentError } = await supabase
          .from('student_profiles')
          .update({
            bio: data.bio,
            interests: data.interests,
            year: data.year,
          })
          .eq('id', userId);
        
        if (studentError) throw studentError;
      }
      
      // Update local state
      set({ 
        userData: { ...userData, ...data },
        isLoading: false 
      });
    } catch (error) {
      console.error("Error updating user data:", error);
      set({ error: error as Error, isLoading: false });
    }
  },

  updateUserStatus: async (status: UserStatus) => {
    try {
      set({ isLoading: true, error: null });
      const { userData } = get();
      
      // Update profile status in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ status }) // Now 'status' is a valid column in profiles
        .eq('id', userData.id);
      
      if (error) throw error;
      
      // Update local state
      set({ 
        userData: { ...userData, status },
        isLoading: false 
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      set({ error: error as Error, isLoading: false });
    }
  }
}));
