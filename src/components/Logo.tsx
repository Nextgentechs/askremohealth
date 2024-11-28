import React from "react";
import Image from "next/image";
import logo from "public/assets/logo.png";
export default function Logo() {
  return <Image src={logo} alt="askvirtualhealthcare logo" className="py-2" />;
}
