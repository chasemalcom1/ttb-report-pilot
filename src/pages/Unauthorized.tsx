
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8 text-destructive"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You don't have permission to access this page
          </p>
        </div>
        
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
