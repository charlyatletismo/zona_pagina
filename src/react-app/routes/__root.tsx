import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import logo_zona from "@/assets/logo.png";
import { Instagram } from '@/components/icons/instagram';
import { Whatsapp } from '@/components/icons/whatsapp';
import { Navigation } from '@/components/nav';
import { NotFound } from '@/components/notFound';


const RootLayout = () => {
  // const [theme, setTheme] = React.useState(() => {
  //   if (typeof window !== 'undefined') {
  //     return localStorage.getItem('theme') || 'light'
  //   }
  //   return 'light'
  // })

  // React.useEffect(() => {
  //   const root = window.document.documentElement
  //   root.classList.remove('light', 'dark')
  //   root.classList.add(theme)
  //   localStorage.setItem('theme', theme)
  // }, [theme])

  // const toggleTheme = () => {
  //   setTheme(theme === 'light' ? 'dark' : 'light')
  // }

  return (
  <div className="flex flex-col min-h-screen">
    <div className="relative bg-primary/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-wrap gap-2 justify-center sm:justify-between items-center px-10">
        <div>
          <Link to="/">
            <img src={logo_zona} alt="Zona Atletismo Logo" className="max-w-xs h-20 mr-2 py-3" />
          </Link>
        </div>
        <div className='flex'>
          <Navigation />
        </div>
      </div>
    </div>
    <Outlet />
    <footer className="
        flex flex-col justify-center 
        items-center bg-primary/5 border-t border-primary/10
        mt-auto py-12
        xl:px-40 md:px-17 sm:px-10 px-5 relative overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary rounded-full blur-3xl"></div>
        </div>

        <div className='relative z-10 flex flex-col sm:flex-row items-center gap-8 my-6'>
          <a href="https://www.instagram.com/zonaatletismo/" className='flex items-center text-gray-600 hover:text-primary transition-colors duration-300 group' target="_blank" rel="noopener noreferrer">
            <Instagram className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span className="ml-2 font-medium">Seguinos en Instagram</span>
          </a>
          <a href="https://wa.me/5493400660640?text=Hola%20Zona%20Atletismo%2C%20quiero%20más%20información" className='flex items-center text-gray-600 hover:text-primary transition-colors duration-300 group' target="_blank" rel="noopener noreferrer">
            <Whatsapp className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span className="ml-2 font-medium">Contactanos por WhatsApp</span>
          </a>
        </div>
        <p className="relative z-10 text-gray-500 text-sm">&copy; {new Date().getFullYear()} Zona Atletismo. Todos los derechos reservados.</p>
        {/* <a className="flex items-center justify-center gap-2 text-gray-600 hover:text-black" href="https://goran.com.ar/" target="_blank" rel="noopener noreferrer">
          <Laptop size={22} className='pt-1' />
          <span className="py-2">Powered by gorandp</span>
          <Code2 size={22} className='pt-1' />
        </a> */}
    </footer>
    <TanStackRouterDevtools />
  </div>
  )
}

export const Route = createRootRoute({ 
  component: RootLayout,
  notFoundComponent: NotFound
})
