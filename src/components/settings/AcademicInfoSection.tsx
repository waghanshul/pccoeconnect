
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/services/user";
import { useAuth } from "@/context/AuthContext";

interface AcademicInfoProps {
  academicInfo: {
    prn: string;
    branch: string;
    year: string;
    recoveryEmail: string;
  };
  setAcademicInfo: React.Dispatch<React.SetStateAction<{
    prn: string;
    branch: string;
    year: string;
    recoveryEmail: string;
  }>>;
}

export const AcademicInfoSection = ({ academicInfo, setAcademicInfo }: AcademicInfoProps) => {
  const { user } = useAuth();
  const { updateStudentProfile } = useUserStore();
  const { toast } = useToast();

  const handleAcademicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAcademicInfo({ ...academicInfo, [name]: value });
  };

  const handleSaveAcademicInfo = async () => {
    if (!user) return;
    
    try {
      await updateStudentProfile(user.id, {
        prn: academicInfo.prn,
        branch: academicInfo.branch,
        year: academicInfo.year,
        recovery_email: academicInfo.recoveryEmail,
      });
      
      toast({
        title: "Success",
        description: "Academic information updated successfully",
      });
    } catch (error) {
      console.error("Error saving academic info:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-xl font-semibold mb-4">Academic Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">PRN Number</label>
          <Input 
            name="prn"
            value={academicInfo.prn}
            onChange={handleAcademicInfoChange}
            className="max-w-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Branch</label>
          <Input 
            name="branch"
            value={academicInfo.branch}
            onChange={handleAcademicInfoChange}
            className="max-w-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <Input 
            name="year"
            value={academicInfo.year}
            onChange={handleAcademicInfoChange}
            className="max-w-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Recovery Email</label>
          <Input 
            name="recoveryEmail"
            value={academicInfo.recoveryEmail}
            onChange={handleAcademicInfoChange}
            className="max-w-md"
          />
        </div>
        <Button onClick={handleSaveAcademicInfo}>Save Academic Information</Button>
      </div>
    </div>
  );
};
