import React from "react";


export const CardGrid = ({ icon, title, description }: { icon: React.ReactElement<{ className?: string }>, title: string, description: string }) => {
  // set icon class based on icon type
  return (
    <div className='bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow'>
      <div className='flex items-center mb-4'>
        {React.cloneElement(icon, { className: 'h-8 w-8 text-primary mr-3' })}
        <h3 className='text-xl font-semibold'>{title}</h3>
      </div>
      <p className='text-gray-600'>{description}</p>
    </div>
  )
};
