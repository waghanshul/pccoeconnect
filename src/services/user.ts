
import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export type UserStatus = 'online' | 'busy' | 'away' | 'offline';

interface StudentProfile {
  id: string;
  prn: string;
  branch: string;
  year: string;
  recovery_email: string;
  department: string;
  bio: string;
  interests: string[];
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  status?: UserStatus;
}

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
  user: UserProfile | null;
  studentProfile: StudentProfile | null;
  userData: UserData | null;
  isLoading: boolean;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  updateStudentProfile: (userId: string, data: Partial<StudentProfile>) => Promise<void>;
  updateUserInterests: (userId: string, interests: string[]) => Promise<void>;
  updateUserPhone: (userId: string, phone: string) => Promise<void>;
  updateUserStatus: (status: UserStatus) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  studentProfile: null,
  userData: null,
  isLoading: false,
  
  fetchUserProfile: async (userId: string) => {
    try {
      set({ isLoading: true });
      
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      // Fetch student profile data if user exists
      const { data: studentData, error: studentError } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
        
      if (studentError) {
        console.error("Error fetching student profile:", studentError);
      }
      
      // Log the fetched data
      console.log("Extended data fetched:", studentData);
      
      // Ensure interests is always an array of strings
      const interests = studentData?.interests
        ? Array.isArray(studentData.interests)
          ? studentData.interests.map(item => String(item)) // Convert all items to strings
          : []
        : [];
      
      // Set the state with user and student profiles
      set({ 
        user: userData as UserProfile,
        studentProfile: studentData ? {
          ...studentData,
          interests: interests
        } as StudentProfile : null,
        userData: {
          id: userData.id,
          name: userData.full_name || 'Guest User',
          avatar: userData.avatar_url || '',
          role: userData.role,
          department: studentData?.department || '',
          year: studentData?.year || '',
          bio: studentData?.bio || '',
          interests: interests,
          isPublic: true,
          email: userData.email || '',
          phone: userData.phone || '',
          status: (userData.status as UserStatus) || 'offline',
        }
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateUserProfile: async (userId: string, data: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", userId);

      if (error) throw error;
      
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
        userData: state.userData ? { 
          ...state.userData,
          name: data.full_name || state.userData.name,
          email: data.email || state.userData.email,
          role: data.role || state.userData.role,
          avatar: data.avatar || state.userData.avatar,
          phone: data.phone || state.userData.phone,
          status: data.status || state.userData.status,
        } : null
      }));
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  },
  
  updateStudentProfile: async (userId: string, data: Partial<StudentProfile>) => {
    try {
      const { error } = await supabase
        .from("student_profiles")
        .update(data)
        .eq("id", userId);

      if (error) throw error;
      
      set((state) => ({
        studentProfile: state.studentProfile ? { ...state.studentProfile, ...data } : null,
        userData: state.userData ? { 
          ...state.userData,
          department: data.department || state.userData.department,
          year: data.year || state.userData.year,
          bio: data.bio || state.userData.bio,
          interests: data.interests || state.userData.interests,
        } : null
      }));
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating student profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  },
  
  updateUserInterests: async (userId: string, interests: string[]) => {
    try {
      // Update student_profiles table
      const { error } = await supabase
        .from("student_profiles")
        .update({ interests })
        .eq("id", userId);

      if (error) throw error;
      
      // Update local state
      set((state) => ({
        studentProfile: state.studentProfile ? { ...state.studentProfile, interests } : null,
        userData: state.userData ? { ...state.userData, interests } : null
      }));
      
      toast({
        title: "Success",
        description: "Interests updated successfully",
      });
    } catch (error) {
      console.error("Error updating interests:", error);
      toast({
        title: "Error",
        description: "Failed to update interests",
        variant: "destructive",
      });
    }
  },
  
  updateUserPhone: async (userId: string, phone: string) => {
    try {
      // Update profiles table
      const { error } = await supabase
        .from("profiles")
        .update({ phone })
        .eq("id", userId);

      if (error) throw error;
      
      // Update local state
      set((state) => ({
        user: state.user ? { ...state.user, phone } : null,
        userData: state.userData ? { ...state.userData, phone } : null
      }));
      
      toast({
        title: "Success",
        description: "Phone number updated successfully",
      });
    } catch (error) {
      console.error("Error updating phone number:", error);
      toast({
        title: "Error",
        description: "Failed to update phone number",
        variant: "destructive",
      });
    }
  },
  
  updateUserStatus: async (status: UserStatus) => {
    const { user } = get();
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status })
        .eq("id", user.id);
        
      if (error) throw error;
      
      set((state) => ({
        user: state.user ? { ...state.user, status } : null,
        userData: state.userData ? { ...state.userData, status } : null
      }));
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  }
}));
