import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";

const Notifications = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Notifications</h1>
        
        <Tabs defaultValue="sports" className="w-full">
          <TabsList className="w-full justify-start mb-8 overflow-x-auto bg-white dark:bg-gray-800">
            <TabsTrigger value="sports">Sports</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="clubs">Clubs</TabsTrigger>
            <TabsTrigger value="placements">Placements</TabsTrigger>
            <TabsTrigger value="celebrations">Celebrations</TabsTrigger>
          </TabsList>

          <TabsContent value="sports" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
              <h3 className="font-semibold dark:text-white">Cricket Tournament Registration Open</h3>
              <p className="text-gray-600 dark:text-gray-300">Annual inter-department cricket tournament registration starts today.</p>
            </div>
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
              <h3 className="font-semibold dark:text-white">Mid-Semester Exam Schedule</h3>
              <p className="text-gray-600 dark:text-gray-300">Mid-semester examinations start from next week.</p>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
              <h3 className="font-semibold dark:text-white">Technical Symposium</h3>
              <p className="text-gray-600 dark:text-gray-300">Annual technical symposium registration is now open.</p>
            </div>
          </TabsContent>

          <TabsContent value="clubs" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
              <h3 className="font-semibold dark:text-white">Robotics Club Meeting</h3>
              <p className="text-gray-600 dark:text-gray-300">Weekly robotics club meeting scheduled for Friday.</p>
            </div>
          </TabsContent>

          <TabsContent value="placements" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
              <h3 className="font-semibold dark:text-white">TCS Campus Drive</h3>
              <p className="text-gray-600 dark:text-gray-300">TCS campus recruitment drive scheduled next month.</p>
            </div>
          </TabsContent>

          <TabsContent value="celebrations" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
              <h3 className="font-semibold dark:text-white">Annual Day Celebration</h3>
              <p className="text-gray-600 dark:text-gray-300">College annual day celebration preparations begin.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Notifications;