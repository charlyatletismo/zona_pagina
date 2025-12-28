import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';


export const FormBox = ({
    error,
    title,
    description,
    returnText,
    returnPath,
    returnParams,
    children } : {
      error: string | null,
      title: string,
      description: string,
      returnText: string | null,
      returnPath: string,
      returnParams: object,
      children: React.ReactNode
    }) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center text-sm mb-4">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}
      {returnText &&
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
          asChild
        >
          <Link to={returnPath} params={returnParams}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {returnText}
          </Link>
        </Button>
      }
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {description}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
