import { Link } from '@tanstack/react-router';
import { LogInIcon, LogOutIcon } from 'lucide-react';
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
import { ThemeModeToggle } from './themeModeToggle';
import { clearUserInfo } from '@/lib/utils';
// import { Sun, Moon } from 'lucide-react';
// import { Code2, Laptop } from 'lucide-react';


const navClass = (
  'bg-transparent border-transparent border-1 border-solid '
  + 'hover:border-primary/40 hover:bg-transparent '
  + '[&.active]:bg-transparent '
  + 'font-medium transition-colors '
);

const LINK_HOME = { to: '/', label: 'Inicio' };
const LINK_SERVICES = { to: '/services', label: 'Servicios' };
const LINK_ABOUT = { to: '/about', label: 'Nosotros' };
const LINK_USERS = { to: '/users', label: 'Usuarios' };
const LINK_MANAGE = { to: '/manage', label: 'Gestión' };
const LINK_MY_EVENTS = { to: '/sportingEvents/myEvents', label: 'Mis Eventos' };
const LINK_MY_MANAGED_USERS_EVENTS = { to: '/sportingEvents/myManagedUsersEvents', label: 'Eventos con inscripciones' };
const LINKS_BY_ROLE: Record<string, Array<{ to: string; label: string }>> = {
  "": [
    LINK_HOME,
    LINK_SERVICES,
    LINK_ABOUT,
  ],
  [roles.ATHLETE_ROLE]: [
    LINK_HOME,
    LINK_MY_EVENTS,
  ],
  [roles.ATHLETES_MANAGER_ROLE]: [
    LINK_HOME,
    LINK_USERS,
    LINK_MY_EVENTS,
    LINK_MY_MANAGED_USERS_EVENTS,
  ],
  [roles.ADMIN_ROLE]: [
    LINK_HOME,
    LINK_MANAGE,
  ],
  [roles.ORGANIZER_ROLE]: [
    LINK_HOME,
    LINK_MANAGE,
    LINK_MY_EVENTS,
  ],
}

export const Navigation = () => {
  const current_role = localStorage.getItem('JWT_TOKEN')
    ? (localStorage.getItem('USER_ROLE') || '')
    : '';
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex-wrap">
        {LINKS_BY_ROLE[current_role]?.map((link) => (
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
                <LogOutIcon className='w-4 h-4 text-foreground' />
              </a>
            ) : (
              <Link to="/login" className={navClass}>
                <LogInIcon className='w-4 h-4 text-foreground' />
              </Link>
            )}
          </NavigationMenuLink>
        </NavigationMenuItem>

        {localStorage.getItem('JWT_TOKEN') && localStorage.getItem('ADMIN_MODE') === 'active' && localStorage.getItem('TEST_MODE') === 'active' && (
          <NavigationMenuItem>
            <ThemeModeToggle
              className={
                navigationMenuTriggerStyle()
                + " cursor-pointer "
                + navClass
              }
            />
          </NavigationMenuItem>
        )}
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