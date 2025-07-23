"use client";
import { RootState, useSelector } from '@/redux/store';
import { ChevronDown } from 'lucide-react';


const PersonalInformationForm: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);


  return (
    <div className=" max-w-7xl mx-auto rounded-lg p-6 border border-gray-100 ">
      <h2 className="text-2xl font-bold text-gray-900 ">Personal Information</h2>
      <hr />
      <div className="md:w-1/2" >
        <div className="grid grid-cols-2  gap-4 mb-4 mt-20">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              disabled
              id="firstName"
              value={user?.firstName}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent"
              placeholder="John"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              disabled
              id="lastName"
              value={user?.lastName}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent"
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            disabled
            id="email"
            value={user?.email}
            className="w-full px-3 py-2 border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent"
            placeholder="user@gmail.com"
          />
        </div>

        <div>
          <label
            htmlFor="phoneType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number
          </label>
          <div className="relative">
            <input
              type="text"
              disabled
              value={user?.phoneNumber?.phoneNumber}
              id="phoneType"
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent"
              placeholder="Mobile"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformationForm;