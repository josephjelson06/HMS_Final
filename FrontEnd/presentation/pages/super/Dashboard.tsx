"use client";

import React from "react";

export default function Dashboard() {
  // Placeholder metrics - would connect to new dashboard API
  const metrics = [
    {
      label: "Active Tenants",
      value: "12",
      change: "+2",
      color: "bg-blue-500",
    },
    {
      label: "Total Revenue",
      value: "$4,200",
      change: "+15%",
      color: "bg-green-500",
    },
    {
      label: "Platform Users",
      value: "5",
      change: "0",
      color: "bg-indigo-500",
    },
    {
      label: "Support Tickets",
      value: "3",
      change: "-1",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white rounded shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-full ${metric.color} flex items-center justify-center text-white`}
              >
                {/* Icon placeholder */}
                <span className="font-bold text-lg">
                  {metric.label.charAt(0)}
                </span>
              </div>
              <span
                className={`text-sm font-medium ${metric.change.startsWith("+") ? "text-green-600" : "text-gray-500"}`}
              >
                {metric.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">
              {metric.label}
            </h3>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
        <div className="text-gray-500 text-sm italic">
          Activity log integration pending...
        </div>
      </div>
    </div>
  );
}
