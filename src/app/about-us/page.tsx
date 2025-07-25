'use client';

import React from "react";
import { Target, Heart, Building, Zap } from "lucide-react";
import Image from "next/image";
import yash from "@/assets/yash.jpg"; // Use `public/` folder if this fails
import Footer from "@/app/components/Common/Footer";
import Header from "@/app/components/Common/Header";

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <Header />

      <div className="container md:w-8/12 mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-10 mt-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
            About Us
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-4">
            Discover our story, mission, and the passionate team behind our
            success. We're building something extraordinary together.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {/* Four Card Sections */}
          {[
            {
              Icon: Building,
              title: "Our Story",
              content: [
                "Founded with a vision to revolutionize the industry, we started as a small team with big dreams. Our journey began in 2020 when we recognized the need for innovative solutions in the market.",
                "Today, we've grown into a trusted partner for countless clients worldwide, always staying true to our core values of excellence and integrity."
              ],
            },
            {
              Icon: Target,
              title: "Our Mission",
              content: [
                "We're committed to delivering exceptional value through cutting-edge technology and unparalleled customer service. Our mission is to empower businesses and individuals to achieve their goals.",
                "Every solution we create is designed with our users in mind, ensuring maximum impact and sustainable growth."
              ],
            },
            {
              Icon: Heart,
              title: "Our Values",
              content: [
                "Integrity, innovation, and customer-centricity are at the heart of everything we do. We believe in transparent communication and building lasting relationships with our partners.",
                "Our commitment to excellence drives us to continuously improve and adapt to meet evolving market needs."
              ],
            },
            {
              Icon: Zap,
              title: "What Makes Us Different",
              content: [
                "Our unique approach combines deep industry expertise with cutting-edge technology. We don't just deliver solutions – we create experiences that transform businesses.",
                "With a focus on scalability and future-proofing, we ensure our clients stay ahead of the curve in an ever-evolving landscape."
              ],
            },
          ].map(({ Icon, title, content }, i) => (
            <div key={i} className="bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 sm:p-8 hover:transform hover:-translate-y-2 transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-2 rounded-lg mr-4">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white">{title}</h2>
              </div>
              {content.map((para, idx) => (
                <p key={idx} className="text-slate-300 leading-relaxed mb-4 text-sm sm:text-base">{para}</p>
              ))}
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 sm:p-8 mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">
            Our Impact
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              ["100+", "Happy Clients"],
              ["50K+", "Projects Completed"],
              ["24/7", "Support Available"],
              ["5+", "Years Experience"],
            ].map(([value, label], idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-400 mb-2">
                  {value}
                </div>
                <div className="text-slate-400 text-xs sm:text-sm uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Founder Section */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Meet the Founder
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-12 px-4">
            Behind our success is a passionate individual dedicated to
            delivering exceptional results and building lasting relationships.
          </p>

          <div className="flex justify-center px-4">
            <div className="bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 sm:p-12 hover:transform hover:-translate-y-2 transition-all duration-300 hover:border-purple-500/50">
              <Image
                src={yash}
                alt="Founder Image"
                width={96}
                height={96}
                className="rounded-full mx-auto mb-6 sm:mb-8"
              />
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">
                Yash Kumar Aggarwal
              </h3>
              <p className="text-purple-400 text-xs sm:text-sm uppercase tracking-wide mb-4 sm:mb-6">
                Founder & CEO
              </p>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                A visionary entrepreneur with a passion for innovation and
                excellence. With years of experience in the industry, dedicated
                to creating solutions that make a real difference for clients
                and partners.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section
        <ContactSection /> */}
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;
