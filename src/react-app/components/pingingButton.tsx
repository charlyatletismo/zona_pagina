

export const ButtonPing = (
  { size,
    padding,
    children,
    pingType = 1
  }: {
    size?: 'sm' | 'md' | 'lg' | 'xl',
    padding?: string,
    children?: React.ReactNode,
    pingType?: 1 | 2
  }
) => {
  const textBySize = size === 'sm' ? 'text-sm ' :
                     size === 'md' ? 'text-base ' :
                     size === 'lg' ? 'text-lg ' :
                     size === 'xl' ? 'text-xl ' :
                     'text-base ';
  const padBySize = padding ? padding :
                    size === 'sm' ? 'px-2 py-2 ' :
                    size === 'md' ? 'px-4 py-2 ' :
                    size === 'lg' ? 'px-8 py-3 ' :
                    size === 'xl' ? 'px-16 py-4 ' :
                    'px-4 py-2 ';
  return (
    <div className='flex justify-center'>
      <div className="relative inline-flex group">
        <div className={
          "bg-background text-foreground group-hover:text-primary "
          + "rounded-lg shadow-md border border-muted-foreground "
          + "group-hover:shadow-lg group-hover:border-primary "
          + "transition-all duration-300 font-bold text-center my-auto "
          + textBySize
          + padBySize
          + (pingType === 1 ? '' : ' animate-outer-shine repeat-2 ')}
        >
          {children}
        </div>
        { pingType === 1 && (
          <div className="absolute top-0 right-0 -mt-1 -mr-1 flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-primary"></span>
          </div>
        )}
      </div>
    </div>
  )
}