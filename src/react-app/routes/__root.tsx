import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import logo_zona from "@/assets/logo.png";
import { LogIn, LogOut } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import * as roles from '@/lib/roles';


const navClass = 'border-white focus:bg-transparent border-2 hover:border-accent [&.active]:border-accent';

const RootLayout = () => (
  <>
    <div className="flex flex-wrap gap-2 justify-center sm:justify-between items-center px-10 mb-2">
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
    <Outlet />
    <TanStackRouterDevtools />
  </>
)

export const Route = createRootRoute({ component: RootLayout })
