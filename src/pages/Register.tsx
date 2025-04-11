
import { RegisterForm } from "@/components/RegisterForm";

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-gray-800/50 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Create an Account</h1>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
