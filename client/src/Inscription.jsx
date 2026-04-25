import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

function Inscription() {
  const inputRef = useRef(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    sexe: '',
    whatsapp: '',
    biographie: '',
    eglise: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const triggerPhotoUpload = () => {
    inputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => submitData.append(key, formData[key]));
    if (photo) submitData.append('photo', photo);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      setMessage('Inscription soumise avec succès ! Merci.');
      setFormData({ nom: '', prenom: '', sexe: '', whatsapp: '', biographie: '', eglise: '' });
      setPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      setMessage('Erreur lors de l\'inscription. Réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30">
      <main className="pb-16 px-6 mx-auto max-w-5xl">
        <motion.section initial="hidden" animate="visible" variants={fadeUp} className="mb-10 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#f2ca50]/20 bg-surface-container/70 px-4 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            2026 Nominations Open
          </div>
          <h1 className="mt-6 text-4xl font-headline font-extrabold tracking-tight text-on-surface sm:text-5xl">
            Candidate <span className="bg-[linear-gradient(135deg,#f2ca50_0%,#d4af37_100%)] bg-clip-text text-transparent">Registration</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
            Join the prestigious circle of nominees for the Ekklesia Impact Award. Share your legacy with the world.
          </p>
        </motion.section>

        <motion.form initial="hidden" animate="visible" variants={fadeUp} onSubmit={handleSubmit} className="space-y-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div variants={fadeUp} className="space-y-6">
              <div className="rounded-[2rem] border border-[#f2ca50]/10 bg-surface-container-low p-6 shadow-2xl shadow-[#f2ca50]/5">
                <h2 className="text-xl font-headline font-bold text-on-surface">The Pinnacle of Faith & Impact</h2>
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                  The Ekklesia Impact Award celebrates divine service and societal transformation. Share your story of mission, leadership, and community impact.
                </p>
              </div>

              <div className="space-y-4 rounded-[2rem] border border-[#99907c]/20 bg-surface-container-high p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
                    <span className="material-symbols-outlined">workspace_premium</span>
                  </div>
                  <div>
                    <h4 className="font-headline text-base font-bold text-on-surface">Global Recognition</h4>
                    <p className="text-sm text-on-surface-variant/80">Join the ranks of international leaders and impactful ministries.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
                    <span className="material-symbols-outlined">campaign</span>
                  </div>
                  <div>
                    <h4 className="font-headline text-base font-bold text-on-surface">Platform for Growth</h4>
                    <p className="text-sm text-on-surface-variant/80">Expand your reach and mission through our editorial network.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-surface-container p-6 border border-[#99907c]/10">
                <h3 className="font-headline text-xl font-bold text-primary">Submission Instructions</h3>
                <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
                  <li className="flex gap-3"><span className="text-primary font-bold">01.</span> Ensure all church affiliations are verifiable.</li>
                  <li className="flex gap-3"><span className="text-primary font-bold">02.</span> Biography should focus on measurable impact and spiritual legacy.</li>
                  <li className="flex gap-3"><span className="text-primary font-bold">03.</span> High-resolution professional portrait (4MB max) is required.</li>
                </ul>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2rem] bg-surface-container-lowest p-8 shadow-2xl shadow-[#f2ca50]/10">
              <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/5 blur-[120px]" />
              <div className="relative space-y-8">
                {message ? (
                  <div className={`rounded-3xl border p-4 text-sm ${message.includes('succès') ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/20 bg-rose-400/10 text-rose-200'}`}>
                    {message}
                  </div>
                ) : null}

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-[0.7rem] uppercase tracking-[0.2em] text-on-surface-variant">First Name</label>
                    <input
                      className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant/30 px-0 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-0"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      type="text"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[0.7rem] uppercase tracking-[0.2em] text-on-surface-variant">Surname</label>
                    <input
                      className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant/30 px-0 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-0"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      type="text"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-[0.7rem] uppercase tracking-[0.2em] text-on-surface-variant">Gender</label>
                    <select
                      className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant/30 px-0 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-0 appearance-none"
                      name="sexe"
                      value={formData.sexe}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[0.7rem] uppercase tracking-[0.2em] text-on-surface-variant">WhatsApp Number</label>
                    <div className="flex items-center gap-3 bg-surface-container-highest border-b-2 border-outline-variant/30 px-3">
                      <span className="text-on-surface-variant text-sm">+</span>
                      <input
                        className="w-full bg-transparent border-0 py-3 text-on-surface outline-none transition placeholder:text-on-surface-variant/30"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="1 234 567 890"
                        type="tel"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[0.7rem] uppercase tracking-[0.2em] text-on-surface-variant">Church of Origin</label>
                  <input
                    className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant/30 px-0 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-0"
                    name="eglise"
                    value={formData.eglise}
                    onChange={handleInputChange}
                    placeholder="Ministry or Parish name"
                    type="text"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[0.7rem] uppercase tracking-[0.2em] text-on-surface-variant">Biography</label>
                  <textarea
                    className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant/30 px-0 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-0 resize-none leading-relaxed"
                    name="biographie"
                    value={formData.biographie}
                    onChange={handleInputChange}
                    placeholder="Describe your journey and impact..."
                    rows="5"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-[0.7rem] uppercase tracking-[0.2em] text-on-surface-variant">Candidate Portrait</label>
                  <div className="grid gap-6 md:grid-cols-12 items-center">
                    <div className="md:col-span-4 aspect-square overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container relative group cursor-pointer" onClick={triggerPhotoUpload}>
                      <img
                        className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                        src={photoPreview || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'}
                        alt="Portrait preview"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 transition-colors group-hover:bg-background/20">
                        <span className="material-symbols-outlined text-primary mb-1">photo_camera</span>
                        <span className="text-[0.65rem] uppercase tracking-[0.15em] text-white">Preview</span>
                      </div>
                    </div>
                    <div className="md:col-span-8">
                      <div className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container-highest p-8 text-center transition-colors hover:border-primary/50" onClick={triggerPhotoUpload}>
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant">cloud_upload</span>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">Click to upload or drag and drop</p>
                          <p className="mt-1 text-xs text-on-surface-variant">RAW, JPG or PNG (MAX. 800x800px)</p>
                        </div>
                      </div>
                      <input
                        ref={inputRef}
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    className="w-full rounded-[1rem] bg-gradient-to-r from-primary to-primary-container py-5 text-sm font-headline font-extrabold uppercase tracking-[0.15em] text-on-primary shadow-[0_10px_40px_rgba(242,202,80,0.2)] transition-transform duration-300 hover:scale-[1.01]"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi...' : 'Submit Nomination'}
                  </button>
                  <p className="mt-6 px-4 text-center text-[0.7rem] text-on-surface-variant/60 leading-relaxed">
                    By submitting, you agree to the Ekklesia Impact Award Terms of Participation and Privacy Policy.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.form>
      </main>

      <footer className="w-full border-t border-[#d4af37]/10 bg-[#111417]">
        <div className="mx-auto flex flex-col gap-6 px-8 py-12 max-w-screen-2xl md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
            <div className="text-lg font-semibold text-[#f2ca50]">Ekklesia Impact Award</div>
            <div className="text-[0.75rem] uppercase tracking-[0.05em] text-[#d0c5af]">© 2025 Ekklesia Impact Award — Développé par JEA</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Inscription;

