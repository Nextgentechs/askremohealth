import React from "react";
import { Button } from "./ui/button";
import SearchIcon from "public/assets/search.png";
import Image from "next/image";

const SearchButton: React.FC = () => {
  return (
    <Button
      variant="default"
      className="hover:bg-primary-dark mt-6 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white"
    >
      <Image
        src={SearchIcon}
        style={{
          filter: "brightness(0) invert(1)",
        }}
        alt="Search Icon"
      />
      <span>Search</span>
    </Button>
  );
};

export default SearchButton;
