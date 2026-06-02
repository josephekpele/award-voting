import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Static fallback data
const staticAwards = [];

const stats = [
  { label: 'Éditions', value: '7+' },
  { label: 'Lauréats', value: '13' },
  { label: 'Catégories', value: '8' },
  { label: 'Moments Uniques', value: '∞' }
];

function AwardModal({ award, onClose }) {
  if (!award) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      <div
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f1720]/95 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white transition hover:bg-white/10"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="grid md:grid-cols-2">
          <div className="relative h-64 md:h-auto">
            <img
              src={award.image}
              alt={award.winner}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1720] via-transparent to-transparent md:bg-gradient-to-r" />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#f2ca50]/30 bg-[#f2ca50]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#f2ca50]">
              <span className="material-symbols-outlined text-base">trophy</span>
              Lauréat {award.year}
            </div>
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {award.winner}
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 text-[#d0c5af]">
                <span className="material-symbols-outlined text-[#f2ca50]">category</span>
                <span className="text-sm font-medium uppercase tracking-wider">{award.category}</span>
              </div>
              <div className="flex items-center gap-3 text-[#d0c5af]">
                <span className="material-symbols-outlined text-[#f2ca50]">celebration</span>
                <span className="text-sm font-medium uppercase tracking-wider">{award.event}</span>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-slate-400">
              {award.winner} a été honoré(e) lors de l'édition {award.year} des Ekklesia Impact Awards 
              dans la catégorie {award.category}. Un moment de gloire qui continue d'inspirer 
              la nouvelle génération de talents.
            </p>
            <Link
              to="/candidates"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-2xl bg-[#f2ca50] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#241a00] transition hover:shadow-[0_20px_60px_rgba(242,202,80,0.25)]"
            >
              Voter cette année <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Galerie() {
  const [activeYear, setActiveYear] = useState('Toutes les années');
  const [activeCategory, setActiveCategory] = useState('Toutes les catégories');
  const [selectedAward, setSelectedAward] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch gallery data from API
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/gallery');
        if (!response.ok) throw new Error('Failed to fetch gallery');
        const data = await response.json();
        setGalleryData(data);
        setError(null);
      } catch (err) {
        console.error('Gallery fetch error:', err);
        setError(err.message);
        setGalleryData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Use gallery data if available, otherwise fall back to static data
  const pastAwards = galleryData.length > 0 ? galleryData.map(img => ({
    id: img.id,
    year: img.year?.toString() || '2025',
    category: img.category || 'Catégorie',
    winner: img.candidate_name || 'Lauréat',
    image: img.image_url.startsWith('http') ? img.image_url : `http://localhost:8000${img.image_url}`,
    event: img.description || 'Événement',
    is_winner: img.is_winner
  })) : staticAwards;

  // Get unique years and sort by descending order
  const allYears = useMemo(() => {
    const years = Array.from(new Set(pastAwards.map(a => a.year))).sort((a, b) => b - a);
    return ['Toutes les années', ...years];
  }, [pastAwards]);

  // Get unique categories and sort alphabetically
  const allCategories = useMemo(() => {
    const categories = Array.from(new Set(pastAwards.map(a => a.category))).sort();
    return ['Toutes les catégories', ...categories];
  }, [pastAwards]);

  // Filter awards by selected year and category
  const filteredAwards = useMemo(() => {
    let filtered = pastAwards;
    
    if (activeYear !== 'Toutes les années') {
      filtered = filtered.filter(a => a.year === activeYear);
    }
    
    if (activeCategory !== 'Toutes les catégories') {
      filtered = filtered.filter(a => a.category === activeCategory);
    }
    
    return filtered;
  }, [activeYear, activeCategory, pastAwards]);

  // Get featured award (first winner of the selected year or current year's winner)
  const featuredAward = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    
    if (activeYear === 'Toutes les années') {
      // Find first winner of current year matching category filter
      const currentYearAwards = pastAwards.filter(a => a.year === currentYear);
      const categoryFiltered = activeCategory === 'Toutes les catégories' 
        ? currentYearAwards 
        : currentYearAwards.filter(a => a.category === activeCategory);
      
      const currentYearWinner = categoryFiltered.find(a => a.is_winner === 1);
      if (currentYearWinner) return currentYearWinner;
      
      // Fallback to any award from current year matching category
      if (categoryFiltered.length > 0) return categoryFiltered[0];
      
      // Fallback to most recent winner matching category
      const categoryWinners = pastAwards.filter(a => 
        activeCategory === 'Toutes les catégories' ? a.is_winner === 1 : (a.is_winner === 1 && a.category === activeCategory)
      );
      if (categoryWinners.length > 0) return categoryWinners[0];
      
      return pastAwards[0];
    }
    
    // Find first winner for the selected year and category
    const yearFiltered = pastAwards.filter(a => a.year === activeYear);
    const yearAndCategoryFiltered = activeCategory === 'Toutes les catégories' 
      ? yearFiltered 
      : yearFiltered.filter(a => a.category === activeCategory);
    
    const yearWinner = yearAndCategoryFiltered.find(a => a.is_winner === 1);
    return yearWinner || yearAndCategoryFiltered[0] || pastAwards[0];
  }, [activeYear, activeCategory, pastAwards]);

  // Calculate dynamic stats based on gallery data
  const stats = useMemo(() => {
    const uniqueYears = new Set(pastAwards.map(a => a.year)).size;
    const uniqueWinners = new Set(pastAwards.map(a => a.winner)).size;
    const uniqueCategories = new Set(pastAwards.map(a => a.category)).size;
    
    return [
      { label: 'Éditions', value: `${uniqueYears}` },
      { label: 'Lauréats', value: `${uniqueWinners}` },
      { label: 'Catégories', value: `${uniqueCategories}` },
      { label: 'Moments Uniques', value: `${pastAwards.length}` }
    ];
  }, [pastAwards]);

  // Get other images (non-featured) for the selected filters
  // Get winners (candidates with is_winner === 1)
  const winners = useMemo(() => {
    return pastAwards.filter(a => a.is_winner === 1);
  }, [pastAwards]);

  // Get other images (non-featured) for the selected filters
  const otherImagesForYear = useMemo(() => {
    return filteredAwards.filter(a => 
      !(a.year === featuredAward?.year && a.winner === featuredAward?.winner)
    );
  }, [filteredAwards, featuredAward]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setSelectedAward(null);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (selectedAward) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedAward]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080f]">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#f2ca50]/[0.04] blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#f2ca50]/[0.03] blur-[140px]" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-white/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <section className="relative px-6 pb-16 pt-2 md:pb-24 md:pt-2">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#f2ca50]/20 bg-[#f2ca50]/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#f2ca50]">
              <span className="material-symbols-outlined text-base">auto_stories</span>
              Archives & Souvenirs
            </div>
            <h1 className="font-headline text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl">
              Galerie des{' '}
              <span className="bg-gradient-to-r from-[#f2ca50] to-[#d4af37] bg-clip-text text-transparent">
                Awards
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-[#d0c5af] md:text-xl">
              Chaque photo raconte une histoire d'excellence. Revivez les moments 
              forts qui ont célébré le talent et glorifié Dieu à travers les années.
            </p>
            <div className="mx-auto mt-8 h-px w-32 bg-gradient-to-r from-transparent via-[#f2ca50]/40 to-transparent" />
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 pb-16">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#f2ca50]/20 hover:bg-white/[0.04]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#f2ca50]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <div className="font-headline text-3xl font-extrabold text-white md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-[#9ca3af]">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Year & Category Filters */}
        <section className="px-6 pb-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Year Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {allYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setActiveYear(year)}
                    className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                      activeYear === year
                        ? 'bg-[#f2ca50] text-[#241a00] shadow-[0_10px_40px_rgba(242,202,80,0.25)]'
                        : 'border border-white/10 bg-white/[0.03] text-[#9ca3af] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-white/10" />

              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                      activeCategory === category
                        ? 'bg-[#f2ca50] text-[#241a00] shadow-[0_10px_40px_rgba(242,202,80,0.25)]'
                        : 'border border-white/10 bg-white/[0.03] text-[#9ca3af] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Award (only when showing all or specific year) */}
        {featuredAward && (
          <section className="px-6 pb-16">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#f2ca50]">
                  {activeYear === 'Tous' ? 'Lauréat en Vedette' : `Lauréat ${activeYear}`}
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
              </div>
              <div
                className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-[#0c0e12] transition-all duration-500 hover:border-[#f2ca50]/20"
                onClick={() => setSelectedAward(featuredAward)}
              >
                <div className="grid lg:grid-cols-5">
                  <div className="relative col-span-3 h-72 overflow-hidden lg:h-[480px]">
                    <img
                      src={featuredAward.image}
                      alt={featuredAward.winner}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = staticAwards[0].image;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-transparent to-transparent lg:bg-gradient-to-r" />
                    <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-[#f2ca50]/30 bg-[#f2ca50]/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.15em] text-[#f2ca50] backdrop-blur-md">
                      <span className="material-symbols-outlined text-sm">star</span>
                      {featuredAward.year}
                    </div>
                  </div>
                  <div className="col-span-2 flex flex-col justify-center p-8 lg:p-12">
                    <h2 className="font-headline text-3xl font-extrabold text-white lg:text-4xl">
                      {featuredAward.winner}
                    </h2>
                    <p className="mt-3 text-lg text-[#d0c5af]">
                      {featuredAward.category}
                    </p>
                    <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#9ca3af]">
                      <span className="material-symbols-outlined text-base text-[#f2ca50]">emoji_events</span>
                      {featuredAward.event}
                    </div>
                    {featuredAward.event && (
                      <p className="mt-6 text-sm leading-relaxed text-slate-400">
                        {featuredAward.event}
                      </p>
                    )}
                    <button className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#f2ca50] transition hover:gap-4">
                      Voir les détails <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Gallery Grid - Other Images */}
        {otherImagesForYear.length > 0 && (
          <section className="px-6 pb-24">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#9ca3af]">
                  {activeYear === 'Tous' ? 'Autres Moments' : `Autres Images - ${activeYear}`}
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {otherImagesForYear.map((award, index) => (
                  <div
                    key={`${award.year}-${award.winner}-${index}`}
                    className="group relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[#0c0e12] transition-all duration-500 hover:border-[#f2ca50]/20 hover:shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
                    onClick={() => setSelectedAward(award)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={award.image}
                        alt={award.winner}
                        className={`h-full w-full object-cover transition-all duration-700 ${
                          hoveredIndex === index ? 'scale-110' : 'scale-100'
                        }`}
                        onError={(e) => {
                          e.target.src = (winners.length > 0 ? winners[0].image : staticAwards[0].image);
                        }}
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
                      
                      {/* Year badge */}
                      <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-[#f2ca50]/30 bg-[#f2ca50]/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#f2ca50] backdrop-blur-md">
                        <span className="material-symbols-outlined text-xs">calendar_month</span>
                        {award.year}
                      </div>

                      {/* Hover expand icon */}
                      <div className="absolute right-4 top-4 flex h-8 w-8 scale-0 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-100">
                        <span className="material-symbols-outlined text-sm">open_in_full</span>
                      </div>

                      {/* Content */}
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                          <h3 className="font-headline text-xl font-bold text-white">
                            {award.winner}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d0c5af]">
                              {award.category}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-[#f2ca50]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f2ca50]">
                              {award.event.substring(0, 15)}...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State or Static Fallback */}
        {filteredAwards.length === 0 && (
          <section className="px-6 pb-24">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#9ca3af]">
                  Tous les Lauréats
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {winners.map((award, index) => (
                  <div
                    key={`${award.year}-${award.winner}-${index}`}
                    className="group relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[#0c0e12] transition-all duration-500 hover:border-[#f2ca50]/20 hover:shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
                    onClick={() => setSelectedAward(award)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={award.image}
                        alt={award.winner}
                        className={`h-full w-full object-cover transition-all duration-700 ${
                          hoveredIndex === index ? 'scale-110' : 'scale-100'
                        }`}
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
                      
                      {/* Year badge */}
                      <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-[#f2ca50]/30 bg-[#f2ca50]/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#f2ca50] backdrop-blur-md">
                        <span className="material-symbols-outlined text-xs">calendar_month</span>
                        {award.year}
                      </div>

                      {/* Hover expand icon */}
                      <div className="absolute right-4 top-4 flex h-8 w-8 scale-0 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-100">
                        <span className="material-symbols-outlined text-sm">open_in_full</span>
                      </div>

                      {/* Content */}
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                          <h3 className="font-headline text-xl font-bold text-white">
                            {award.winner}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d0c5af]">
                              {award.category}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-[#f2ca50]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f2ca50]">
                              {award.event}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Footer */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-[#f2ca50]/10 bg-gradient-to-br from-[#f2ca50]/[0.06] to-transparent p-10 text-center md:p-16">
            <h2 className="font-headline text-3xl font-extrabold text-white md:text-4xl">
              Vous aussi, faites partie de l'histoire
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[#d0c5af]">
              Les prochains lauréats sont peut-être parmi vous. Participez aux Awards 2025 
              et laissez votre empreinte dans la galerie des grands.
            </p>
            <Link
              to="/candidates"
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#f2ca50] px-8 py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-[#241a00] shadow-[0_20px_60px_rgba(242,202,80,0.25)] transition-all hover:scale-[1.03] hover:shadow-[0_30px_80px_rgba(242,202,80,0.35)]"
            >
              Voter maintenant
              <span className="material-symbols-outlined">how_to_vote</span>
            </Link>
          </div>
        </section>
      </div>

      {/* Modal */}
      {selectedAward && (
        <AwardModal
          award={selectedAward}
          onClose={() => setSelectedAward(null)}
        />
      )}
    </div>
  );
}

