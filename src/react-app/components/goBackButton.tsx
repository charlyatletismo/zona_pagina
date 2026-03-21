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
    <Link
      to=".."
      className={CLASS_NAME}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Volver atrás
    </Link>
  )
  // return (
  //   <button
  //     className={CLASS_NAME}
  //     onClick={() => {
  //       const lastUrl = document.referrer;
  //       const currentUrl = window.location.href;
  //       if (
  //         !lastUrl
  //         || lastUrl?.startsWith(window.location.origin)
  //         || lastUrl === currentUrl
  //         || window.history.length <= 1
  //       ) {
  //         window.location.href = window.location.href + '/..'
  //       } else {
  //         window.history.back()
  //       }
  //     }}
  //   >
  //     <ArrowLeft className="w-4 h-4 mr-2" />
  //     Volver atrás
  //   </button>
  // )
}
