"use client";
import Image from "next/image";
import React from "react";
import Doctor from "public/assets/doctor.png";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import SearchButton from "./Search";

interface County {
  name: string;
  code: string;
}

const HeroSection: React.FC = () => {
  const counties: County[] = [
    { name: "Machakos", code: "MA" },
    { name: "Nyeri", code: "NY" },
    { name: "Kiambu", code: "KI" },
    { name: "Nakuru", code: "NA" },
  ];

  const specialties = [
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Surgery",
  ];

  const cities = ["Nairobi", "Kisumu", "Narok", "Eldoret", "Mombasa", "Nyeri"];

  return (
    <section className="relative flex flex-col bg-gradient-to-b from-[#FFFDFB] to-[#FFF7ED]">
      <div
        className="flex w-11/12 items-center justify-between rounded-r-full bg-gradient-to-r from-white to-[#FFEFE1] px-16"
        style={{
          background:
            "linear-gradient(to top left, #FFEFE1 25%, white 100%), linear-gradient(to right, #FFEFE1 10%, #FFEFE1 10%, rgba(255, 234, 214, 0.8) 50%)",
        }}
      >
        <div className="w-full md:w-4/5">
          <h1 className="mb-4 text-5xl font-extrabold tracking-wide text-primary">
            Solutions that help you and your loved ones enjoy <br />{" "}
            <span className="bg-[#86B427] text-white">Good Health</span>
            and <span className="bg-[#86B427] text-white">Long Life</span>
          </h1>
          <p className="py-2 text-base text-slate-500">
            We take the guesswork out of finding the right doctors, hospitals,
            and <br /> care for your family.
          </p>
        </div>
        <div className="w-full md:w-1/2">
          <Image
            src={Doctor}
            height={602}
            width={528}
            className="object-contain"
            alt="Doctor Image"
          />
        </div>
      </div>

      <div className="absolute left-16 top-[92%] mt-6 flex w-10/12 flex-wrap gap-4 rounded-2xl border-[1px] border-[#CCC8DA] bg-white px-6 py-8 shadow-md">
        <div className="w-full sm:w-1/5">
          <Label htmlFor="specialty-select">Doctor Speciality</Label>
          <Select id="specialty-select">
            <SelectTrigger>
              <SelectValue placeholder="Select a speciality" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((specialty, index) => (
                <SelectItem key={index} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/5">
          <Label htmlFor="country-select">Country</Label>
          <Select id="country-select">
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {counties.map((county) => (
                <SelectItem key={county.code} value={county.code}>
                  {county.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/5">
          <Label htmlFor="city-select">City</Label>
          <Select id="city-select">
            <SelectTrigger>
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city, index) => (
                <SelectItem key={index} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/5">
          <Label htmlFor="search-input">Search</Label>
          <Input
            type="text"
            placeholder="Doctor/Hospital"
            className="rounded-md border p-2 shadow-sm"
          />
        </div>
        <SearchButton />
      </div>
    </section>
  );
};

export default HeroSection;
