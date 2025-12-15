import React, { useState } from 'react';
import { UserState, EmergencyContact } from '../types';
import { Save, User, Phone, MapPin, Heart, ShieldAlert } from 'lucide-react';

interface SettingsProps {
  userState: UserState;
  onUpdateUser: (updates: Partial<UserState>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ userState, onUpdateUser }) => {
  const [name, setName] = useState(userState.name);
  const [location, setLocation] = useState(userState.location || '');
  const [contactName, setContactName] = useState(userState.emergencyContact?.name || '');
  const [contactPhone, setContactPhone] = useState(userState.emergencyContact?.phone || '');
  const [contactRelation, setContactRelation] = useState(userState.emergencyContact?.relation || 'Parent');

  const handleSave = () => {
    const emergencyContact: EmergencyContact = {
      name: contactName,
      phone: contactPhone,
      relation: contactRelation
    };

    onUpdateUser({
      name,
      location,
      emergencyContact
    });

    alert("Settings saved successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-10">
      <header>
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Settings & Care</h1>
        <p className="text-slate-500 mt-2 text-lg">Manage your profile and emergency safety net.</p>
      </header>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <User className="mr-3 text-violet-600" size={24} />
            Personal Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Current Location (City)</label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                  placeholder="e.g. New York, NY"
                />
                <MapPin className="absolute left-4 top-4 text-slate-400" size={20}/>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-rose-500"></div>
          <div className="flex justify-between items-start mb-6">
             <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <ShieldAlert className="mr-3 text-rose-600" size={24} />
              Emergency & Parent Care
            </h2>
          </div>
          <p className="text-slate-500 mb-6 text-sm">
            We will alert this contact if your stress levels reach a critical point (Level 8+). 
            This ensures your safety and keeps your loved ones informed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all"
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Relationship</label>
              <div className="relative">
                <select
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all appearance-none text-slate-700"
                >
                  <option value="Parent">Parent</option>
                  <option value="Partner">Partner</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Therapist">Therapist</option>
                </select>
                <Heart className="absolute left-4 top-4 text-rose-400" size={20}/>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-600">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all"
                  placeholder="+1 (555) 000-0000"
                />
                <Phone className="absolute left-4 top-4 text-slate-400" size={20}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1 flex items-center"
        >
          <Save size={20} className="mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
};