"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import walletIcon from "../../public/icons/wallet.png";

const Header = () => {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    return (
        <header className="flex relative justify-between items-center p-4">
            <div className="flex justify-center items-center px-8 w-64">
                <h4 className="font-extrabold">SmartTicket</h4>
            </div>
            <nav className="flex justify-center w-fit h-fit rounded-full glass">
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
            <div className="flex justify-center items-center space-x-2 w-64">
                <Button variant="secondary" size="secondary">
                    Connect Wallet
                    <Image src={walletIcon} alt="Wallet Icon" className="w-5 h-5" />
                </Button>
                <Button variant="link">Help</Button>
            </div>
            <span className="absolute bottom-0 left-0 w-full h-[0.5px] bg-gradient-stroke"></span>
        </header>
    );
};

export default Header;
