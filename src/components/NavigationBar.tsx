import React from "react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import Login from "public/assets/log-in.png";
import Image from "next/image";
import Link from "next/link";

const NavigationBar: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-8">
        <Logo />
        <nav className="flex gap-6">
          <Link href="/find-doctor" className="nav-links">
            Find a Doctor
          </Link>
          <Link href="/find-hospital" className="nav-links">
            Find a Hospital
          </Link>
          <Link href="/how-it-works" className="nav-links">
            How It Works
          </Link>
          <Link href="/about-us" className="nav-links">
            About Us
          </Link>
          <a href="/contact-us" className="nav-links">
            Contact Us
          </a>
        </nav>
      </div>

      {/* Right Section: Action Buttons */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="flex items-center gap-2">
          <Image src={Login} alt="icon for login" height={16} width={16} />
          Log in
        </Button>
        <Button
          variant="default"
          className="bg-primary text-white hover:bg-[#1A1721]"
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
};

export default NavigationBar;
