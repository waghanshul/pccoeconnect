import { AppLayout } from "@/components/layout/AppLayout";
import { UserProfile as UserProfileComponent } from "@/components/UserProfile";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserStatus } from "@/services/user";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProfileData {
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

interface ProfileRecord {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
  status?: UserStatus;
  phone?: string;
}

const UserProfile = () => {
  const { id: userId } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (userId) fetchUserData(userId);
  }, [userId]);

  const fetchUserData = async (id: string) => {
    try {
      setIsLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      const typedProfileData = profileData as ProfileRecord;

      let extendedData: any = {};
      if (typedProfileData.role === 'student') {
        const { data: studentData, error: studentError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (studentError && studentError.code !== 'PGRST116') throw studentError;
        
        if (studentData) {
          extendedData = studentData;
          if (extendedData.interests) {
            if (Array.isArray(extendedData.interests)) {
              // ok
            } else if (typeof extendedData.interests === 'string') {
              try { extendedData.interests = JSON.parse(extendedData.interests); }
              catch { extendedData.interests = []; }
            } else if (typeof extendedData.interests !== 'object') {
              extendedData.interests = [];
            }
          } else {
            extendedData.interests = [];
          }
        }
      } else if (typedProfileData.role === 'admin') {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (adminError && adminError.code !== 'PGRST116') throw adminError;
        if (adminData) extendedData = adminData;
      }

      setUserData({
        id: typedProfileData.id,
        name: typedProfileData.full_name || 'Guest User',
        avatar: typedProfileData.avatar_url || "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
        role: typedProfileData.role,
        department: extendedData.department || '',
        year: extendedData.year || '',
        bio: extendedData.bio || '',
        interests: Array.isArray(extendedData.interests) ? extendedData.interests : [],
        isPublic: true,
        email: typedProfileData.email || '',
        phone: typedProfileData.phone || '',
        status: typedProfileData.status as UserStatus || 'offline',
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!userData) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">User not found</h2>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-6">
        <UserProfileComponent 
          user={userData} 
          isOwnProfile={user?.id === userData?.id}
        />
      </div>
    </AppLayout>
  );
};

export default UserProfile;
