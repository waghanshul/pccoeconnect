
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

// Define a type that matches the actual database schema for profiles
interface ProfileRecord {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
  status?: UserStatus;
}

interface UserStore {
  userData: UserData;
  isLoading: boolean;
  error: Error | null;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  updateUserStatus: (status: UserStatus) => Promise<void>;
  syncProfileToDatabase: () => Promise<void>;
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
      
      // Cast to the correct type to handle additional properties
      const typedProfileData = profileData as ProfileRecord;
      
      // Fetch extended profile data based on role
      let extendedData = {};
      if (typedProfileData.role === 'student') {
        const { data: studentData, error: studentError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (studentError) throw studentError;
        extendedData = studentData || {};
      } else if (typedProfileData.role === 'admin') {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (adminError) throw adminError;
        extendedData = adminData || {};
      }
      
      console.log("Profile data fetched:", typedProfileData);
      console.log("Extended data fetched:", extendedData);
      
      // Combine the data
      set({
        userData: {
          id: typedProfileData.id,
          name: typedProfileData.full_name || 'Guest User',
          avatar: typedProfileData.avatar_url || defaultUserData.avatar,
          role: typedProfileData.role,
          department: (extendedData as any).department || '',
          year: (extendedData as any).year || '',
          bio: (extendedData as any).bio || '',
          interests: (extendedData as any).interests || [],
          isPublic: true,
          email: typedProfileData.email,
          phone: '',
          status: typedProfileData.status as UserStatus || 'offline',
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
      
      // Prepare data for profiles table update
      const profileUpdate: Partial<ProfileRecord> = {};
      
      if (data.name) profileUpdate.full_name = data.name;
      if (data.avatar) profileUpdate.avatar_url = data.avatar;
      if (data.email) profileUpdate.email = data.email;
      
      // Update profiles table if needed
      if (Object.keys(profileUpdate).length > 0) {
        console.log("Updating profiles table with:", profileUpdate);
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', userId);
        
        if (profileError) throw profileError;
      }
      
      // Update extended profile data
      if (userData.role === 'student' && (data.bio || data.interests || data.year || data.department)) {
        const studentUpdate: any = {};
        if (data.bio !== undefined) studentUpdate.bio = data.bio;
        if (data.interests !== undefined) studentUpdate.interests = data.interests;
        if (data.year !== undefined) studentUpdate.year = data.year;
        if (data.department !== undefined) studentUpdate.department = data.department;
        
        console.log("Updating student_profiles table with:", studentUpdate);
        const { error: studentError } = await supabase
          .from('student_profiles')
          .update(studentUpdate)
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
        .update({ 
          status: status 
        })
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
  },

  syncProfileToDatabase: async () => {
    try {
      set({ isLoading: true, error: null });
      const { userData } = get();
      
      if (!userData.id) {
        throw new Error("No user ID available");
      }
      
      // Sync all current userData to appropriate tables
      const profileUpdate = {
        full_name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar,
        status: userData.status
      };
      
      console.log("Syncing profile data:", profileUpdate);
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userData.id);
      
      if (profileError) throw profileError;
      
      // Sync student-specific data
      if (userData.role === 'student') {
        const studentUpdate = {
          department: userData.department,
          year: userData.year,
          bio: userData.bio,
          interests: userData.interests
        };
        
        console.log("Syncing student profile data:", studentUpdate);
        const { error: studentError } = await supabase
          .from('student_profiles')
          .update(studentUpdate)
          .eq('id', userData.id);
        
        if (studentError) throw studentError;
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error("Error syncing profile to database:", error);
      set({ error: error as Error, isLoading: false });
    }
  }
}));
