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
import * as roles from '@/lib/roles';
import { clearUserInfo } from '@/lib/utils';
// import { Sun, Moon } from 'lucide-react';
// import { Code2, Laptop } from 'lucide-react';


const navClass = 'bg-transparent text-gray-600 hover:text-primary hover:bg-primary/5 [&.active]:text-primary [&.active]:bg-primary/10 font-medium transition-colors';

const LINK_HOME = { to: '/', label: 'Inicio' };
const LINK_SERVICES = { to: '/services', label: 'Servicios' };
const LINK_ABOUT = { to: '/about', label: 'Nosotros' };
const LINK_USERS = { to: '/users', label: 'Usuarios' };
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
    // LINK_ATHLETE_STATS,
  ],
  [roles.ADMIN_ROLE]: [
    LINK_HOME,
    LINK_USERS,
  ],
  [roles.ORGANIZER_ROLE]: [
    LINK_HOME,
    LINK_USERS,
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

        {localStorage.getItem('JWT_TOKEN') && (localStorage.getItem('USER_ROLES')?.split(",").length || 0) > 1 && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <a onClick={() => {
                // switch to next role
                const roles = localStorage.getItem('USER_ROLES')?.split(",") || [];
                const i = roles.indexOf(localStorage.getItem('USER_ROLE') || '');
                const nextRole = roles[(i + 1) % roles.length];
                localStorage.setItem('USER_ROLE', nextRole);
                window.location.reload();
              }} className={navClass}>Rol: {localStorage.getItem('USER_ROLE')}</a>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}

        {/* <NavigationMenuItem>
              <button onClick={toggleTheme} className={navClass + " px-3 py-2 rounded-md flex items-center cursor-pointer"}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </NavigationMenuItem> */}

        {localStorage.getItem('JWT_TOKEN') && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link to="/settings" className={navClass}>
                <Settings className='my-auto' size={16} />
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
  )
}