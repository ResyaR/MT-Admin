"use client";

import React from "react";
import { useParams } from "next/navigation";
import MenuTable from "@/components/MenuTable";

export default function RestaurantMenusPage() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <MenuTable restaurantId={parseInt(id)} />
    </div>
  );
}

