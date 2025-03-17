
import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  status?: string;
}

interface UserStore {
  user: UserProfile | null;
  studentProfile: StudentProfile | null;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  updateStudentProfile: (userId: string, data: Partial<StudentProfile>) => Promise<void>;
  updateUserInterests: (userId: string, interests: string[]) => Promise<void>;
  updateUserPhone: (userId: string, phone: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  studentProfile: null,
  
  fetchUserProfile: async (userId: string) => {
    try {
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
      
      // Set the state with user and student profiles
      set({ 
        user: userData as UserProfile,
        studentProfile: studentData as StudentProfile 
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
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
}));
