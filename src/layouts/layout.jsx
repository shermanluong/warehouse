import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'


const navigation = [
    { name: 'Dashboard', href: 'dashboard', current: false, roles: ['admin']},
    { name: 'Product', href: 'product', current: false, roles: ['admin']},
    { name: 'Substitution', href: 'substitution', current: false, roles: ['admin']},
    { name: 'Users', href: 'users', current: false, roles: ['admin']},
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const Layout = ({children, headerTitle}) => {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [userName, setUserName] = useState('');
    const [filteredNav, setFilteredNav] = useState([]);

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

    const handleSignOut = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    return(
        <>
            <div className="min-h-full">
                <Disclosure as="nav" className="bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
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
                                item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                'rounded-md px-3 py-2 text-sm font-medium',
                                )}
                            >
                                {item.name}
                            </a>
                            ))}
                        </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            <p
                                type="button"
                                className="relative bg-gray-800 p-1 text-white"
                            >
                                {role}
                            </p>

                            {/* Profile dropdown */}
                            <Menu as="div" className="relative ml-3">
                                <div>
                                <MenuButton className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                                    <span className="absolute -inset-1.5" />
                                    <span className="sr-only">Open user menu</span>
                                    <div className="size-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold uppercase">
                                        {userName?.charAt(0) || "U"}
                                    </div>
                                </MenuButton>
                                </div>
                                <MenuItems
                                transition
                                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                >
                                    <MenuItem key={userName}>
                                        <a
                                            href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                                        >
                                            {userName}
                                        </a>
                                    </MenuItem>
                                    <MenuItem key="Sign out">
                                        <a
                                            onClick={handleSignOut}
                                            className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                                        >
                                            Sign out
                                        </a>
                                    </MenuItem>
                                </MenuItems>
                            </Menu>
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        {/* Mobile menu button */}
                        <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                        <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                        </DisclosureButton>
                    </div>
                    </div>
                </div>

                <DisclosurePanel className="md:hidden">
                    <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                    {filteredNav.map((item) => (
                        <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        aria-current={item.current ? 'page' : undefined}
                        className={classNames(
                            item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'block rounded-md px-3 py-2 text-base font-medium',
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
                            <button
                            type="button"
                            className="relative ml-auto shrink-0 bg-gray-800 p-1 text-white"
                            >
                                {role}
                            </button>
                        </div>
                        <div className="mt-3 space-y-1 px-2">
                            <DisclosureButton
                                key={userName}
                                as="a"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                                {userName}
                            </DisclosureButton>
                            <DisclosureButton
                                onClick={handleSignOut}
                                key="Sign out"
                                as="a"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                                Sign out
                            </DisclosureButton>
                        </div>
                    </div>
                </DisclosurePanel>
                </Disclosure>

                <header className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{headerTitle}</h1>
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