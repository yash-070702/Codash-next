'use client';

import React from 'react';
import Head from 'next/head';

const WorkingOnItPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Working On It | Coming Soon</title>
        <meta name="description" content="We're working hard to bring you something amazing. Stay tuned!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className=" bg-gradient-to-b text-amber-50 flex items-center justify-center relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(156 163 175) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Company logo placeholder */}
         

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl font-light text-gray-100 mb-6 tracking-tight leading-tight">
            We're Working On It
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            Our team is putting the finishing touches on something exceptional. 
            <br className="hidden md:block" />
            <span className="font-medium text-gray-900">You'll have access shortly.</span>
          </p>

          {/* Progress indicator */}
          <div className="mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">In Progress</p>
          </div>



          {/* Status update */}
          <div className="bg-gray-600 border border-gray-900 rounded-lg p-6 mb-12 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-200">Current Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Active Development
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-gray-900 h-2 rounded-full transition-all duration-1000 ease-out" style={{width: '85%'}}></div>
            </div>
            <p className="text-xs text-gray-400">Estimated completion: Nov 2025</p>
          </div>
     
        </div>

      
      </div>
    </>
  );
};

export default WorkingOnItPage;