import React, { useState } from 'react';
import { Doctor } from '../types';
import { Video, Star, Clock, ShieldCheck, MapPin, Navigation } from 'lucide-react';

const ALL_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    specialty: 'Clinical Psychologist',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
    available: true,
    location: 'New York, NY'
  },
  {
    id: '2',
    name: 'Dr. James Wilson',
    specialty: 'Stress Management Expert',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300',
    available: true,
    location: 'Los Angeles, CA'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Psychiatrist',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300',
    available: false,
    location: 'New York, NY'
  },
  {
    id: '4',
    name: 'Dr. Michael Chang',
    specialty: 'Behavioral Therapist',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300',
    available: true,
    location: 'Chicago, IL'
  }
];

export const Consultation: React.FC = () => {
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  
  // Filter logic: if location is set, filter by simple string match (demo), otherwise show top rated
  const doctors = userLocation 
    ? ALL_DOCTORS.filter(d => d.location.includes(userLocation.split(',')[0])) 
    : ALL_DOCTORS;

  // Fallback if filtering leaves no results
  const displayDoctors = doctors.length > 0 ? doctors : ALL_DOCTORS;

  const handleGetLocation = () => {
    setIsLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, reverse geocode lat/lng to get city. 
          // For this demo, we mock a detected location.
          // Randomly picking 'New York' to demonstrate filtering
          setTimeout(() => {
            setUserLocation("New York, NY"); 
            setIsLoadingLoc(false);
          }, 1000);
        },
        (error) => {
          console.error("Error obtaining location", error);
          alert("Could not access location. Showing all doctors.");
          setIsLoadingLoc(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsLoadingLoc(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
           <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Stress Doctors</h1>
           <p className="text-slate-500 mt-2 text-lg">Connect with certified professionals near you.</p>
        </div>
        <button 
          onClick={handleGetLocation}
          className="mt-4 md:mt-0 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm flex items-center hover:bg-slate-50 transition-colors"
        >
          {isLoadingLoc ? (
             <span className="flex items-center animate-pulse">Detecting...</span>
          ) : (
            <>
              <Navigation size={18} className="mr-2 text-violet-600" />
              {userLocation ? `Near ${userLocation}` : 'Find Doctors Near Me'}
            </>
          )}
        </button>
      </header>

      {userLocation && displayDoctors.length === 0 && (
         <div className="p-4 bg-amber-50 text-amber-800 rounded-xl">
           No doctors found exactly in {userLocation}. Showing top rated specialists worldwide.
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayDoctors.map((doc) => (
          <div key={doc.id} className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-100 border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl group">
            <div className="flex items-start justify-between mb-6">
              <img 
                src={doc.image} 
                alt={doc.name} 
                className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center ${doc.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {doc.available ? (
                  <><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span> Available</>
                ) : (
                  <><Clock size={12} className="mr-1"/> Book Later</>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800">{doc.name}</h3>
            <p className="text-indigo-600 font-medium text-sm mb-2">{doc.specialty}</p>
            <div className="flex items-center text-slate-400 text-xs mb-4">
              <MapPin size={14} className="mr-1" />
              {doc.location}
            </div>
            
            <div className="flex items-center space-x-4 mb-6 text-sm text-slate-500">
              <div className="flex items-center text-amber-500">
                <Star size={16} fill="currentColor" className="mr-1"/>
                <span className="font-bold text-slate-700">{doc.rating}</span>
              </div>
              <div className="flex items-center">
                 <ShieldCheck size={16} className="mr-1"/> Verified
              </div>
            </div>

            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center transition-colors hover:bg-slate-800">
              <Video size={20} className="mr-2"/>
              Consult Now
            </button>
          </div>
        ))}
      </div>
      
      <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 text-center">
        <h3 className="text-indigo-900 font-bold text-lg mb-2">Need immediate help?</h3>
        <p className="text-indigo-700 mb-6">Our crisis counselors are available 24/7.</p>
        <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
          Call Crisis Hotline
        </button>
      </div>
    </div>
  );
};