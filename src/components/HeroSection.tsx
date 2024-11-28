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
import { Button } from "./ui/button";
import { Search } from "lucide-react";

type County = {
  name: string;
  code: string;
};

const counties: County[] = [
  { name: "Machakos", code: "MA" },
  { name: "Nyeri", code: "NY" },
  { name: "Kiambu", code: "KI" },
  { name: "Nakuru", code: "NA" },
];

const specialties: string[] = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Surgery",
];

const cities: string[] = [
  "Nairobi",
  "Kisumu",
  "Narok",
  "Eldoret",
  "Mombasa",
  "Nyeri",
];

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center">
      <div className="flex w-11/12 items-center gap-8 pr-8 pt-12">
        <div className="flex flex-col">
          <h1 className="mb-4 whitespace-nowrap text-5xl font-extrabold leading-tight text-primary">
            Solutions that help you and <br /> your loved ones enjoy <br />
            <span className="bg-[##88B527] text-white">
              Good Health
            </span> and{" "}
            <span className="bg-[##88B527] text-white">Long Life</span>
          </h1>

          <p className="py-2 text-base text-slate-500">
            We take the guesswork out of finding the right doctors, hospitals,
            and <br /> care for your family.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="flex h-[573px] w-[601px] items-center justify-center rounded-full bg-[#FFF7ED]">
            <Image src={Doctor} className="object-contain" alt="Doctor Image" />
          </div>
        </div>
      </div>

      <div className="flex w-10/12 flex-wrap items-center justify-between gap-4 rounded-2xl border-[1px] border-[#CCC8DA] bg-white px-6 py-8 shadow-md">
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
        <Button
          variant="default"
          className="hover:bg-primary-dark mt-6 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white"
        >
          <Search color="white" />
          <span>Search</span>
        </Button>
      </div>
    </section>
  );
}
