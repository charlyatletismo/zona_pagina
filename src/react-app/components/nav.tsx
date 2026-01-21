import { Link } from '@tanstack/react-router'
import { LogIn, LogOut } from 'lucide-react';
import { Settings } from 'lucide-react';
// import React from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import * as roles from '@shared/roles';
import { clearUserInfo } from '@/lib/utils';
// import { Sun, Moon } from 'lucide-react';
// import { Code2, Laptop } from 'lucide-react';


const navClass = (
  'bg-transparent text-gray-600 '
  + 'hover:text-gray-700 hover:bg-primary/20 '
  + '[&.active]:text-white [&.active]:bg-primary/60 '
  + 'font-medium transition-colors '
);

const LINK_HOME = { to: '/', label: 'Inicio' };
const LINK_SERVICES = { to: '/services', label: 'Servicios' };
const LINK_ABOUT = { to: '/about', label: 'Nosotros' };
const LINK_USERS = { to: '/users', label: 'Usuarios' };
const LINK_MANAGE = { to: '/manage', label: 'Gestión' };
// const LINK_ATHLETE_STATS = { to: '/athlete/stats', label: 'Estadísticas' };
const LINKS_BY_ROLE: Record<string, any> = {
  "": [
    LINK_HOME,
    LINK_SERVICES,
    LINK_ABOUT,
  ],
  [roles.ATHLETE_ROLE]: [
    LINK_HOME,
    // LINK_ATHLETE_STATS,
  ],
  [roles.ATHLETES_MANAGER_ROLE]: [
    LINK_HOME,
    LINK_USERS,
    // LINK_ATHLETE_STATS,
  ],
  [roles.ADMIN_ROLE]: [
    LINK_HOME,
    LINK_MANAGE,
  ],
  [roles.ORGANIZER_ROLE]: [
    LINK_HOME,
    LINK_MANAGE,
  ],
}

export const Navigation = () => {
  const current_role = localStorage.getItem('JWT_TOKEN')
    ? (localStorage.getItem('USER_ROLE') || '')
    : '';
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex-wrap">
        {LINKS_BY_ROLE[current_role]?.map((link: any) => (
          <NavigationMenuItem key={link.to}>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link to={link.to} className={navClass}>{link.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}

        {/* <NavigationMenuItem>
              <button onClick={toggleTheme} className={navClass + " px-3 py-2 rounded-md flex items-center cursor-pointer"}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </NavigationMenuItem> */}

        {localStorage.getItem('JWT_TOKEN') && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link to="/settings" className={navClass}>
                <Settings className='my-auto [&.active]:text-white' size={16} />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            {localStorage.getItem('JWT_TOKEN') ? (
              <a onClick={() => {
                clearUserInfo();
                window.location.href = '/';
              }} className={navClass + " cursor-pointer"}>
                <LogOut size={16} />
                {/* <div className='flex items-center gap-1'>
                      Cerrar sesión
                    </div> */}
              </a>
            ) : (
              <Link to="/login" className={navClass}>
                <LogIn className='[&.active]:text-white' size={16} />
                {/* <div className='flex items-center gap-1'>
                      Iniciar sesión
                    </div> */}
              </Link>
            )}
          </NavigationMenuLink>
        </NavigationMenuItem>

        {localStorage.getItem('JWT_TOKEN') && localStorage.getItem('ADMIN_MODE') === 'active' && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <a onClick={() => {
                // switch to next role
                const all_roles = [roles.ADMIN_ROLE, roles.ORGANIZER_ROLE, roles.ATHLETES_MANAGER_ROLE, roles.ATHLETE_ROLE];
                const i = all_roles.indexOf(localStorage.getItem('USER_ROLE') || '');
                const nextRole = all_roles[(i + 1) % all_roles.length];
                localStorage.setItem('USER_ROLE', nextRole);
                window.location.reload();
              }} className="bg-primary/70 text-white cursor-pointer hover:animate-tremor hover:bg-primary hover:text-white">Rol: {localStorage.getItem('USER_ROLE')}</a>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}