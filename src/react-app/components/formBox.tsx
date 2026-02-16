import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';


export const FormBox = ({
    title,
    description,
    returnText,
    returnPath,
    returnParams,
    error,
    children } : {
      title: string,
      description: string,
      returnText?: string | null,
      returnPath?: string,
      returnParams?: object,
      error?: string | null,
      children: React.ReactNode
    }) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {returnText && returnPath &&
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
          asChild
        >
          <Link to={returnPath} params={returnParams ? returnParams : {}}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {returnText}
          </Link>
        </Button>
      }
      {!(returnText && returnPath) &&
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary cursor-pointer"
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back()
            } else {
              window.location.href = window.location.href + '/..'
            }
          }}
          asChild
        >
          <div>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver atrás
          </div>
        </Button>
      }
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {description}
          </p>
        </div>

        {error ? ( (
          <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center text-sm m-4">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )) : children}
      </div>
    </div>
  );
}
