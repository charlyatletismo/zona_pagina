import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import logo_zona from "@/assets/logo.png";
import { Instagram } from '@/components/icons/instagram';
import { Whatsapp } from '@/components/icons/whatsapp';
import { LogIn, LogOut } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import * as roles from '@/lib/roles';
// import { Code2, Laptop } from 'lucide-react';

const navClass = 'bg-transparent text-gray-600 hover:text-primary hover:bg-primary/5 [&.active]:text-primary [&.active]:bg-primary/10 font-medium transition-colors';

const RootLayout = () => (
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
        <NavigationMenu>
          <NavigationMenuList className="flex-wrap">
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/" className={navClass}>Inicio</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {localStorage.getItem('JWT_TOKEN') ? null : (
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to="/services" className={navClass}>Servicios</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ) }

            {localStorage.getItem('JWT_TOKEN') ? null : (
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to="/about" className={navClass}>Nosotros</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}

            {localStorage.getItem('JWT_TOKEN') && roles.R_RUNNER_STATS.includes(localStorage.getItem('USER_ROLE') || '') && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to="/stats" className={navClass}>Estadísticas</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}

            {localStorage.getItem('JWT_TOKEN') && (localStorage.getItem('USER_ROLES')?.split(",").length || 0) > 1 && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <a onClick={() => {
                    // switch to next role
                    const roles = localStorage.getItem('USER_ROLES')?.split(",") || [];
                    const i = roles.indexOf(localStorage.getItem('USER_ROLE') || '') ;
                    const nextRole = roles[(i + 1) % roles.length];
                    localStorage.setItem('USER_ROLE', nextRole);
                    window.location.reload();
                }} className={navClass}>Rol: { localStorage.getItem('USER_ROLE') }</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
            )}

            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                {localStorage.getItem('JWT_TOKEN') ? (
                  <a onClick={() => {
                    localStorage.setItem('JWT_TOKEN', '');
                    localStorage.setItem('USER_ROLES', '');
                    localStorage.setItem('USER_ID', '');
                    localStorage.setItem('USER_ROLE', '');
                    window.location.href = '/';
                  }} className={navClass}>
                      <LogOut size={16} />
                    {/* <div className='flex items-center gap-1'>
                      Cerrar sesión
                    </div> */}
                  </a>
                ) : (
                  <Link to="/login" className={navClass}>
                    <LogIn size={16} />
                    {/* <div className='flex items-center gap-1'>
                      Iniciar sesión
                    </div> */}
                  </Link>
                )}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
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

export const Route = createRootRoute({ component: RootLayout })
