"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { LogIn } from "lucide-react";
import Logo from "./Logo";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";

export default function NavigationBar() {
  return (
    <div className="flex items-center justify-between px-16">
      <div className="flex items-center gap-4">
        <Logo />
        <NavigationMenu className="list-none">
          <NavigationMenuItem>
            <Link href="/find-doctor" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Find Doctor
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/find-hospital" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Find a Hospital
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="#how-it-works" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                How it Works
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/about us" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                About Us
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/contact-us" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Contact us
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenu>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="flex items-center gap-2">
          <LogIn color="#412E7D" height={16} width={16} />
          Log in
        </Button>
        <Button
          variant="default"
          className="bg-primary text-white hover:bg-[#1a1721]"
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
}
