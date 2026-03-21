import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';


const CLASS_NAME = 'mb-4 py-1 hover:text-primary cursor-pointer flex items-center text-sm gap-2 font-medium';


export const GoBackButton = ({
  returnText,
  returnPath,
  returnParams,
}: {
  returnText?: string | null,
  returnPath?: string | null,
  returnParams?: object | null,
}) => {
  if (returnText && returnPath) {
    return (
      <Link
        to={returnPath}
        params={returnParams ? returnParams : {}}
        className={CLASS_NAME}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {returnText}
      </Link>
    )
  }
  return (
    <button
      className={CLASS_NAME}
      onClick={() => {
        const lastUrl = document.referrer;
        const currentUrl = window.location.href;
        // console.log('Last URL:', lastUrl);
        // console.log('Current URL:', currentUrl);
        // console.log('History length:', window.history.length);
        // console.log('comp', lastUrl.startsWith(window.location.origin))
        if (lastUrl.startsWith(window.location.origin) && lastUrl !== currentUrl) {
          window.location.href = window.location.href + '/..'
        } else if (lastUrl === currentUrl) {
          window.location.href = window.location.href + '/..'
        } else if (window.history.length > 1) {
          window.history.back()
        } else {
          window.location.href = window.location.href + '/..'
        }
      }}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Volver atrás
    </button>
  )
}
