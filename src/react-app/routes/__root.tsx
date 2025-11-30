import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import logo_zona from "@/assets/logo.png";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"


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
                <Link to="/" className='border-white border-2 hover:border-accent [&.active]:border-accent'>Inicio</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/services" className='border-white border-2 hover:border-accent [&.active]:border-accent'>Servicios</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/about" className='border-white border-2 hover:border-accent [&.active]:border-accent'>Nosotros</Link>
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
