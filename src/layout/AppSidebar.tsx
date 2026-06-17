"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BellIcon,
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; hrOnly?: boolean }[];
};

const userNavItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
  { icon: <CalenderIcon />, name: "My Leaves", path: "/leave/history" },
  { icon: <ListIcon />, name: "My Exits", path: "/exit/my-requests" },
];

const adminNavItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
  { icon: <CalenderIcon />, name: "My Leaves", path: "/leave/history" },
  { icon: <ListIcon />, name: "My Exits", path: "/exit/my-requests" },
  {
    icon: <UserCircleIcon />,
    name: "HR Administration",
    subItems: [
      { name: "Employee Database", path: "/hr/employees" },
      { name: "Pending Approvals", path: "/hr/pending-approvals" },
      { name: "User Management", path: "/hr/users" },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Leave Management",
    subItems: [
      { name: "Apply for Leave", path: "/leave/apply" },
      { name: "Approvals", path: "/leave/approvals" },
      { name: "Leave Balances", path: "/leave/balances" },
      { name: "Leave Types", path: "/leave/leave-types" },
      { name: "Leave Type Configs", path: "/leave/type-configs" },
    ],
  },
  {
    icon: <ListIcon />,
    name: "Exit Management",
    subItems: [
      { name: "Exit Request", path: "/exit" },
      { name: "Approvals", path: "/exit/approvals" },
      { name: "End of Service", path: "/exit/end-of-service" },
      { name: "Checklist", path: "/exit/checklist" },
    ],
  },
];

const superAdminNavItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
  { icon: <CalenderIcon />, name: "My Leaves", path: "/leave/history" },
  { icon: <ListIcon />, name: "My Exits", path: "/exit/my-requests" },
  {
    icon: <UserCircleIcon />,
    name: "HR Administration",
    subItems: [
      { name: "Employee Database", path: "/hr/employees" },
      { name: "Pending Approvals", path: "/hr/pending-approvals" },
      { name: "User Management", path: "/hr/users" },
      { name: "Departments", path: "/hr/departments" },
      { name: "Roles", path: "/hr/roles" },
      { name: "Programs", path: "/hr/programs" },
      { name: "Locations", path: "/hr/locations" },
      { name: "Countries", path: "/hr/countries" },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Leave Management",
    subItems: [
      { name: "Apply for Leave", path: "/leave/apply" },
      { name: "Approvals", path: "/leave/approvals" },
      { name: "Leave Balances", path: "/leave/balances" },
      { name: "Leave Types", path: "/leave/leave-types" },
      { name: "Leave Type Configs", path: "/leave/type-configs" },
    ],
  },
  {
    icon: <ListIcon />,
    name: "Exit Management",
    subItems: [
      { name: "Exit Request", path: "/exit" },
      { name: "Approvals", path: "/exit/approvals" },
      { name: "End of Service", path: "/exit/end-of-service" },
      { name: "Checklist", path: "/exit/checklist" },
    ],
  },
  { icon: <PieChartIcon />, name: "Reports", path: "/reports" },
  { icon: <BellIcon />, name: "Notification Tracker", path: "/hr/notifications" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [isHR, setIsHR] = useState(false);
  const [isRegularUser, setIsRegularUser] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      let user: any = raw ? JSON.parse(raw) : {};
      if (token) {
        try { user = { ...user, ...JSON.parse(atob(token.split('.')[1])) }; } catch { /* ignore */ }
      }
      const role = (user?.role || user?.designation || "").toLowerCase();
      const isSuperAdmin = role === 'superadmin' || role === 'super admin' || role === 'systemadmin' || role === 'system admin';
      const isAdminRole = !isSuperAdmin && (
        role === 'admin' ||
        role.includes('hr') ||
        role.includes('supervisor') ||
        role.includes('finance') ||
        role.includes('operation') ||
        role.includes('compliance')
      );
      setIsHR(isSuperAdmin);
      setIsAdmin(isAdminRole);
      setIsRegularUser(!isSuperAdmin && !isAdminRole);
    } catch { /* ignore */ }
  }, []);

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer lg:justify-start`}
            >
              <span
                className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              <span className={`menu-item-text`}>{nav.name}</span>
              <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                <span className={`menu-item-text`}>{nav.name}</span>
              </Link>
            )
          )}
          {nav.subItems && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.filter(s => !s.hrOnly || isHR).map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const currentNavItems = isRegularUser ? userNavItems : isAdmin ? adminNavItems : superAdminNavItems;

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      const items = currentNavItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      suppressHydrationWarning
      className={`fixed flex flex-col top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 w-[290px]
        ${isExpanded || isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/dashboard">
          <>
            <Image
              className="dark:hidden"
              src="/images/logo/brand-logo.png"
              alt="Logo"
              width={180}
              height={48}
            />
            <Image
              className="hidden dark:block"
              src="/images/logo/brand-logo-dark.png"
              alt="Logo"
              width={180}
              height={48}
            />
          </>
        </Link>
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start">
                  Menu
                </h2>
                {renderMenuItems(currentNavItems, "main")}
              </div>
            </div>
          </nav>
        </div>
        <div className="flex-shrink-0 pb-6 border-t border-gray-100 dark:border-gray-800 pt-4">
          <button
            onClick={() => router.push("/logout")}
            className="flex items-center w-full gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
