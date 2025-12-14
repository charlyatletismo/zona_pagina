import { Link } from '@tanstack/react-router'
import { LogIn, LogOut } from 'lucide-react';
// import { Sun, Moon } from 'lucide-react';
// import React from 'react';
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

const LINKS_BY_ROLE: Record<string, any> = {
  "": [
    { to: '/', label: 'Inicio' },
    { to: '/services', label: 'Servicios' },
    { to: '/about', label: 'Nosotros' },
  ],
  [roles.RUNNER_ROLE]: [
    { to: '/', label: 'Inicio' },
    { to: '/runner/stats', label: 'Estadísticas' },
  ],
}

export const Navigation = () => {
  console.log(LINKS_BY_ROLE)
  const current_role = localStorage.getItem('JWT_TOKEN') ? (localStorage.getItem('USER_ROLE') || '') : '';
  return (
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
        )}

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
              <Link to="/runner/stats" className={navClass}>Estadísticas</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}

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
  )
}