import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline'
import axios from "axios";


const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', current: false, roles: ['admin'] },
    { name: 'Approve', href: '/admin/approval', current: false, roles: ['admin'] },
    { name: 'Product', href: '/admin/product', current: false, roles: ['admin'] },
    { name: 'Substitution', href: '/admin/substitution', current: false, roles: ['admin'] },
    { name: 'Users', href: '/admin/users', current: false, roles: ['admin'] },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const Layout = ({children, headerTitle}) => {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [userName, setUserName] = useState('');
    const [filteredNav, setFilteredNav] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const currentUserRole = currentUser?.role || null;
        const currentUserName = currentUser?.userName || '';
        setRole(currentUserRole);
        setUserName(currentUserName);

        const filtered = navigation.filter(item => 
            item.roles.includes(currentUserRole)
        );

        setFilteredNav(filtered);
    },[])
    
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    
    const fetchNotifications = async () => {
        try {
            const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/notification/`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
            );
            const notifs = res?.data || [];
            setNotifications(notifs);

            const hasUnreadNotifs = notifs.some(n => !n.read);
            setHasUnread(hasUnreadNotifs);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_API_URL}/notification/read-all`,
                {}, // request body is empty
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark all read', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleProfile = () => {
      navigate("/profile");
    }

    const handleSignOut = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <>
          <div className="min-h-full">
            <Disclosure as="nav" className="bg-gray-800">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  {/* Logo & Nav */}
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <img
                        alt="Rita's Farm"
                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                        className="size-8"
                      />
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {filteredNav.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            aria-current={item.current ? 'page' : undefined}
                            className={classNames(
                              item.current
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                              'rounded-md px-3 py-2 text-lg font-bold'
                            )}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Desktop right side */}
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      {/* Notifications */}
                      <Menu as="div" className="relative">
                        <MenuButton
                          onClick={handleMarkAllRead}
                          className="relative rounded-full bg-gray-800 p-2 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none"
                        >
                          <span className="sr-only">View notifications</span>
                          <BellIcon aria-hidden="true" className="size-6" />
                          {hasUnread && (
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                          )}
                        </MenuButton>
                        <MenuItems className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-80 overflow-y-auto">
                          <div className="py-2 px-4 text-base font-bold border-b">Notifications</div>
                          {notifications.length === 0 && (
                            <div className="px-4 py-2 text-base text-gray-500">No notifications</div>
                          )}
                          {notifications.length > 0 &&
                            notifications.map((n) => (
                              <MenuItem key={n._id}>
                                <a
                                  href="#"
                                  className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 focus:outline-none"
                                >
                                  {n.message}
                                </a>
                              </MenuItem>
                            ))}
                        </MenuItems>
                      </Menu>
                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <MenuButton className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-lg focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none">
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">Open user menu</span>
                          <div className="size-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold uppercase">
                            {userName?.charAt(0) || "U"}
                          </div>
                        </MenuButton>
                        <MenuItems
                          className="absolute right-0 z-10 mt-2 w-52 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 focus:outline-none"
                        >
                          <MenuItem key={userName}>
                            <a
                              onClick={handleProfile}
                              className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 focus:outline-none"
                            >
                              {userName}
                            </a>
                          </MenuItem>
                          <MenuItem key="Sign out">
                            <a
                              onClick={handleSignOut}
                              className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 focus:outline-none"
                            >
                              Sign out
                            </a>
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </div>
                  </div>
                  {/* Mobile menu button */}
                  <div className="-mr-2 flex md:hidden">
                    <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none">
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Open main menu</span>
                      <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                      <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                    </DisclosureButton>
                  </div>
                </div>
              </div>
              {/* Mobile menu */}
              <DisclosurePanel className="md:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                  {filteredNav.map((item) => (
                    <DisclosureButton
                      key={item.name}
                      as="a"
                      href={item.href}
                      aria-current={item.current ? 'page' : undefined}
                      className={classNames(
                        item.current
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'block rounded-md px-3 py-2 text-lg font-bold'
                      )}
                    >
                      {item.name}
                    </DisclosureButton>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4 pb-3">
                  <div className="flex items-center px-5">
                    <div className="shrink-0">
                      <div className="size-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold uppercase">
                        {userName?.charAt(0) || "U"}
                      </div>
                    </div>
                    <Menu as="div" className="relative ml-auto shrink-0">
                      <MenuButton
                        type="button"
                        className="relative rounded-full bg-gray-800 p-2 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon aria-hidden="true" className="size-6" />
                        {hasUnread && (
                          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                      </MenuButton>
      
                      <MenuItems className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-80 overflow-y-auto">
                        <div className="py-2 px-4 text-base font-bold border-b">Notifications</div>
      
                        {notifications.length === 0 ? (
                          <div className="px-4 py-2 text-base text-gray-500">No notifications</div>
                        ) : (
                          notifications.map((n) => (
                            <MenuItem key={n._id}>
                              <a
                                href="#"
                                className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 focus:outline-none"
                              >
                                {n.message}
                              </a>
                            </MenuItem>
                          ))
                        )}
                      </MenuItems>
                    </Menu>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    <DisclosureButton
                      onClick={handleProfile}
                      key={userName}
                      as="a"
                      className="block rounded-md px-3 py-2 text-lg font-bold text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      {userName}
                    </DisclosureButton>
                    <DisclosureButton
                      onClick={handleSignOut}
                      key="Sign out"
                      as="a"
                      className="block rounded-md px-3 py-2 text-lg font-bold text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      Sign out
                    </DisclosureButton>
                  </div>
                </div>
              </DisclosurePanel>
            </Disclosure>
      
            <header className="bg-white shadow-sm">
              <div className="flex justify-between mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{headerTitle}</h1>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{role}</h1>
              </div>
            </header>
            <main>
              {children}
            </main>
          </div>
        </>
    );
} 

export default Layout;