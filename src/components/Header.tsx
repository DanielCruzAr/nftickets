"use client";

import React from "react";
import { usePathname } from "next/navigation";

const Header = () => {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    return (
        <header className="flex">
            <nav className="flex justify-center w-fit rounded-full bg-secondary/20">
                <ul className="flex">
                    <li
                        className={`px-5 py-2 rounded-s-full hover:bg-secondary/30 ${
                            isActive("/") ? "bg-secondary/25" : ""
                        }`}
                    >
                        <a href="/">Home</a>
                    </li>
                    <li
                        className={`px-5 py-2 hover:bg-secondary/30 ${
                            isActive("/events") ? "bg-secondary/25" : ""
                        }`}
                    >
                        <a href="/">Events</a>
                    </li>
                    <li
                        className={`px-5 py-2 rounded-e-full hover:bg-secondary/30 ${
                            isActive("/tickets") ? "bg-secondary/25" : ""
                        }`}
                    >
                        <a href="/">My Tickets</a>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
