
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">הדף לא נמצא</p>
        <Link to="/">
          <Button className="mt-4">חזור לדף הבית</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
