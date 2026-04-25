import React from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { payAndVote } from './api'

export default function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { slug, total, candidate, voteCount } = location.state || {}

  const [selectedMethod, setSelectedMethod] = React.useState('FLOOZ')
  const [showPhoneModal, setShowPhoneModal] = React.useState(false)
  const [phoneNumber, setPhoneNumber] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleProceed = async () => {
    if (!selectedMethod) {
      alert('Veuillez sélectionner un moyen de paiement')
      return
    }
    
    if (!phoneNumber.trim()) {
      setShowPhoneModal(true)
      return
    }

    setIsLoading(true)

    const paymentData = {
      phone_number: phoneNumber,
      amount: total,
      vote_count: voteCount,
      network: selectedMethod,
      description: `Vote for ${candidate.name}`
    }

    try {
      const result = await payAndVote(slug, paymentData)
      alert('Paiement réussi! Votre vote a été enregistré.')
      navigate('/candidates')
    } catch (error) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmPayment = () => {
    if (!phoneNumber.trim()) {
      alert('Veuillez entrer un numéro de téléphone valide')
      return
    }
    setShowPhoneModal(false)
    handleProceed()
  }

  if (!candidate) {
    return <div className="container"><p>Erreur: Données manquantes.</p></div>
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on-surface font-body">
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1080px] flex-col px-4 sm:px-6 py-16">
        <header className="mb-10 rounded-[32px] border border-outline-variant/20 bg-surface-container-high p-8 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.7)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-low px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                Secure Checkout Protocol
              </span>
              <h1 className="mt-6 text-4xl font-headline font-extrabold tracking-tight text-white md:text-5xl">Finalize your support with a secure payment</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-on-surface-variant">Review your vote summary and select the payment operator to complete the transaction safely.</p>
            </div>
            <div className="rounded-3xl bg-surface-container-low p-5 text-right text-xs uppercase tracking-[0.35em] text-on-surface-variant">
              <div className="mb-2 text-white text-sm font-semibold">Payment summary</div>
              <div>Votes: <span className="font-semibold text-white">{voteCount}</span></div>
              <div>Total: <span className="font-semibold text-primary">{total}F</span></div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:gap-10 md:grid-cols-[0.75fr_1.25fr] items-start">
          <article className="space-y-6 rounded-[32px] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)]">
            <div className="relative overflow-hidden rounded-[32px] border border-outline-variant/15 bg-surface-container-high p-6">
              <div className="absolute -right-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-on-surface-variant">Vote summary</p>
                    <h2 className="mt-2 text-2xl font-headline font-bold text-white">{candidate.name}</h2>
                    <p className="text-sm text-on-surface-variant">Public Service Category</p>
                  </div>
                  <div className="h-20 w-20 overflow-hidden rounded-3xl border border-primary/20 bg-surface-container-low">
                    <img className="h-full w-full object-cover" src={candidate.photo_url || 'https://picsum.photos/seed/placeholder/900/900'} alt={candidate.name} />
                  </div>
                </div>
                <div className="grid gap-4 rounded-3xl border border-outline-variant/15 bg-surface-container-low p-5">
                  <div className="flex items-center justify-between text-sm text-on-surface-variant">
                    <span>Number of Votes</span>
                    <span className="font-semibold text-white">{voteCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-on-surface-variant">
                    <span>Processing Fee</span>
                    <span className="font-semibold text-white">0 F</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-outline-variant/30 pt-4 text-sm uppercase tracking-[0.3em] text-on-surface-variant">
                    <span>Total amount</span>
                    <span className="text-3xl font-headline font-extrabold text-primary">{total}F</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-3xl border border-outline-variant/15 bg-surface-container-low p-5 text-sm text-on-surface-variant">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-primary">shield_locked</span>
                <div>
                  <p className="font-semibold text-white">Secure payment</p>
                  <p>Transactions are encrypted end-to-end.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-2xl text-primary">
                <span className="material-symbols-outlined">token</span>
                <span className="material-symbols-outlined">payments</span>
              </div>
            </div>
          </article>

          <aside className="self-start space-y-6 rounded-[32px] border border-outline-variant/20 bg-surface-container-low p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3 text-white">
              <span className="text-xl font-headline font-bold">Select Operator</span>
              <span className="flex-1 h-px bg-outline-variant/30" />
            </div>

            <div className="grid gap-4">
              {['FLOOZ', 'TMONEY'].map((method, index) => {
                const isSelected = selectedMethod === method
                const title = method === 'FLOOZ' ? 'Mixx by Yas' : 'Moov Money'
                const subtitle = method === 'FLOOZ' ? 'Instant mobile credit transfer' : 'Secure mobile wallet payment'
                const iconBg = method === 'FLOOZ' ? 'bg-[#FF0000]' : 'bg-[#0055A4]'
                const label = method === 'FLOOZ' ? 'MIXX' : 'Moov'

                return (
                  <label key={method} className="group relative block cursor-pointer">
                    <input
                      checked={isSelected}
                      onChange={() => setSelectedMethod(method)}
                      className="peer sr-only"
                      name="payment_method"
                      type="radio"
                    />
                    <div className="relative overflow-hidden rounded-[28px] border border-outline-variant/15 bg-surface-container-low p-5 transition duration-300 peer-checked:border-primary/60 peer-checked:bg-surface-container-high hover:bg-surface-container-high">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity duration-300 peer-checked:opacity-100" />
                      <div className="relative flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`${iconBg} flex h-16 w-16 items-center justify-center rounded-full border border-outline-variant/20 text-xs font-black uppercase tracking-[0.25em] text-white`}>{label}</div>
                          <div>
                            <h3 className="font-headline text-lg font-bold text-white">{title}</h3>
                            <p className="text-sm text-on-surface-variant">{subtitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="hidden text-[10px] font-bold uppercase tracking-widest text-primary md:inline">Select</span>
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary transition-all">
                            <span className={`h-2.5 w-2.5 rounded-full bg-on-primary transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>

            <div className="rounded-[28px] border border-outline-variant/15 bg-surface-container-low p-6">
              <button
                onClick={handleProceed}
                disabled={isLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-primary to-primary-container py-4 text-lg font-headline font-bold text-on-primary shadow-[0_12px_32px_-12px_rgba(242,202,80,0.55)] transition hover:shadow-[0_16px_48px_-16px_rgba(242,202,80,0.65)] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined !text-lg animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>autorenew</span>
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
              <p className="mt-4 text-center text-[10px] uppercase tracking-[0.35em] text-on-surface-variant">Encrypted transaction managed by Ekklesia Systems</p>
            </div>
          </aside>
        </section>

        {/* Phone Number Modal */}
        {showPhoneModal && (
          <>
            <div
              className="fixed inset-0 z-40 bg-background/75 backdrop-blur-sm transition-opacity"
              onClick={() => setShowPhoneModal(false)}
            />
            <div className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-md -translate-x-1/2 -translate-y-1/2 items-center justify-center p-4 md:p-6">
              <div className="w-full rounded-3xl border border-outline-variant/30 bg-surface-container-highest/95 backdrop-blur-xl shadow-2xl">
                <div className="p-8">
                  <div className="mb-8 flex items-center justify-between">
                    <h3 className="text-2xl font-headline font-bold text-on-surface">Enter Phone Number</h3>
                    <button
                      onClick={() => setShowPhoneModal(false)}
                      className="grid h-12 w-12 place-items-center rounded-2xl border border-outline-variant/30 bg-surface-container-low p-3 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined !text-lg">close</span>
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-3 block text-sm font-medium uppercase tracking-wider text-on-surface-variant">
                        Phone for {selectedMethod === 'FLOOZ' ? 'Mixx' : 'Moov Money'}
                      </label>
                      <input
                        ref={(input) => input && input.focus()}
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+228 90 12 34 56"
                        className="w-full rounded-2xl border border-outline-variant/50 bg-surface-container-low px-5 py-4 text-lg text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowPhoneModal(false)}
                        className="flex-1 rounded-2xl border-2 border-outline-variant/30 bg-transparent py-4 px-6 font-semibold text-on-surface transition hover:border-outline-variant"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmPayment}
                        disabled={!phoneNumber.trim()}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-primary to-primary-container py-4 px-6 font-bold text-on-primary shadow-lg transition hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm & Pay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-primary-container/10 blur-3xl" />
      </div>
    </div>
  )
}