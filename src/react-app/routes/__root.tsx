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
import { Button } from '@/components/ui/button';


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

            {localStorage.getItem('JWT_TOKEN') && localStorage.getItem('USER_ROLE') === 'runner' && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to="/stats" className={navClass}>Estadísticas</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}

            {localStorage.getItem('JWT_TOKEN') && (localStorage.getItem('USER_ROLES')?.split(",").length || 0) > 1 && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Button onClick={() => {
                    // switch to next role
                    let flag = false;
                    localStorage.getItem('USER_ROLES')?.split(",").forEach(role => {
                      if (role === localStorage.getItem('USER_ROLE')) {
                        flag = true;
                      } else if (flag) {
                        flag = false;
                        localStorage.setItem('USER_ROLE', role);
                        window.location.reload();
                      }
                    if (!flag) {
                      localStorage.setItem('USER_ROLE', localStorage.getItem('USER_ROLES')?.split(",")[0] || '');
                      window.location.reload();
                    }
                  });
                }} className={navClass}>Rol: { localStorage.getItem('USER_ROLE') }</Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
            )}

            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                {localStorage.getItem('JWT_TOKEN') ? (
                  <Link to="/logout" className={navClass}>
                      <LogOut size={16} />
                    {/* <div className='flex items-center gap-1'>
                      Cerrar sesión
                    </div> */}
                  </Link>
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
