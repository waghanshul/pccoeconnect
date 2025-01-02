import { Check, X } from "lucide-react";

interface Requirement {
  text: string;
  validator: (password: string) => boolean;
}

const requirements: Requirement[] = [
  {
    text: "At least 8 characters",
    validator: (password) => password.length >= 8,
  },
  {
    text: "Contains uppercase letter",
    validator: (password) => /[A-Z]/.test(password),
  },
  {
    text: "Contains lowercase letter",
    validator: (password) => /[a-z]/.test(password),
  },
  {
    text: "Contains number",
    validator: (password) => /[0-9]/.test(password),
  },
  {
    text: "Contains special character",
    validator: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export function PasswordStrengthIndicator({ password }: { password: string }) {
  return (
    <div className="space-y-2 text-sm mt-2">
      {requirements.map((requirement, index) => {
        const isMet = requirement.validator(password);
        return (
          <div
            key={index}
            className={`flex items-center gap-2 ${
              isMet ? "text-green-600" : "text-gray-500"
            }`}
          >
            {isMet ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            {requirement.text}
          </div>
        );
      })}
    </div>
  );
}