import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@web/components/ui/breadcrumb'

const Overview = () => {
  const stats = [
    { title: "Total Patients", value: 100, bgColor: "#f3f4f6", textColor: "#0077B6" },
    { title: "Total Doctors", value: 20, bgColor: "#f3f4f6", textColor: "#12B76A" },
    { title: "Total Appointments", value: 100, bgColor: "#f3f4f6", textColor: "#F79009" },
    { title: "Appointments Today", value: 20, bgColor: "#f3f4f6", textColor: "#6941C6" },
    { title: "Canceled Appointments", value: 15, bgColor: "#f3f4f6", textColor: "#F04438" },
    { title: "Completed Appointments", value: 80, bgColor: "#f3f4f6", textColor: "#76AB35" }
  ];

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Overview</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <p className=' mt-5 text-2xl font-medium'>Welcome, Admin!</p>
      <p className='mb-7 text-gray-500 text-base'>Overview of the system stats</p>
      <div className="grid grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  )
}
const StatCard = ({ title, value, bgColor, textColor }) => (
  <div className={`bg-white p-6 rounded-md text-center`} style={{ backgroundColor: bgColor }}>
    <h3 className="text-black text-base">{title}</h3>
    <p className="text-2xl mt-2 text-gray-500">{value}</p>
  </div>
);
export default Overview