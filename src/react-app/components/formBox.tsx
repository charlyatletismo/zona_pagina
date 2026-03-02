import { AlertCircle } from 'lucide-react';
import { GoBackButton } from '@/components/goBackButton';


export const FormBox = ({
    title,
    description,
    returnText,
    returnPath,
    returnParams,
    returnDisabled = false,
    padding = 'px-4 py-8',
    error,
    children } : {
      title: string | null,
      description: string | null,
      returnText?: string | null,
      returnPath?: string,
      returnParams?: object,
      returnDisabled?: boolean,
      padding?: string,
      error?: string | null,
      children: React.ReactNode
    }) => {
  return (
    <div className={`container mx-auto ${padding} max-w-3xl`}>
      {!returnDisabled &&
        <GoBackButton
          returnText={returnText}
          returnPath={returnPath}
          returnParams={returnParams}
        />
      }
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {(title || description) && (
          <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {description}
            </p>
          </div>
        )}

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
