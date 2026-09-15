'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Compass,
  ArrowRight,
  Eye,
  Layers,
  Activity,
  Award,
} from 'lucide-react';

interface LandmarkData {
  id: string;
  num: string;
  name: string;
  nameHi: string;
  subtitle: string;
  subtitleHi: string;
  wardZone: string;
  wardZoneHi: string;
  coordinates: string;
  image: string;
  legacy: string;
  legacyHi: string;
  civicRole: string;
  civicRoleHi: string;
  keyStats: { label: string; val: string }[];
  accentColor: string;
}

const LANDMARKS: LandmarkData[] = [
  {
    id: 'upper-lake',
    num: '01',
    name: 'Upper Lake (Bhojtal)',
    nameHi: 'बड़ा तालाब (भोजताल)',
    subtitle: 'The 1,000-Year-Old Jewel & Water Lifeline of Bhopal',
    subtitleHi: 'भोपाल का 1,000 वर्ष पुराना जीवनदायिनी सरोवर',
    wardZone: 'Ward 23 & 25 • Zone 05 (VIP Road / Khanugaon)',
    wardZoneHi: 'वार्ड 23 एवं 25 • ज़ोन 05 (वीआईपी रोड / खानूगांव)',
    coordinates: '23.2497° N, 77.3756° E',
    image: '/images/landmarks/upper-lake.jpg',
    legacy:
      'Constructed by Raja Bhoj of the Paramara dynasty in the 11th century, Bhojtal is Asia’s oldest man-made lake and a designated Ramsar wetland sanctuary.',
    legacyHi:
      '11वीं शताब्दी में परमार राजा भोज द्वारा निर्मित भोजताल एशिया की सबसे प्राचीन मानव-निर्मित झीलों में से एक है और अंतर्राष्ट्रीय रामसर आर्द्रभूमि स्थल है।',
    civicRole:
      'BMC Smart Water Quality Telemetry monitors dissolved oxygen levels 24x7. Automated weed harvesting and strict catchment sanitation prevent civic drainage runoff.',
    civicRoleHi:
      'भोपाल नगर निगम स्मार्ट जल गुणवत्ता टेलीमेट्री 24x7 निगरानी करती है। वीआईपी रोड व कैचमेंट एरिया में सीवरेज व कचरा प्रबंधन पर त्वरित AI अलर्ट तैनात हैं।',
    keyStats: [
      { label: 'Surface Area', val: '31.5 km²' },
      { label: 'Built In', val: '11th Century' },
      { label: 'Water Supply', val: '40% of Bhopal' },
    ],
    accentColor: 'from-sky-500 to-blue-600',
  },
  {
    id: 'van-vihar',
    num: '02',
    name: 'Van Vihar National Park',
    nameHi: 'वन विहार राष्ट्रीय उद्यान',
    subtitle: 'Lakeside Urban Sanctuary & Ecological Lung',
    subtitleHi: 'झील किनारे स्थित प्राकृतिक वन्यजीव अभयारण्य',
    wardZone: 'Ward 24 • Zone 05 (Shyamla Hills / Lake Shore)',
    wardZoneHi: 'वार्ड 24 • ज़ोन 05 (श्यामला हिल्स / लेक फ्रंट)',
    coordinates: '23.2312° N, 77.3732° E',
    image: '/images/landmarks/van-vihar.jpg',
    legacy:
      'Spanning 4.45 km² along Bhojtal shores, Van Vihar seamlessly merges an open zoological park with a natural forest ecosystem preserving central Indian biodiversity.',
    legacyHi:
      'भोजताल के किनारे 4.45 वर्ग किमी में फैला वन विहार खुला चिड़ियाघर और प्राकृतिक वन पारिस्थितिकी तंत्र का अनूठा संगम है।',
    civicRole:
      'Designated Zero-Plastic Eco-Corridor with smart solar streetlights and real-time municipal grievance dispatch for perimeter boundary fencing and road upkeep.',
    civicRoleHi:
      'जीरो-प्लास्टिक इको ज़ोन जहां स्मार्ट सोलर लाइटिंग और परिधि स्वच्छता की शिकायतों पर 4 घंटे का त्वरित आपातकालीन SLA लागू है।',
    keyStats: [
      { label: 'Sanctuary Area', val: '4.45 sq km' },
      { label: 'Status', val: 'National Park' },
      { label: 'Eco SLA', val: '< 4 Hours' },
    ],
    accentColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'taj-ul-masajid',
    num: '03',
    name: 'Taj-ul-Masajid',
    nameHi: 'ताज-उल-मसाजिद',
    subtitle: 'The Crown of Mosques & Mughal Splendor',
    subtitleHi: 'मस्जिदों का ताज — भव्य वास्तुकला एवं संस्कृति का प्रतीक',
    wardZone: 'Ward 09 • Zone 02 (Old City / Motia Khan)',
    wardZoneHi: 'वार्ड 09 • ज़ोन 02 (पुराना भोपाल / मोतिया खान)',
    coordinates: '23.2647° N, 77.3931° E',
    image: '/images/landmarks/taj-ul-masajid.jpg',
    legacy:
      'One of Asia’s largest mosques, started by Begum Shah Jahan and completed with colossal pink sandstone minarets, marble domes, and a grand water reflection pool.',
    legacyHi:
      'एशिया की विशालतम मस्जिदों में से एक, बेगम शाहजहां द्वारा शुरू की गई गुलाबी बलुआ पत्थर के विशाल मीनारों व संगमरमर के गुंबदों वाली ऐतिहासिक धरोहर।',
    civicRole:
      'Integrated Old Bhopal Heritage Corridor management with high-density crowd sanitization, dynamic lighting maintenance, and 24/7 public convenience oversight.',
    civicRoleHi:
      'पुराने भोपाल के हेरिटेज कॉरिडोर में विशेष सफाई अभियान, स्ट्रीट लाइट रखरखाव एवं सार्वजनिक सुविधाओं की रीयल-टाइम मॉनिटरिंग।',
    keyStats: [
      { label: 'Courtyard Cap', val: '175,000+' },
      { label: 'Minaret Height', val: '206 Feet' },
      { label: 'Zone Priority', val: 'Heritage A+' },
    ],
    accentColor: 'from-rose-500 to-pink-600',
  },
  {
    id: 'sanchi-stupa',
    num: '04',
    name: 'Sanchi Stupa',
    nameHi: 'सांची का महान स्तूप',
    subtitle: 'UNESCO World Heritage of Timeless Peace & Architecture',
    subtitleHi: 'यूनेस्को विश्व धरोहर — शांति एवं स्थापत्य का अमर संदेश',
    wardZone: 'Raisen-Bhopal Metropolitan Heritage Belt',
    wardZoneHi: 'भोपाल-रायसेन मेट्रोपॉलिटन हेरिटेज कॉरिडोर',
    coordinates: '23.4795° N, 77.7397° E',
    image: '/images/landmarks/sanchi-stupa.jpg',
    legacy:
      'Commissioned by Emperor Ashoka in the 3rd century BCE, the Great Stupa stands as India’s foremost symbol of Buddhist art with intricately carved stone Toranas.',
    legacyHi:
      'तीसरी शताब्दी ईसा पूर्व में सम्राट अशोक द्वारा निर्मित, सांची का महान स्तूप अपनी नक्काशीदार तोरण द्वारों के साथ विश्व विख्यात बौद्ध धरोहर है।',
    civicRole:
      'Inter-agency regional transport & clean highway connectivity coordination, linking Bhopal Smart City bus rapid transit and eco-tourism arterial routes.',
    civicRoleHi:
      'भोपाल स्मार्ट सिटी कनेक्टिविटी कॉरिडोर एवं हेरिटेज बस रूट के अंतर्गत स्वच्छ, सुगम व डिजिटल रूप से निगरानीयुक्त परिवहन गलियारा।',
    keyStats: [
      { label: 'Origin', val: '3rd Century BCE' },
      { label: 'Recognition', val: 'UNESCO Site' },
      { label: 'Corridor', val: 'Smart Highway' },
    ],
    accentColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'bharat-bhavan',
    num: '05',
    name: 'Bharat Bhavan',
    nameHi: 'भारत भवन',
    subtitle: 'Charles Correa’s Multi-Arts Masterpiece on Lake Shores',
    subtitleHi: 'चार्ल्स कोरिया द्वारा डिज़ाइन किया गया कला एवं संस्कृति केंद्र',
    wardZone: 'Ward 21 • Zone 04 (Shyamla Hills)',
    wardZoneHi: 'वार्ड 21 • ज़ोन 04 (श्यामला हिल्स)',
    coordinates: '23.2458° N, 77.3887° E',
    image: '/images/landmarks/bharat-bhavan.jpg',
    legacy:
      'Designed by iconic architect Charles Correa, Bharat Bhavan is a sunken architectural marvel with terraced amphitheatres and galleries harmonizing with Bhojtal.',
    legacyHi:
      'प्रसिद्ध वास्तुकार चार्ल्स कोरिया द्वारा परिकल्पित भारत भवन प्राकृतिक ढलानों और झीलों के दृश्य के साथ सामंजस्य बिठाने वाला सांस्कृतिक केंद्र है।',
    civicRole:
      'Smart civic drainage prevention on hillside terraces, cultural district acoustic zoning, and prioritized municipal sanitation during national art symposiums.',
    civicRoleHi:
      'हिल्स टेरेस पर स्मार्ट तूफानी जल निकासी, सांस्कृतिक क्षेत्र की ध्वनि निगरानी और नियमित नागरिक सुविधा अनुरक्षण।',
    keyStats: [
      { label: 'Architect', val: 'Charles Correa' },
      { label: 'Established', val: '1982' },
      { label: 'Disciplines', val: 'Multi-Arts Hub' },
    ],
    accentColor: 'from-indigo-500 to-blue-700',
  },
  {
    id: 'gauhar-mahal',
    num: '06',
    name: 'Gauhar Mahal',
    nameHi: 'गौहर महल',
    subtitle: 'Regal Architectural Heritage of the Begums of Bhopal',
    subtitleHi: 'भोपाल की बेगमों की ऐतिहासिक वास्तुकला एवं शाही शान',
    wardZone: 'Ward 15 • Zone 03 (VIP Road / Upper Lake Banks)',
    wardZoneHi: 'वार्ड 15 • ज़ोन 03 (वीआईपी रोड / झील किनारा)',
    coordinates: '23.2562° N, 77.3906° E',
    image: '/images/landmarks/gauhar-mahal.jpg',
    legacy:
      'Built in 1820 by Qudsia Begum (Gauhar Begum), the first female ruler of Bhopal, blending Hindu and Mughal architectural motifs overlooking the lake.',
    legacyHi:
      '1820 में भोपाल की पहली महिला शासक कुदसिया बेगम (गौहर बेगम) द्वारा निर्मित, जो हिंदू व मुगल स्थापत्य कला का सुंदर संगम है।',
    civicRole:
      'VIP Road urban traffic stabilization, automated pothole triage along heritage waterfronts, and rapid lighting restoration for nightly craft fairs.',
    civicRoleHi:
      'वीआईपी रोड एवं झील किनारे की सड़कों पर गड्ढों की स्वचालित AI पहचान, हेरिटेज फसाड लाइटिंग व हस्तशिल्प मेलों का नागरिक सहयोग।',
    keyStats: [
      { label: 'Constructed', val: '1820 CE' },
      { label: 'Founder', val: 'Qudsia Begum' },
      { label: 'Preservation', val: 'Civic Protected' },
    ],
    accentColor: 'from-amber-600 to-yellow-600',
  },
  {
    id: 'tribal-museum',
    num: '07',
    name: 'Madhya Pradesh Tribal Museum',
    nameHi: 'मध्य प्रदेश जनजातीय संग्रहालय',
    subtitle: 'Vibrant Living Tapestry of Indigenous Tribal Culture',
    subtitleHi: 'जनजातीय कला, संस्कृति और जीवनशैली का जीवंत संग्रहालय',
    wardZone: 'Ward 22 • Zone 04 (Shyamla Hills Cultural Complex)',
    wardZoneHi: 'वार्ड 22 • ज़ोन 04 (श्यामला हिल्स परिसर)',
    coordinates: '23.2389° N, 77.3831° E',
    image: '/images/landmarks/tribal-museum.jpg',
    legacy:
      'A world-renowned experiential museum showcasing the rich lifestyle, art, myths, and architecture of MP’s Gond, Bhil, Baiga, Korku, and Sahariya tribes.',
    legacyHi:
      'गोंड, भील, बैगा, कोरकू और सहरिया जनजातियों की कला, संस्कृति और स्थापत्य को जीवंत प्रदर्शित करने वाला विश्वस्तरीय संग्रहालय।',
    civicRole:
      'Smart waste segregation, zero-litter zone enforcement, and multilingual digital information kiosks integrated into Bhopal Smart City network.',
    civicRoleHi:
      'स्मार्ट कचरा पृथक्करण, शून्य-अपशिष्ट क्षेत्र प्रबंधन एवं स्मार्ट सिटी नेटवर्क से जुड़े नागरिक सूचना सहायता केंद्र।',
    keyStats: [
      { label: 'Tribal Groups', val: '7 Major Tribes' },
      { label: 'Galleries', val: '6 Thematic Halls' },
      { label: 'Zero-Waste', val: 'Active BMC Hub' },
    ],
    accentColor: 'from-purple-500 to-indigo-600',
  },
];

export const BhopalLandmarksJourney: React.FC = () => {
  const { locale } = useLanguage();
  const isHindi = locale === 'hi';
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const current = LANDMARKS[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % LANDMARKS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + LANDMARKS.length) % LANDMARKS.length);
  };

  return (
    <section
      id="bhopal-journey"
      ref={containerRef}
      className="relative bg-slate-950 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800"
    >
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-sky-500/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-sky-400 text-xs font-bold tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>{isHindi ? 'भोपाल धरोहर एवं नागरिक सर्वेक्षण' : 'Bhopal Heritage & Civic Map'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {isHindi ? (
              <>
                भोपाल के शीर्ष 7 प्रमुख स्थल{' '}
                <span className="bg-gradient-to-r from-sky-400 to-amber-300 bg-clip-text text-transparent">
                  एवं स्मार्ट सेवा नेटवर्क
                </span>
              </>
            ) : (
              <>
                Top 7 Landmarks of Bhopal &{' '}
                <span className="bg-gradient-to-r from-sky-400 to-amber-300 bg-clip-text text-transparent">
                  Smart Municipal Care
                </span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            {isHindi
              ? 'भोपाल की ऐतिहासिक पहचान से लेकर नगर निगम के आधुनिक वार्ड प्रबंधन तक — हर धरोहर क्षेत्र में समर्पित स्मार्ट सिटी नागरिक सेवाएं।'
              : "Explore Bhopal's cultural soul and discover how our municipal intelligence network delivers proactive maintenance, sanitation, and rapid triage to every zone."}
          </p>
        </div>

        {/* Interactive Location Navigation Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {LANDMARKS.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105 border border-blue-400'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span className={`text-[10px] font-mono ${isActive ? 'text-sky-200' : 'text-slate-500'}`}>
                  {item.num}
                </span>
                <span>{isHindi ? item.nameHi.split(' ')[0] : item.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Cinematic Visual Stage */}
        <div
          className="relative rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl overflow-hidden p-6 sm:p-10 lg:p-12 transition-all duration-500 backdrop-blur-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Top Progress & Ward Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black font-mono text-sky-400">
                {current.num} <span className="text-sm font-normal text-slate-500">/ 07</span>
              </span>
              <div className="h-4 w-px bg-slate-700" />
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{isHindi ? current.wardZoneHi : current.wardZone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                {current.coordinates}
              </span>
              {/* Previous / Next Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  aria-label="Previous Landmark"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  aria-label="Next Landmark"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main 2-Column Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Image with 3D Perspective & Depth */}
            <div className="lg:col-span-7 relative group">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 aspect-[16/10] bg-slate-950">
                <img
                  src={current.image}
                  alt={current.name}
                  className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                {/* Floating Floating Landmark Title on Image for Mobile */}
                <div className="absolute bottom-4 left-4 right-4 sm:hidden">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    {current.num} • {isHindi ? 'धरोहर' : 'Landmark'}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {isHindi ? current.nameHi : current.name}
                  </h3>
                </div>

                {/* Top Corner Floating Tag */}
                <div className="absolute top-4 left-4 hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs text-slate-200 font-semibold shadow-lg">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bhopal Heritage Asset</span>
                </div>
              </div>

              {/* Mini Stats Pill Bar below image */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {current.keyStats.map((stat, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center backdrop-blur-sm"
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {stat.label}
                    </div>
                    <div className="text-sm sm:text-base font-black text-slate-100 mt-0.5">
                      {stat.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Detailed Narrative & Smart Civic Connection */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="text-xs font-bold font-mono text-sky-400 uppercase tracking-widest mb-1.5">
                  Bhopal Pride • 0{activeIndex + 1} of 07
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {isHindi ? current.nameHi : current.name}
                </h3>
                <p className="text-sm font-semibold text-slate-300 mt-1">
                  {isHindi ? current.subtitleHi : current.subtitle}
                </p>
              </div>

              {/* Historical Context Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'ऐतिहासिक एवं सांस्कृतिक महत्व' : 'Historical & Cultural Legacy'}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {isHindi ? current.legacyHi : current.legacy}
                </p>
              </div>

              {/* Municipal Smart City Civic Integration Card */}
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 space-y-2">
                <div className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>{isHindi ? 'स्मार्ट सिटी एवं बीएमसी नागरिक सेवा' : 'Smart City & BMC Civic Action'}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {isHindi ? current.civicRoleHi : current.civicRole}
                </p>
              </div>

              {/* Quick Jump Action */}
              <div className="pt-2 flex items-center justify-between">
                <a
                  href="#intake-portal"
                  className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition group"
                >
                  <span>{isHindi ? 'इस क्षेत्र में शिकायत दर्ज करें' : 'Report an issue in this ward'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>

                <div className="flex items-center gap-1.5">
                  {LANDMARKS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === activeIndex ? 'w-6 bg-sky-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Jump to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
